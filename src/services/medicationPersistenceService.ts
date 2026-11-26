import type { NativeDB } from "../database/nativeDb";
import { createRepositories } from "../database/db";
import type { Medication, MedicationSchedule } from "../types/domain";
import { getCurrentSchedule } from "../utils/currentSchedule";

export function createMedicationPersistenceService(db: NativeDB) {
  function assertOwnership(
    medication: Medication,
    schedule: MedicationSchedule
  ): void {
    if (schedule.medicationId !== medication.id) {
      throw new Error("Schedule does not belong to medication");
    }
  }

  async function createWithSchedule(
    medication: Medication,
    schedule: MedicationSchedule
  ): Promise<void> {
    assertOwnership(medication, schedule);
    await db.withTransactionAsync(async (transaction) => {
      const repositories = createRepositories(transaction);
      await repositories.medications.create(medication);
      await repositories.schedules.create(schedule);
    });
  }

  async function updateWithSchedule(
    medication: Medication,
    schedule: MedicationSchedule
  ): Promise<void> {
    assertOwnership(medication, schedule);
    await db.withTransactionAsync(async (transaction) => {
      const repositories = createRepositories(transaction);
      const existingSchedule = await repositories.schedules.getById(
        schedule.id
      );
      if (
        existingSchedule &&
        existingSchedule.medicationId !== medication.id
      ) {
        throw new Error("Schedule belongs to another medication");
      }

      await repositories.medications.update(medication);
      const effectiveAt = medication.updatedAt;
      const activeSchedules = (await repositories.schedules.getByMedicationId(medication.id))
        .filter((candidate) => candidate.isActive);
      const recurrenceChanged = !existingSchedule ||
        JSON.stringify([existingSchedule.kind, existingSchedule.times, existingSchedule.intervalHours, existingSchedule.weekdays, existingSchedule.startDate, existingSchedule.endDate, existingSchedule.anchorAt]) !==
        JSON.stringify([schedule.kind, schedule.times, schedule.intervalHours, schedule.weekdays, schedule.startDate, schedule.endDate, schedule.anchorAt]);

      if (recurrenceChanged) {
        for (const active of activeSchedules) {
          await repositories.schedules.update({ ...active, isActive: false, effectiveUntil: effectiveAt });
        }
        await repositories.schedules.create({
          ...schedule,
          id: existingSchedule ? `${schedule.id}-revision-${Date.now()}` : schedule.id,
          isActive: !medication.isPaused,
          effectiveFrom: effectiveAt,
          effectiveUntil: medication.isPaused ? effectiveAt : undefined,
        });
        return;
      }
      await repositories.schedules.deactivateOthers(
        medication.id,
        schedule.id
      );

      if (existingSchedule) {
        await repositories.schedules.update({ ...schedule, isActive: existingSchedule.isActive });
      } else {
        await repositories.schedules.create({ ...schedule, isActive: true });
      }
    });
  }

  async function remove(medicationId: string): Promise<void> {
    await db.withTransactionAsync(async (transaction) => {
      const repositories = createRepositories(transaction);
      await repositories.medications.remove(medicationId);
    });
  }

  async function setPaused(medication: Medication): Promise<void> {
    await db.withTransactionAsync(async (transaction) => {
      const repositories = createRepositories(transaction);
      const schedules = await repositories.schedules.getByMedicationId(medication.id);
      await repositories.medications.update(medication);
      if (medication.isPaused) {
        for (const schedule of schedules.filter((item) => item.isActive)) {
          await repositories.schedules.update({ ...schedule, isActive: false, effectiveUntil: medication.updatedAt });
        }
      } else {
        const last = getCurrentSchedule(schedules);
        for (const active of schedules.filter((item) => item.isActive)) {
          await repositories.schedules.update({ ...active, isActive: false, effectiveUntil: medication.updatedAt });
        }
        if (last) await repositories.schedules.create({ ...last, id: `${last.id}-resume-${Date.now()}`, isActive: true, effectiveFrom: medication.updatedAt, effectiveUntil: undefined });
      }
    });
  }

  return { createWithSchedule, updateWithSchedule, remove, setPaused };
}

export type MedicationPersistenceService = ReturnType<
  typeof createMedicationPersistenceService
>;
