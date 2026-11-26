import type { MedicationSchedule } from "../types/domain";

export function getCurrentSchedule(schedules: MedicationSchedule[]): MedicationSchedule | undefined {
  return [...schedules].sort((left, right) =>
    Number(right.isActive) - Number(left.isActive) ||
    (right.effectiveFrom || "").localeCompare(left.effectiveFrom || "") ||
    (right.effectiveUntil || "").localeCompare(left.effectiveUntil || "")
  )[0];
}
