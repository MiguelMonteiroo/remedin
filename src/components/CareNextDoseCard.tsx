import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, Clock3 } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = { time: string; name?: string; dosage?: string; onPress?: () => void };

export function CareNextDoseCard({ time, name, dosage, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? "Ver detalhes da próxima dose" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.heading}>
        <Clock3 color={colors.primary} size={24} strokeWidth={2.5} />
        <AppText variant="subheading" weight="bold" style={styles.headingText}>Próxima dose</AppText>
      </View>
      <View style={styles.content}>
        <AppText
          ellipsizeMode="clip"
          numberOfLines={1}
          variant="display"
          weight="bold"
          style={styles.time}
        >
          {time}
        </AppText>
        <View style={styles.info}>
          <AppText variant="heading" weight="bold" style={styles.nameText}>{name || "Nenhuma dose pendente"}</AppText>
          <AppText variant="subheading" style={styles.dosageText}>{dosage || "Sem dosagem informada"}</AppText>
        </View>
      </View>
      {onPress ? (
        <View style={styles.actionRow}>
          <ChevronRight color={colors.primary} size={32} strokeWidth={2.5} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.primarySoft, borderRadius: radii.lg, padding: spacing.xl },
  heading: { alignItems: "center", flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  headingText: { color: colors.primary },
  content: { flexDirection: "column", gap: spacing.xs, marginBottom: spacing.sm },
  time: {
    color: colors.primaryDark,
    fontVariant: ["tabular-nums"],
    fontSize: 48,
    lineHeight: 56,
  },
  info: { flex: 1 },
  nameText: { color: colors.primaryDark },
  dosageText: { color: colors.primary },
  actionRow: { alignItems: "flex-end", marginTop: spacing.md },
  pressed: { opacity: 0.85 },
});
