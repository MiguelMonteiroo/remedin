import { createRepositories } from "../../database/db";
import { migrateDbIfNeeded } from "../../database/migrations";
import { createTestDatabase } from "../../database/testing/testDatabase";
import type {
  DoseOccurrence,
  Medication,
  MedicationSchedule,
} from "../../types/domain";
import { createMedicationPersistenceService } from "../medicationPersistenceService";
import type { ReminderScheduler } from "../reminderScheduler";
import {
  isReminderArtifactActive,
  reconcileNotifications,
  reminderArtifactsMatchPlans,
} from "../reminderSyncService";
import { planOccurrenceReminders } from "../reminders/reminderPlanner";

function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

describe("reminder synchronization", () => {
  it("recovers a snooze on a retired schedule after editing", async () => {
    const { db, close } = createTestDatabase();
    const clock = jest.spyOn(Date, "now").mockReturnValue(new Date("2026-06-01T08:02:00").getTime());
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const med: Medication = { id: "snooze-edit", name: "Teste", dosage: "", notes: "", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-06-01T08:02:00", isPaused: false };
      await repos.medications.create(med);
      await repos.schedules.create({ id: "retired", medicationId: med.id, kind: "dailyTimes", times: ["08:00"], intervalHours: 0, weekdays: [], startDate: "", endDate: "", anchorAt: "", snoozeMinutes: 5, isActive: false, effectiveUntil: "2026-06-01T08:02:00" });
      await repos.doseLogs.create({ id: "snoozed-edit", medicationId: med.id, scheduleId: "retired", doseOccurrenceId: `${med.id}-retired-2026-06-01-0`, action: "snoozed", actionAt: "2026-06-01T08:00:00", snoozedUntil: "2026-06-01T08:05:00" });
      await repos.settings.update({ notificationsEnabled: true });
      const scheduler = { cancelSingle: jest.fn(), scheduleForOccurrence: jest.fn().mockResolvedValue(["alarm"]) } as unknown as ReminderScheduler;
      await reconcileNotifications(repos.reminderArtifacts, repos.medications, repos.schedules, repos.doseLogs, repos.settings, scheduler);
      expect(scheduler.scheduleForOccurrence).toHaveBeenCalledWith(expect.objectContaining({ scheduledAt: "2026-06-01T08:05:00" }), expect.anything(), expect.objectContaining({ id: "retired" }), expect.objectContaining({ snoozed: true }));
    } finally { clock.mockRestore(); close(); }
  });

  it("renews the 48-hour horizon after several days without foreground access", async () => {
    const { db, close } = createTestDatabase();
    const clock = jest.spyOn(Date, "now").mockReturnValue(new Date("2026-06-01T00:00:00").getTime());
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      await repos.medications.create({ id: "long-term", name: "Teste", dosage: "", notes: "", createdAt: "2026-01-01T00:00:00", updatedAt: "2026-01-01T00:00:00", isPaused: false });
      await repos.schedules.create({ id: "daily", medicationId: "long-term", kind: "dailyTimes", times: ["08:00"], intervalHours: 0, weekdays: [], startDate: "", endDate: "", anchorAt: "", snoozeMinutes: 5, isActive: true });
      await repos.settings.update({ notificationsEnabled: true });
      const scheduler = { cancelSingle: jest.fn(), scheduleForOccurrence: jest.fn().mockResolvedValue(["alarm"]) } as unknown as ReminderScheduler;
      const reconcile = () => reconcileNotifications(repos.reminderArtifacts, repos.medications, repos.schedules, repos.doseLogs, repos.settings, scheduler);
      await reconcile();
      expect(scheduler.scheduleForOccurrence).toHaveBeenCalledWith(expect.objectContaining({ scheduledAt: "2026-06-02T08:00:00" }), expect.anything(), expect.anything(), expect.anything());
      jest.mocked(scheduler.scheduleForOccurrence).mockClear();
      clock.mockReturnValue(new Date("2026-06-04T00:00:00").getTime());
      await reconcile();
      expect(scheduler.scheduleForOccurrence).toHaveBeenCalledWith(expect.objectContaining({ scheduledAt: "2026-06-05T08:00:00" }), expect.anything(), expect.anything(), expect.anything());
      expect(jest.mocked(scheduler.scheduleForOccurrence).mock.calls.every(([dose]) => dose.scheduledAt >= "2026-06-04")).toBe(true);
    } finally { clock.mockRestore(); close(); }
  });
  it("recognizes native alarms independently from Notifee triggers", () => {
    const artifact = {
      id: "artifact-1",
      kind: "doseAlarm" as const,
      notificationId: "native:artifact-1",
      doseOccurrenceId: "dose-1",
      medicationId: "med-1",
      scheduleId: "schedule-1",
      doseWindowKey: "2026-07-20T08:00",
      scheduledFor: "2026-07-20T08:00:00",
      expiresAt: "",
      createdAt: "2026-07-19T08:00:00",
    };

    expect(
      isReminderArtifactActive(
        artifact,
        new Set(),
        new Set(["native:artifact-1"])
      )
    ).toBe(true);
    expect(isReminderArtifactActive(artifact, new Set(), new Set())).toBe(false);
  });

  it("rejects native artifacts that still point to the pre-edit time", () => {
    const occurrence: DoseOccurrence = {
      id: "med-1-schedule-1-2026-07-14-0",
      medicationId: "med-1",
      scheduleId: "schedule-1",
      scheduledAt: "2026-07-14T14:00:00",
      status: "pending",
    };
    const plans = planOccurrenceReminders(
      occurrence,
      new Date("2026-07-14T00:00:00")
    );
    const artifacts = plans.map((plan, index) => ({
      id: `artifact-${index}`,
      kind: plan.kind,
      notificationId: `native-${index}`,
      doseOccurrenceId: occurrence.id,
      medicationId: occurrence.medicationId,
      scheduleId: occurrence.scheduleId,
      doseWindowKey: "2026-07-14T12:00",
      scheduledFor: plan.scheduledFor.replace("T14:", "T12:"),
      expiresAt: "",
      createdAt: "2026-07-13T00:00:00",
    }));

    expect(reminderArtifactsMatchPlans(artifacts, plans)).toBe(false);
  });

  it("recreates future reminders whose native triggers disappeared", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const persistence = createMedicationPersistenceService(db);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = localDate(tomorrow);
      const medication: Medication = {
        id: "med-1",
        name: "Dipirona",
        dosage: "500 mg",
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPaused: false,
      };
      const schedule: MedicationSchedule = {
        id: "schedule-1",
        medicationId: medication.id,
        kind: "dailyTimes",
        times: ["12:00"],
        intervalHours: 0,
        weekdays: [],
        startDate: "",
        endDate: "",
        anchorAt: "",
        snoozeMinutes: 5,
        isActive: true,
      };
      const occurrence: DoseOccurrence = {
        id: `${medication.id}-${schedule.id}-${date}-0`,
        medicationId: medication.id,
        scheduleId: schedule.id,
        scheduledAt: `${date}T12:00:00`,
        status: "pending",
      };
      await persistence.createWithSchedule(medication, schedule);
      await repos.settings.update({
        notificationsEnabled: true,
        defaultSnoozeMinutes: 5,
        userName: "Maria",
        fullScreenAlarmEnabled: false,
        criticalAlertsEnabled: false,
        showLockScreenDetails: false,
        reminderSetupCompleted: true,
        onboardingCompleted: true,
      });

      const plans = planOccurrenceReminders(occurrence);
      for (const [index, plan] of plans.entries()) {
        await repos.reminderArtifacts.create({
          id: `artifact-${index}`,
          kind: plan.kind,
          notificationId: `missing-native-${index}`,
          doseOccurrenceId: occurrence.id,
          medicationId: medication.id,
          scheduleId: schedule.id,
          doseWindowKey: occurrence.scheduledAt.slice(0, 16),
          scheduledFor: plan.scheduledFor,
          expiresAt: "",
          createdAt: new Date().toISOString(),
        });
      }

      const scheduler = {
        cancelSingle: jest.fn().mockResolvedValue(undefined),
        scheduleForOccurrence: jest
          .fn()
          .mockResolvedValue(["replacement-trigger"]),
      } as unknown as ReminderScheduler;

      const result = await reconcileNotifications(
        repos.reminderArtifacts,
        repos.medications,
        repos.schedules,
        repos.doseLogs,
        repos.settings,
        scheduler
      );

      expect(result.removed).toBe(plans.length);
      expect(result.recreated).toBeGreaterThanOrEqual(1);
      expect(scheduler.scheduleForOccurrence).toHaveBeenCalledWith(
        expect.objectContaining({ id: occurrence.id }),
        medication,
        schedule,
        expect.any(Object)
      );
    } finally {
      close();
    }
  });

  it.each(["taken", "skipped"] as const)(
    "does not recreate reminders for a %s dose",
    async (action) => {
      const { db, close } = createTestDatabase();

      try {
        await migrateDbIfNeeded(db);
        const repos = createRepositories(db);
        const persistence = createMedicationPersistenceService(db);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = localDate(tomorrow);
        const medication: Medication = {
          id: `med-${action}`,
          name: "Dipirona",
          dosage: "500 mg",
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPaused: false,
        };
        const schedule: MedicationSchedule = {
          id: `schedule-${action}`,
          medicationId: medication.id,
          kind: "dailyTimes",
          times: ["12:00"],
          intervalHours: 0,
          weekdays: [],
          startDate: "",
          endDate: "",
          anchorAt: "",
          snoozeMinutes: 5,
          isActive: true,
        };
        const occurrenceId = `${medication.id}-${schedule.id}-${date}-0`;
        await persistence.createWithSchedule(medication, schedule);
        await repos.settings.update({
          notificationsEnabled: true,
          defaultSnoozeMinutes: 5,
          userName: "Maria",
          fullScreenAlarmEnabled: false,
          criticalAlertsEnabled: false,
          showLockScreenDetails: false,
          reminderSetupCompleted: true,
          onboardingCompleted: true,
        });
        await repos.doseLogs.create({
          id: `log-${action}`,
          doseOccurrenceId: occurrenceId,
          medicationId: medication.id,
          scheduleId: schedule.id,
          action,
          actionAt: new Date().toISOString(),
          snoozedUntil: "",
        });

        const scheduler = {
          cancelSingle: jest.fn().mockResolvedValue(undefined),
          scheduleForOccurrence: jest.fn().mockResolvedValue([]),
        } as unknown as ReminderScheduler;

        await reconcileNotifications(
          repos.reminderArtifacts,
          repos.medications,
          repos.schedules,
          repos.doseLogs,
          repos.settings,
          scheduler
        );

        expect(scheduler.scheduleForOccurrence).not.toHaveBeenCalledWith(
          expect.objectContaining({ id: occurrenceId }),
          expect.anything(),
          expect.anything(),
          expect.anything()
        );
      } finally {
        close();
      }
    }
  );

  it.each([false, true])("recreates a snoozed alarm after restart (across midnight: %s)", async (acrossMidnight) => {
    const { db, close } = createTestDatabase();
    const now = jest.spyOn(Date, "now").mockReturnValue(new Date("2026-08-15T00:02:00").getTime());

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const persistence = createMedicationPersistenceService(db);
      const date = acrossMidnight ? "2026-08-14" : "2026-08-15";
      const time = acrossMidnight ? "23:59" : "00:01";
      const medication: Medication = {
        id: "med-snoozed",
        name: "Losartana",
        dosage: "50 mg",
        notes: "",
        createdAt: "2026-08-01T00:00:00",
        updatedAt: "2026-08-01T00:00:00",
        isPaused: false,
      };
      const schedule: MedicationSchedule = {
        id: "schedule-snoozed",
        medicationId: medication.id,
        kind: "dailyTimes",
        times: [time],
        intervalHours: 0,
        weekdays: [],
        startDate: "",
        endDate: "",
        anchorAt: "",
        snoozeMinutes: 5,
        isActive: true,
      };
      const occurrenceId = `${medication.id}-${schedule.id}-${date}-0`;
      const snoozedUntil = "2026-08-15T00:04:00";
      await persistence.createWithSchedule(medication, schedule);
      await repos.settings.update({
        notificationsEnabled: true,
        defaultSnoozeMinutes: 5,
        userName: "Maria",
        fullScreenAlarmEnabled: true,
        criticalAlertsEnabled: false,
        showLockScreenDetails: true,
        reminderSetupCompleted: true,
        onboardingCompleted: true,
      });
      await repos.doseLogs.create({
        id: "log-snoozed",
        doseOccurrenceId: occurrenceId,
        medicationId: medication.id,
        scheduleId: schedule.id,
        action: "snoozed",
        actionAt: new Date().toISOString(),
        snoozedUntil,
      });

      const scheduler = {
        cancelSingle: jest.fn().mockResolvedValue(undefined),
        scheduleForOccurrence: jest.fn().mockResolvedValue(["snoozed-alarm"]),
      } as unknown as ReminderScheduler;

      await reconcileNotifications(
        repos.reminderArtifacts,
        repos.medications,
        repos.schedules,
        repos.doseLogs,
        repos.settings,
        scheduler
      );

      expect(scheduler.scheduleForOccurrence).toHaveBeenCalledWith(
        expect.objectContaining({
          id: occurrenceId,
          scheduledAt: snoozedUntil,
          status: "snoozed",
        }),
        medication,
        schedule,
        expect.objectContaining({
          snoozed: true,
          alarmAt: new Date(snoozedUntil),
        })
      );
    } finally {
      now.mockRestore();
      close();
    }
  });
});
