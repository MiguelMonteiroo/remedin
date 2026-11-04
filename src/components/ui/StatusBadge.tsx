import { StyleSheet, View } from "react-native";
import { Circle, type LucideIcon } from "lucide-react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../../theme/ThemeProvider";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";
import { DoseStatus } from "../../types/domain";
import { ptBR } from "../../i18n/ptBR";

export type BadgeStatus = DoseStatus | "active" | "paused" | "undone";

type Props = { status: BadgeStatus };

const LABELS: Record<BadgeStatus, string> = {
  pending: ptBR.status.pending,
  taken: ptBR.status.taken,
  skipped: ptBR.status.skipped,
  snoozed: ptBR.status.snoozed,
  unrecorded: ptBR.status.unrecorded,
  active: ptBR.status.active,
  paused: ptBR.status.paused,
  undone: "Desfeita",
};

export function StatusBadge({ status }: Props) {
  const { colors } = useAppTheme();
  const palette: Record<BadgeStatus, { color: string; background: string }> = {
    pending: { color: colors.warning, background: colors.warningSoft },
    taken: { color: colors.success, background: colors.successSoft },
    skipped: { color: colors.danger, background: colors.dangerSoft },
    snoozed: { color: colors.info, background: colors.infoSoft },
    unrecorded: { color: colors.danger, background: colors.dangerSoft },
    active: { color: colors.success, background: colors.successSoft },
    paused: { color: colors.warning, background: colors.warningSoft },
    undone: { color: colors.textMuted, background: colors.surfaceMuted },
  };
  const { color, background } = palette[status];
  const Icon: LucideIcon = Circle;
  return (
    <View accessibilityLabel={`Status: ${LABELS[status]}`} accessible style={[styles.badge, { backgroundColor: background }]}>
      <Icon color={color} fill={color} size={8} strokeWidth={0} />
      <AppText variant="caption" weight="semibold" style={{ color }}>{LABELS[status]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", alignSelf: "flex-start", borderRadius: radii.pill, flexDirection: "row", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});
