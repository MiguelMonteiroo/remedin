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
import { PrivacyScreen } from "../screens/PrivacyScreen";
import { RootStackParamList, RootTabParamList } from "./types";
import { useAppTheme } from "../theme/ThemeProvider";
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
      tabBar={(props) => <BottomNavigationBar {...props} />}
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

export function BottomNavigationBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name as keyof RootTabParamList];
        const focused = state.index === index;
        const Icon = config.icon;
        const itemTint = focused ? colors.primaryDark : colors.textMuted;

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
              pressed && { backgroundColor: colors.surfaceMuted },
            ]}
          >
            {focused ? (
              <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            ) : null}
            <Icon color={itemTint} size={22} strokeWidth={focused ? 2.5 : 2.1} />
            <AppText
              maxFontSizeMultiplier={1.25}
              numberOfLines={2}
              style={[styles.navLabel, { color: itemTint }]}
              variant="caption"
              weight={focused ? "bold" : "medium"}
            >
              {config.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AppNavigator() {
  const { colors } = useAppTheme();
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
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    minHeight: 58,
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 24,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  navLabel: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});
