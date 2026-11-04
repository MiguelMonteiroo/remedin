import { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlarmClockCheck,
  ArrowLeft,
  BatteryCharging,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  History,
  LockKeyhole,
  Maximize2,
  Pill,
  ShieldCheck,
  Volume2,
} from "lucide-react-native";
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
import {
  ESSENTIAL_ONBOARDING_PERMISSION_STEPS,
  getNotificationOnboardingAction,
  type EssentialOnboardingPermissionStep,
} from "../../services/reminders/permissionOnboarding";
import { validateProfileName } from "../../utils/validation";
import { useReducedMotion } from "../../utils/useReducedMotion";
import { RemedinHorizontalSignature } from "../brand/RemedinBrand";
import { AppText } from "../ui/AppText";
import { Screen } from "../ui/Screen";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { useAppTheme } from "../../theme/ThemeProvider";
import { motionDurations, motionEasings } from "../../theme/motion";
import { type ThemeColors } from "../../theme/theme";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { fontFamilies } from "../../theme/typography";

type Step =
  | "welcome"
  | "profile"
  | "guide"
  | EssentialOnboardingPermissionStep
  | "ready";

type AwaitingCapability =
  | "notifications"
  | "doNotDisturb"
  | "exact"
  | "fullScreen"
  | "battery"
  | null;

const CORAL_HEADER_BG = "#A44945";

