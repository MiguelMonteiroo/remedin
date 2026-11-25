import { AppState, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import {
  AlarmClockCheck,
  BatteryCharging,
  Bell,
  Info,
  LockKeyhole,
  Maximize2,
  TestTube2,
  UserRound,
  Volume2,
} from "lucide-react-native";
import { AppButton } from "../components/ui/AppButton";
import { ProfileAvatarImage, ProfileAvatarPicker } from "../components/ProfileAvatarPicker";
import { AppCard } from "../components/ui/AppCard";
import { AppText } from "../components/ui/AppText";
import { Screen } from "../components/ui/Screen";
import { SectionHeader } from "../components/ui/SectionHeader";
import { CareInfoTip } from "../components/CareInfoTip";
import { SettingsRow } from "../components/SettingsRow";
import { useAppData } from "../services/appDataProvider";
import {
  ensureAlarmChannels,
  getAlarmPresentationDiagnostics,
  getReminderPermissionState,
  openBatterySettings,
  openCriticalAlarmChannelSettings,
  openDoNotDisturbSettings,
  openExactAlarmSettings,
  openFullScreenAlarmSettings,
  openNotificationSettings,
  openNativeAlarmChannelSettings,
  requestNotificationPermission,
} from "../services/notificationPermissionService";
import type { ProfileAvatar, ReminderPermissionState } from "../types/domain";
import { validateProfileName } from "../utils/validation";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { fontFamilies } from "../theme/typography";
import { ptBR } from "../i18n/ptBR";
import { REMINDER_SETTING_ORDER, type ReminderSettingKey } from "../utils/reminderSettingsOrder";
import {
  fullScreenAlarmAction,
  isFullScreenAlarmReady,
  type AlarmPresentationDiagnostics,
} from "../services/reminders/alarmPresentationDiagnostics";

export function SettingsScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const {
    settings,
    updateProfile,
    updateNotificationsEnabled,
    updateReminderSettings,
    runAlarmTest,
    reminderSyncPending,
  } = useAppData();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<ReminderPermissionState | null>(null);
  const [alarmPresentation, setAlarmPresentation] = useState<AlarmPresentationDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.userName);
  const [avatarDraft, setAvatarDraft] = useState(settings.profileAvatar);
  const [nameError, setNameError] = useState("");
  const [alarmTestMessage, setAlarmTestMessage] = useState("");

  const refreshPermissions = useCallback(async (enabledPreference = settings.notificationsEnabled) => {
    const [readiness, presentation] = await Promise.all([
      getReminderPermissionState(),
      getAlarmPresentationDiagnostics(settings.criticalAlertsEnabled).catch(() => null),
    ]);
    setPermissionState(readiness);
    setAlarmPresentation(presentation);
    setNotificationsEnabled(enabledPreference && readiness.notifications === "granted");
    setLoading(false);
    return readiness;
  }, [settings.criticalAlertsEnabled, settings.notificationsEnabled]);

  useEffect(() => {
    if (!alarmTestMessage) return;
    const timer = setTimeout(() => setAlarmTestMessage(""), 8_000);
    return () => clearTimeout(timer);
  }, [alarmTestMessage]);
  useEffect(() => { refreshPermissions(); }, [refreshPermissions]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshPermissions();
    });
    return () => subscription.remove();
  }, [refreshPermissions]);

  const basicPermissionGranted = permissionState?.notifications === "granted";
  const remindersReady = notificationsEnabled && basicPermissionGranted;
  const advancedDisabled = !remindersReady;
  const criticalReady =
    remindersReady &&
    settings.criticalAlertsEnabled &&
    permissionState?.doNotDisturb === "granted" &&
    permissionState?.criticalAlarmChannel === "bypasses";
  const exactReady =
    remindersReady &&
    (permissionState?.exactAlarms === "granted" || permissionState?.exactAlarms === "notRequired");
  const fullScreenReady =
    remindersReady &&
    isFullScreenAlarmReady(settings.fullScreenAlarmEnabled, alarmPresentation);
  const fullScreenAction = alarmPresentation
    ? fullScreenAlarmAction(alarmPresentation)
    : null;
  const backgroundReady = permissionState?.batteryOptimization === "unrestricted";

  async function handleToggleNotifications(value: boolean) {
    setLoading(true);
    if (value) {
      const result = await requestNotificationPermission();
      await updateNotificationsEnabled(result.granted);
      await refreshPermissions(result.granted);
      return;
    }
    await updateNotificationsEnabled(false);
    await refreshPermissions(false);
  }

  async function handleCriticalAlertsToggle(value: boolean) {
    if (advancedDisabled) return;
    if (!value) {
      await updateReminderSettings({ criticalAlertsEnabled: false });
      return;
    }
    await updateReminderSettings({ criticalAlertsEnabled: true });
    const readiness = await refreshPermissions();
    if (readiness.doNotDisturb !== "granted") {
      await openDoNotDisturbSettings();
      return;
    }
    await ensureAlarmChannels();
    const channels = await refreshPermissions();
    if (channels.criticalAlarmChannel !== "bypasses") await openCriticalAlarmChannelSettings();
  }

  async function handleFullScreenToggle(value: boolean) {
    if (advancedDisabled) return;
    await updateReminderSettings({ fullScreenAlarmEnabled: value });
    if (value && permissionState?.fullScreen === "denied") await openFullScreenAlarmSettings();
    await refreshPermissions();
  }

  async function openFullScreenBlocker(): Promise<void> {
    if (fullScreenAction === "notifications") {
      await openNotificationSettings();
      return;
    }
    if (fullScreenAction === "channel") {
      await openNativeAlarmChannelSettings(settings.criticalAlertsEnabled);
      return;
    }
    await openFullScreenAlarmSettings();
  }

  async function handleSaveName() {
    const error = validateProfileName(nameDraft);
    if (error) {
      setNameError(error);
      return;
    }
    try {
      await updateProfile(nameDraft, avatarDraft);
      setNameError("");
      setEditingName(false);
    } catch {
      setNameError("Não foi possível salvar seu perfil. Tente novamente.");
    }
  }

  async function handleAlarmTest() {
    if (advancedDisabled) return;
    setAlarmTestMessage("");
    const readiness = await refreshPermissions();
    if (readiness.notifications !== "granted") return;
    await runAlarmTest();
    setAlarmTestMessage("Bloqueie a tela agora. O alarme deve abrir sobre a tela bloqueada ou imediatamente após você desbloquear.");
  }

  function renderReminderSetting(key: ReminderSettingKey) {
    switch (key) {
      case "notifications":
        return (
          <SettingsRow
            key={key}
            icon={Bell}
            title={ptBR.profile.notifications.title}
            description={ptBR.profile.notifications.description}
            state={remindersReady ? "Ativado" : permissionState?.notifications === "denied" ? "Bloqueado no aparelho" : "Desativado"}
            stateTone={remindersReady ? "positive" : "attention"}
            actionLabel={permissionState?.notifications === "denied" ? "Abrir configurações" : undefined}
            onAction={openNotificationSettings}
            switchValue={permissionState?.notifications === "denied" ? undefined : remindersReady}
            onSwitchChange={handleToggleNotifications}
            disabled={loading}
          />
        );
      case "silentMode":
        return (
          <SettingsRow
            key={key}
            icon={Volume2}
            title={ptBR.profile.silentMode.title}
            description={ptBR.profile.silentMode.description}
            state={criticalReady ? "Ativado" : advancedDisabled ? "Ative as notificações primeiro" : "Precisa de autorização"}
            stateTone={criticalReady ? "positive" : "attention"}
            actionLabel={settings.criticalAlertsEnabled && !criticalReady ? "Revisar autorização" : undefined}
            onAction={permissionState?.doNotDisturb === "granted" ? openCriticalAlarmChannelSettings : openDoNotDisturbSettings}
            switchValue={settings.criticalAlertsEnabled}
            onSwitchChange={handleCriticalAlertsToggle}
            disabled={advancedDisabled}
          />
        );
      case "exactAlarm":
        return (
          <SettingsRow
            key={key}
            icon={AlarmClockCheck}
            title={ptBR.profile.exactAlarm.title}
            description={ptBR.profile.exactAlarm.description}
            state={exactReady ? "Ativado" : advancedDisabled ? "Ative as notificações primeiro" : "Precisa de autorização"}
            stateTone={exactReady ? "positive" : "attention"}
            actionLabel={ptBR.actions.review}
            onAction={openExactAlarmSettings}
            disabled={advancedDisabled}
          />
        );
      case "fullScreen":
        return (
          <SettingsRow
            key={key}
            icon={Maximize2}
            title={ptBR.profile.fullScreen.title}
            description={ptBR.profile.fullScreen.description}
            state={fullScreenReady ? "Ativado" : advancedDisabled ? "Ative as notificações primeiro" : settings.fullScreenAlarmEnabled ? "Precisa de autorização" : "Desativado"}
            stateTone={fullScreenReady ? "positive" : "attention"}
            actionLabel={settings.fullScreenAlarmEnabled && !fullScreenReady ? "Revisar autorização" : undefined}
            onAction={openFullScreenBlocker}
            switchValue={settings.fullScreenAlarmEnabled}
            onSwitchChange={handleFullScreenToggle}
            disabled={advancedDisabled}
          />
        );
      case "lockScreenDetails":
        return (
          <SettingsRow
            key={key}
            icon={LockKeyhole}
            title={ptBR.profile.lockScreen.title}
            description={ptBR.profile.lockScreen.description}
            state={settings.showLockScreenDetails ? "Visíveis" : "Ocultos"}
            stateTone={settings.showLockScreenDetails ? "positive" : "neutral"}
            switchValue={settings.showLockScreenDetails}
            onSwitchChange={(value) => updateReminderSettings({ showLockScreenDetails: value })}
            disabled={advancedDisabled}
          />
        );
      case "background":
        return (
          <SettingsRow
            key={key}
            icon={BatteryCharging}
            title={ptBR.profile.background.title}
            description={ptBR.profile.background.description}
            state={backgroundReady ? "Sem restrição" : "Economia de bateria ativa"}
            stateTone={backgroundReady ? "positive" : "attention"}
            actionLabel={ptBR.actions.openSettings}
            onAction={openBatterySettings}
            disabled={advancedDisabled}
            last
          />
        );
    }
  }

  return (
    <Screen edges={["top", "left", "right"]} style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <AppText accessibilityRole="header" variant="title" style={styles.title}>
            {ptBR.profile.title}
          </AppText>
          <AppText muted style={[styles.subtitle, { color: colors.textMuted }]}>
            {ptBR.profile.subtitle}
          </AppText>
        </View>

        {reminderSyncPending ? (
          <CareInfoTip text="Alguns lembretes aguardam atualização. O Remedin tentará novamente ao abrir o app." />
        ) : null}

        <ProfileNamePanel
          avatar={settings.profileAvatar}
          avatarDraft={avatarDraft}
          editing={editingName}
          error={nameError}
          name={settings.userName}
          nameDraft={nameDraft}
          onAvatarChange={setAvatarDraft}
          onCancel={() => { setNameError(""); setEditingName(false); }}
          onChange={(value) => { setNameDraft(value); if (nameError) setNameError(""); }}
          onEdit={() => {
            setNameDraft(settings.userName);
            setAvatarDraft(settings.profileAvatar);
            setEditingName(true);
          }}
          onSave={handleSaveName}
        />

        <SectionHeader title={ptBR.profile.remindersTitle} meta={ptBR.profile.remindersMeta} />
        <AppCard style={[styles.settingsGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {REMINDER_SETTING_ORDER.map(renderReminderSetting)}
        </AppCard>

        <AppCard style={styles.testCard}>
          <View style={styles.testHeading}>
            <View style={styles.testIcon}><TestTube2 color={colors.primaryDark} size={25} strokeWidth={2} /></View>
            <View style={styles.testCopy}>
              <AppText variant="subheading" weight="semibold" style={{ color: colors.text }}>Testar alarme</AppText>
              <AppText variant="caption" muted style={{ color: colors.textMuted }}>Confira som, vibração e tela antes do próximo horário.</AppText>
            </View>
          </View>
          <AppButton disabled={advancedDisabled} icon={TestTube2} onPress={handleAlarmTest} title="Testar em 5 segundos" variant="secondary" />
          {alarmTestMessage ? <AppText accessibilityLiveRegion="polite" variant="small" style={styles.alarmTestMessage}>{alarmTestMessage}</AppText> : null}
        </AppCard>

        <SectionHeader title="Sobre" />
        <View style={styles.aboutRow}>
          <Info color={colors.primaryMuted} size={22} strokeWidth={2} />
          <View style={styles.aboutCopy}>
            <AppText variant="small" weight="semibold" style={{ color: colors.text }}>Remedin 1.0.0</AppText>
            <AppText variant="caption" muted style={{ color: colors.textMuted }}>Lembretes pessoais armazenados somente neste aparelho.</AppText>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

type ProfileProps = {
  avatar?: ProfileAvatar;
  avatarDraft?: ProfileAvatar;
  editing: boolean;
  error: string;
  name: string;
  nameDraft: string;
  onAvatarChange: (value: ProfileAvatar) => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
};

function ProfileNamePanel({
  avatar,
  avatarDraft,
  editing,
  error,
  name,
  nameDraft,
  onAvatarChange,
  onCancel,
  onChange,
  onEdit,
  onSave,
}: ProfileProps) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const selectedAvatar = editing ? avatarDraft : avatar;

  return (
    <AppCard style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.profileHeading, editing && styles.profileHeadingEditing]}>
        <View style={styles.avatar}>
          {selectedAvatar
            ? <ProfileAvatarImage avatar={selectedAvatar} size={52} />
            : <UserRound color={colors.primaryDark} size={27} strokeWidth={2} />}
        </View>
        <View style={styles.profileCopy}>
          <AppText variant="caption" style={{ color: colors.textMuted }}>Perfil neste aparelho</AppText>
          {!editing ? <AppText variant="heading" style={styles.profileName}>{name || "Seu nome"}</AppText> : null}
        </View>
        {!editing ? <AppButton onPress={onEdit} size="compact" title="Editar" variant="ghost" /> : null}
      </View>
      {editing ? (
        <>
          <TextInput
            accessibilityLabel="Nome do perfil"
            autoCapitalize="words"
            onChangeText={onChange}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, error ? styles.inputError : null]}
            value={nameDraft}
          />
          {error ? <AppText accessibilityRole="alert" variant="small" style={styles.nameError}>{error}</AppText> : null}
          <ProfileAvatarPicker value={avatarDraft} onChange={onAvatarChange} />
          <View style={styles.editActions}>
            <AppButton onPress={onCancel} size="compact" style={styles.editButton} title="Cancelar" variant="ghost" />
            <AppButton disabled={Boolean(validateProfileName(nameDraft))} onPress={onSave} size="compact" style={styles.editButton} title="Salvar" />
          </View>
        </>
      ) : null}
    </AppCard>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { paddingBottom: spacing.xl },
  headerBlock: { marginBottom: spacing.lg },
  title: { color: colors.primaryDark },
  subtitle: { marginTop: spacing.xs },
  profileCard: { borderRadius: radii.lg, marginBottom: spacing.md, padding: spacing.lg },
  profileHeading: { alignItems: "center", flexDirection: "row" },
  profileHeadingEditing: { marginBottom: spacing.md },
  avatar: { alignItems: "center", backgroundColor: colors.primarySoft, borderColor: colors.border, borderRadius: 27, borderWidth: 1, height: 54, justifyContent: "center", marginRight: spacing.md, width: 54 },
  profileCopy: { flex: 1, marginRight: spacing.sm },
  profileName: { color: colors.primaryDark },
  input: { backgroundColor: colors.surface, borderColor: colors.borderStrong, borderRadius: radii.md, borderWidth: 1, color: colors.text, fontFamily: fontFamilies.regular, fontSize: 18, minHeight: 52, paddingHorizontal: spacing.md },
  inputError: { borderColor: colors.danger },
  nameError: { color: colors.danger, marginTop: spacing.sm },
  editActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  editButton: { flex: 1 },
  settingsGroup: { borderRadius: radii.lg, marginBottom: spacing.lg, paddingBottom: 0, paddingHorizontal: spacing.lg, paddingTop: 0 },
  testCard: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder, borderRadius: radii.lg, marginBottom: spacing.lg, padding: spacing.lg },
  testHeading: { alignItems: "center", flexDirection: "row", marginBottom: spacing.lg },
  testIcon: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.md, height: 48, justifyContent: "center", marginRight: spacing.md, width: 48 },
  testCopy: { flex: 1 },
  alarmTestMessage: { color: colors.primaryDark, marginTop: spacing.md },
  aboutRow: { alignItems: "flex-start", flexDirection: "row", paddingBottom: spacing.xl },
  aboutCopy: { flex: 1, marginLeft: spacing.md },
});
