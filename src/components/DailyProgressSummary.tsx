import { StyleSheet, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  taken: number;
  total: number;
  label: string;
  supportLabel: string;
};

export function DailyProgressSummary({ taken, total, label, supportLabel }: Props) {
  const progress = total === 0 ? 0 : Math.max(0, Math.min(1, taken / total));

  return (
    <View accessibilityLabel={`${label}. ${supportLabel}`} accessible style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <AppText variant="subheading" weight="bold" style={styles.label}>Progresso</AppText>
          <AppText variant="heading" weight="bold" style={styles.valueText}>{label}</AppText>
        </View>
        <View style={styles.countBubble}>
          <AppText variant="heading" weight="bold" style={styles.countText}>{taken}/{total}</AppText>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <View style={styles.supportRow}>
        <CheckCircle2 color={colors.primary} size={24} strokeWidth={2.5} />
        <AppText variant="label" style={styles.supportText}>{supportLabel}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  headingRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  headingCopy: { flex: 1, marginRight: spacing.md },
  label: { color: colors.textMuted },
  valueText: { color: colors.primaryDark, marginTop: spacing.xs },
  countBubble: {
    alignItems: "center",
    backgroundColor: colors.bentoSun,
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: 56,
    minWidth: 72,
    paddingHorizontal: spacing.sm,
  },
  countText: { color: colors.navyDeep },
  track: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: radii.pill,
    height: 16,
    marginTop: spacing.xl,
    overflow: "hidden",
  },
  fill: { backgroundColor: colors.primary, borderRadius: radii.pill, height: "100%", minWidth: 0 },
  supportRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  supportText: { flex: 1, color: colors.textMuted },
});
