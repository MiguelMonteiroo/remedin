import React from "react";
import { StyleSheet, Text, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { CareDoseActionCard } from "../../components/CareDoseActionCard";
import { CareHeader } from "../../components/CareHeader";
import { ProfileAvatarImage } from "../../components/ProfileAvatarPicker";
import { DailyProgressSummary } from "../../components/DailyProgressSummary";
import { AppThemeProvider } from "../ThemeProvider";
import { themes } from "../theme";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({ __esModule: true, default: jest.fn() }));

it.each(["light", "dark"] as const)("renders the pending dose in %s and keeps Take, Snooze, and Skip actions", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  const onTake = jest.fn();
  const onSnooze = jest.fn();
  const onSkip = jest.fn();
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(
      <AppThemeProvider>
        <CareDoseActionCard
          name="Dipirona"
          time="08:00"
          snoozeMinutes={5}
          onTake={onTake}
          onSnooze={onSnooze}
          onSkip={onSkip}
        />
      </AppThemeProvider>
    );
  });
  const card = renderer.root.findByProps({ accessibilityLabel: "Ver detalhes de Dipirona" });
  const style = typeof card.props.style === "function" ? card.props.style({ pressed: false }) : card.props.style;
  expect(StyleSheet.flatten(style).backgroundColor).toBe(themes[scheme].surface);
  const name = renderer.root.findAllByType(Text).find((node: { props: { children?: unknown } }) => node.props.children === "Dipirona");
  expect(StyleSheet.flatten(name.props.style).color).toBe(themes[scheme].text);

  const stopPropagation = jest.fn();
  await act(async () => renderer.root.findByProps({ accessibilityLabel: "Marcar dose como tomada" }).props.onPress({ stopPropagation }));
  expect(onTake).toHaveBeenCalledTimes(1);

  await act(async () => renderer.root.findByProps({ accessibilityLabel: "Adiar dose de Dipirona por 5 minutos" }).props.onPress({ stopPropagation }));
  expect(onSnooze).toHaveBeenCalledTimes(1);

  await act(async () => renderer.root.findByProps({ accessibilityLabel: "Pular dose de Dipirona" }).props.onPress({ stopPropagation }));
  expect(onSkip).toHaveBeenCalledTimes(1);
  expect(stopPropagation).toHaveBeenCalledTimes(3);

  await act(async () => renderer.unmount());
});

it.each(["light", "dark"] as const)("renders the daily progress on the themed surface in %s", async (scheme) => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => { renderer = TestRenderer.create(<AppThemeProvider><DailyProgressSummary taken={1} total={2} label="1 de 2" supportLabel="Progresso diário" /></AppThemeProvider>); });
  const card = renderer.root.findByProps({ accessibilityLabel: "1 de 2. Progresso diário" });
  expect(StyleSheet.flatten(card.props.style).backgroundColor).toBe(themes[scheme].surface);
  await act(async () => renderer.unmount());
});

it("renders CareHeader with horizontal signature and clickable profile avatar", async () => {
  (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
  const onAvatarPress = jest.fn();
  let renderer!: ReturnType<typeof TestRenderer.create>;
  await act(async () => {
    renderer = TestRenderer.create(
      <AppThemeProvider>
        <CareHeader
          avatar="capybara"
          title="Bom dia, Helena"
          subtitle="Seu cuidado de hoje"
          initials="H"
          onAvatarPress={onAvatarPress}
        />
      </AppThemeProvider>
    );
  });

  const avatarBtn = renderer.root.findByProps({
    accessibilityRole: "button",
    accessibilityLabel: "Abrir perfil e configurações",
  });
  expect(avatarBtn.findByType(ProfileAvatarImage).props.avatar).toBe("capybara");
  await act(async () => avatarBtn.props.onPress());
  expect(onAvatarPress).toHaveBeenCalledTimes(1);
  await act(async () => renderer.unmount());
});
