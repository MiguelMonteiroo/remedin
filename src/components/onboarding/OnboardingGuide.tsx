import { Animated, Pressable, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BellRing, CheckCircle2, History, LockKeyhole, Pill } from "lucide-react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { RemedinHorizontalSignature } from "../brand/RemedinBrand";
import { AppText } from "../ui/AppText";
import { ConfirmationDialog } from "../ui/ConfirmationDialog";
import { CORAL_HEADER_BG, createOnboardingStyles } from "./onboardingStyles";

export function OnboardingGuide({
  name,
  busy,
  fadeAnim,
  slideAnim,
  confirmSkipVisible,
  onContinue,
  onRequestSkip,
  onCancelSkip,
  onConfirmSkip,
}: {
  name: string;
  busy: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  confirmSkipVisible: boolean;
  onContinue: () => void;
  onRequestSkip: () => void;
  onCancelSkip: () => void;
  onConfirmSkip: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = createOnboardingStyles(colors);
  const firstName = name.trim().split(/\s+/)[0];
  const primaryTitle = busy ? "Aguarde..." : "Configurar meus lembretes";

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
              onPress={onContinue}
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
              onPress={onRequestSkip}
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
        onCancel={onCancelSkip}
        onConfirm={onConfirmSkip}
        title="Continuar sem lembretes?"
        visible={confirmSkipVisible}
      />
    </SafeAreaView>
  );
}

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
  const styles = createOnboardingStyles(colors);
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
