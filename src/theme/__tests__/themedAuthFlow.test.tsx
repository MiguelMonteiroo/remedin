import React from "react";
import { TextInput, useColorScheme } from "react-native";
// @ts-expect-error react-test-renderer does not ship declarations in this project.
import TestRenderer, { act } from "react-test-renderer";
import { BrandSplashScreen } from "../../components/onboarding/BrandSplashScreen";
import { AuthFlowScreen } from "../../components/onboarding/AuthFlowScreen";
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

const mockSignUpWithEmail = jest.fn().mockResolvedValue(undefined);
const mockSignInWithEmail = jest.fn().mockResolvedValue(undefined);
const mockSignInWithGoogle = jest.fn().mockResolvedValue(undefined);
const mockResetAccountPassword = jest.fn().mockResolvedValue(undefined);
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
    savedAccounts: [],
    userAccount: {
      authenticated: true,
      name: "Helena Costa",
      email: "helena@email.com",
      provider: "email",
    },
    settings: {
      notificationsEnabled: false,
      defaultSnoozeMinutes: 5,
      userName: "Helena Costa",
      fullScreenAlarmEnabled: false,
      criticalAlertsEnabled: false,
      showLockScreenDetails: false,
      reminderSetupCompleted: false,
      onboardingCompleted: false,
    },
    signUpWithEmail: mockSignUpWithEmail,
    signInWithEmail: mockSignInWithEmail,
    signInWithGoogle: mockSignInWithGoogle,
    resetAccountPassword: mockResetAccountPassword,
    completeOnboarding: mockCompleteOnboarding,
    updateNotificationsEnabled: mockUpdateNotificationsEnabled,
    updateReminderSettings: mockUpdateReminderSettings,
  }),
}));

describe("Phase 1 & Phase 2: Splash, Auth Flow, and Streamlined Onboarding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it.each(["light", "dark"] as const)(
    "renders AuthFlowScreen welcome stage with 3 pill actions in %s theme",
    async (scheme) => {
      (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue(scheme);
      let renderer!: ReturnType<typeof TestRenderer.create>;
      await act(async () => {
        renderer = TestRenderer.create(
          <AppThemeProvider>
            <AuthFlowScreen />
          </AppThemeProvider>
        );
      });

      const buttons = renderer.root.findAllByProps({ accessibilityRole: "button" });
      const labels = buttons.map(
        (node: { props: { accessibilityLabel?: string } }) => node.props.accessibilityLabel
      );
      expect(labels).toContain("Continuar com o Google");
      expect(labels).toContain("Criar uma conta");
      expect(labels).toContain("Entrar com minha conta");
      await act(async () => renderer.unmount());
    }
  );

  it("navigates to Criar Conta (03A) and submits name, email, and password", async () => {
    (useColorScheme as jest.MockedFunction<typeof useColorScheme>).mockReturnValue("light");
    let renderer!: ReturnType<typeof TestRenderer.create>;
    await act(async () => {
      renderer = TestRenderer.create(
        <AppThemeProvider>
          <AuthFlowScreen />
        </AppThemeProvider>
      );
    });

    const createAccountBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Criar uma conta",
    });

    await act(async () => {
      createAccountBtn.props.onClick?.() ?? createAccountBtn.props.onPress?.();
    });

    const inputs = renderer.root.findAllByType(TextInput);
    const nameInput = inputs.find(
      (node: { props: { accessibilityLabel?: string } }) =>
        node.props.accessibilityLabel === "Como podemos chamar você"
    );
    const emailInput = inputs.find(
      (node: { props: { accessibilityLabel?: string } }) =>
        node.props.accessibilityLabel === "Seu e-mail"
    );
    const passInput = inputs.find(
      (node: { props: { accessibilityLabel?: string } }) =>
        node.props.accessibilityLabel === "Crie uma senha"
    );

    await act(async () => {
      nameInput.props.onChangeText("Helena Costa");
      emailInput.props.onChangeText("helena@email.com");
      passInput.props.onChangeText("senha123");
    });

    const submitBtn = renderer.root.findByProps({
      accessibilityRole: "button",
      accessibilityLabel: "Criar conta",
    });

    await act(async () => {
      await (submitBtn.props.onClick?.() ?? submitBtn.props.onPress?.());
    });

    expect(mockSignUpWithEmail).toHaveBeenCalledWith(
      "Helena Costa",
      "helena@email.com",
      "senha123"
    );
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
