import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { CareNextDoseCard } from "../../components/CareNextDoseCard";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));

it.each(["light", "dark"] as const)("displays the next dose in %s and opens its details", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const onPress = jest.fn();
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><CareNextDoseCard time="08:00" name="Dipirona" onPress={onPress} /></AppThemeProvider>); });
  const card = renderer.root.findByProps({ accessibilityLabel: "Ver detalhes da próxima dose" });
  const style = typeof card.props.style === "function" ? card.props.style({ pressed: false }) : card.props.style;
  expect(StyleSheet.flatten(style).backgroundColor).toBe(themes[scheme].primarySoft);
  const time = renderer.root.findAllByType(Text).find((node: { props: { children?: unknown } }) => node.props.children === "08:00");
  expect(StyleSheet.flatten(time.props.style).color).toBe(themes[scheme].primaryDark);
  await act(async () => card.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  await act(async () => renderer.unmount());
});
