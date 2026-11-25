import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { AppButton } from "../../components/ui/AppButton";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));

it.each(["light", "dark"] as const)("renders a readable primary action in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><AppButton title="Salvar" /></AppThemeProvider>); });
  const button = renderer.root.findByProps({ accessibilityRole: "button" });
  const buttonStyle = typeof button.props.style === "function" ? button.props.style({ pressed: false }) : button.props.style;
  expect(StyleSheet.flatten(buttonStyle).backgroundColor).toBe(themes[scheme].primary);
  expect(StyleSheet.flatten(renderer.root.findByType(Text).props.style).color).toBe(themes[scheme].onPrimary);
  await act(async () => renderer.unmount());
});

it.each(["light", "dark"] as const)("uses readable semantic colors for secondary and status actions in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const c = themes[scheme];
  for (const [variant, background, foreground] of [
    ["secondary", c.primarySoft, c.primaryDark],
    ["success", c.successSoft, c.success],
    ["warning", c.warningSoft, c.warning],
    ["danger", c.dangerSoft, c.danger],
    ["dangerSoft", c.dangerSoft, c.danger],
    ["ghost", c.surface, c.primaryDark],
  ] as const) {
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><AppButton title="Ação" variant={variant} /></AppThemeProvider>); });
    const button = renderer.root.findByProps({ accessibilityRole: "button" });
    const buttonStyle = typeof button.props.style === "function" ? button.props.style({ pressed: false }) : button.props.style;
    expect(StyleSheet.flatten(buttonStyle).backgroundColor).toBe(background);
    expect(StyleSheet.flatten(renderer.root.findByType(Text).props.style).color).toBe(foreground);
    await act(async () => renderer.unmount());
  }
});
