import { StyleSheet } from "react-native";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";
import { useAppTheme } from "../../theme/ThemeProvider";
import { spacing } from "../../theme/spacing";

export function Screen({ style, ...props }: SafeAreaViewProps) {
  const { colors } = useAppTheme();
  return <SafeAreaView {...props} style={[styles.screen, { backgroundColor: colors.background }, style]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
});
