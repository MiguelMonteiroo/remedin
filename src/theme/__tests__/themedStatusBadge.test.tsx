import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { StatusBadge, type BadgeStatus } from "../../components/ui/StatusBadge";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));

it.each(["light", "dark"] as const)("uses the theme's readable status colors in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const c = themes[scheme];
  const cases: Array<[BadgeStatus, string, string]> = [
    ["pending", c.warningSoft, c.warning], ["taken", c.successSoft, c.success],
    ["skipped", c.dangerSoft, c.danger], ["snoozed", c.infoSoft, c.info],
    ["unrecorded", c.dangerSoft, c.danger], ["active", c.successSoft, c.success],
    ["paused", c.warningSoft, c.warning], ["undone", c.surfaceMuted, c.textMuted],
  ];
  for (const [status, background, foreground] of cases) {
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><StatusBadge status={status} /></AppThemeProvider>); });
    const badge = renderer.root.find((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel?.startsWith("Status: "));
    expect(StyleSheet.flatten(badge.props.style).backgroundColor).toBe(background);
    expect(StyleSheet.flatten(renderer.root.findByType(Text).props.style).color).toBe(foreground);
    await act(async () => renderer.unmount());
  }
});
