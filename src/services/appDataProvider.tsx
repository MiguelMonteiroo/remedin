import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useDatabase } from "../database/DatabaseProvider";
import {
  Medication,
  MedicationSchedule,
  DoseLog,
  DoseOccurrence,
  ProfileAvatar,
  ReminderSettings,
} from "../types/domain";
import { createDoseService, DoseService } from "./doseService";
import { createReminderScheduler } from "./reminderScheduler";
import {
  ensureChannelCreated,
  getReminderPermissionState,
} from "./notificationPermissionService";
import { reconcileNotifications } from "./reminderSyncService";
import { createReminderPermissionMonitor } from "./reminders/reminderPermissionMonitor";
import { startReminderSyncInBackground } from "./reminders/reminderSyncCoordinator";
import { createRepositories } from "../database/db";
import { createMedicationPersistenceService } from "./medicationPersistenceService";
import {
  getTodayDoseViewModel,
  indexLatestDoseLogs,
  AdherenceSummary,
} from "../utils/doseEngine";
import { validateProfileName } from "../utils/validation";
import { DEFAULT_REMINDER_SETTINGS } from "../utils/defaultReminderSettings";
import { formatLocalDate, formatLocalDateTime } from "../utils/dateTime";

interface AppDataContextValue {
  medications: Medication[];
  schedules: MedicationSchedule[];
  doseLogs: DoseLog[];
  todayOccurrences: DoseOccurrence[];
  todaySummary: AdherenceSummary;
  loading: boolean;
  error: string | null;
  retryLoadingData: () => Promise<void>;
  refreshDoseLogs: () => Promise<void>;
  reminderSyncPending: boolean;
  settings: ReminderSettings;
  addMedication: (name: string, dosage: string, time: string, notes: string, scheduleKind?: string, intervalHours?: number, weekdays?: number[]) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  setDoseTaken: (occurrenceId: string, medicationId: string, scheduleId: string, isTaken: boolean) => Promise<void>;
  skipDose: (occurrenceId: string, medicationId: string, scheduleId: string) => Promise<void>;
  undoDoseAction: (occurrenceId: string, medicationId: string, scheduleId: string) => Promise<void>;
  snoozeDose: (occurrenceId: string, medicationId: string, scheduleId: string) => Promise<void>;
  doseService: DoseService | null;
  setMedicationPaused: (medicationId: string, paused: boolean) => Promise<void>;
  updateMedicationWithSchedule: (
    medicationId: string,
    name: string,
    dosage: string,
    notes: string,
    scheduleKind?: string,
    time?: string,
    intervalHours?: number,
    weekdays?: number[]
  ) => Promise<void>;
  updateProfile: (name: string, avatar?: ProfileAvatar) => Promise<void>;
  markOnboardingIntroSeen: () => Promise<void>;
  completeOnboarding: (name?: string) => Promise<void>;
  updateNotificationsEnabled: (enabled: boolean) => Promise<void>;
  updateReminderSettings: (patch: Partial<ReminderSettings>) => Promise<void>;
  runAlarmTest: () => Promise<void>;
  snoozeMinutes: number;
}

const DEFAULT_SETTINGS = DEFAULT_REMINDER_SETTINGS;

const AppDataContext = createContext<AppDataContextValue>({
  medications: [],
  schedules: [],
  doseLogs: [],
  todayOccurrences: [],
  todaySummary: { total: 0, taken: 0, pending: 0, skipped: 0, unrecorded: 0, snoozed: 0 },
  loading: true,
  error: null,
  retryLoadingData: async () => {},
  refreshDoseLogs: async () => {},
  reminderSyncPending: false,
  settings: DEFAULT_SETTINGS,
  addMedication: async () => {},
  removeMedication: async () => {},
  setDoseTaken: async () => {},
  skipDose: async () => {},
  undoDoseAction: async () => {},
  snoozeDose: async () => {},
  doseService: null,
  setMedicationPaused: async () => {},
  updateMedicationWithSchedule: async () => {},
  updateProfile: async () => {},
  markOnboardingIntroSeen: async () => {},
  completeOnboarding: async () => {},
  updateNotificationsEnabled: async () => {},
  updateReminderSettings: async () => {},
  runAlarmTest: async () => {},
  snoozeMinutes: 5,
});

