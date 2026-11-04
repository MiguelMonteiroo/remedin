import { Pressable, PressableProps, StyleSheet, View, ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../../theme/ThemeProvider";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "dangerSoft"
  | "ghost";

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  size?: "default" | "compact";
  /** @deprecated Use size="compact". */
  compact?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
};

export function AppButton({
  title,
  variant = "primary",
  size = "default",
  compact = false,
  icon: Icon,
  style,
  disabled,
  ...props
}: Props) {
  const { colors: themeColors } = useAppTheme();
  const isCompact = compact || size === "compact";
  const palette = {
    primary: { backgroundColor: themeColors.primary, color: themeColors.onPrimary },
    secondary: { backgroundColor: themeColors.primarySoft, color: themeColors.primaryDark },
    success: { backgroundColor: themeColors.successSoft, color: themeColors.success },
    warning: { backgroundColor: themeColors.warningSoft, color: themeColors.warning },
    danger: { backgroundColor: themeColors.dangerSoft, color: themeColors.danger },
    dangerSoft: { backgroundColor: themeColors.dangerSoft, color: themeColors.danger },
    ghost: { backgroundColor: themeColors.surface, color: themeColors.primaryDark },
  }[variant];

  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? "button"}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: Boolean(disabled),
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isCompact && styles.compact,
        { backgroundColor: palette.backgroundColor },
        variant === "ghost" && { borderColor: themeColors.controlBorder, borderWidth: 1.5 },
        variant === "dangerSoft" && { borderColor: themeColors.dangerBorder, borderWidth: 1.5 },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon ? <Icon color={palette.color} size={18} strokeWidth={2.4} /> : null}
        <AppText
          variant="small"
          weight="bold"
          style={[
            styles.text,
            { color: palette.color },
          ]}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  compact: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minWidth: 0,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    flexShrink: 1,
    textAlign: "center",
  },
});
