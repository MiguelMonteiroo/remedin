import React from "react";
import { Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { AppThemeProvider, useAppTheme } from "../ThemeProvider";
import { resolveThemeName, themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
const mockScheme = useColorScheme as jest.MockedFunction<typeof useColorScheme>;

function Probe() {
  const { name, colors } = useAppTheme();
  return <Text>{`${name}:${colors.background}`}</Text>;
}

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
    const linear = rgb.map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const [x, y] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (x + 0.05) / (y + 0.05);
}

describe("application theme", () => {
  it("follows the system and defaults missing preferences to light", () => {
    expect(resolveThemeName("light")).toBe("light");
    expect(resolveThemeName("dark")).toBe("dark");
    expect(resolveThemeName(null)).toBe("light");
    expect(resolveThemeName(undefined)).toBe("light");
    expect(resolveThemeName("unspecified")).toBe("light");
  });

  it("updates mounted consumers when the system appearance changes", async () => {
    mockScheme.mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><Probe /></AppThemeProvider>); });
    expect(renderer.root.findByType(Text).props.children).toBe("light:#FAF7F6");
    mockScheme.mockReturnValue("dark");
    await act(async () => { renderer.update(<AppThemeProvider><Probe /></AppThemeProvider>); });
    expect(renderer.root.findByType(Text).props.children).toBe("dark:#291C1C");
    await act(async () => renderer.unmount());
  });

  it.each(["light", "dark"] as const)("keeps essential text and states readable in %s", (name) => {
    const c = themes[name];
    for (const [foreground, background] of [
      [c.text, c.background], [c.text, c.surface], [c.textMuted, c.background],
      [c.onPrimary, c.primary], [c.success, c.successSoft],
      [c.primaryDark, c.primarySoft], [c.primaryDark, c.surface],
      [c.text, c.primarySoft], [c.text, c.surfaceMuted], [c.textMuted, c.surfaceMuted],
      [c.warning, c.warningSoft], [c.danger, c.dangerSoft],
      [c.info, c.infoSoft],
    ]) expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c.controlBorder, c.surface)).toBeGreaterThanOrEqual(3);
  });
});
