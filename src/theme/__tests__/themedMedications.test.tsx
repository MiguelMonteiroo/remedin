import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { MedicationsScreen } from "../../screens/MedicationsScreen";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: require("react-native").View }));
jest.mock("../../services/appDataProvider", () => ({ useAppData: () => ({ medications: [{ id: "one", name: "Dipirona", dosage: "500 mg", isPaused: false }], schedules: [] }) }));

it.each(["light", "dark"] as const)("renders medication names in %s and opens the selected item", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const navigate = jest.fn();
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><MedicationsScreen navigation={{ navigate } as never} route={{} as never} /></AppThemeProvider>); });
  const name = renderer.root.findAllByType(Text).find((node: { props: { children?: unknown } }) => node.props.children === "Dipirona (500 mg)");
  expect(StyleSheet.flatten(name.props.style).color).toBe(themes[scheme].text);
  await act(async () => renderer.root.findByProps({ accessibilityLabel: "Abrir Dipirona (500 mg)" }).props.onPress());
  expect(navigate).toHaveBeenCalledWith("MedicationDetail", { medicationId: "one" });
  await act(async () => renderer.unmount());
});
