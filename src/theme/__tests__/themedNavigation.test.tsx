import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BottomNavigationBar } from "../../navigation/AppNavigator";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 20, top: 0, left: 0, right: 0 }) }));
jest.mock("../../screens/HomeScreen", () => ({ HomeScreen: () => null }));
jest.mock("../../screens/AddMedicationScreen", () => ({ AddMedicationScreen: () => null }));
jest.mock("../../screens/EditMedicationScreen", () => ({ EditMedicationScreen: () => null }));
jest.mock("../../screens/MedicationDetailScreen", () => ({ MedicationDetailScreen: () => null }));
jest.mock("../../screens/HistoryScreen", () => ({ HistoryScreen: () => null }));
jest.mock("../../screens/MedicationsScreen", () => ({ MedicationsScreen: () => null }));
jest.mock("../../screens/SettingsScreen", () => ({ SettingsScreen: () => null }));

it.each(["light", "dark"] as const)("highlights the selected tab in %s and preserves navigation", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const navigate = jest.fn();
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const props = { state: { index: 0, routes: [{ key: "home", name: "Home" }, { key: "meds", name: "Medications" }] }, navigation: { navigate, emit } } as unknown as BottomTabBarProps;
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><BottomNavigationBar {...props} /></AppThemeProvider>); });
  const barStyle = StyleSheet.flatten(renderer.toJSON().props.style);
  expect(barStyle).toMatchObject({ backgroundColor: themes[scheme].surface, paddingBottom: 20 });
  expect(barStyle.position).toBeUndefined();
  const active = renderer.root.findByProps({ accessibilityLabel: "Hoje", accessibilityRole: "tab" });
  expect(StyleSheet.flatten(active.props.children[0].props.style).backgroundColor).toBe(themes[scheme].primary);
  expect(active.props.accessibilityState.selected).toBe(true);
  const medications = renderer.root.findByProps({ accessibilityLabel: "Medicamentos", accessibilityRole: "tab" });
  expect(medications.props.children[0]).toBeNull();
  await act(async () => medications.props.onPress());
  expect(navigate).toHaveBeenCalledWith("Medications", undefined);
  await act(async () => renderer.unmount());
});
