import { Pressable, PressableProps, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { type ThemeColors } from "../../theme/theme";
import { radii } from "../../theme/radii";

type Props = PressableProps & {
  icon: LucideIcon;
  label: string;
};

export function IconButton({ icon: Icon, label, ...props }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      accessibilityRole={props.accessibilityRole ?? "button"}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Icon color={colors.text} size={22} strokeWidth={2} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  pressed: {
    opacity: 0.75,
  },
});
