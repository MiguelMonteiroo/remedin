import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "./src/database/DatabaseProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AppDataProvider, useAppData } from "./src/services/appDataProvider";
import { NotificationEventBridge } from "./src/components/reminders/NotificationEventBridge";
import { AuthFlowScreen } from "./src/components/onboarding/AuthFlowScreen";
import { BrandSplashScreen } from "./src/components/onboarding/BrandSplashScreen";
import { FirstRunOnboarding } from "./src/components/onboarding/FirstRunOnboarding";
import { AppThemeProvider } from "./src/theme/ThemeProvider";
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
      <DatabaseProvider>
        <NavigationContainer
          onReady={handleNavigationReady}
          ref={navigationRef}
        >
          <AppDataProvider>
            <AppExperience />
          </AppDataProvider>
        </NavigationContainer>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}

export function AppExperience() {
  const { error, loading, settings, userAccount } = useAppData();

  if (loading) {
    return <BrandSplashScreen />;
  }

  if (!error && !userAccount.authenticated) {
    return <AuthFlowScreen />;
  }

  if (!error && !settings.onboardingCompleted) {
    return <FirstRunOnboarding />;
  }

  return (
    <>
      <AppNavigator />
      <NotificationEventBridge />
    </>
  );
}
