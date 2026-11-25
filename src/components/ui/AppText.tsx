import { Text, TextProps } from "react-native";
import { useAppTheme } from "../../theme/ThemeProvider";
import { fontFamilies, typography } from "../../theme/typography";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "small"
  | "caption";

type Weight = keyof typeof fontFamilies;

type Props = TextProps & {
  variant?: Variant;
  weight?: Weight;
  muted?: boolean;
};

export function AppText({
  variant = "body",
  weight,
  muted = false,
  style,
  maxFontSizeMultiplier = 1.5,
  ...props
}: Props) {
  const { colors } = useAppTheme();
  const resolvedWeight = weight ?? DEFAULT_WEIGHTS[variant];

  return (
    <Text
      {...props}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        { color: muted ? colors.textMuted : colors.text },
        typography[variant],
        { fontFamily: fontFamilies[resolvedWeight] },
        style,
      ]}
    />
  );
}

const DEFAULT_WEIGHTS: Record<Variant, Weight> = {
  display: "bold",
  title: "bold",
  heading: "bold",
  subheading: "semibold",
  body: "regular",
  small: "regular",
  caption: "medium",
};
