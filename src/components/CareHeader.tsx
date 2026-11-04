import { Pressable, StyleSheet, View } from "react-native";
import { RemedinHorizontalSignature } from "./brand/RemedinBrand";
import { AppText } from "./ui/AppText";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  title: string;
  subtitle: string;
  initials?: string;
  onAvatarPress?: () => void;
};

export function CareHeader({
  title,
  subtitle,
  initials = "M",
  onAvatarPress,
}: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <RemedinHorizontalSignature
        color={colors.primary}
        fontSize={19}
        style={styles.signature}
        symbolSize={22}
      />
      <View style={styles.header}>
        <View style={styles.text}>
          <AppText accessibilityRole="header" variant="title" style={styles.title}>
            {title}
          </AppText>
          <AppText muted style={{ color: colors.textMuted }}>
            {subtitle}
          </AppText>
        </View>
        {onAvatarPress ? (
          <Pressable
            accessibilityLabel="Abrir perfil e configurações"
            accessibilityRole="button"
            onPress={onAvatarPress}
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.avatarPressed,
            ]}
          >
            <AppText weight="bold" style={styles.avatarText}>
              {initials}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.avatar}>
            <AppText weight="bold" style={styles.avatarText}>
              {initials}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: spacing.sm,
    },
    signature: {
      marginBottom: spacing.sm,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
    },
    text: {
      flex: 1,
      marginRight: spacing.md,
    },
    title: {
      color: colors.primaryDark,
      marginBottom: spacing.xs,
    },
    avatar: {
      alignItems: "center",
      backgroundColor: colors.primarySoft,
      borderColor: colors.border,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      height: 52,
      justifyContent: "center",
      width: 52,
    },
    avatarPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.97 }],
    },
    avatarText: {
      color: colors.primaryDark,
      fontSize: 18,
    },
  });
