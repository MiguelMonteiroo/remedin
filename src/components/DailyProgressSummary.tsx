import { StyleSheet, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  taken: number;
  total: number;
  label: string;
  supportLabel: string;
};

export function DailyProgressSummary({ taken, total, label, supportLabel }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const progress = total === 0 ? 0 : Math.max(0, Math.min(1, taken / total));

  return (
    <View accessibilityLabel={`${label}. ${supportLabel}`} accessible style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <AppText variant="caption" weight="bold" style={styles.label}>
            PROGRESSO DE HOJE
          </AppText>
          <AppText variant="heading" weight="bold" style={styles.valueText}>
            {label}
          </AppText>
        </View>
        <View style={styles.countBubble}>
          <AppText variant="heading" weight="bold" style={styles.countText}>
            {taken}/{total}
          </AppText>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <View style={styles.supportRow}>
        <CheckCircle2 color={colors.primary} size={22} strokeWidth={2.4} />
        <AppText variant="small" weight="semibold" style={styles.supportText}>
          {supportLabel}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      padding: spacing.xl,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    headingRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    headingCopy: { flex: 1, marginRight: spacing.md },
    label: { color: colors.textMuted, letterSpacing: 0.6 },
    valueText: { color: colors.primaryDark, marginTop: spacing.xs },
    countBubble: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      justifyContent: "center",
      minHeight: 52,
      minWidth: 74,
      paddingHorizontal: spacing.md,
    },
    countText: { color: colors.primaryDark },
    track: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: radii.pill,
      height: 14,
      marginTop: spacing.lg,
      overflow: "hidden",
    },
    fill: {
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      height: "100%",
      minWidth: 0,
    },
    supportRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    supportText: { flex: 1, color: colors.textMuted },
  });
