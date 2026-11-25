import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { RemedinCapsuleSymbol } from "../brand/RemedinBrand";
import { AppText } from "../ui/AppText";
import { motionEasings } from "../../theme/motion";
import { spacing } from "../../theme/spacing";
import { fontFamilies } from "../../theme/typography";
import { useReducedMotion } from "../../utils/useReducedMotion";

const CORAL_BRAND_BG = "#A44945";
const CORAL_BRAND_FG = "#FFFFFF";

export function BrandSplashScreen({
  firstLaunch = false,
  onIntroComplete,
}: {
  firstLaunch?: boolean;
  onIntroComplete?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(firstLaunch ? 0 : 1)).current;
  const animate = firstLaunch && !reduceMotion;

  useEffect(() => {
    if (!firstLaunch) return;
    if (reduceMotion) {
      const timer = setTimeout(() => onIntroComplete?.(), 450);
      return () => clearTimeout(timer);
    }

    progress.setValue(0);
    const intro = Animated.timing(progress, {
      toValue: 1,
      duration: 1250,
      easing: motionEasings.standard,
      useNativeDriver: true,
    });
    intro.start(({ finished }) => {
      if (finished) onIntroComplete?.();
    });
    return () => intro.stop();
  }, [firstLaunch, onIntroComplete, progress, reduceMotion]);

  return (
    <View
      accessible
      accessibilityLabel="remedin. Preparando seu cuidado..."
      accessibilityRole="summary"
      style={styles.screen}
    >
      <StatusBar barStyle="light-content" backgroundColor={CORAL_BRAND_BG} />
      <View style={styles.symbolHalo}>
        {animate ? (
          <Animated.View
            style={[
              styles.introRing,
              {
                opacity: progress.interpolate({
                  inputRange: [0, 0.42, 0.9],
                  outputRange: [0, 0.55, 0],
                  extrapolate: "clamp",
                }),
                transform: [{ scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.66, 1.34],
                }) }],
              },
            ]}
          />
        ) : null}
        <Animated.View
          style={animate ? {
            opacity: progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
            transform: [
              { scale: progress.interpolate({ inputRange: [0, 0.52, 1], outputRange: [0.68, 1.06, 1] }) },
              { rotate: progress.interpolate({ inputRange: [0, 0.68, 1], outputRange: ["-28deg", "0deg", "0deg"] }) },
            ],
          } : undefined}
        >
          <RemedinCapsuleSymbol color={CORAL_BRAND_FG} size={108} />
        </Animated.View>
      </View>
      <Animated.View style={animate ? {
        opacity: progress.interpolate({
          inputRange: [0, 0.36, 0.78, 1],
          outputRange: [0, 0, 1, 1],
        }),
      } : undefined}>
        <AppText allowFontScaling={false} style={styles.wordmark}>remedin</AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CORAL_BRAND_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolHalo: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  introRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: 78,
    borderWidth: 1,
    borderColor: CORAL_BRAND_FG,
  },
  wordmark: {
    color: CORAL_BRAND_FG,
    fontFamily: fontFamilies.semibold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -1,
  },
});
