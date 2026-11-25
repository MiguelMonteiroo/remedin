import type { NativeDB } from "../nativeDb";
import { PROFILE_AVATARS, type ReminderSettings } from "../../types/domain";
import { DEFAULT_REMINDER_SETTINGS } from "../../utils/defaultReminderSettings";

const DEFAULT_SETTINGS = DEFAULT_REMINDER_SETTINGS;

function parseSnoozeMinutes(value: string | undefined): number {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 60
    ? parsed
    : DEFAULT_SETTINGS.defaultSnoozeMinutes;
}

export function createSettingsRepository(db: NativeDB) {
  async function get(): Promise<ReminderSettings> {
    const rows = await db.getAllAsync<{ key: string; value: string }>(
      "SELECT * FROM app_settings"
    );
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    const profileAvatar = PROFILE_AVATARS.find((avatar) => avatar === map.profileAvatar);
    return {
      notificationsEnabled:
        map.notificationsEnabled === "true" ||
        DEFAULT_SETTINGS.notificationsEnabled,
      defaultSnoozeMinutes: parseSnoozeMinutes(map.defaultSnoozeMinutes),
      userName: map.userName || DEFAULT_SETTINGS.userName,
      fullScreenAlarmEnabled: map.fullScreenAlarmEnabled === "true",
      criticalAlertsEnabled: map.criticalAlertsEnabled === "true",
      showLockScreenDetails: map.showLockScreenDetails === "true",
      reminderSetupCompleted: map.reminderSetupCompleted === "true",
      onboardingCompleted: map.onboardingCompleted === "true",
      ...(profileAvatar && { profileAvatar }),
      ...(map.onboardingIntroSeen === "true" && { onboardingIntroSeen: true }),
    };
  }

  async function update(settings: Partial<ReminderSettings>): Promise<void> {
    await db.withTransactionAsync(async (transaction) => {
      for (const [key, value] of Object.entries(settings)) {
        if (value === undefined) continue;
        await transaction.runAsync(
          "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
          key,
          String(value)
        );
      }
    });
  }

  return { get, update };
}

export type SettingsRepository = ReturnType<typeof createSettingsRepository>;
