import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { spacing } from "../../theme/spacing";
import { useAppTheme } from "../../theme/ThemeProvider";

type Props = {
  title: string;
  meta?: string;
};

export function SectionHeader({ title, meta }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <AppText variant="subheading" weight="semibold" style={{ color: colors.primaryDark }}>
        {title}
      </AppText>
      {meta ? (
        <AppText variant="caption" muted style={{ color: colors.textMuted }}>
          {meta}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});
