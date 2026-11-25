import React from "react";
import { TextInput, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { BrandSplashScreen } from "../../components/onboarding/BrandSplashScreen";
import { FirstRunOnboarding } from "../../components/onboarding/FirstRunOnboarding";
import { AppThemeProvider } from "../ThemeProvider";

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => {
  const mockReact = require("react");
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      mockReact.createElement("View", { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

const mockUpdateProfile = jest.fn().mockResolvedValue(undefined);
let mockUserName = "Helena Costa";
const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);
const mockUpdateNotificationsEnabled = jest.fn().mockResolvedValue(undefined);
const mockUpdateReminderSettings = jest.fn().mockResolvedValue(undefined);

jest.mock("../../services/notificationPermissionService", () => ({
  ensureAlarmChannels: jest.fn().mockResolvedValue(undefined),
  getReminderPermissionState: jest.fn().mockResolvedValue({
    notifications: "granted",
    exactAlarms: "granted",
    fullScreen: "granted",
    doNotDisturb: "granted",
    criticalAlarmChannel: "bypasses",
    batteryOptimization: "unrestricted",
  }),
  openBatterySettings: jest.fn().mockResolvedValue(undefined),
  openCriticalAlarmChannelSettings: jest.fn().mockResolvedValue(undefined),
  openDoNotDisturbSettings: jest.fn().mockResolvedValue(undefined),
  openExactAlarmSettings: jest.fn().mockResolvedValue(undefined),
  openFullScreenAlarmSettings: jest.fn().mockResolvedValue(undefined),
  openNotificationSettings: jest.fn().mockResolvedValue(undefined),
  requestNotificationPermission: jest.fn().mockResolvedValue({ granted: true }),
}));

jest.mock("../../services/appDataProvider", () => ({
  useAppData: () => ({
    settings: {
      notificationsEnabled: false,
      defaultSnoozeMinutes: 5,
      userName: mockUserName,
      fullScreenAlarmEnabled: false,
      criticalAlertsEnabled: false,
      showLockScreenDetails: false,
      reminderSetupCompleted: false,
      onboardingCompleted: false,
    },
    updateProfile: mockUpdateProfile,
    completeOnboarding: mockCompleteOnboarding,
    updateNotificationsEnabled: mockUpdateNotificationsEnabled,
    updateReminderSettings: mockUpdateReminderSettings,
  }),
}));

describe("Brand splash and local onboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserName = "Helena Costa";
  });

  it("renders BrandSplashScreen with Coral identity and status copy", async () => {
    (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <BrandSplashScreen />
        </AppThemeProvider>
      );
    });

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("remedin");
    expect(json).toContain("Preparando seu cuidado...");
    expect(json).toContain("#A44945");
    await act(async () => renderer.unmount());
  });

  it("opens local profile setup from welcome and saves the selected avatar", async () => {
    mockUserName = "";
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <FirstRunOnboarding />
        </AppThemeProvider>
      );
    });

    expect(JSON.stringify(renderer.toJSON())).toContain("Seus dados ficam neste aparelho.");
    const start = renderer.root.findByProps({ accessibilityRole: "button", accessibilityLabel: "Começar" });
    await act(async () => { (start.props.onClick ?? start.props.onPress)(); });

    const name = renderer.root.findByType(TextInput);
    const avatar = renderer.root.findByProps({ accessibilityRole: "radio", accessibilityLabel: "Capivara" });
    await act(async () => {
      name.props.onChangeText("Helena Costa");
      (avatar.props.onClick ?? avatar.props.onPress)();
    });
    const next = renderer.root.findByProps({ accessibilityRole: "button", accessibilityLabel: "Continuar" });
    await act(async () => { await (next.props.onClick ?? next.props.onPress)(); });

    expect(mockUpdateProfile).toHaveBeenCalledWith("Helena Costa", "capybara");
    expect(JSON.stringify(renderer.toJSON())).toContain("Olá, Helena");
    await act(async () => renderer.unmount());
  });

  it("starts FirstRunOnboarding at Screen 04 (guide) with Coral header and Bento cards", async () => {
    (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <FirstRunOnboarding />
        </AppThemeProvider>
      );
    });

    const json = JSON.stringify(renderer.toJSON());
    expect(json).toContain("Seu cuidado em um só lugar");
    expect(json).toContain("Olá, Helena");
    expect(json).toContain("Configurar meus lembretes");
    expect(json).not.toContain("Como podemos chamar você?");
    await act(async () => renderer.unmount());
  });

  it("walks through the 3 essential permission steps to the ready completion screen", async () => {
    (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <FirstRunOnboarding />
        </AppThemeProvider>
      );
    });

    // Step 04 -> Step 05 (1/3: notifications)
    const startPermsBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Configurar meus lembretes",
    });
    await act(async () => {
      await (startPermsBtn.props.onClick?.() ?? startPermsBtn.props.onPress?.());
    });

    expect(JSON.stringify(renderer.toJSON())).toContain("Passo 1 de 3");
    expect(JSON.stringify(renderer.toJSON())).toContain("Receba seus lembretes");

    // Step 1/3 -> Step 2/3 (exact)
    const allowNotifBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Permitir notificações",
    });
    await act(async () => {
      await (allowNotifBtn.props.onClick?.() ?? allowNotifBtn.props.onPress?.());
    });

    expect(mockUpdateNotificationsEnabled).toHaveBeenCalledWith(true);
    expect(mockUpdateReminderSettings).toHaveBeenCalledWith({
      showLockScreenDetails: true,
    });
    expect(JSON.stringify(renderer.toJSON())).toContain("Passo 2 de 3");
    expect(JSON.stringify(renderer.toJSON())).toContain("Avise no horário certo");

    // Step 2/3 -> Step 3/3 (fullScreen)
    const allowExactBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Permitir horário exato",
    });
    await act(async () => {
      await (allowExactBtn.props.onClick?.() ?? allowExactBtn.props.onPress?.());
    });

    expect(JSON.stringify(renderer.toJSON())).toContain("Passo 3 de 3");
    expect(JSON.stringify(renderer.toJSON())).toContain("Alarme em tela cheia");

    // Step 3/3 -> Ready summary screen
    const allowFullBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Permitir tela cheia",
    });
    await act(async () => {
      await (allowFullBtn.props.onClick?.() ?? allowFullBtn.props.onPress?.());
    });

    const readyJson = JSON.stringify(renderer.toJSON());
    expect(readyJson).toContain("Seus lembretes estão prontos!");
    expect(readyJson).toContain("Tocar no Não Perturbe");
    expect(readyJson).toContain("Bateria sem restrições");

    // Finish onboarding
    const finishBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Ir para o aplicativo",
    });
    await act(async () => {
      await (finishBtn.props.onClick?.() ?? finishBtn.props.onPress?.());
    });

    expect(mockCompleteOnboarding).toHaveBeenCalledWith("Helena Costa");
    await act(async () => renderer.unmount());
  });

  it("exits directly to Home when the user skips notifications and confirms 'Continuar sem lembretes'", async () => {
    (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <FirstRunOnboarding />
        </AppThemeProvider>
      );
    });

    const skipGuideBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Pular configuração de lembretes por enquanto",
    });
    await act(async () => {
      await (skipGuideBtn.props.onClick?.() ?? skipGuideBtn.props.onPress?.());
    });

    const confirmSkipBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Continuar sem lembretes",
    });
    await act(async () => {
      await (confirmSkipBtn.props.onClick?.() ?? confirmSkipBtn.props.onPress?.());
    });

    expect(mockUpdateNotificationsEnabled).toHaveBeenCalledWith(false);
    expect(mockCompleteOnboarding).toHaveBeenCalledWith("Helena Costa");
    await act(async () => renderer.unmount());
  });
});
