import type {
  DoseLog,
  Medication,
  MedicationSchedule,
} from "../types/domain";
import { getTodayDoseViewModel, indexLatestDoseLogs } from "./doseEngine";
import { formatLocalDate } from "./dateTime";

export interface AdherenceResult {
  percentage: number;
  taken: number;
  total: number;
}

export function calculateAdherence(
  logs: DoseLog[],
  totalExpected: number
): AdherenceResult {
  const latestActions = new Map<string, DoseLog>();

  for (const log of logs) {
    const existing = latestActions.get(log.doseOccurrenceId);
    if (!existing || log.actionAt > existing.actionAt) {
      latestActions.set(log.doseOccurrenceId, log);
    }
  }

  const taken = Array.from(latestActions.values()).filter(
    (log) => log.action === "taken"
  ).length;

  return {
    percentage: totalExpected > 0 ? Math.round((taken / totalExpected) * 100) : 0,
    taken,
    total: totalExpected,
  };
}

export interface DailyAdherenceSummary {
  date: string;
  total: number;
  taken: number;
  pending: number;
  skipped: number;
  snoozed: number;
  unrecorded: number;
  percentage: number | null;
}

export function buildDailyAdherenceSummary(
  date: string,
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: DoseLog[] | ReadonlyMap<string, DoseLog>,
  now = new Date()
): DailyAdherenceSummary {
  const { summary } = getTodayDoseViewModel(date, medications, schedules, logs, now);
  return {
    date,
    ...summary,
    percentage: summary.total ? Math.round((summary.taken / summary.total) * 100) : null,
  };
}

export function buildAdherenceHistory(
  dates: string[],
  medications: Medication[],
  schedules: MedicationSchedule[],
  logs: DoseLog[],
  now = new Date()
): DailyAdherenceSummary[] {
  const latestLogs = indexLatestDoseLogs(logs);
  return dates.map((date) => buildDailyAdherenceSummary(date, medications, schedules, latestLogs, now));
}

function parseLocalDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function getLast7Days(reference = new Date()): string[] {
  const days: string[] = [];
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(reference);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    days.push(formatLocalDate(date));
  }
  return days;
}

const WEEKDAYS = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const MONTHS = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
];

export function formatHistoryDayLabel(
  date: string,
  reference = new Date()
): string {
  const today = new Date(reference);
  today.setHours(12, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date === formatLocalDate(today)) return "Hoje";
  if (date === formatLocalDate(yesterday)) return "Ontem";

  const parsed = parseLocalDate(date);
  return `${WEEKDAYS[parsed.getDay()]}, ${String(parsed.getDate()).padStart(
    2,
    "0"
  )} ${MONTHS[parsed.getMonth()]}`;
}

export function formatHistoryActionDateTime(
  actionAt: string,
  reference = new Date()
): string {
  const date = new Date(actionAt);
  if (!Number.isFinite(date.getTime())) return "Horário indisponível";

  const dayLabel = formatHistoryDayLabel(formatLocalDate(date), reference);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
  return `${dayLabel}, ${time}`;
}
