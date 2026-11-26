import { createRepositories } from "../../database/db";
import { migrateDbIfNeeded } from "../../database/migrations";
import { createTestDatabase } from "../../database/testing/testDatabase";
import type { Medication, MedicationSchedule } from "../../types/domain";
import { createMedicationPersistenceService } from "../medicationPersistenceService";
import { getTodayDoseViewModel } from "../../utils/doseEngine";

const medication: Medication = {
  id: "med-1",
  name: "Dipirona",
  dosage: "500 mg",
  notes: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  isPaused: false,
};

function schedule(
  id: string,
  medicationId = medication.id
): MedicationSchedule {
  return {
    id,
    medicationId,
    kind: "dailyTimes",
    times: ["08:00"],
    intervalHours: 0,
    weekdays: [],
    startDate: "",
    endDate: "",
    anchorAt: "",
    snoozeMinutes: 5,
    isActive: true,
  };
}

describe("medication persistence service", () => {
  it("resumes the latest edited time rather than the original schedule", async () => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const original = schedule("first");
      await service.createWithSchedule(medication, original);
      await service.updateWithSchedule({ ...medication, updatedAt: "2026-01-03T10:00:00" }, { ...original, times: ["14:00"] });
      await service.setPaused({ ...medication, isPaused: true, updatedAt: "2026-01-04T10:00:00" });
      await service.setPaused({ ...medication, updatedAt: "2026-01-06T10:00:00" });
      expect((await repos.schedules.getAll()).find((item) => item.isActive)?.times).toEqual(["14:00"]);
    } finally { close(); }
  });

  it("does not duplicate a taken slot when adding weekdays to the schedule", async () => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const original = { ...schedule("slot"), kind: "weekdays" as const, times: ["20:00"], weekdays: [1] };
      await service.createWithSchedule(medication, original);
      const occurrence = getTodayDoseViewModel("2026-06-01", [medication], [original], []).occurrences[0];
      await repos.doseLogs.create({ id: "same-slot", doseOccurrenceId: occurrence.id, medicationId: medication.id, scheduleId: original.id, action: "taken", actionAt: "2026-06-01T19:00:00", snoozedUntil: "" });
      await service.updateWithSchedule({ ...medication, updatedAt: "2026-06-01T19:30:00" }, { ...original, weekdays: [1, 3] });
      const view = getTodayDoseViewModel("2026-06-01", [medication], await repos.schedules.getAll(), await repos.doseLogs.getAll());
      expect(view.occurrences).toHaveLength(1);
      expect(view.summary).toMatchObject({ total: 1, taken: 1, pending: 0 });
    } finally { close(); }
  });

  it.each([false, true])("does not fabricate paused-period doses after an edit (recurrence changed: %s)", async (changeTime) => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      await service.createWithSchedule(medication, schedule("paused-edit"));
      await service.setPaused({ ...medication, isPaused: true, updatedAt: "2026-01-03T10:00:00" });
      const previous = (await repos.schedules.getAll())[0];
      await service.updateWithSchedule({ ...medication, isPaused: true, updatedAt: "2026-01-04T10:00:00", name: "Novo nome" }, { ...previous, ...(changeTime ? { times: ["14:00"] } : {}) });
      await service.setPaused({ ...medication, updatedAt: "2026-01-06T10:00:00" });
      const schedules = await repos.schedules.getAll();
      expect(getTodayDoseViewModel("2026-01-05", [medication], schedules, []).occurrences).toHaveLength(0);
      const future = getTodayDoseViewModel("2026-01-07", [medication], schedules, []).occurrences;
      expect(future).toHaveLength(1);
      expect(future[0].scheduledAt).toBe(changeTime ? "2026-01-07T14:00:00" : "2026-01-07T08:00:00");
    } finally { close(); }
  });

  it("preserves a dose taken before its scheduled time when recurrence changes", async () => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const original = { ...schedule("early"), times: ["20:00"] };
      await service.createWithSchedule(medication, original);
      const occurrence = getTodayDoseViewModel("2026-01-03", [medication], [original], []).occurrences[0];
      await repos.doseLogs.create({ id: "early-taken", doseOccurrenceId: occurrence.id, medicationId: medication.id, scheduleId: original.id, action: "taken", actionAt: "2026-01-03T19:00:00", snoozedUntil: "" });
      await service.updateWithSchedule({ ...medication, updatedAt: "2026-01-03T19:30:00" }, { ...original, times: ["21:00"] });
      const view = getTodayDoseViewModel("2026-01-03", [medication], await repos.schedules.getAll(), await repos.doseLogs.getAll());
      expect(view.occurrences.find((item) => item.id === occurrence.id)?.status).toBe("taken");
      expect(view.summary.taken).toBe(1);
    } finally { close(); }
  });

  it("keeps previous occurrences and their logs when editing an existing schedule", async () => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const original = schedule("history");
      await service.createWithSchedule(medication, original);
      const previous = getTodayDoseViewModel("2026-01-03", [medication], [original], []).occurrences[0];
      await repos.doseLogs.create({ id: "taken", doseOccurrenceId: previous.id, medicationId: medication.id, scheduleId: original.id, action: "taken", actionAt: "2026-01-03T08:00:00", snoozedUntil: "" });
      await service.updateWithSchedule({ ...medication, updatedAt: "2026-01-04T10:00:00" }, { ...original, times: ["14:00"] });
      const schedules = await repos.schedules.getAll();
      const logs = await repos.doseLogs.getAll();
      const history = getTodayDoseViewModel("2026-01-03", [medication], schedules, logs);
      expect(history.occurrences).toHaveLength(1);
      expect(history.occurrences[0]).toMatchObject({ id: previous.id, scheduledAt: "2026-01-03T08:00:00", status: "taken" });
      const future = getTodayDoseViewModel("2026-01-05", [medication], schedules, logs);
      expect(future.occurrences).toHaveLength(1);
      expect(future.occurrences[0].scheduledAt).toBe("2026-01-05T14:00:00");
    } finally { close(); }
  });

  it("preserves earlier doses while paused and leaves the paused period empty after resume", async () => {
    const { db, close } = createTestDatabase();
    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      await service.createWithSchedule(medication, schedule("pause"));
      const paused = { ...medication, isPaused: true, updatedAt: "2026-01-04T10:00:00" };
      await service.setPaused(paused);
      expect(getTodayDoseViewModel("2026-01-03", [paused], await repos.schedules.getAll(), []).occurrences).toHaveLength(1);
      const resumed = { ...medication, updatedAt: "2026-01-06T10:00:00" };
      await service.setPaused(resumed);
      const schedules = await repos.schedules.getAll();
      expect(getTodayDoseViewModel("2026-01-05", [resumed], schedules, []).occurrences).toHaveLength(0);
      expect(getTodayDoseViewModel("2026-01-07", [resumed], schedules, []).occurrences).toHaveLength(1);
    } finally { close(); }
  });

  it("rolls back medication creation when its schedule cannot be saved", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);

      await expect(
        service.createWithSchedule(medication, schedule("schedule-1", "missing-med"))
      ).rejects.toThrow();

      await expect(repos.medications.getById(medication.id)).resolves.toBeNull();
    } finally {
      close();
    }
  });

  it("rejects a schedule owned by another existing medication", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const otherMedication = { ...medication, id: "med-2", name: "Losartana" };
      await service.createWithSchedule(
        otherMedication,
        schedule("schedule-2", otherMedication.id)
      );

      await expect(
        service.createWithSchedule(
          medication,
          schedule("schedule-1", otherMedication.id)
        )
      ).rejects.toThrow("Schedule does not belong to medication");

      await expect(repos.medications.getById(medication.id)).resolves.toBeNull();
      await expect(repos.schedules.getByMedicationId(otherMedication.id)).resolves.toHaveLength(1);
    } finally {
      close();
    }
  });

  it("atomically replaces the active schedule while preserving history", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      await service.createWithSchedule(medication, schedule("schedule-1"));

      const updatedMedication = {
        ...medication,
        name: "Dipirona sódica",
        updatedAt: "2026-01-02T00:00:00.000Z",
      };
      await service.updateWithSchedule(
        updatedMedication,
        schedule("schedule-2")
      );

      expect((await repos.medications.getById(medication.id))?.name).toBe(
        "Dipirona sódica"
      );
      expect(await repos.schedules.getByMedicationId(medication.id)).toEqual([
        expect.objectContaining({ id: "schedule-2", isActive: true }),
        expect.objectContaining({ id: "schedule-1", isActive: false }),
      ]);
    } finally {
      close();
    }
  });

  it("removes the medication and all records it owns", async () => {
    const { db, close } = createTestDatabase();

    try {
      await migrateDbIfNeeded(db);
      const repos = createRepositories(db);
      const service = createMedicationPersistenceService(db);
      const activeSchedule = schedule("schedule-1");
      await service.createWithSchedule(medication, activeSchedule);
      await repos.doseLogs.create({
        id: "log-1",
        doseOccurrenceId: "dose-1",
        medicationId: medication.id,
        scheduleId: activeSchedule.id,
        action: "taken",
        actionAt: "2026-01-01T08:00:00.000Z",
        snoozedUntil: "",
      });

      await service.remove(medication.id);

      await expect(repos.medications.getById(medication.id)).resolves.toBeNull();
      await expect(repos.schedules.getByMedicationId(medication.id)).resolves.toEqual([]);
      await expect(repos.doseLogs.getByMedicationId(medication.id)).resolves.toEqual([]);
    } finally {
      close();
    }
  });
});
