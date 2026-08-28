import { Pressable, StyleSheet, View } from "react-native";
import { Clock3, SkipForward } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { colors } from "../theme/colors";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  time: string;
  name: string;
  dosage?: string;
  snoozeMinutes?: number;
  onTake: () => void;
  onSnooze?: () => void;
  onSkip?: () => void;
  onPress?: () => void;
};

const BENTO_COLORS = [
  colors.bentoMenta,
  colors.bentoPeach,
  colors.bentoLilac,
  colors.bentoSun,
  colors.bentoSky,
];

function getBentoColor(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BENTO_COLORS[hash % BENTO_COLORS.length];
}

export function CareDoseActionCard({
  time,
  name,
  dosage,
  snoozeMinutes = 5,
  onTake,
  onSnooze,
  onSkip,
  onPress,
}: Props) {
  const bgColor = getBentoColor(name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <AppText variant="subheading" weight="bold" style={styles.iconTime}>{time}</AppText>
      </View>
      
      <View style={styles.info}>
        <AppText variant="heading" weight="bold" style={styles.name}>{name}</AppText>
        <AppText variant="subheading" style={styles.dosage}>
          {dosage || "Dose programada"}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Marcar dose como tomada"
        onPress={onTake}
        style={({ pressed }) => [styles.takeButton, pressed && styles.pressed]}
      >
        <AppText variant="subheading" weight="bold" style={styles.takeText}>Tomar</AppText>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconBox: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  iconTime: {
    color: colors.navyDeep,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    color: colors.text,
  },
  dosage: {
    color: colors.textMuted,
  },
  takeButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  takeText: {
    color: colors.primaryDark,
  },
  pressed: {
    opacity: 0.7,
  },
});
