import { Pressable, StyleSheet, View } from "react-native";
import { Pencil, Pill } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { StatusBadge } from "./ui/StatusBadge";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  name: string;
  dosage: string;
  description?: string;
  paused: boolean;
  onEdit?: () => void;
};

export function CareDetailHeroCard({
  name,
  dosage,
  description,
  paused,
  onEdit,
}: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Pill color={colors.primaryDark} size={34} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <AppText variant="heading" weight="bold" style={styles.name}>
            {name}
          </AppText>
          <StatusBadge status={paused ? "paused" : "active"} />
        </View>
        <AppText variant="small" weight="semibold" style={styles.dosage}>
          {dosage}
        </AppText>
        {onEdit ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar medicamento"
            onPress={onEdit}
            style={({ pressed }) => [
              styles.editPillButton,
              pressed && styles.pressed,
            ]}
          >
            <Pencil color={colors.primaryDark} size={15} strokeWidth={2.4} />
            <AppText variant="small" weight="bold" style={styles.editText}>
              Editar
            </AppText>
          </Pressable>
        ) : null}
        {description ? (
          <AppText muted style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      flexDirection: "row",
      marginBottom: spacing.md,
      padding: spacing.xl,
    },
    iconWrap: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      height: 76,
      justifyContent: "center",
      marginRight: spacing.lg,
      width: 76,
    },
    info: {
      flex: 1,
    },
    titleRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: spacing.sm,
    },
    name: {
      color: colors.primaryDark,
      flex: 1,
    },
    dosage: {
      color: colors.primaryDark,
      marginTop: spacing.xs,
    },
    editPillButton: {
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      flexDirection: "row",
      gap: 6,
      justifyContent: "center",
      marginTop: spacing.md,
      minHeight: 44,
      paddingHorizontal: spacing.lg,
    },
    editText: {
      color: colors.primaryDark,
    },
    pressed: {
      opacity: 0.78,
    },
    description: {
      color: colors.primaryDark,
      marginTop: spacing.md,
    },
  });
