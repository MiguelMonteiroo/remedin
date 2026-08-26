import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, View } from "react-native";
import { Home, Pill, History, UserRound, type LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "../screens/HomeScreen";
import { AddMedicationScreen } from "../screens/AddMedicationScreen";
import { EditMedicationScreen } from "../screens/EditMedicationScreen";
import { MedicationDetailScreen } from "../screens/MedicationDetailScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { MedicationsScreen } from "../screens/MedicationsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { RootStackParamList, RootTabParamList } from "./types";
import { colors } from "../theme/colors";
import { ptBR } from "../i18n/ptBR";
import { fontFamilies } from "../theme/typography";
import { AppText } from "../components/ui/AppText";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

const TAB_CONFIG: Record<keyof RootTabParamList, { icon: LucideIcon; label: string }> = {
  Home: { icon: Home, label: ptBR.tabs.today },
  Medications: { icon: Pill, label: ptBR.tabs.medications },
  History: { icon: History, label: ptBR.tabs.history },
  Profile: { icon: UserRound, label: ptBR.tabs.profile },
};

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: ptBR.tabs.today,
        }}
      />
      <Tabs.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          title: ptBR.tabs.medications,
        }}
      />
      <Tabs.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: ptBR.tabs.history,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          title: ptBR.tabs.profile,
        }}
      />
    </Tabs.Navigator>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingContainer, { bottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.floatingPill}>
        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name as keyof RootTabParamList];
          const focused = state.index === index;
          const Icon = config.icon;

          return (
            <Pressable
              accessibilityLabel={config.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              key={route.key}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              style={({ pressed }) => [
                styles.navItem,
                focused && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Icon color={colors.text} size={22} strokeWidth={2.2} />
              <AppText
                allowFontScaling={false}
                numberOfLines={1}
                style={styles.navLabel}
                variant="caption"
                weight="bold"
              >
                {config.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fontFamilies.bold },
      }}
    >
      <Stack.Screen
        name="Onboarding"
        options={{ headerShown: false }}
      >
        {({ navigation }) => (
          <OnboardingScreen onComplete={() => navigation.replace("MainTabs")} />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditMedication"
        component={EditMedicationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicationDetail"
        component={MedicationDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  floatingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 40,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 30,
  },
  navItemActive: {
    backgroundColor: colors.surfaceMuted,
  },
  navItemPressed: {
    opacity: 0.7,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
});

