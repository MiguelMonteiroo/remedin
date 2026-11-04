import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { AppText } from "../ui/AppText";
import { fontFamilies } from "../../theme/typography";

const CAPSULE_PATH =
  "M72 104V76a56 56 0 0 1 112 0v28c-31 17-81 17-112 0Zm0 20c31 17 81 17 112 0v56a56 56 0 0 1-112 0v-56Z";

export function RemedinCapsuleSymbol({
  color = "#FFFFFF",
  size = 64,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 256 256">
        <G fill={color} transform="rotate(45 128 128)">
          <Path d={CAPSULE_PATH} />
        </G>
      </Svg>
    </View>
  );
}

export function RemedinHorizontalSignature({
  color = "#A44945",
  symbolSize = 36,
  fontSize = 26,
  style,
}: {
  color?: string;
  symbolSize?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityLabel="remedin"
      accessibilityRole="header"
      style={[styles.signatureRow, style]}
    >
      <RemedinCapsuleSymbol color={color} size={symbolSize} />
      <AppText
        allowFontScaling={false}
        style={[
          styles.wordmark,
          {
            color,
            fontSize,
            lineHeight: Math.round(fontSize * 1.2),
          },
        ]}
      >
        remedin
      </AppText>
    </View>
  );
}

export function GoogleLogoIcon({ size = 22 }: { size?: number }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v2.98h3.86c2.26-2.09 3.56-5.17 3.56-8.8Z"
        />
        <Path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-2.98c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
        />
        <Path
          fill="#FBBC05"
          d="M5.27 14.31A7.28 7.28 0 0 1 4.9 12c0-.81.14-1.59.37-2.31V6.6H1.29A11.99 11.99 0 0 0 0 12c0 1.93.46 3.77 1.29 5.4l3.98-3.09Z"
        />
        <Path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.6l3.98 3.09c.95-2.85 3.6-4.94 6.73-4.94Z"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  signatureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  wordmark: {
    fontFamily: fontFamilies.semibold,
    letterSpacing: -0.5,
  },
});
