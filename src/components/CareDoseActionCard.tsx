import { ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Check, Clock3, SkipForward } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";
import { isLargeText } from "../utils/accessibilityLayout";

type Props = {
  time: string;
  name: string;
  dosage?: string;
  snoozeMinutes?: number;
  onTake: () => void;
  onSnooze?: () => void;
  onSkip?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  busy?: boolean;
};

export function CareDoseActionCard({
  time,
  name,
  dosage,
  snoozeMinutes = 5,
  onTake,
  onSnooze,
  onSkip,
  onPress,
  disabled = false,
  busy = false,
}: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const { width, fontScale } = useWindowDimensions();
  const expandedLayout = width < 360 || isLargeText(fontScale);
  const hasSecondaryActions = Boolean(onSnooze || onSkip);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.mainRow, expandedLayout && { flexWrap: "wrap" }]}>
        <View style={[styles.iconBox, expandedLayout && { minWidth: 84 }]}>
          <AppText
            ellipsizeMode="clip"
            numberOfLines={1}
            variant="subheading"
            weight="bold"
            style={styles.iconTime}
          >
            {time}
          </AppText>
        </View>

        <View style={styles.info}>
          <AppText variant="heading" weight="bold" style={styles.name}>
            {name}
          </AppText>
          <AppText variant="subheading" style={styles.dosage}>
            {dosage || "Dose programada"}
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Marcar dose como tomada"
          accessibilityState={{ disabled, busy }}
          disabled={disabled}
          onPress={(event) => { event.stopPropagation(); onTake(); }}
          style={({ pressed }) => [styles.takeButton, expandedLayout && { width: "100%" }, disabled && { opacity: 0.6 }, pressed && styles.pressed]}
        >
          {busy ? <ActivityIndicator color={colors.onPrimary} size="small" /> : <Check color={colors.onPrimary} size={18} strokeWidth={2.6} />}
          <AppText variant="small" weight="bold" style={styles.takeText}>
            Tomar
          </AppText>
        </Pressable>
      </View>

      {hasSecondaryActions ? (
        <View style={styles.secondaryRow}>
          {onSnooze ? (
            <Pressable
              accessibilityLabel={`Adiar dose de ${name} por ${snoozeMinutes} minutos`}
              accessibilityRole="button"
              accessibilityState={{ disabled, busy }}
              disabled={disabled}
              onPress={(event) => { event.stopPropagation(); onSnooze(); }}
              style={({ pressed }) => [
                styles.secondaryPill,
                pressed && styles.pressed,
              ]}
            >
              <Clock3 color={colors.primaryDark} size={16} strokeWidth={2.2} />
              <AppText variant="caption" weight="bold" style={styles.secondaryPillText}>
                Adiar {snoozeMinutes} min
              </AppText>
            </Pressable>
          ) : null}

          {onSkip ? (
            <Pressable
              accessibilityLabel={`Pular dose de ${name}`}
              accessibilityRole="button"
              accessibilityState={{ disabled, busy }}
              disabled={disabled}
              onPress={(event) => { event.stopPropagation(); onSkip(); }}
              style={({ pressed }) => [
                styles.secondaryPill,
                pressed && styles.pressed,
              ]}
            >
              <SkipForward color={colors.textMuted} size={16} strokeWidth={2.2} />
              <AppText variant="caption" weight="bold" style={styles.skipPillText}>
                Pular
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      padding: spacing.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
    },
    mainRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.md,
    },
    iconBox: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: radii.md,
      borderWidth: 1,
      height: 58,
      justifyContent: "center",
      minWidth: 64,
      paddingHorizontal: spacing.xs,
    },
    iconTime: {
      color: colors.primaryDark,
      fontVariant: ["tabular-nums"],
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
      marginTop: 2,
    },
    takeButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: radii.pill,
      flexDirection: "row",
      gap: 6,
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    takeText: {
      color: colors.onPrimary,
    },
    secondaryRow: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.md,
    },
    secondaryPill: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1,
      flex: 1,
      flexDirection: "row",
      gap: 6,
      justifyContent: "center",
      minHeight: 48,
      paddingHorizontal: spacing.md,
    },
    secondaryPillText: {
      color: colors.primaryDark,
    },
    skipPillText: {
      color: colors.textMuted,
    },
    pressed: {
      opacity: 0.8,
    },
  });
