import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
import { Bell } from "lucide-react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { SettingsRow } from "../../components/SettingsRow";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));

it.each(["light", "dark"] as const)("renders reminder settings with legible text in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><SettingsRow icon={Bell} title="Notificações" description="Avisar" state="Ativado" stateTone="positive" /></AppThemeProvider>); });
  const label = renderer.root.findAllByType(Text).find((node: { props: { children?: unknown } }) => node.props.children === "Notificações");
  expect(StyleSheet.flatten(label.props.style).color).toBe(themes[scheme].text);
  await act(async () => renderer.unmount());
});
