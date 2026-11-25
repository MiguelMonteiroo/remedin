import { Pressable, StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { AppText } from "./ui/AppText";
import { useAppTheme } from "../theme/ThemeProvider";
import { type ThemeColors } from "../theme/theme";
import { radii } from "../theme/radii";
import { spacing } from "../theme/spacing";

type Props = {
  step: number;
  title: string;
  icon?: LucideIcon;
  optional?: boolean;
  expanded: boolean;
  onPress: () => void;
  children: ReactNode;
};

export function CareAccordionStepCard({
  step,
  title,
  icon: StepIcon,
  optional,
  expanded,
  onPress,
  children,
}: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const Chevron = expanded ? ChevronUp : ChevronDown;
  const badgeFg = expanded ? colors.onPrimary : colors.primaryDark;

  return (
    <View style={[styles.card, expanded && styles.expandedCard]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? "Fechar" : "Abrir"} etapa ${step}: ${title}`}
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={styles.header}
      >
        <View
          style={[
            styles.stepBadge,
            expanded ? styles.stepBadgeActive : styles.stepBadgeInactive,
            StepIcon && styles.stepBadgeWithIcon,
          ]}
        >
          {StepIcon ? (
            <StepIcon color={badgeFg} size={15} strokeWidth={2.5} />
          ) : null}
          <AppText
            variant="caption"
            weight="bold"
            style={[styles.stepText, { color: badgeFg }]}
          >
            {step}
          </AppText>
        </View>
        <AppText variant="subheading" weight="bold" style={styles.title}>
          {title}
          {optional ? (
            <AppText style={{ color: colors.textMuted }}> (opcional)</AppText>
          ) : null}
        </AppText>
        <View style={styles.chevronPill}>
          <Chevron color={colors.primaryDark} size={20} strokeWidth={2.2} />
        </View>
      </Pressable>
      {expanded ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      marginBottom: spacing.md,
      overflow: "hidden",
    },
    expandedCard: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      minHeight: 68,
      paddingHorizontal: spacing.lg,
    },
    stepBadge: {
      alignItems: "center",
      borderRadius: radii.pill,
      flexDirection: "row",
      height: 38,
      justifyContent: "center",
      marginRight: spacing.md,
      width: 38,
    },
    stepBadgeActive: {
      backgroundColor: colors.primary,
    },
    stepBadgeInactive: {
      backgroundColor: colors.primarySoft,
    },
    stepBadgeWithIcon: {
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      width: 62,
    },
    stepText: {
      fontSize: 13,
    },
    title: {
      color: colors.text,
      flex: 1,
    },
    chevronPill: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: radii.pill,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    content: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      padding: spacing.lg,
    },
  });
