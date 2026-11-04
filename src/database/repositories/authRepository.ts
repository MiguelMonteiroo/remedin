import type { NativeDB } from "../nativeDb";
import type {
  AuthProviderKind,
  StoredUserCredential,
  UserAccount,
} from "../../types/domain";

export const DEFAULT_USER_ACCOUNT: UserAccount = {
  authenticated: false,
  name: "",
  email: "",
  provider: null,
};

function parseStoredAccounts(raw: string | undefined): StoredUserCredential[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredUserCredential =>
        Boolean(item && typeof item.email === "string" && typeof item.name === "string")
    );
  } catch {
    return [];
  }
}

function parseProvider(value: string | undefined): AuthProviderKind | null {
  if (value === "google" || value === "email") return value;
  return null;
}

function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "Você";
  const cleaned = localPart.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Você";
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function createAuthRepository(db: NativeDB) {
  async function readMap(): Promise<Record<string, string>> {
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      "SELECT * FROM app_settings"
    );
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  }

  async function getAccount(): Promise<UserAccount> {
    const map = await readMap();
    const explicitAuth = map.authAuthenticated;
    const legacyAuthenticated =
      explicitAuth === undefined &&
      map.onboardingCompleted === "true" &&
      Boolean(map.userName?.trim());

    const authenticated = explicitAuth === "true" || legacyAuthenticated;
    const name = (map.authName || map.userName || "").trim();
    const email = (map.authEmail || "").trim();
    const provider =
      parseProvider(map.authProvider) ?? (legacyAuthenticated ? "email" : null);

    return {
      authenticated,
      name,
      email,
      provider,
    };
  }

  async function getSavedAccounts(): Promise<StoredUserCredential[]> {
    const map = await readMap();
    return parseStoredAccounts(map.authAccountsJson);
  }

  async function persistSession(
    account: UserAccount,
    accounts: StoredUserCredential[]
  ): Promise<void> {
    const entries: Array<[string, string]> = [
      ["authAuthenticated", account.authenticated ? "true" : "false"],
      ["authName", account.name],
      ["authEmail", account.email],
      ["authProvider", account.provider ?? ""],
      ["authAccountsJson", JSON.stringify(accounts)],
    ];

    if (account.name.trim()) {
      entries.push(["userName", account.name.trim()]);
    }

    await db.withTransactionAsync(async (transaction) => {
      for (const [key, value] of entries) {
        await transaction.runAsync(
          "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
          key,
          value
        );
      }
    });
  }

  async function signUpWithEmail(
    name: string,
    email: string,
    password: string
  ): Promise<UserAccount> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const accounts = await getSavedAccounts();
    const existingIndex = accounts.findIndex(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    const credential: StoredUserCredential = {
      name: normalizedName,
      email: normalizedEmail,
      password,
      provider: "email",
    };

    const nextAccounts =
      existingIndex >= 0
        ? accounts.map((item, idx) => (idx === existingIndex ? credential : item))
        : [...accounts, credential];

    const session: UserAccount = {
      authenticated: true,
      name: normalizedName,
      email: normalizedEmail,
      provider: "email",
    };

    await persistSession(session, nextAccounts);
    return session;
  }

  async function signInWithEmail(
    email: string,
    password: string
  ): Promise<UserAccount> {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = await getSavedAccounts();
    const existing = accounts.find(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (existing && existing.password && existing.password !== password) {
      throw new Error("E-mail ou senha incorretos. Confira seus dados e tente novamente.");
    }

    const map = await readMap();
    const resolvedName =
      existing?.name?.trim() ||
      map.userName?.trim() ||
      deriveNameFromEmail(normalizedEmail);

    const credential: StoredUserCredential = {
      name: resolvedName,
      email: normalizedEmail,
      password,
      provider: "email",
    };

    const nextAccounts = existing
      ? accounts.map((item) =>
          item.email.toLowerCase() === normalizedEmail ? credential : item
        )
      : [...accounts, credential];

    const session: UserAccount = {
      authenticated: true,
      name: resolvedName,
      email: normalizedEmail,
      provider: "email",
    };

    await persistSession(session, nextAccounts);
    return session;
  }

  async function signInWithGoogle(
    name: string,
    email: string
  ): Promise<UserAccount> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim() || deriveNameFromEmail(normalizedEmail);
    const accounts = await getSavedAccounts();
    const existingIndex = accounts.findIndex(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    const credential: StoredUserCredential = {
      name: normalizedName,
      email: normalizedEmail,
      password: accounts[existingIndex]?.password,
      provider: "google",
    };

    const nextAccounts =
      existingIndex >= 0
        ? accounts.map((item, idx) => (idx === existingIndex ? credential : item))
        : [...accounts, credential];

    const session: UserAccount = {
      authenticated: true,
      name: normalizedName,
      email: normalizedEmail,
      provider: "google",
    };

    await persistSession(session, nextAccounts);
    return session;
  }

  async function resetPassword(email: string, newPassword: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = await getSavedAccounts();
    const existingIndex = accounts.findIndex(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    const nextAccounts =
      existingIndex >= 0
        ? accounts.map((item, idx) =>
            idx === existingIndex ? { ...item, password: newPassword } : item
          )
        : [
            ...accounts,
            {
              name: deriveNameFromEmail(normalizedEmail),
              email: normalizedEmail,
              password: newPassword,
              provider: "email" as const,
            },
          ];

    await db.runAsync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
      "authAccountsJson",
      JSON.stringify(nextAccounts)
    );
  }

  async function signOut(): Promise<UserAccount> {
    const current = await getAccount();
    const signedOut: UserAccount = {
      ...current,
      authenticated: false,
    };
    await db.runAsync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
      "authAuthenticated",
      "false"
    );
    return signedOut;
  }

  return {
    getAccount,
    getSavedAccounts,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;
