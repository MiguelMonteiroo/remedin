import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/spacing";
import { RemedinCapsuleSymbol, RemedinHorizontalSignature } from "../brand/RemedinBrand";
import { AppButton } from "../ui/AppButton";
import { AppText } from "../ui/AppText";
import { Screen } from "../ui/Screen";

export function OnboardingWelcome({ onContinue }: { onContinue: () => void }) {
  const { colors, name } = useAppTheme();

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={name === "dark" ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RemedinHorizontalSignature color={colors.primaryDark} />
        <View style={styles.hero}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.orbit, { borderColor: colors.border }]}
          >
            <View style={[styles.medallion, { backgroundColor: colors.primarySoft }]}>
              <RemedinCapsuleSymbol color={colors.primaryDark} size={112} />
            </View>
            <View style={[styles.orbitPoint, { backgroundColor: colors.primary }]} />
          </View>
          <AppText accessibilityRole="header" variant="title" style={[styles.title, { color: colors.text }]}>
            Seu cuidado no tempo certo.
          </AppText>
          <AppText style={[styles.description, { color: colors.textMuted }]}>
            Organize seus medicamentos e receba lembretes nos horários da sua rotina.
          </AppText>
        </View>
        <View style={styles.footer}>
          <AppButton accessibilityLabel="Começar" onPress={onContinue} title="Começar" />
          <View style={styles.privacy}>
            <ShieldCheck color={colors.primaryDark} size={17} />
            <AppText variant="small" style={[styles.privacyText, { color: colors.textMuted }]}>
              Funciona offline. Seus dados ficam neste aparelho.
            </AppText>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: "center", paddingTop: spacing.sm, paddingBottom: spacing.lg },
  hero: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xl },
  orbit: { width: 196, height: 196, borderRadius: 98, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  medallion: { width: 156, height: 156, borderRadius: 78, alignItems: "center", justifyContent: "center" },
  orbitPoint: { width: 8, height: 8, borderRadius: 4, position: "absolute", top: 22, right: 27 },
  title: { textAlign: "center", maxWidth: 325, marginTop: spacing.xl },
  description: { textAlign: "center", maxWidth: 315, marginTop: spacing.md },
  footer: { alignSelf: "center", width: "100%", maxWidth: 420, gap: spacing.md },
  privacy: { alignItems: "center", justifyContent: "center", flexDirection: "row", gap: spacing.sm },
  privacyText: { flexShrink: 1, textAlign: "center" },
});
