import React, { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { RemedinCapsuleSymbol } from "../brand/RemedinBrand";
import { AppText } from "../ui/AppText";
import { motionDurations, motionEasings } from "../../theme/motion";
import { spacing } from "../../theme/spacing";
import { fontFamilies } from "../../theme/typography";
import { useReducedMotion } from "../../utils/useReducedMotion";

const CORAL_BRAND_BG = "#A44945";
const CORAL_BRAND_FG = "#FFFFFF";

export function BrandSplashScreen({
  statusText = "Preparando seu cuidado...",
}: {
  statusText?: string;
}) {
  const reduceMotion = useReducedMotion();
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0.94)).current;

  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: motionDurations.splash,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: motionDurations.splash,
        easing: motionEasings.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, reduceMotion, scaleAnim]);

  return (
    <View
      accessible
      accessibilityLabel={`remedin. ${statusText}`}
      accessibilityRole="summary"
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={CORAL_BRAND_BG} />

      <Animated.View
        style={[
          styles.centerStage,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.symbolHalo}
        >
          <RemedinCapsuleSymbol color={CORAL_BRAND_FG} size={108} />
        </View>
        <AppText allowFontScaling={false} style={styles.wordmark}>
          remedin
        </AppText>
      </Animated.View>

      <View style={styles.footer}>
        <AppText variant="small" style={styles.statusText}>
          {statusText}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CORAL_BRAND_BG,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolHalo: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  wordmark: {
    color: CORAL_BRAND_FG,
    fontFamily: fontFamilies.semibold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.6,
  },
  footer: {
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  statusText: {
    color: CORAL_BRAND_FG,
    fontFamily: fontFamilies.medium,
  },
});
