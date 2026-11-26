import {
  Medication,
  MedicationSchedule,
  DoseOccurrence,
  DoseLog,
  DoseStatus,
} from "../types/domain";
import { formatLocalDate, normalizeDoseDateTime } from "./dateTime";

function occursAfterMedicationCreation(
  occurrence: DoseOccurrence,
  medication: Medication
): boolean {
  const createdAt = new Date(medication.createdAt).getTime();
  const scheduledAt = new Date(occurrence.scheduledAt).getTime();
  if (!Number.isFinite(createdAt) || !Number.isFinite(scheduledAt)) return true;
  return scheduledAt >= createdAt;
}

function occursDuringSchedule(occurrence: DoseOccurrence, schedule: MedicationSchedule): boolean {
  const timestamp = new Date(occurrence.scheduledAt).getTime();
  return (!schedule.effectiveFrom || timestamp >= new Date(schedule.effectiveFrom).getTime()) &&
    (!schedule.effectiveUntil || timestamp < new Date(schedule.effectiveUntil).getTime());
}

function getDayOfWeek(dateString: string): number {
  const date = new Date(dateString + "T12:00:00");
  return date.getDay();
}

function isDateInRange(
  dateString: string,
  startDate: string,
  endDate: string
): boolean {
  if (startDate && dateString < startDate) return false;
  if (endDate && dateString > endDate) return false;
  return true;
}

function generateIntervalOccurrences(
  medication: Medication,
  schedule: MedicationSchedule,
  date: string
): DoseOccurrence[] {
  const occurrences: DoseOccurrence[] = [];
  const fallbackAnchorDate = schedule.startDate || date;
  const anchor = new Date(
    schedule.anchorAt || `${fallbackAnchorDate}T${schedule.times[0] || "08:00"}:00`
  );
  const intervalMs = schedule.intervalHours * 60 * 60 * 1000;
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  if (
    !Number.isFinite(anchor.getTime()) ||
    !Number.isFinite(intervalMs) ||
    intervalMs < 3_600_000
  ) return [];

  const firstIndex = Math.max(
    0,
    Math.ceil((dayStart.getTime() - anchor.getTime()) / intervalMs)
  );

  for (
    let sequence = firstIndex;
    anchor.getTime() + sequence * intervalMs < dayEnd.getTime();
    sequence++
  ) {
    const occurrenceDate = new Date(anchor.getTime() + sequence * intervalMs);
    if (occurrenceDate.getTime() < dayStart.getTime()) continue;

    const occurrenceDateString = `${occurrenceDate.getFullYear()}-${String(
      occurrenceDate.getMonth() + 1
    ).padStart(2, "0")}-${String(occurrenceDate.getDate()).padStart(2, "0")}`;
    if (occurrenceDateString !== date) continue;

    const hours = String(occurrenceDate.getHours()).padStart(2, "0");
    const minutes = String(occurrenceDate.getMinutes()).padStart(2, "0");
    occurrences.push({
      id: `${medication.id}-${schedule.id}-${date}-${occurrences.length}`,
      medicationId: medication.id,
      scheduleId: schedule.id,
      scheduledAt: `${date}T${hours}:${minutes}:00`,
      status: "pending",
    });
  }

  return occurrences;
}

export function generateDoseOccurrencesForDate(
  medication: Medication,
  schedule: MedicationSchedule,
  date: string
): DoseOccurrence[] {
  if (medication.isPaused && !schedule.effectiveUntil) return [];
  if (!schedule.isActive && !schedule.effectiveUntil) return [];
  if (!isDateInRange(date, schedule.startDate, schedule.endDate)) return [];

  if (schedule.kind === "intervalHours") {
    return generateIntervalOccurrences(medication, schedule, date).filter(
      (occurrence) => occursAfterMedicationCreation(occurrence, medication) && occursDuringSchedule(occurrence, schedule)
    );
  }

  if (schedule.kind === "weekdays") {
    const dayOfWeek = getDayOfWeek(date);
    if (!schedule.weekdays.includes(dayOfWeek)) return [];
  }

  return schedule.times
    .map((time, index) => ({
      id: `${medication.id}-${schedule.id}-${date}-${index}`,
      medicationId: medication.id,
      scheduleId: schedule.id,
      scheduledAt: `${date}T${time}:00`,
      status: "pending" as DoseStatus,
    }))
    .filter((occurrence) =>
      occursAfterMedicationCreation(occurrence, medication) && occursDuringSchedule(occurrence, schedule)
    );
}

export function resolveDoseStatus(
  doseOccurrenceId: string,
  logs: DoseLog[],
  scheduledAt?: string,
  now = new Date()
): DoseStatus {
  return resolveStatusFromLog(getLatestDoseLog(doseOccurrenceId, logs), scheduledAt, now);
}

function resolveStatusFromLog(
  latestLog: DoseLog | null,
  scheduledAt: string | undefined,
  now: Date
): DoseStatus {
  const unresolvedStatus = (): DoseStatus =>
    scheduledAt && scheduledAt.slice(0, 10) < formatLocalDate(now)
      ? "unrecorded"
      : "pending";

  if (!latestLog) return unresolvedStatus();

  if (latestLog.action === "undone") return "pending";
  if (latestLog.action === "snoozed") {
    const snoozedUntil = new Date(latestLog.snoozedUntil).getTime();
    if (snoozedUntil > now.getTime()) return "snoozed";
    return unresolvedStatus();
  }

  if (latestLog.action === "taken") return "taken";
  if (latestLog.action === "skipped") return "skipped";

  return "pending";
}

