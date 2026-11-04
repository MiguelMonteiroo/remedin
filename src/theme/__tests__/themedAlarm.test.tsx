import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { DoseAlarmScreen } from "../../screens/DoseAlarmScreen";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("../../database/openAppDatabase", () => ({ openAppDatabase: jest.fn() }));
jest.mock("../../services/reminders/notificationEventHandler", () => ({ executeDefaultNotificationCommand: jest.fn().mockResolvedValue(undefined) }));

it.each(["light", "dark"] as const)("renders the alarm action in %s and ends a test alarm", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const onClose = jest.fn();
  let renderer!: ReturnType<typeof TestRenderer.create>;
  const payload = { notificationId: "test", title: "Teste", body: "", data: { artifactKind: "alarmTest" } };
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><DoseAlarmScreen embedded onClose={onClose} payload={payload} /></AppThemeProvider>); });
  const button = renderer.root.findByProps({ accessibilityLabel: "Encerrar teste de alarme" });
  const style = typeof button.props.style === "function" ? button.props.style({ pressed: false }) : button.props.style;
  expect(StyleSheet.flatten(style).backgroundColor).toBe(themes[scheme].primary);
  const text = renderer.root.findAllByType(Text).find((node: { props: { children?: unknown } }) => node.props.children === "Encerrar teste");
  expect(StyleSheet.flatten(text.props.style).color).toBe(themes[scheme].onPrimary);
  await act(async () => button.props.onPress());
  expect(onClose).toHaveBeenCalled();
  await act(async () => renderer.unmount());
});

it.each(["light", "dark"] as const)("keeps hidden alarm details and disables marking as taken in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  let renderer!: ReturnType<typeof TestRenderer.create>;
  const payload = { notificationId: "private", title: "Hora do medicamento", body: "Desbloqueie o aparelho para ver os detalhes.", data: { artifactKind: "doseAlarm", showDetails: "false" } };
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><DoseAlarmScreen embedded payload={payload} /></AppThemeProvider>); });
  const text = renderer.root.findAllByType(Text).map((node: { props: { children?: unknown } }) => node.props.children);
  expect(text).toContain("Desbloqueie o aparelho e abra o Remedin para registrar a dose.");
  expect(renderer.root.findAll((node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel?.startsWith("Marcar "))).toHaveLength(0);
  await act(async () => renderer.unmount());
});