export function FirstRunOnboarding() {
  const { name: themeName, colors } = useAppTheme();
  const isDark = themeName === "dark";
  const styles = createStyles(colors);
  const reduceMotion = useReducedMotion();
  const {
    completeOnboarding,
    settings,
    userAccount,
    updateNotificationsEnabled,
    updateReminderSettings,
  } = useAppData();

  const initialName = (userAccount?.name || settings?.userName || "").trim();
  const hasAuthenticatedProfile = Boolean(
    userAccount?.authenticated || initialName
  );
  const [step, setStep] = useState<Step>(
    hasAuthenticatedProfile ? "guide" : "welcome"
  );
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");
  const [permissionMessage, setPermissionMessage] = useState("");
  const [notificationRequestAttempted, setNotificationRequestAttempted] =
    useState(false);
  const [confirmSkipVisible, setConfirmSkipVisible] = useState(false);
  const [awaitingCapability, setAwaitingCapability] =
    useState<AwaitingCapability>(null);
  const [dndConfigured, setDndConfigured] = useState(false);
  const [batteryConfigured, setBatteryConfigured] = useState(false);
  const [busy, setBusy] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  function transitionToStep(nextStep: Step) {
    setPermissionMessage("");
    if (reduceMotion) {
      setStep(nextStep);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    setStep(nextStep);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: motionDurations.normal,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }

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

  async function finishOnboarding() {
    setBusy(true);
    try {
      await completeOnboarding(
        (name || userAccount?.name || settings?.userName || "").trim()
      );
    } finally {
      setBusy(false);
    }
  }

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
          await updateReminderSettings({ showLockScreenDetails: true });
          transitionToStep("exact");
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
  }, [awaitingCapability, name, reduceMotion]);

  function continueFromProfile() {
    const error = validateProfileName(name);
    if (error) {
      setNameError(error);
      return;
    }
    setNameError("");
    transitionToStep("guide");
  }

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
        await updateReminderSettings({ showLockScreenDetails: true });
        transitionToStep("exact");
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
        await updateReminderSettings({ showLockScreenDetails: true });
        transitionToStep("exact");
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

  async function skipBasicNotifications() {
    setConfirmSkipVisible(false);
    setBusy(true);
    try {
      await updateNotificationsEnabled(false);
      setPermissionMessage("");
      await finishOnboarding();
    } finally {
      setBusy(false);
    }
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

  function handleBack() {
    if (busy) return;
    if (step === "notifications") transitionToStep("guide");
    else if (step === "exact") transitionToStep("notifications");
    else if (step === "fullScreen") transitionToStep("exact");
    else if (step === "ready") transitionToStep("fullScreen");
  }

  function handlePrimaryAction() {
    if (busy) return;
    if (step === "welcome") transitionToStep("profile");
    else if (step === "profile") continueFromProfile();
    else if (step === "guide") transitionToStep("notifications");
    else if (step === "notifications") requestBasicNotifications();
    else if (step === "exact") requestExactAlarms();
    else if (step === "fullScreen") requestFullScreenAlarm();
    else finishOnboarding();
  }

  const primaryTitle = getPrimaryTitle(step, busy);
  const firstName = (name || userAccount?.name || settings?.userName || "")
    .trim()
    .split(/\s+/)[0];

  // SCREEN 04: GUIDE (Coral Header + Rounded Bottom Sheet + 3 Bento Cards)
  if (step === "guide") {
    return (
      <SafeAreaView style={styles.coralScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={CORAL_HEADER_BG}
        />
        <View style={styles.coralHeader}>
          <RemedinHorizontalSignature
            color="#FFFFFF"
            fontSize={22}
            symbolSize={28}
          />
          <View style={styles.coralBadge}>
            <AppText variant="caption" style={styles.coralBadgeText}>
              {firstName
                ? `Olá, ${firstName} · Guia rápido`
                : "Conheça o Remedin"}
            </AppText>
          </View>
          <AppText
            accessibilityRole="header"
            variant="title"
            style={styles.coralHeaderTitle}
          >
            Seu cuidado em um só lugar
          </AppText>
          <AppText style={styles.coralHeaderSubtitle}>
            Veja como o Remedin acompanha sua rotina de medicamentos com calma e clareza.
          </AppText>
        </View>

        <Animated.View
          style={[
            styles.guideSheet,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.guideSheetContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.bentoFeatureList}>
              <FeatureCard
                icon={Pill}
                stepNumber="1"
                title="Organize sua rotina"
                description="Cadastre seus medicamentos, dosagens e horários em segundos."
              />
              <FeatureCard
                icon={CheckCircle2}
                stepNumber="2"
                title="Cuide das doses de hoje"
                description="Receba alertas no horário e marque como tomada, adie ou pule com 1 toque."
              />
              <FeatureCard
                icon={History}
                stepNumber="3"
                title="Acompanhe seu histórico"
                description="Consulte seus registros diários e veja sua evolução nos últimos dias."
              />
            </View>

            <View style={styles.privacyBanner}>
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.privacyIconWrap}
              >
                <LockKeyhole color={colors.primaryDark} size={18} />
              </View>
              <AppText variant="small" style={styles.privacyBannerText}>
                Seus dados e horários ficam salvos neste aparelho com total privacidade.
              </AppText>
            </View>

            <View style={styles.sheetFooter}>
              <Pressable
                accessibilityLabel={primaryTitle}
                accessibilityRole="button"
                accessibilityState={{ busy, disabled: busy }}
                disabled={busy}
                onPress={handlePrimaryAction}
                style={({ pressed }) => [
                  styles.primaryPillButton,
                  pressed && styles.pillPressed,
                ]}
              >
                <AppText style={styles.primaryPillText}>{primaryTitle}</AppText>
              </Pressable>

              <Pressable
                accessibilityLabel="Pular configuração de lembretes por enquanto"
                accessibilityRole="button"
                disabled={busy}
                onPress={() => setConfirmSkipVisible(true)}
                style={({ pressed }) => [
                  styles.secondaryPillButton,
                  pressed && styles.pillPressed,
                ]}
              >
                <AppText style={styles.secondaryPillText}>
                  Pular por enquanto
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>

        <ConfirmationDialog
          busy={busy}
          cancelLabel="Voltar e configurar"
          confirmAccessibilityLabel="Continuar sem lembretes"
          confirmLabel="Continuar sem lembretes"
          description="Sem essa permissão, o Remedin não poderá avisar quando uma dose estiver próxima ou no horário. Você ainda poderá usar o app e ativar os lembretes depois em Perfil."
          icon={BellRing}
          onCancel={() => setConfirmSkipVisible(false)}
          onConfirm={skipBasicNotifications}
          title="Continuar sem lembretes?"
          visible={confirmSkipVisible}
        />
      </SafeAreaView>
    );
  }

  // SCREEN 05: EDITORIAL MINIMALIST PERMISSIONS (Steps 1-3 + Ready Summary)
  const isPermissionFlow =
    step === "notifications" ||
    step === "exact" ||
    step === "fullScreen" ||
    step === "ready";

  const activeProgressIndex =
    step === "notifications"
      ? 0
      : step === "exact"
      ? 1
      : step === "fullScreen"
      ? 2
      : 3;

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardArea}
      >
        {isPermissionFlow ? (
          <View style={styles.editorialTopBar}>
            <View style={styles.editorialNavRow}>
              <Pressable
                accessibilityLabel="Voltar para a etapa anterior"
                accessibilityRole="button"
                disabled={busy}
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backPillButton,
                  pressed && styles.pillPressed,
                ]}
              >
                <ArrowLeft color={colors.primaryDark} size={20} />
                <AppText style={styles.backPillText}>Voltar</AppText>
              </Pressable>

              <View style={styles.stepPillBadge}>
                <AppText variant="caption" style={styles.stepPillBadgeText}>
                  {step === "ready"
                    ? "Concluído"
                    : `Passo ${activeProgressIndex + 1} de ${
                        ESSENTIAL_ONBOARDING_PERMISSION_STEPS.length
                      }`}
                </AppText>
              </View>
            </View>

            <View
              accessibilityLabel={
                step === "ready"
                  ? "Todas as 3 etapas concluídas"
                  : `Progresso: etapa ${activeProgressIndex + 1} de 3`
              }
              style={styles.progressTrack}
            >
              {ESSENTIAL_ONBOARDING_PERMISSION_STEPS.map((item, idx) => {
                const filled = idx <= activeProgressIndex;
                return (
                  <View
                    key={item}
                    style={[
                      styles.progressSegment,
                      filled
                        ? styles.progressSegmentActive
                        : styles.progressSegmentInactive,
                    ]}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <OnboardingStepContent
              batteryConfigured={batteryConfigured}
              busy={busy}
              dndConfigured={dndConfigured}
              name={name}
              nameError={nameError}
              onConfigureBattery={requestBatteryAccess}
              onConfigureDnd={requestDoNotDisturbAccess}
              onNameChange={(value) => {
                setName(value);
                if (nameError) setNameError("");
              }}
              permissionMessage={permissionMessage}
              step={step}
            />
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityLabel={primaryTitle}
            accessibilityRole="button"
            accessibilityState={{ busy, disabled: busy }}
            disabled={busy}
            onPress={handlePrimaryAction}
            style={({ pressed }) => [
              styles.primaryPillButton,
              busy && styles.pillDisabled,
              pressed && styles.pillPressed,
            ]}
          >
            <AppText style={styles.primaryPillText}>{primaryTitle}</AppText>
          </Pressable>

          {step === "notifications" ||
          step === "exact" ||
          step === "fullScreen" ? (
            <Pressable
              accessibilityLabel={`Fazer ${getStepTitle(step).toLowerCase()} depois`}
              accessibilityRole="button"
              disabled={busy}
              onPress={() => {
                if (step === "notifications") setConfirmSkipVisible(true);
                else if (step === "exact") {
                  transitionToStep("fullScreen");
                } else if (step === "fullScreen") {
                  skipFullScreen();
                }
              }}
              style={({ pressed }) => [
                styles.secondaryPillButton,
                pressed && styles.pillPressed,
              ]}
            >
              <AppText style={styles.secondaryPillText}>Agora não</AppText>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>

      <ConfirmationDialog
        busy={busy}
        cancelLabel="Voltar e permitir"
        confirmAccessibilityLabel="Continuar sem lembretes"
        confirmLabel="Continuar sem lembretes"
        description="Sem essa permissão, o Remedin não poderá avisar quando uma dose estiver próxima ou no horário. Você ainda poderá usar o app e ativar os lembretes depois em Perfil."
        icon={BellRing}
        onCancel={() => setConfirmSkipVisible(false)}
        onConfirm={skipBasicNotifications}
        title="Continuar sem lembretes?"
        visible={confirmSkipVisible}
      />
    </Screen>
  );
}

function OnboardingStepContent({
  step,
  name,
  nameError,
  onNameChange,
  permissionMessage,
  dndConfigured,
  batteryConfigured,
  onConfigureDnd,
  onConfigureBattery,
  busy,
}: {
  step: Step;
  name: string;
  nameError: string;
  onNameChange: (value: string) => void;
  permissionMessage: string;
  dndConfigured: boolean;
  batteryConfigured: boolean;
  onConfigureDnd: () => void;
  onConfigureBattery: () => void;
  busy: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (step === "welcome") {
    return (
      <View style={styles.stepContent}>
        <View style={styles.brandRow}>
          <View style={styles.iconWrap}>
            <HeartPulse color={colors.primaryDark} size={30} />
          </View>
          <AppText variant="subheading" style={styles.brandName}>
            Remedin
          </AppText>
        </View>
        <AppText accessibilityRole="header" variant="title" style={styles.title}>
          Bem-vindo ao Remedin
        </AppText>
        <AppText muted style={styles.description}>
          Organize seus medicamentos e acompanhe sua rotina com mais tranquilidade.
        </AppText>
      </View>
    );
  }

  if (step === "profile") {
    return (
      <View style={styles.stepContent}>
        <AppText variant="caption" style={styles.eyebrow}>
          Primeiro acesso
        </AppText>
        <AppText accessibilityRole="header" variant="title" style={styles.title}>
          Como podemos chamar você?
        </AppText>
        <AppText muted style={styles.description}>
          Usaremos seu nome apenas para personalizar sua experiência neste aparelho.
        </AppText>
        <AppText style={styles.inputLabel}>Seu nome</AppText>
        <TextInput
          accessibilityLabel="Seu nome"
          autoCapitalize="words"
          autoComplete="name"
          autoFocus
          onChangeText={onNameChange}
          placeholder="Digite seu nome"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          style={[styles.input, nameError ? styles.inputError : null]}
          value={name}
        />
        {nameError ? (
          <AppText
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.errorText}
            variant="small"
          >
            {nameError}
          </AppText>
        ) : null}
      </View>
    );
  }

  if (step === "ready") {
    return (
      <View style={styles.editorialCard}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.iconWrap, { backgroundColor: colors.successSoft }]}
        >
          <ShieldCheck color={colors.success} size={34} />
        </View>
        <AppText accessibilityRole="header" variant="title" style={styles.title}>
          Seus lembretes estão prontos!
        </AppText>
        <AppText muted style={styles.description}>
          O essencial já foi configurado para avisar você sobre suas doses. Se quiser, você também pode blindar o aparelho abaixo:
        </AppText>

        <View style={styles.optionalSection}>
          <AppText variant="caption" style={styles.optionalSectionTitle}>
            BLINDAGEM OPCIONAL DO APARELHO
          </AppText>

          <Pressable
            accessibilityLabel={
              dndConfigured
                ? "Toque no Silencioso e Não Perturbe ativado"
                : "Configurar toque no Silencioso e Não Perturbe"
            }
            accessibilityRole="button"
            disabled={busy}
            onPress={onConfigureDnd}
            style={({ pressed }) => [
              styles.optionalRowCard,
              dndConfigured && styles.optionalRowCardConfigured,
              pressed && styles.pillPressed,
            ]}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.optionalRowIcon}
            >
              <Volume2 color={colors.primaryDark} size={22} />
            </View>
            <View style={styles.optionalRowBody}>
              <AppText variant="subheading" style={styles.optionalRowTitle}>
                Tocar no Não Perturbe
              </AppText>
              <AppText variant="small" muted style={styles.optionalRowDesc}>
                Permite que alarmes críticos toquem mesmo com o modo Prioridade ativo.
              </AppText>
            </View>
            <View style={styles.optionalRowAction}>
              {dndConfigured ? (
                <AppText variant="caption" style={styles.configuredTag}>
                  Ativado ✓
                </AppText>
              ) : (
                <View style={styles.configureActionWrap}>
                  <AppText variant="caption" style={styles.configureActionText}>
                    Ativar
                  </AppText>
                  <ChevronRight color={colors.primaryDark} size={16} />
                </View>
              )}
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel={
              batteryConfigured
                ? "Bateria sem restrições ativada"
                : "Configurar bateria sem restrições"
            }
            accessibilityRole="button"
            disabled={busy}
            onPress={onConfigureBattery}
            style={({ pressed }) => [
              styles.optionalRowCard,
              batteryConfigured && styles.optionalRowCardConfigured,
              pressed && styles.pillPressed,
            ]}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.optionalRowIcon}
            >
              <BatteryCharging color={colors.primaryDark} size={22} />
            </View>
            <View style={styles.optionalRowBody}>
              <AppText variant="subheading" style={styles.optionalRowTitle}>
                Bateria sem restrições
              </AppText>
              <AppText variant="small" muted style={styles.optionalRowDesc}>
                Evita que o Android atrase alarmes quando a tela fica bloqueada por horas.
              </AppText>
            </View>
            <View style={styles.optionalRowAction}>
              {batteryConfigured ? (
                <AppText variant="caption" style={styles.configuredTag}>
                  Ativado ✓
                </AppText>
              ) : (
                <View style={styles.configureActionWrap}>
                  <AppText variant="caption" style={styles.configureActionText}>
                    Ativar
                  </AppText>
                  <ChevronRight color={colors.primaryDark} size={16} />
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {permissionMessage ? (
          <View style={styles.permissionFeedbackCard}>
            <AppText
              accessibilityLiveRegion="polite"
              style={styles.permissionMessage}
              variant="small"
            >
              {permissionMessage}
            </AppText>
          </View>
        ) : null}
      </View>
    );
  }

  if (step === "guide") {
    return null;
  }

  const content = PERMISSION_CONTENT[step];
  const Icon = content.icon;

  return (
    <View style={styles.editorialCard}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.iconWrap}
      >
        <Icon color={colors.primaryDark} size={34} />
      </View>
      <AppText accessibilityRole="header" variant="title" style={styles.title}>
        {content.title}
      </AppText>
      <AppText muted style={styles.description}>
        {content.description}
      </AppText>

      {step === "notifications" ? (
        <View style={styles.benefitList}>
          <BenefitRow text="Aviso 5 minutos antes e na hora da dose" />
          <BenefitRow text="Nome e dosagem visíveis na tela bloqueada" />
          <BenefitRow text="Você pode ajustar esses avisos depois em Perfil" last />
        </View>
      ) : null}

      {step === "exact" ? (
        <View style={styles.benefitList}>
          <BenefitRow text="Lembrete pontual 5 minutos antes" />
          <BenefitRow text="Alarme sonoro no minuto exato da dose" last />
        </View>
      ) : null}

      {step === "fullScreen" ? <AlarmPreview /> : null}

      {permissionMessage ? (
        <View style={styles.permissionFeedbackCard}>
          <AppText
            accessibilityLiveRegion="polite"
            style={styles.permissionMessage}
            variant="small"
          >
            {permissionMessage}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const PERMISSION_CONTENT = {
  notifications: {
    title: "Receba seus lembretes",
    description:
      "O Remedin envia notificações locais para avisar quando estiver perto da hora e no momento exato de tomar cada medicamento.",
    icon: BellRing,
  },
  exact: {
    title: "Avise no horário certo",
    description:
      "Permita alarmes exatos para garantir que o Android entregue seus lembretes pontualmente, sem atrasos do sistema.",
    icon: AlarmClockCheck,
  },
  fullScreen: {
    title: "Alarme em tela cheia",
    description:
      "Quando o aparelho estiver bloqueado, o alarme pode ocupar a tela para você confirmar ou adiar a dose com facilidade.",
    icon: Maximize2,
  },
} as const;

function FeatureCard({
  icon: Icon,
  stepNumber,
  title,
  description,
}: {
  icon: typeof Pill;
  stepNumber: string;
  title: string;
  description: string;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.featureCard}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.featureIconMedallion}
      >
        <Icon color={colors.primaryDark} size={24} />
      </View>
      <View style={styles.featureCardBody}>
        <View style={styles.featureTitleRow}>
          <AppText variant="caption" style={styles.featureStepTag}>
            0{stepNumber}
          </AppText>
          <AppText variant="subheading" style={styles.featureCardTitle}>
            {title}
          </AppText>
        </View>
        <AppText muted variant="small" style={styles.featureDescription}>
          {description}
        </AppText>
      </View>
    </View>
  );
}

function BenefitRow({
  text,
  last = false,
}: {
  text: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.benefitRow, last && styles.benefitRowLast]}>
      <CheckCircle2 color={colors.success} size={22} />
      <AppText style={styles.benefitText}>{text}</AppText>
    </View>
  );
}

function AlarmPreview() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View
      accessible
      accessibilityLabel="Exemplo de alarme para Losartana 50 miligramas às 09:00"
      style={styles.alarmPreview}
    >
      <View style={styles.alarmPreviewHeader}>
        <View style={styles.alarmPreviewIconBox}>
          <Clock3 color={colors.primaryDark} size={22} />
        </View>
        <View style={styles.alarmPreviewText}>
          <AppText variant="subheading" style={{ color: colors.text }}>
            Losartana 50 mg
          </AppText>
          <AppText variant="caption" muted style={{ color: colors.textMuted }}>
            Dose das 09:00 · 1 comprimido
          </AppText>
        </View>
      </View>
      <View style={styles.previewActions}>
        <View style={styles.previewPrimary}>
          <AppText variant="caption" style={styles.previewPrimaryText}>
            Marcar como tomado
          </AppText>
        </View>
        <View style={styles.previewSecondary}>
          <AppText variant="caption" style={styles.previewSecondaryText}>
            Adiar 5 min
          </AppText>
        </View>
      </View>
    </View>
  );
}

