import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FloatingTabBar } from "../../navigation/AppNavigator";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }) }));
jest.mock("../../screens/HomeScreen", () => ({ HomeScreen: () => null }));
jest.mock("../../screens/AddMedicationScreen", () => ({ AddMedicationScreen: () => null }));
jest.mock("../../screens/EditMedicationScreen", () => ({ EditMedicationScreen: () => null }));
jest.mock("../../screens/MedicationDetailScreen", () => ({ MedicationDetailScreen: () => null }));
jest.mock("../../screens/HistoryScreen", () => ({ HistoryScreen: () => null }));
jest.mock("../../screens/MedicationsScreen", () => ({ MedicationsScreen: () => null }));
jest.mock("../../screens/SettingsScreen", () => ({ SettingsScreen: () => null }));
jest.mock("../../screens/OnboardingScreen", () => ({ OnboardingScreen: () => null }));

it.each(["light", "dark"] as const)("highlights the selected tab in %s and preserves navigation", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const props = { state: { index: 0, routes: [{ key: "home", name: "Home" }, { key: "meds", name: "Medications" }] }, navigation: { navigate, emit } } as unknown as BottomTabBarProps;
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><FloatingTabBar {...props} /></AppThemeProvider>); });
  const active = renderer.root.findByProps({ accessibilityLabel: "Hoje", accessibilityRole: "tab" });
  const style = typeof active.props.style === "function" ? active.props.style({ pressed: false }) : active.props.style;
  expect(StyleSheet.flatten(style).backgroundColor).toBe(themes[scheme].primarySoft);
  expect(active.props.accessibilityState.selected).toBe(true);
  const medications = renderer.root.findByProps({ accessibilityLabel: "Medicamentos", accessibilityRole: "tab" });
  await act(async () => medications.props.onPress());
  expect(navigate).toHaveBeenCalledWith("Medications", undefined);
  await act(async () => renderer.unmount());
});
