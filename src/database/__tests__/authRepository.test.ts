import { migrateDbIfNeeded } from "../migrations";
import { createAuthRepository } from "../repositories/authRepository";
import { createSettingsRepository } from "../repositories/settingsRepository";
import { createTestDatabase } from "../testing/testDatabase";

describe("auth repository", () => {
  it("returns unauthenticated defaults on a fresh install", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const auth = createAuthRepository(db);

      await expect(auth.getAccount()).resolves.toEqual({
        authenticated: false,
        name: "",
        email: "",
        provider: null,
      });
    } finally {
      close();
    }
  });

  it("signs up with email, syncs userName, signs out, and signs back in", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const auth = createAuthRepository(db);
      const settings = createSettingsRepository(db);

      const created = await auth.signUpWithEmail(
        "Helena Costa",
        "Helena@Email.com",
        "senha123"
      );

      expect(created).toEqual({
        authenticated: true,
        name: "Helena Costa",
        email: "helena@email.com",
        provider: "email",
      });
      expect((await settings.get()).userName).toBe("Helena Costa");

      const signedOut = await auth.signOut();
      expect(signedOut.authenticated).toBe(false);

      await expect(
        auth.signInWithEmail("helena@email.com", "errada")
      ).rejects.toThrow("E-mail ou senha incorretos");

      const signedIn = await auth.signInWithEmail(
        "helena@email.com",
        "senha123"
      );
      expect(signedIn).toEqual({
        authenticated: true,
        name: "Helena Costa",
        email: "helena@email.com",
        provider: "email",
      });
    } finally {
      close();
    }
  });

  it("persists Google account selection and password reset", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const auth = createAuthRepository(db);

      const googleSession = await auth.signInWithGoogle(
        "Carlos Silva",
        "carlos@gmail.com"
      );
      expect(googleSession).toEqual({
        authenticated: true,
        name: "Carlos Silva",
        email: "carlos@gmail.com",
        provider: "google",
      });

      await auth.resetPassword("carlos@gmail.com", "novaSenha123");
      const saved = await auth.getSavedAccounts();
      expect(saved).toHaveLength(1);
      expect(saved[0]?.email).toBe("carlos@gmail.com");
    } finally {
      close();
    }
  });
});
