import notifee from "@notifee/react-native";
import type { ReminderArtifactRepository } from "../database/repositories/reminderArtifactRepository";
import type { MedicationRepository } from "../database/repositories/medicationRepository";
import type { ScheduleRepository } from "../database/repositories/scheduleRepository";
import type { DoseLogRepository } from "../database/repositories/doseLogRepository";
import type { SettingsRepository } from "../database/repositories/settingsRepository";
import {
  generateMedicationOccurrencesForDate,
  indexLatestDoseLogs,
  resolveDoseOccurrence,
} from "../utils/doseEngine";
import type { ReminderScheduler } from "./reminderScheduler";
import { getNotificationPermissionStatus } from "./notificationPermissionService";
import { planOccurrenceReminders } from "./reminders/reminderPlanner";
import type { PlannedReminder } from "./reminders/reminderPlanner";
import type { DoseOccurrence, ReminderArtifact } from "../types/domain";
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
  const [medications, schedules, logs] = await Promise.all([
    medicationRepo.getAll(), scheduleRepo.getAll(), doseLogRepo.getAll(),
  ]);
  const latestDoseLogs = indexLatestDoseLogs(logs);
  const cancelledOccurrences = new Set<string>();
  const slotsByDay = new Map<string, DoseOccurrence[]>();
  const now = Date.now();
  const staleBefore = now - 15 * 60 * 1000;
  let removed = 0;

  for (const artifact of storedArtifacts) {
    const scheduledAt = new Date(artifact.scheduledFor).getTime();
    const medication = medications.find((item) => item.id === artifact.medicationId);
    const schedule = schedules.find((item) => item.id === artifact.scheduleId);
    const latestLog = latestDoseLogs.get(artifact.doseOccurrenceId);
    const date = artifact.doseWindowKey.slice(0, 10);
    const cacheKey = `${artifact.medicationId}:${date}`;
    if (medication && !slotsByDay.has(cacheKey)) {
      slotsByDay.set(cacheKey, generateMedicationOccurrencesForDate(
        medication, schedules.filter((item) => item.medicationId === medication.id),
        date, latestDoseLogs, new Date(now)
      ));
    }
    const recordedSlot = slotsByDay.get(cacheKey)?.find((item) => item.scheduledAt.slice(0, 16) === artifact.doseWindowKey);
    if (scheduledAt > now && (
      !medication || medication.isPaused || !schedule ||
      (!schedule.isActive && latestLog?.action !== "snoozed") ||
      recordedSlot?.status === "taken" || recordedSlot?.status === "skipped" ||
      latestLog?.action === "taken" || latestLog?.action === "skipped"
    )) {
      if (!cancelledOccurrences.has(artifact.doseOccurrenceId)) {
        await reminderScheduler.cancelSingle(artifact.doseOccurrenceId);
        cancelledOccurrences.add(artifact.doseOccurrenceId);
      }
      continue;
    }
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

  const horizon = now + 48 * 60 * 60 * 1000;
  const referenceTime = new Date(now);
  const today = formatLocalDate(referenceTime);
  let recreated = 0;

  for (const medication of medications) {
    if (medication.isPaused) continue;
    const medicationSchedules = schedules.filter(
      (schedule) => schedule.medicationId === medication.id && (schedule.isActive || Boolean(schedule.effectiveUntil))
    );

      const occurrences = Array.from({ length: 4 }, (_, index) =>
        generateMedicationOccurrencesForDate(
          medication,
          medicationSchedules,
          formatLocalDate(addDays(referenceTime, index - 1)),
          latestDoseLogs,
          referenceTime
        )
      )
        .flat();

      for (const originalOccurrence of occurrences) {
        const schedule = medicationSchedules.find((item) => item.id === originalOccurrence.scheduleId);
        if (!schedule) continue;
        const { occurrence, latestLog } = resolveDoseOccurrence(
          originalOccurrence,
          latestDoseLogs,
          referenceTime
        );
        if (originalOccurrence.scheduledAt.slice(0, 10) < today && latestLog?.action !== "snoozed") continue;
        let artifacts = await artifactRepo.getByDoseOccurrenceId(occurrence.id);
        if (occurrence.status === "taken" || occurrence.status === "skipped") {
          if (artifacts.length > 0) {
            await reminderScheduler.cancelSingle(occurrence.id);
          }
          continue;
        }

        const effectiveTimestamp = new Date(occurrence.scheduledAt).getTime();
        if (effectiveTimestamp <= now || effectiveTimestamp > horizon) continue;

        const snoozed = latestLog?.action === "snoozed";
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

  return { removed, recreated };
}

export async function getActiveNotificationCount(
  artifactRepo: ReminderArtifactRepository
): Promise<number> {
  return (await artifactRepo.getAll()).length;
}
