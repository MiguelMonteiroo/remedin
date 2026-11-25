import type { DoseLog, Medication, MedicationSchedule } from "../../types/domain";
import { formatLocalDate } from "../dateTime";
import { generateDoseOccurrencesForDate, getTodayDoseViewModel } from "../doseEngine";
import { buildAdherenceHistory, getLast7Days } from "../stats";

it("resolves 72,000 dose records for Today and the seven-day history", () => {
  const now = new Date(2026, 7, 15, 12);
  const medications: Medication[] = Array.from({ length: 100 }, (_, index) => ({
    id: `med-${index}`,
    name: `Medicamento de teste ${index}`,
    dosage: "",
    notes: "",
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-01-01T00:00:00",
    isPaused: false,
  }));
  const schedules: MedicationSchedule[] = medications.map(({ id }) => ({
    id: `schedule-${id}`,
    medicationId: id,
    kind: "dailyTimes",
    times: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
    intervalHours: 0,
    weekdays: [],
    startDate: "",
    endDate: "",
    anchorAt: "",
    snoozeMinutes: 5,
    isActive: true,
  }));
  const logs: DoseLog[] = [];
  for (let offset = 0; offset < 120; offset++) {
    const date = formatLocalDate(new Date(2026, 7, 15 - offset, 12));
    for (const [index, medication] of medications.entries()) {
      const doses = generateDoseOccurrencesForDate(medication, schedules[index], date);
      for (const dose of doses) {
        logs.push({
          id: dose.id,
          doseOccurrenceId: dose.id,
          medicationId: medication.id,
          scheduleId: dose.scheduleId,
          action: index % 2 === 0 ? "taken" : "skipped",
          actionAt: dose.scheduledAt,
          snoozedUntil: "",
        });
      }
    }
  }

  expect(logs).toHaveLength(72_000);
  const history = buildAdherenceHistory(getLast7Days(now), medications, schedules, logs, now);
  const today = getTodayDoseViewModel(formatLocalDate(now), medications, schedules, logs, now);

  expect(today.summary).toMatchObject({ total: 600, taken: 300, skipped: 300 });
  expect(history).toHaveLength(7);
  for (const day of history) {
    expect(day).toMatchObject({ total: 600, taken: 300, skipped: 300, percentage: 50 });
  }
});
