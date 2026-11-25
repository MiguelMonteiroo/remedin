import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "./src/database/DatabaseProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppDataProvider, useAppData } from "./src/services/appDataProvider";
import { NotificationEventBridge } from "./src/components/reminders/NotificationEventBridge";
import { BrandSplashScreen } from "./src/components/onboarding/BrandSplashScreen";
import { FirstRunOnboarding } from "./src/components/onboarding/FirstRunOnboarding";
import { DevScreenPicker, type ScreenPreview } from "./src/navigation/DevScreenPicker";
import { AppThemeProvider, useAppTheme } from "./src/theme/ThemeProvider";
import { DoseAlarmScreen } from "./src/screens/DoseAlarmScreen";
import {
  asDoseAlarmPayload,
  type DoseAlarmPayload,
} from "./src/services/reminders/alarmPayloadLoader";
import {
  handleNavigationReady,
  navigationRef,
  resetToHome,
} from "./src/navigation/navigationRef";

type AppProps = {
  initialAlarmPayload?: DoseAlarmPayload | null;
};

export default function App({ initialAlarmPayload }: AppProps) {
  return (
    <AppThemeProvider>
      <AppRoot initialAlarmPayload={initialAlarmPayload} />
    </AppThemeProvider>
  );
}

function AppRoot({ initialAlarmPayload }: AppProps) {
  const { name: theme } = useAppTheme();
  const [launchAlarm, setLaunchAlarm] = useState(() =>
    asDoseAlarmPayload(initialAlarmPayload)
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "RemedinNativeAlarmStopped",
      () => {
        setLaunchAlarm(null);
        resetToHome();
      }
    );
    return () => subscription.remove();
  }, []);

  if (launchAlarm) {
    return (
      <SafeAreaProvider>
        <DoseAlarmScreen
          onClose={() => {
            setLaunchAlarm(null);
            resetToHome();
          }}
          payload={launchAlarm}
        />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      <DatabaseProvider>
        <AppDataProvider>
          <AppExperience />
        </AppDataProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}

export function AppExperience() {
  const { error, loading, settings, markOnboardingIntroSeen } = useAppData();
  const [splashElapsed, setSplashElapsed] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [preview, setPreview] = useState<{ screen: ScreenPreview; revision: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplashElapsed(true), 360);
    return () => clearTimeout(timer);
  }, []);

  const finishIntro = useCallback(async () => {
    await markOnboardingIntroSeen().catch(() => undefined);
    setIntroFinished(true);
  }, [markOnboardingIntroSeen]);

  const closePreview = useCallback(() => setPreview(null), []);
  const selectPreview = useCallback((screen: ScreenPreview | null) => {
    setPreview((current) => screen ? { screen, revision: (current?.revision ?? 0) + 1 } : null);
  }, []);

  const currentPreview = __DEV__ ? preview?.screen : undefined;
  let content;

  if (currentPreview?.kind === "intro" || currentPreview?.kind === "splash") {
    content = <BrandSplashScreen key={preview?.revision} firstLaunch={currentPreview.kind === "intro"} />;
  } else if (currentPreview?.kind === "onboarding") {
    content = <FirstRunOnboarding key={preview?.revision} initialStep={currentPreview.step} onPreviewFinish={closePreview} />;
  } else if (currentPreview?.kind === "alarm") {
    content = <DoseAlarmScreen embedded preview onClose={closePreview} payload={PREVIEW_ALARM} />;
  } else if (currentPreview?.kind !== "navigation" && (loading || !splashElapsed)) {
    content = <BrandSplashScreen />;
  } else if (currentPreview?.kind !== "navigation" && !error && !settings.onboardingCompleted) {
    content = settings.onboardingIntroSeen || settings.userName || introFinished
      ? <FirstRunOnboarding />
      : <BrandSplashScreen key="startup-intro" firstLaunch onIntroComplete={finishIntro} />;
  } else {
    content = (
      <NavigationContainer
        key={currentPreview?.kind === "navigation" ? preview?.revision : "app"}
        initialState={currentPreview?.kind === "navigation" ? currentPreview.state : undefined}
        onReady={handleNavigationReady}
        ref={navigationRef}
      >
        <AppNavigator />
        <NotificationEventBridge />
      </NavigationContainer>
    );
  }

  return (
    <>
      {content}
      {__DEV__ ? <DevScreenPicker onSelect={selectPreview} /> : null}
    </>
  );
}

const PREVIEW_ALARM: DoseAlarmPayload = {
  notificationId: "preview",
  title: "Hora do medicamento",
  body: "Sua dose está programada para agora.",
  data: { artifactKind: "doseAlarm", scheduledAt: "2026-01-01T08:00:00" },
};