export function useAppData() {
  return useContext(AppDataContext);
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const db = useDatabase();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [today, setToday] = useState(() => formatLocalDate(new Date()));
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef<ReminderSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderSyncPending, setReminderSyncPending] = useState(false);
  const reminderSyncCounterRef = useRef({ current: 0, failed: false });

  const repos = useMemo(() => createRepositories(db), [db]);
  const medicationPersistence = useMemo(() => createMedicationPersistenceService(db), [db]);
  const doseSvc = useMemo(() => createDoseService(repos.doseLogs), [repos]);
  const reminderScheduler = useMemo(() => createReminderScheduler(repos.reminderArtifacts), [repos]);
  const permissionMonitor = useRef<
    ReturnType<typeof createReminderPermissionMonitor> | undefined
  >(undefined);
  if (!permissionMonitor.current) {
    permissionMonitor.current = createReminderPermissionMonitor({
      readState: getReminderPermissionState,
      onCapabilitiesChanged: async () => {
        await ensureChannelCreated();
        await reminderScheduler.cancelAll();
      },
    });
  }
  const syncReminders = useCallback(async () => {
    await ensureChannelCreated();
    await permissionMonitor.current?.refresh();
    const legacyMappings = await repos.notifications.getAll();
    if (legacyMappings.length > 0) {
      await reminderScheduler.cancelAll();
      await repos.notifications.removeAll();
    }
    await reconcileNotifications(
      repos.reminderArtifacts,
      repos.medications,
      repos.schedules,
      repos.doseLogs,
      repos.settings,
      reminderScheduler
    );
  }, [repos, reminderScheduler]);

  const loadData = useCallback(async () => {
    try {
      const [meds, scheds, doseLogs, appSettings] =
        await Promise.all([
          repos.medications.getAll(),
          repos.schedules.getAll(),
          repos.doseLogs.getAll(),
          repos.settings.get(),
        ]);
      setMedications(meds);
      setSchedules(scheds);
      setLogs(doseLogs);
      settingsRef.current = appSettings;
      setSettings(appSettings);
      setError(null);

      startReminderSyncInBackground({
        sync: syncReminders,
        fallback: syncReminders,
        onPendingChange: setReminderSyncPending,
        pendingCounter: reminderSyncCounterRef.current,
      });
    } catch {
      setError("Não foi possível carregar sua rotina.");
    } finally {
      setLoading(false);
    }
  }, [repos, syncReminders]);

  const retryLoadingData = useCallback(async () => {
    setLoading(true);
    await loadData();
  }, [loadData]);

  const refreshDoseLogs = useCallback(async () => {
    setLogs(await repos.doseLogs.getAll());
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    function refreshToday() {
      clearTimeout(midnightTimer);
      const now = new Date();
      const nextDay = new Date(now);
      nextDay.setHours(24, 0, 0, 0);
      setToday(formatLocalDate(now));
      midnightTimer = setTimeout(refreshToday, Math.max(1_000, nextDay.getTime() - now.getTime()));
    }

    refreshToday();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshToday();
        void loadData();
      }
    });
    return () => {
      clearTimeout(midnightTimer);
      subscription.remove();
    };
  }, [loadData]);

  const latestLogs = useMemo(() => indexLatestDoseLogs(logs), [logs]);
  const todayData = getTodayDoseViewModel(today, medications, schedules, latestLogs);

  const rescheduleMedicationNotifications = useCallback(async () => {
    await reminderScheduler.cancelAll();
    await syncReminders();
  }, [reminderScheduler, syncReminders]);

  const queueReminderSync = useCallback((sync = syncReminders) => {
    startReminderSyncInBackground({
      sync,
      fallback: sync,
      onPendingChange: setReminderSyncPending,
      pendingCounter: reminderSyncCounterRef.current,
    });
  }, [syncReminders]);

  const addMedication = useCallback(
    async (name: string, dosage: string, time: string, notes: string, scheduleKind?: string, intervalHours?: number, weekdays?: number[]) => {
      const now = new Date().toISOString();
      const medId = `med-${Date.now()}`;
      const schedId = `sched-${Date.now()}`;

      const medication: Medication = {
        id: medId,
        name,
        dosage: dosage || "Sem dosagem",
        notes,
        createdAt: now,
        updatedAt: now,
        isPaused: false,
      };

      const kind = (scheduleKind as MedicationSchedule["kind"]) || "dailyTimes";

      const schedule: MedicationSchedule = {
        id: schedId,
        medicationId: medId,
        kind,
        times: [time],
        intervalHours: kind === "intervalHours" ? (intervalHours || 8) : 0,
        weekdays: kind === "weekdays" ? (weekdays || []) : [],
        startDate: "",
        endDate: "",
        anchorAt: kind === "intervalHours" ? `${formatLocalDate(new Date())}T${time}:00` : "",
        snoozeMinutes: settings.defaultSnoozeMinutes,
        isActive: true,
      };

      await medicationPersistence.createWithSchedule(medication, schedule);

      setMedications((prev) => [...prev, medication]);
      setSchedules((prev) => [...prev, schedule]);
      queueReminderSync();
    },
    [medicationPersistence, queueReminderSync, settings.defaultSnoozeMinutes]
  );

  const removeMedication = useCallback(async (id: string) => {
    await reminderScheduler.cancelForMedication(id);
    await medicationPersistence.remove(id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setSchedules((prev) => prev.filter((s) => s.medicationId !== id));
    setLogs((prev) => prev.filter((log) => log.medicationId !== id));
  }, []);

  const setMedicationPaused = useCallback(
    async (medicationId: string, paused: boolean) => {
      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;
      const updated = { ...medication, isPaused: paused, updatedAt: new Date().toISOString() };
      await reminderScheduler.cancelForMedication(medicationId);
      await repos.medications.update(updated);
      setMedications((prev) => prev.map((m) => (m.id === medicationId ? updated : m)));
      if (!paused) queueReminderSync();
    },
    [medications, queueReminderSync, reminderScheduler, repos]
  );

  const setDoseTaken = useCallback(
    async (occurrenceId: string, medicationId: string, scheduleId: string, isTaken: boolean) => {
      const now = new Date().toISOString();
      if (isTaken) {
        await doseSvc.undoDoseAction(occurrenceId, medicationId, scheduleId, now);
      } else {
        await doseSvc.markDoseTaken(occurrenceId, medicationId, scheduleId, now);
        await reminderScheduler.cancelSingle(occurrenceId);
      }
      await refreshDoseLogs();
    },
    []
  );

  const skipDose = useCallback(
    async (occurrenceId: string, medicationId: string, scheduleId: string) => {
      const now = new Date().toISOString();
      await doseSvc.skipDose(occurrenceId, medicationId, scheduleId, now);
      await reminderScheduler.cancelSingle(occurrenceId);
      await refreshDoseLogs();
    },
    []
  );

  const undoDoseAction = useCallback(
    async (occurrenceId: string, medicationId: string, scheduleId: string) => {
      await doseSvc.undoDoseAction(
        occurrenceId,
        medicationId,
        scheduleId,
        new Date().toISOString()
      );
      await refreshDoseLogs();

      if (settingsRef.current.notificationsEnabled) {
        await reconcileNotifications(
          repos.reminderArtifacts,
          repos.medications,
          repos.schedules,
          repos.doseLogs,
          repos.settings,
          reminderScheduler
        );
      }
    },
    [refreshDoseLogs]
  );

  const snoozeDose = useCallback(
    async (occurrenceId: string, medicationId: string, scheduleId: string) => {
      const snoozeCount = await repos.doseLogs.countSnoozes(occurrenceId);
      if (snoozeCount >= 3) return;
      const now = new Date();
      const snoozeMs = 5 * 60 * 1000;
      const snoozedUntil = new Date(now.getTime() + snoozeMs);

      await doseSvc.snoozeDose(
        occurrenceId,
        medicationId,
        scheduleId,
        now.toISOString(),
        formatLocalDateTime(snoozedUntil)
      );
      await refreshDoseLogs();

      const occurrence: DoseOccurrence = {
        id: occurrenceId,
        medicationId,
        scheduleId,
        scheduledAt: formatLocalDateTime(snoozedUntil),
        status: "pending",
      };

      const medication = medications.find((m) => m.id === medicationId);
      const schedule = schedules.find((s) => s.id === scheduleId);

      await reminderScheduler.cancelSingle(occurrenceId);
      if (medication && schedule) {
        await reminderScheduler.scheduleForOccurrence(
          occurrence,
          medication,
          schedule,
          {
            showLockScreenDetails: settingsRef.current.showLockScreenDetails,
            fullScreenAlarmEnabled: settingsRef.current.fullScreenAlarmEnabled,
            criticalAlertsEnabled: settingsRef.current.criticalAlertsEnabled,
            snoozed: true,
            alarmAt: snoozedUntil,
          }
        );
      }
    },
    [medications, refreshDoseLogs, schedules]
  );

  const updateMedicationWithSchedule = useCallback(
    async (
      medicationId: string,
      name: string,
      dosage: string,
      notes: string,
      scheduleKind?: string,
      time?: string,
      intervalHours?: number,
      weekdays?: number[]
    ) => {
      const medication = medications.find((m) => m.id === medicationId);
      if (!medication) return;

      const now = new Date().toISOString();

      const updated: Medication = {
        ...medication,
        name,
        dosage: dosage || "Sem dosagem",
        notes,
        updatedAt: now,
      };

      const medicationSchedules = schedules.filter(
        (schedule) => schedule.medicationId === medicationId
      );
      const existingSchedule =
        medicationSchedules.find((schedule) => schedule.isActive) ||
        medicationSchedules[0];
      const kind = (scheduleKind as MedicationSchedule["kind"]) || existingSchedule?.kind || "dailyTimes";

      let persistedSchedule: MedicationSchedule;
      if (existingSchedule) {
        persistedSchedule = {
          ...existingSchedule,
          kind,
          times: time ? [time] : existingSchedule.times,
          intervalHours: kind === "intervalHours" ? (intervalHours || existingSchedule.intervalHours || 8) : 0,
          weekdays: kind === "weekdays" ? (weekdays || existingSchedule.weekdays) : [],
          anchorAt:
            kind === "intervalHours" && time
              ? `${formatLocalDate(new Date())}T${time}:00`
              : kind === "intervalHours"
                ? existingSchedule.anchorAt
                : "",
          isActive: true,
        };
      } else {
        persistedSchedule = {
          id: `sched-${Date.now()}`,
          medicationId,
          kind,
          times: [time || "08:00"],
          intervalHours: kind === "intervalHours" ? (intervalHours || 8) : 0,
          weekdays: kind === "weekdays" ? (weekdays || []) : [],
          startDate: "",
          endDate: "",
          anchorAt: kind === "intervalHours" ? `${formatLocalDate(new Date())}T${time || "08:00"}:00` : "",
          snoozeMinutes: settings.defaultSnoozeMinutes,
          isActive: true,
        };
      }

      await medicationPersistence.updateWithSchedule(updated, persistedSchedule);
      setMedications((prev) => prev.map((m) => (m.id === medicationId ? updated : m)));
      setSchedules(await repos.schedules.getAll());

      queueReminderSync(async () => {
        await reminderScheduler.cancelForMedication(medicationId);
        await syncReminders();
      });
    },
    [medications, medicationPersistence, queueReminderSync, reminderScheduler, repos, schedules, settings.defaultSnoozeMinutes, syncReminders]
  );

  const persistSettings = useCallback(async (patch: Partial<ReminderSettings>) => {
    await repos.settings.update(patch);
    const updated = { ...settingsRef.current, ...patch };
    settingsRef.current = updated;
    setSettings(updated);
    return updated;
  }, []);

  const updateProfile = useCallback(async (name: string, avatar?: ProfileAvatar) => {
    const validationError = validateProfileName(name);
    if (validationError) throw new Error(validationError);
    await persistSettings({
      userName: name.trim(),
      ...(avatar && { profileAvatar: avatar }),
    });
  }, [persistSettings]);

  const markOnboardingIntroSeen = useCallback(async () => {
    await persistSettings({ onboardingIntroSeen: true });
  }, [persistSettings]);

  const completeOnboarding = useCallback(async (name?: string) => {
    const resolvedName = (name ?? settingsRef.current.userName).trim();
    const validationError = validateProfileName(resolvedName);
    if (validationError) throw new Error(validationError);

    await persistSettings({
      userName: resolvedName,
      onboardingCompleted: true,
      reminderSetupCompleted: true,
    });
  }, [persistSettings]);

  const updateNotificationsEnabled = useCallback(
    async (enabled: boolean) => {
      await persistSettings({ notificationsEnabled: enabled });
      if (enabled) {
        await rescheduleMedicationNotifications();
      } else {
        await reminderScheduler.cancelAll();
      }
    },
    [persistSettings, rescheduleMedicationNotifications]
  );

  const updateReminderSettings = useCallback(
    async (patch: Partial<ReminderSettings>) => {
      const updated = await persistSettings(patch);
      if (updated.notificationsEnabled) {
        await rescheduleMedicationNotifications();
      }
    },
    [persistSettings, rescheduleMedicationNotifications]
  );

  const runAlarmTest = useCallback(async () => {
    await ensureChannelCreated();
    await reminderScheduler.runAlarmTest({
      criticalAlertsEnabled: settingsRef.current.criticalAlertsEnabled,
      fullScreenAlarmEnabled: settingsRef.current.fullScreenAlarmEnabled,
    });
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        medications,
        schedules,
        doseLogs: logs,
        todayOccurrences: todayData.occurrences,
        todaySummary: todayData.summary,
        loading,
        error,
        retryLoadingData,
        refreshDoseLogs,
        reminderSyncPending,
        settings,
        addMedication,
        removeMedication,
        setDoseTaken,
        skipDose,
        undoDoseAction,
        snoozeDose,
        setMedicationPaused,
        updateMedicationWithSchedule,
        updateProfile,
        markOnboardingIntroSeen,
        completeOnboarding,
        updateNotificationsEnabled,
        updateReminderSettings,
        runAlarmTest,
        doseService: doseSvc,
        snoozeMinutes: settings.defaultSnoozeMinutes,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
