import notifee from "@notifee/react-native";
import type { ReminderArtifactRepository } from "../database/repositories/reminderArtifactRepository";
import type { MedicationRepository } from "../database/repositories/medicationRepository";
import type { ScheduleRepository } from "../database/repositories/scheduleRepository";
import type { DoseLogRepository } from "../database/repositories/doseLogRepository";
import type { SettingsRepository } from "../database/repositories/settingsRepository";
import {
  generateDoseOccurrencesForDate,
  indexLatestDoseLogs,
  resolveDoseOccurrence,
} from "../utils/doseEngine";
import type { ReminderScheduler } from "./reminderScheduler";
import { getNotificationPermissionStatus } from "./notificationPermissionService";
import { planOccurrenceReminders } from "./reminders/reminderPlanner";
import type { PlannedReminder } from "./reminders/reminderPlanner";
import type { ReminderArtifact } from "../types/domain";
import { formatLocalDate } from "../utils/dateTime";

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function reminderArtifactsMatchPlans(
  artifacts: ReminderArtifact[],
  plans: PlannedReminder[]
): boolean {
  const plansByKind = new Map(plans.map((plan) => [plan.kind, plan]));
  return artifacts.every((artifact) => {
    const plan = plansByKind.get(artifact.kind);
    if (!plan) return false;
    return (
      new Date(artifact.scheduledFor).getTime() ===
      new Date(plan.scheduledFor).getTime()
    );
  });
}

export function isReminderArtifactActive(
  artifact: ReminderArtifact,
  notifeeTriggerIds: Set<string>,
  nativeAlarmIds: Set<string>
): boolean {
  return artifact.notificationId.startsWith("native:")
    ? nativeAlarmIds.has(artifact.notificationId)
    : notifeeTriggerIds.has(artifact.notificationId);
}

export async function reconcileNotifications(
  artifactRepo: ReminderArtifactRepository,
  medicationRepo: MedicationRepository,
  scheduleRepo: ScheduleRepository,
  doseLogRepo: DoseLogRepository,
  settingsRepo: SettingsRepository,
  reminderScheduler: ReminderScheduler
): Promise<{ removed: number; recreated: number }> {
  const { granted } = await getNotificationPermissionStatus();
  const settings = await settingsRepo.get();
  const [notifeeIds, nativeIds] = await Promise.all([
    notifee.getTriggerNotificationIds(),
    reminderScheduler.getScheduledNativeAlarmIds?.() ?? Promise.resolve([]),
  ]);
  const activeNotifeeIds = new Set(notifeeIds);
  const activeNativeIds = new Set(nativeIds);
  const storedArtifacts = await artifactRepo.getAll();
  const now = Date.now();
  const staleBefore = now - 15 * 60 * 1000;
  let removed = 0;

  for (const artifact of storedArtifacts) {
    const scheduledAt = new Date(artifact.scheduledFor).getTime();
    const missingTrigger = !isReminderArtifactActive(
      artifact,
      activeNotifeeIds,
      activeNativeIds
    );
    const shouldRemoveMissingArtifact =
      missingTrigger &&
      (scheduledAt > now || scheduledAt < staleBefore);

    if (shouldRemoveMissingArtifact) {
      await artifactRepo.remove(artifact.id);
      removed++;
    }
  }

  if (!granted || !settings.notificationsEnabled) {
    return { removed, recreated: 0 };
  }

  const medications = await medicationRepo.getAll();
  const schedules = await scheduleRepo.getAll();
  const latestDoseLogs = indexLatestDoseLogs(await doseLogRepo.getAll());
  const horizon = now + 48 * 60 * 60 * 1000;
  const referenceTime = new Date(now);
  const today = formatLocalDate(referenceTime);
  let recreated = 0;

  for (const medication of medications) {
    if (medication.isPaused) continue;
    const medicationSchedules = schedules.filter(
      (schedule) => schedule.medicationId === medication.id && schedule.isActive
    );

    for (const schedule of medicationSchedules) {
      const occurrences = Array.from({ length: 4 }, (_, index) =>
        generateDoseOccurrencesForDate(
          medication,
          schedule,
          formatLocalDate(addDays(referenceTime, index - 1))
        )
      )
        .flat();

      for (const originalOccurrence of occurrences) {
        const { occurrence } = resolveDoseOccurrence(
          originalOccurrence,
          latestDoseLogs,
          referenceTime
        );
        if (originalOccurrence.scheduledAt.slice(0, 10) < today && occurrence.status !== "snoozed") continue;
        let artifacts = await artifactRepo.getByDoseOccurrenceId(occurrence.id);
        if (occurrence.status === "taken" || occurrence.status === "skipped") {
          if (artifacts.length > 0) {
            await reminderScheduler.cancelSingle(occurrence.id);
          }
          continue;
        }

        const effectiveTimestamp = new Date(occurrence.scheduledAt).getTime();
        if (effectiveTimestamp <= now || effectiveTimestamp > horizon) continue;

        const snoozed = occurrence.status === "snoozed";
        const planOptions = snoozed
          ? { snoozed: true, alarmAt: new Date(occurrence.scheduledAt) }
          : {};
        const expectedPlans = planOccurrenceReminders(
          occurrence,
          referenceTime,
          planOptions
        );
        if (!reminderArtifactsMatchPlans(artifacts, expectedPlans)) {
          await reminderScheduler.cancelSingle(occurrence.id);
          artifacts = [];
        }
        const windowArtifacts = await artifactRepo.getByWindowKey(
          occurrence.scheduledAt.slice(0, 16)
        );
        const expectedKinds = expectedPlans.map((plan) => plan.kind);
        const existingKinds = new Set(artifacts.map((artifact) => artifact.kind));
        if (windowArtifacts.some((artifact) => artifact.kind === "preAlert")) {
          existingKinds.add("preAlert");
        }
        if (expectedKinds.every((kind) => existingKinds.has(kind))) continue;
        if (artifacts.length > 0) {
          await reminderScheduler.cancelSingle(occurrence.id);
        }
        const ids = await reminderScheduler.scheduleForOccurrence(
          occurrence,
          medication,
          schedule,
          {
            showLockScreenDetails: settings.showLockScreenDetails,
            fullScreenAlarmEnabled: settings.fullScreenAlarmEnabled,
            criticalAlertsEnabled: settings.criticalAlertsEnabled,
            ...planOptions,
          }
        );
        recreated += ids.length;
      }
    }
  }

  return { removed, recreated };
}

export async function getActiveNotificationCount(
  artifactRepo: ReminderArtifactRepository
): Promise<number> {
  return (await artifactRepo.getAll()).length;
}