function getPrimaryTitle(step: Step, busy: boolean): string {
  if (busy) return "Aguarde...";
  if (step === "welcome") return "Começar";
  if (step === "profile") return "Continuar";
  if (step === "guide") return "Configurar meus lembretes";
  if (step === "notifications") return "Permitir notificações";
  if (step === "exact") return "Permitir horário exato";
  if (step === "fullScreen") return "Permitir tela cheia";
  return "Ir para o aplicativo";
}

function getStepTitle(step: EssentialOnboardingPermissionStep): string {
  return PERMISSION_CONTENT[step].title;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    keyboardArea: { flex: 1 },
    coralScreen: {
      backgroundColor: CORAL_HEADER_BG,
      flex: 1,
    },
    coralHeader: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
    },
    coralBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255, 255, 255, 0.18)",
      borderRadius: radii.pill,
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    coralBadgeText: {
      color: "#FFFFFF",
      fontFamily: fontFamilies.bold,
      fontSize: 13,
    },
    coralHeaderTitle: {
      color: "#FFFFFF",
      marginTop: spacing.md,
    },
    coralHeaderSubtitle: {
      color: "rgba(255, 255, 255, 0.90)",
      fontSize: 16,
      lineHeight: 23,
      marginTop: spacing.xs,
    },
    guideSheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.xl,
      borderTopRightRadius: radii.xl,
      flex: 1,
      overflow: "hidden",
    },
    guideSheetContent: {
      flexGrow: 1,
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    bentoFeatureList: {
      gap: spacing.md,
    },
    featureCard: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      flexDirection: "row",
      padding: spacing.lg,
    },
    featureIconMedallion: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: radii.md,
      height: 52,
      justifyContent: "center",
      marginRight: spacing.md,
      width: 52,
    },
    featureCardBody: {
      flex: 1,
    },
    featureTitleRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.xs,
    },
    featureStepTag: {
      color: colors.primary,
      fontFamily: fontFamilies.bold,
      fontSize: 13,
    },
    featureCardTitle: {
      color: colors.text,
      flexShrink: 1,
    },
    featureDescription: {
      color: colors.textMuted,
      marginTop: 4,
    },
    privacyBanner: {
      alignItems: "center",
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentSelectionBorder,
      borderRadius: radii.md,
      borderWidth: 1,
      flexDirection: "row",
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    privacyIconWrap: {
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    privacyBannerText: {
      color: colors.text,
      flex: 1,
    },
    sheetFooter: {
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    editorialTopBar: {
      paddingBottom: spacing.md,
      paddingTop: spacing.sm,
    },
    editorialNavRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    backPillButton: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      minHeight: 48,
      paddingHorizontal: spacing.md,
    },
    backPillText: {
      color: colors.primaryDark,
      fontFamily: fontFamilies.semibold,
      fontSize: 15,
    },
    stepPillBadge: {
      backgroundColor: colors.primarySoft,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
    },
    stepPillBadgeText: {
      color: colors.primaryDark,
      fontFamily: fontFamilies.bold,
      fontSize: 13,
    },
    progressTrack: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    progressSegment: {
      borderRadius: radii.pill,
      flex: 1,
      height: 6,
    },
    progressSegmentActive: {
      backgroundColor: colors.primary,
    },
    progressSegmentInactive: {
      backgroundColor: colors.border,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: spacing.lg,
    },
    stepContent: {
      flex: 1,
      paddingTop: spacing.lg,
    },
    editorialCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      padding: spacing.xl,
    },
    brandRow: {
      alignItems: "center",
      flexDirection: "row",
      marginBottom: spacing.xl,
    },
    brandName: { color: colors.primaryDark, marginLeft: spacing.md },
    eyebrow: { color: colors.primaryDark, marginBottom: spacing.md },
    iconWrap: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: 22,
      height: 68,
      justifyContent: "center",
      marginBottom: spacing.lg,
      width: 68,
    },
    title: { color: colors.primaryDark },
    description: {
      color: colors.textMuted,
      marginTop: spacing.sm,
    },
    inputLabel: {
      color: colors.text,
      marginBottom: spacing.sm,
      marginTop: spacing.xxl,
    },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.controlBorder,
      borderRadius: radii.md,
      borderWidth: 1,
      color: colors.text,
      fontFamily: fontFamilies.regular,
      fontSize: 18,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
    },
    inputError: { borderColor: colors.danger },
    errorText: { color: colors.danger, marginTop: spacing.sm },
    benefitList: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      marginTop: spacing.xl,
      paddingHorizontal: spacing.md,
    },
    benefitRow: {
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      minHeight: 54,
      paddingVertical: spacing.sm,
    },
    benefitRowLast: {
      borderBottomWidth: 0,
    },
    benefitText: {
      color: colors.text,
      flex: 1,
      fontSize: 15,
      marginLeft: spacing.md,
    },
    permissionFeedbackCard: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentSelectionBorder,
      borderRadius: radii.md,
      borderWidth: 1,
      marginTop: spacing.lg,
      padding: spacing.md,
    },
    permissionMessage: {
      color: colors.primaryDark,
    },
    alarmPreview: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      marginTop: spacing.xl,
      padding: spacing.lg,
    },
    alarmPreviewHeader: {
      alignItems: "center",
      flexDirection: "row",
    },
    alarmPreviewIconBox: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: radii.md,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    alarmPreviewText: { flex: 1, marginLeft: spacing.md },
    previewActions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    previewPrimary: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      flex: 1,
      justifyContent: "center",
      minHeight: 46,
      paddingHorizontal: spacing.sm,
    },
    previewPrimaryText: {
      color: colors.onPrimary,
      fontFamily: fontFamilies.bold,
      textAlign: "center",
    },
    previewSecondary: {
      alignItems: "center",
      borderColor: colors.primary,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      justifyContent: "center",
      minHeight: 46,
      paddingHorizontal: spacing.md,
    },
    previewSecondaryText: {
      color: colors.primaryDark,
      fontFamily: fontFamilies.bold,
      textAlign: "center",
    },
    optionalSection: {
      gap: spacing.sm,
      marginTop: spacing.xl,
    },
    optionalSectionTitle: {
      color: colors.textMuted,
      fontFamily: fontFamilies.bold,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    optionalRowCard: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: 68,
      padding: spacing.md,
    },
    optionalRowCardConfigured: {
      borderColor: colors.success,
    },
    optionalRowIcon: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderRadius: radii.md,
      height: 44,
      justifyContent: "center",
      marginRight: spacing.md,
      width: 44,
    },
    optionalRowBody: {
      flex: 1,
      paddingRight: spacing.xs,
    },
    optionalRowTitle: {
      color: colors.text,
      fontSize: 16,
    },
    optionalRowDesc: {
      color: colors.textMuted,
      marginTop: 2,
    },
    optionalRowAction: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
    configuredTag: {
      color: colors.success,
      fontFamily: fontFamilies.bold,
    },
    configureActionWrap: {
      alignItems: "center",
      flexDirection: "row",
      gap: 2,
    },
    configureActionText: {
      color: colors.primaryDark,
      fontFamily: fontFamilies.bold,
    },
    footer: {
      backgroundColor: colors.background,
      gap: spacing.sm,
      paddingBottom: spacing.md,
      paddingTop: spacing.sm,
    },
    primaryPillButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      justifyContent: "center",
      minHeight: 56,
      paddingHorizontal: spacing.xl,
    },
    primaryPillText: {
      color: colors.onPrimary,
      fontFamily: fontFamilies.bold,
      fontSize: 17,
    },
    secondaryPillButton: {
      alignItems: "center",
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      justifyContent: "center",
      minHeight: 50,
      paddingHorizontal: spacing.xl,
    },
    secondaryPillText: {
      color: colors.primaryDark,
      fontFamily: fontFamilies.semibold,
      fontSize: 16,
    },
    pillPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.99 }],
    },
    pillDisabled: {
      opacity: 0.55,
    },
  });
