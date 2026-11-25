import { View, ViewProps, StyleSheet } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { radii } from "../../theme/radii";
import { spacing } from "../../theme/spacing";

export function AppCard({ style, ...props }: ViewProps) {
  const { colors } = useAppTheme();
  return <View {...props} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.xl,
  },
});
