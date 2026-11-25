import { Pressable, StyleSheet, View } from "react-native";
import { ChevronRight, Clock3 } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { useAppTheme } from "../theme/ThemeProvider";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  time: string;
  name?: string;
  dosage?: string;
  onPress?: () => void;
};

export function CareNextDoseCard({ time, name, dosage, onPress }: Props) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? "Ver detalhes da próxima dose" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.heading}>
          <Clock3 color={colors.primaryDark} size={20} strokeWidth={2.4} />
          <AppText
            variant="caption"
            weight="bold"
            style={[styles.eyebrow, { color: colors.primaryDark }]}
          >
            PRÓXIMA DOSE
          </AppText>
        </View>
        {onPress ? (
          <View style={[styles.chevronPill, { backgroundColor: colors.surface }]}>
            <ChevronRight color={colors.primaryDark} size={22} strokeWidth={2.4} />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <AppText
          ellipsizeMode="clip"
          numberOfLines={1}
          variant="display"
          weight="bold"
          style={[styles.time, { color: colors.primaryDark }]}
        >
          {time}
        </AppText>
        <View style={styles.info}>
          <AppText
            variant="heading"
            weight="bold"
            style={{ color: colors.primaryDark }}
          >
            {name || "Nenhuma dose pendente"}
          </AppText>
          <AppText variant="subheading" style={{ color: colors.primaryDark }}>
            {dosage || "Sem dosagem informada"}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.xl,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  eyebrow: {
    letterSpacing: 0.6,
  },
  chevronPill: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  content: {
    flexDirection: "column",
    gap: spacing.xs,
  },
  time: {
    fontVariant: ["tabular-nums"],
    fontSize: 46,
    lineHeight: 54,
  },
  info: { flex: 1 },
  pressed: { opacity: 0.88 },
});
