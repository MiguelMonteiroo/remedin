import React from "react";
import { Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import App from "../../../App";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children }));
jest.mock("../../../src/screens/DoseAlarmScreen", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const { useAppTheme } = require("../../../src/theme/ThemeProvider");
  return { DoseAlarmScreen: ({ payload }: { payload: { title: string } }) => {
    const theme = useAppTheme();
    return React.createElement(Text, null, `${theme.name}:${payload.title}`);
  } };
});
jest.mock("../../../src/database/DatabaseProvider", () => ({
  DatabaseProvider: () => { throw new Error("database provider mounted during cold alarm"); },
}));
jest.mock("../../../src/navigation/AppNavigator", () => ({ AppNavigator: () => null }));
jest.mock("../../../src/services/appDataProvider", () => ({ AppDataProvider: () => null, useAppData: jest.fn() }));
jest.mock("../../../src/components/reminders/NotificationEventBridge", () => ({ NotificationEventBridge: () => null }));
jest.mock("../../../src/components/onboarding/FirstRunOnboarding", () => ({ FirstRunOnboarding: () => null }));
jest.mock("../../../src/navigation/navigationRef", () => ({ handleNavigationReady: jest.fn(), navigationRef: {}, resetToHome: jest.fn() }));

it.each(["light", "dark"] as const)("provides %s theme to a cold alarm without loading the database", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(<App initialAlarmPayload={{ notificationId: "alarm", title: "Dose", body: "", data: { artifactKind: "doseAlarm" } }} />);
  });
  expect(renderer.root.findByType(Text).props.children).toBe(`${scheme}:Dose`);
  await act(async () => renderer.unmount());
});