function isLatestLog(log: DoseLog, previous: DoseLog | null | undefined): boolean {
  return !previous || log.actionAt.localeCompare(previous.actionAt) >= 0;
}

function getLatestDoseLog(
  doseOccurrenceId: string,
  logs: DoseLog[] | ReadonlyMap<string, DoseLog>
): DoseLog | null {
  if (!Array.isArray(logs)) return logs.get(doseOccurrenceId) ?? null;

  let latest: DoseLog | null = null;
  for (const log of logs) {
    if (log.doseOccurrenceId === doseOccurrenceId && isLatestLog(log, latest)) latest = log;
  }
  return latest;
}

export function indexLatestDoseLogs(logs: DoseLog[]): ReadonlyMap<string, DoseLog> {
  const latest = new Map<string, DoseLog>();
  for (const log of logs) {
    if (isLatestLog(log, latest.get(log.doseOccurrenceId))) latest.set(log.doseOccurrenceId, log);
  }
  return latest;
}

export function resolveDoseOccurrence(
  occurrence: DoseOccurrence,
  logs: DoseLog[] | ReadonlyMap<string, DoseLog>,
  now = new Date()
): { occurrence: DoseOccurrence; latestLog: DoseLog | null } {
  const latestLog = getLatestDoseLog(occurrence.id, logs);
  const scheduledAt =
    latestLog?.action === "snoozed"
      ? normalizeDoseDateTime(latestLog.snoozedUntil)
      : occurrence.scheduledAt;
  const status = resolveStatusFromLog(latestLog, scheduledAt, now);

  return {
    occurrence: { ...occurrence, scheduledAt, status },
    latestLog,
  };
}

export function getTodayDoseViewModel(
  date: string,
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: DoseLog[] | ReadonlyMap<string, DoseLog>,
  now = new Date()
): { occurrences: DoseOccurrence[]; summary: AdherenceSummary } {
  const latestLogs = Array.isArray(logs) ? indexLatestDoseLogs(logs) : logs;
  const schedulesByMedication = new Map<string, MedicationSchedule[]>();
  for (const schedule of schedules) {
    const existing = schedulesByMedication.get(schedule.medicationId);
    if (existing) existing.push(schedule);
    else schedulesByMedication.set(schedule.medicationId, [schedule]);
  }

  const allOccurrences: DoseOccurrence[] = [];
  for (const medication of medications) {
    allOccurrences.push(...generateMedicationOccurrencesForDate(medication, schedulesByMedication.get(medication.id) ?? [], date, latestLogs, now));
  }

  allOccurrences.sort(
    (left, right) =>
      new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
  );

  return {
    occurrences: allOccurrences,
    summary: getAdherenceSummary(allOccurrences),
  };
}

export function generateMedicationOccurrencesForDate(
  medication: Medication,
  schedules: MedicationSchedule[],
  date: string,
  latestLogs: ReadonlyMap<string, DoseLog>,
  now = new Date()
): DoseOccurrence[] {
  const bySlot = new Map<string, DoseOccurrence>();
  for (const schedule of schedules) {
    for (const occurrence of generateResolvedOccurrencesForDate(medication, schedule, date, latestLogs, now)) {
      const previous = bySlot.get(occurrence.scheduledAt);
      const log = latestLogs.get(occurrence.id);
      const previousLog = previous && latestLogs.get(previous.id);
      if (!previous || (log && (!previousLog || log.actionAt >= previousLog.actionAt))) {
        bySlot.set(occurrence.scheduledAt, occurrence);
      }
    }
  }
  return [...bySlot.values()];
}

export function generateResolvedOccurrencesForDate(
  medication: Medication,
  schedule: MedicationSchedule,
  date: string,
  latestLogs: ReadonlyMap<string, DoseLog>,
  now = new Date()
): DoseOccurrence[] {
  const occurrences = generateDoseOccurrencesForDate(medication, schedule, date);
  const ids = new Set(occurrences.map((item) => item.id));
  // Explicit records outlive edits to recurrence coverage, including early intake.
  const originalOccurrences = generateDoseOccurrencesForDate(
    { ...medication, isPaused: false },
    { ...schedule, isActive: true, effectiveFrom: undefined, effectiveUntil: undefined },
    date
  );
  for (const occurrence of originalOccurrences) {
    const log = latestLogs.get(occurrence.id);
    if (!ids.has(occurrence.id) && log && ["taken", "skipped", "snoozed"].includes(log.action)) {
      occurrences.push(occurrence);
    }
  }
  return occurrences.map((occurrence) => resolveDoseOccurrence(occurrence, latestLogs, now).occurrence);
}

export interface AdherenceSummary {
  total: number;
  taken: number;
  pending: number;
  skipped: number;
  unrecorded: number;
  snoozed: number;
}

export function getAdherenceSummary(
  occurrences: DoseOccurrence[]
): AdherenceSummary {
  const summary: AdherenceSummary = {
    total: occurrences.length,
    taken: 0,
    pending: 0,
    skipped: 0,
    unrecorded: 0,
    snoozed: 0,
  };

  for (const occ of occurrences) {
    if (occ.status === "taken") summary.taken++;
    else if (occ.status === "pending") summary.pending++;
    else if (occ.status === "skipped") summary.skipped++;
    else if (occ.status === "unrecorded") summary.unrecorded++;
    else if (occ.status === "snoozed") summary.snoozed++;
  }

  return summary;
}
