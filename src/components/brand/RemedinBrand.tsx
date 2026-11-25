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
