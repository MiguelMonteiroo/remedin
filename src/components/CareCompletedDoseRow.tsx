import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Check, ChevronRight, Minus, RotateCcw } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { AppButton } from "./ui/AppButton";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { DoseStatus } from "../types/domain";
import { ptBR } from "../i18n/ptBR";
import { isLargeText } from "../utils/accessibilityLayout";

type Props = {
  time: string;
  name: string;
  dosage?: string;
  status: Extract<DoseStatus, "taken" | "skipped">;
  onPress?: () => void;
  onUndo?: () => void;
  undoing?: boolean;
};

export function CareCompletedDoseRow({
  time,
  name,
  dosage,
  status,
  onPress,
  onUndo,
  undoing = false,
}: Props) {
  const { colors } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  const styles = createStyles(colors);
  const stackActions = Boolean(onUndo) && (width < 390 || isLargeText(fontScale));
  const isSkipped = status === "skipped";
  const Icon = isSkipped ? Minus : Check;
  const statusText = isSkipped ? "Pulada" : "Tomada";
  const title = dosage && dosage !== ptBR.form.noDosage ? `${name} (${dosage})` : name;

  return (
    <View style={[styles.row, stackActions && styles.stackedRow]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.details, stackActions && styles.stackedDetails, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`Dose ${statusText.toLowerCase()}: ${title}, às ${time}`}
      >
        <View style={[styles.statusIcon, isSkipped && styles.skippedIcon]}>
          <Icon color={isSkipped ? colors.danger : colors.success} size={18} />
        </View>
        <AppText
          weight="semibold"
          style={[styles.time, isSkipped && styles.skippedText]}
        >
          {time}
        </AppText>
        <View style={styles.info}>
          <AppText variant="small" weight="semibold" style={styles.name}>{title}</AppText>
          <AppText
            variant="small"
            style={[styles.statusText, isSkipped && styles.skippedText]}
          >
            {statusText}
          </AppText>
        </View>
      </Pressable>
      {onUndo ? (
        <AppButton
          accessibilityLabel={`Desfazer dose ${isSkipped ? "pulada" : "tomada"}`}
          accessibilityHint={`Volta a dose de ${name}, das ${time}, para pendente.`}
          disabled={undoing}
          icon={RotateCcw}
          onPress={onUndo}
          size="compact"
          style={stackActions ? styles.stackedUndoButton : styles.undoButton}
          title="Desfazer"
          variant="ghost"
        />
      ) : (
        <ChevronRight color={colors.textMuted} size={20} />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 72,
    paddingVertical: spacing.md,
  },
  stackedRow: { alignItems: "stretch", flexDirection: "column", gap: spacing.sm },
  stackedDetails: { flex: 0, width: "100%" },
  stackedUndoButton: { alignSelf: "flex-end", marginLeft: 0 },
  details: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    height: 32,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 32,
  },
  skippedIcon: {
    backgroundColor: colors.dangerSoft,
  },
  time: {
    color: colors.success,
    fontVariant: ["tabular-nums"],
    marginRight: spacing.md,
    minWidth: 48,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
  },
  statusText: {
    color: colors.success,
  },
  skippedText: {
    color: colors.danger,
  },
  pressed: {
    opacity: 0.75,
  },
  undoButton: {
    marginLeft: spacing.sm,
  },
});
