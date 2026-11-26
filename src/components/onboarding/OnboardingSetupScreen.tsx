import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TextInput,
  View,
} from "react-native";
import {
  AlarmClockCheck,
  ArrowLeft,
  BatteryCharging,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Maximize2,
  LockKeyhole,
  ShieldCheck,
  Volume2,
} from "lucide-react-native";
import {
  ESSENTIAL_ONBOARDING_PERMISSION_STEPS,
  type EssentialOnboardingPermissionStep,
} from "../../services/reminders/permissionOnboarding";
import { useAppTheme } from "../../theme/ThemeProvider";
import type { ProfileAvatar } from "../../types/domain";
import { RemedinHorizontalSignature } from "../brand/RemedinBrand";
import { ProfileAvatarPicker } from "../ProfileAvatarPicker";
import { AppText } from "../ui/AppText";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { Screen } from "../ui/Screen";
import { ptBR } from "../../i18n/ptBR";
import { createOnboardingStyles } from "./onboardingStyles";
import type { OnboardingSetupStep } from "./onboardingTypes";

type StepContentProps = {
  step: OnboardingSetupStep;
  avatar?: ProfileAvatar;
  name: string;
  nameError: string;
  onAvatarChange: (value: ProfileAvatar) => void;
  onNameChange: (value: string) => void;
  permissionMessage: string;
  dndConfigured: boolean;
  batteryConfigured: boolean;
  onConfigureDnd: () => void;
  onConfigureBattery: () => void;
  busy: boolean;
};

export function OnboardingSetupScreen({
  step,
  busy,
  fadeAnim,
  slideAnim,
  confirmSkipVisible,
  onBack,
  onContinue,
  onSkip,
  onCancelSkip,
  onConfirmSkip,
  ...contentProps
}: StepContentProps & {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  confirmSkipVisible: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onCancelSkip: () => void;
  onConfirmSkip: () => void;
}) {
  const { name: themeName, colors } = useAppTheme();
  const isDark = themeName === "dark";
  const styles = createOnboardingStyles(colors);
  const primaryTitle = getPrimaryTitle(step, busy);
  const activeProgressIndex = step === "ready"
    ? ESSENTIAL_ONBOARDING_PERMISSION_STEPS.length
    : step === "profile" ? -1 : ESSENTIAL_ONBOARDING_PERMISSION_STEPS.indexOf(step);

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
        {step === "profile" ? (
          <Pressable
            accessibilityLabel="Voltar para boas-vindas"
            accessibilityRole="button"
            disabled={busy}
            onPress={onBack}
            style={[styles.backPillButton, styles.profileBackButton]}
          >
            <ArrowLeft color={colors.primaryDark} size={20} />
            <AppText style={styles.backPillText}>Voltar</AppText>
          </Pressable>
        ) : null}
        {step !== "profile" ? (
          <View style={styles.editorialTopBar}>
            <View style={styles.editorialNavRow}>
              <Pressable
                accessibilityLabel="Voltar para a etapa anterior"
                accessibilityRole="button"
                disabled={busy}
                onPress={onBack}
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
                  ? `Todas as ${ESSENTIAL_ONBOARDING_PERMISSION_STEPS.length} etapas concluídas`
                  : `Progresso: etapa ${activeProgressIndex + 1} de ${ESSENTIAL_ONBOARDING_PERMISSION_STEPS.length}`
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
              {...contentProps}
              busy={busy}
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
            onPress={onContinue}
            style={({ pressed }) => [
              styles.primaryPillButton,
              busy && styles.pillDisabled,
              pressed && styles.pillPressed,
            ]}
          >
            <AppText style={styles.primaryPillText}>{primaryTitle}</AppText>
          </Pressable>

          {step === "notifications" ||
          step === "lockScreenDetails" ||
          step === "exact" ||
          step === "fullScreen" ? (
            <Pressable
              accessibilityLabel={step === "lockScreenDetails" ? ptBR.onboardingPrivacy.hide : `Fazer ${getStepTitle(step).toLowerCase()} depois`}
              accessibilityRole="button"
              disabled={busy}
              onPress={onSkip}
              style={({ pressed }) => [
                styles.secondaryPillButton,
                pressed && styles.pillPressed,
              ]}
            >
              <AppText style={styles.secondaryPillText}>{step === "lockScreenDetails" ? ptBR.onboardingPrivacy.hide : "Agora não"}</AppText>
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
        onCancel={onCancelSkip}
        onConfirm={onConfirmSkip}
        title="Continuar sem lembretes?"
        visible={confirmSkipVisible}
      />
    </Screen>
  );
}

function OnboardingStepContent({
  step,
  avatar,
  name,
  nameError,
  onAvatarChange,
  onNameChange,
  permissionMessage,
  dndConfigured,
  batteryConfigured,
  onConfigureDnd,
  onConfigureBattery,
  busy,
}: StepContentProps) {
  const { colors } = useAppTheme();
  const styles = createOnboardingStyles(colors);

  if (step === "profile") {
    return (
      <View style={styles.stepContent}>
        <RemedinHorizontalSignature color={colors.primaryDark} style={styles.profileBrand} />
        <AppText accessibilityRole="header" variant="title" style={styles.title}>
          Como podemos chamar você?
        </AppText>
        <AppText muted style={styles.description}>
          Personalize seu perfil. Seu nome e avatar ficam neste aparelho.
        </AppText>
        <AppText style={styles.inputLabel}>Seu nome</AppText>
        <TextInput
          accessibilityLabel="Seu nome"
          autoCapitalize="words"
          autoComplete="name"
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
        <ProfileAvatarPicker value={avatar} onChange={onAvatarChange} />
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
          <BenefitRow text={ptBR.onboardingPrivacy.choiceBenefit} />
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
  lockScreenDetails: {
    title: ptBR.onboardingPrivacy.title,
    description: ptBR.onboardingPrivacy.description,
    icon: LockKeyhole,
  },
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

function BenefitRow({
  text,
  last = false,
}: {
  text: string;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = createOnboardingStyles(colors);
  return (
    <View style={[styles.benefitRow, last && styles.benefitRowLast]}>
      <CheckCircle2 color={colors.success} size={22} />
      <AppText style={styles.benefitText}>{text}</AppText>
    </View>
  );
}

function AlarmPreview() {
  const { colors } = useAppTheme();
  const styles = createOnboardingStyles(colors);
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

function getPrimaryTitle(step: OnboardingSetupStep, busy: boolean): string {
  if (busy) return "Aguarde...";
  if (step === "lockScreenDetails") return ptBR.onboardingPrivacy.show;
  if (step === "profile") return "Continuar";
  if (step === "notifications") return "Permitir notificações";
  if (step === "exact") return "Permitir horário exato";
  if (step === "fullScreen") return "Permitir tela cheia";
  return "Ir para o aplicativo";
}

function getStepTitle(step: EssentialOnboardingPermissionStep): string {
  return PERMISSION_CONTENT[step].title;
}
