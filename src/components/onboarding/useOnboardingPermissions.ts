import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useAppData } from "../../services/appDataProvider";
import {
  ensureAlarmChannels,
  getReminderPermissionState,
  openBatterySettings,
  openCriticalAlarmChannelSettings,
  openDoNotDisturbSettings,
  openExactAlarmSettings,
  openFullScreenAlarmSettings,
  openNotificationSettings,
  requestNotificationPermission,
} from "../../services/notificationPermissionService";
import { getNotificationOnboardingAction } from "../../services/reminders/permissionOnboarding";
import type { OnboardingStep } from "./onboardingTypes";

type AwaitingCapability =
  | "notifications"
  | "doNotDisturb"
  | "exact"
  | "fullScreen"
  | "battery"
  | null;

export function useOnboardingPermissions(
  step: OnboardingStep,
  onAdvance: (step: OnboardingStep) => void,
  setBusy: (busy: boolean) => void
) {
  const { updateNotificationsEnabled, updateReminderSettings } = useAppData();
  const [permissionMessage, setPermissionMessage] = useState("");
  const [notificationRequestAttempted, setNotificationRequestAttempted] =
    useState(false);
  const [awaitingCapability, setAwaitingCapability] =
    useState<AwaitingCapability>(null);
  const [dndConfigured, setDndConfigured] = useState(false);
  const [batteryConfigured, setBatteryConfigured] = useState(false);

  const transitionToStep = useCallback((nextStep: OnboardingStep) => {
    setPermissionMessage("");
    onAdvance(nextStep);
  }, [onAdvance]);

  async function refreshOptionalCapabilities() {
    try {
      const permissions = await getReminderPermissionState();
      setDndConfigured(
        permissions.doNotDisturb === "granted" &&
          permissions.criticalAlarmChannel === "bypasses"
      );
      setBatteryConfigured(permissions.batteryOptimization === "unrestricted");
    } catch {
      // Ignore permission query errors in test/mocked environments
    }
  }

  useEffect(() => {
    if (step === "ready") {
      refreshOptionalCapabilities();
    }
  }, [step]);

  useEffect(() => {
    if (!awaitingCapability) return;

    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      const permissions = await getReminderPermissionState();
      setAwaitingCapability(null);

      if (awaitingCapability === "notifications") {
        const granted = permissions.notifications === "granted";
        await updateNotificationsEnabled(granted);
        if (granted) {
          transitionToStep("lockScreenDetails");
        } else {
          setPermissionMessage(
            "As notificações continuam desativadas. Ative a opção do Remedin nas configurações ou toque em Agora não."
          );
        }
        return;
      }

      if (awaitingCapability === "exact") {
        if (
          permissions.exactAlarms === "granted" ||
          permissions.exactAlarms === "notRequired"
        ) {
          transitionToStep("fullScreen");
        } else {
          setPermissionMessage(
            "O horário exato ainda não foi autorizado. Você pode tentar novamente ou avançar."
          );
        }
        return;
      }

      if (awaitingCapability === "fullScreen") {
        if (
          permissions.fullScreen === "granted" ||
          permissions.fullScreen === "unsupported"
        ) {
          transitionToStep("ready");
        } else {
          setPermissionMessage(
            "A tela cheia ainda não foi autorizada. Você pode tentar novamente ou continuar para concluir."
          );
        }
        return;
      }

      if (awaitingCapability === "doNotDisturb") {
        if (
          permissions.doNotDisturb === "granted" &&
          permissions.criticalAlarmChannel === "bypasses"
        ) {
          await ensureAlarmChannels();
          await updateReminderSettings({ criticalAlertsEnabled: true });
          setDndConfigured(true);
          setPermissionMessage("");
        } else {
          setPermissionMessage(
            "O Android ainda não autorizou alarmes no Não Perturbe. Você pode revisar depois em Perfil."
          );
        }
        return;
      }

      if (awaitingCapability === "battery") {
        if (permissions.batteryOptimization === "unrestricted") {
          setBatteryConfigured(true);
          setPermissionMessage("");
        } else {
          setPermissionMessage(
            "A economia de bateria ainda está ativa para o Remedin. Você também pode ajustar isso depois em Perfil."
          );
        }
      }
    });

    return () => subscription.remove();
  }, [awaitingCapability, transitionToStep, updateNotificationsEnabled, updateReminderSettings]);

  async function requestBasicNotifications() {
    setBusy(true);
    setPermissionMessage("");
    try {
      const permissions = await getReminderPermissionState();
      const action = getNotificationOnboardingAction(
        permissions.notifications,
        notificationRequestAttempted
      );

      if (action === "continue") {
        await updateNotificationsEnabled(true);
        transitionToStep("lockScreenDetails");
        return;
      }

      if (action === "settings") {
        setAwaitingCapability("notifications");
        setPermissionMessage(
          "Na próxima tela, ative Permitir notificações para o Remedin. Depois, volte ao aplicativo."
        );
        await openNotificationSettings();
        return;
      }

      setNotificationRequestAttempted(true);
      const result = await requestNotificationPermission();
      await updateNotificationsEnabled(result.granted);
      if (result.granted) {
        transitionToStep("lockScreenDetails");
      } else {
        setPermissionMessage(
          "As notificações não foram autorizadas. Tente novamente ou toque em Agora não para continuar sem lembretes."
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function requestExactAlarms() {
    setBusy(true);
    setPermissionMessage("");
    try {
      const permissions = await getReminderPermissionState();
      if (
        permissions.exactAlarms === "granted" ||
        permissions.exactAlarms === "notRequired"
      ) {
        transitionToStep("fullScreen");
        return;
      }

      setAwaitingCapability("exact");
      setPermissionMessage(
        "Na próxima tela, permita que o Remedin defina alarmes e lembretes no horário exato."
      );
      await openExactAlarmSettings();
    } finally {
      setBusy(false);
    }
  }

  async function chooseLockScreenDetails(showDetails: boolean) {
    setBusy(true);
    try {
      await updateReminderSettings({ showLockScreenDetails: showDetails });
      transitionToStep("exact");
    } finally {
      setBusy(false);
    }
  }

  async function requestFullScreenAlarm() {
    setBusy(true);
    setPermissionMessage("");
    try {
      await updateReminderSettings({ fullScreenAlarmEnabled: true });
      const permissions = await getReminderPermissionState();
      if (
        permissions.fullScreen === "granted" ||
        permissions.fullScreen === "unsupported"
      ) {
        transitionToStep("ready");
        return;
      }

      setAwaitingCapability("fullScreen");
      setPermissionMessage(
        "Na próxima tela, permita que o Remedin abra alarmes em tela cheia."
      );
      await openFullScreenAlarmSettings();
    } finally {
      setBusy(false);
    }
  }

  async function requestDoNotDisturbAccess() {
    setBusy(true);
    setPermissionMessage("");
    try {
      const permissions = await getReminderPermissionState();
      if (
        permissions.doNotDisturb === "granted" &&
        permissions.criticalAlarmChannel === "bypasses"
      ) {
        await ensureAlarmChannels();
        await updateReminderSettings({ criticalAlertsEnabled: true });
        setDndConfigured(true);
        return;
      }

      if (permissions.doNotDisturb === "granted") {
        setAwaitingCapability("doNotDisturb");
        setPermissionMessage(
          "Na próxima tela, permita que o canal Alarmes críticos de dose ignore o Não Perturbe."
        );
        await openCriticalAlarmChannelSettings();
        return;
      }

      await updateReminderSettings({ criticalAlertsEnabled: true });
      setAwaitingCapability("doNotDisturb");
      setPermissionMessage(
        "Na próxima tela, localize o Remedin e ative o acesso para tocar mesmo em Não Perturbe."
      );
      await openDoNotDisturbSettings();
    } finally {
      setBusy(false);
    }
  }

  async function requestBatteryAccess() {
    setBusy(true);
    setPermissionMessage("");
    try {
      const permissions = await getReminderPermissionState();
      if (permissions.batteryOptimization === "unrestricted") {
        setBatteryConfigured(true);
        return;
      }

      setAwaitingCapability("battery");
      setPermissionMessage(
        "Na próxima tela, procure o Remedin e permita o uso da bateria sem restrições."
      );
      await openBatterySettings();
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    await updateNotificationsEnabled(false);
    setPermissionMessage("");
  }

  async function skipFullScreen() {
    setBusy(true);
    try {
      await updateReminderSettings({ fullScreenAlarmEnabled: false });
      transitionToStep("ready");
    } finally {
      setBusy(false);
    }
  }

  return {
    transitionToStep,
    permissionMessage,
    dndConfigured,
    batteryConfigured,
    requestBasicNotifications,
    chooseLockScreenDetails,
    requestExactAlarms,
    requestFullScreenAlarm,
    requestDoNotDisturbAccess,
    requestBatteryAccess,
    disableNotifications,
    skipFullScreen,
  };
}
