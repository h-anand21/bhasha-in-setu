import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { createBottomTabNavigator, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "../theme/colors";
import { HomeScreen } from "../screens/HomeScreen";
import { LiveDialogueScreen } from "../screens/LiveDialogueScreen";
import { TranslateScreen } from "../screens/TranslateScreen";
import { WorksheetsScreen } from "../screens/WorksheetsScreen";
import { LibraryScreen } from "../screens/LibraryScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { OfflineScreen } from "../screens/OfflineScreen";
import { LanguageSelectionScreen } from "../screens/LanguageSelectionScreen";
import { LanguageDetailsScreen } from "../screens/LanguageDetailsScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { CurvedNotchBottomNav, NavTabType } from "../components/CurvedNotchBottomNav";
import { getAppSetting } from "../services/database";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomBottomTabBar({ state, navigation }: BottomTabBarProps) {
  const currentRouteName = state.routes[state.index]?.name || "Home";

  let activeTab: NavTabType = "Home";
  if (currentRouteName === "Home") activeTab = "Home";
  else if (currentRouteName === "Lessons") activeTab = "Lessons";
  else if (currentRouteName === "Live") activeTab = "Live";
  else if (currentRouteName === "Progress") activeTab = "Progress";
  else if (currentRouteName === "Profile") activeTab = "Profile";

  const handleTabPress = (tab: NavTabType) => {
    navigation.navigate(tab);
  };

  return (
    <CurvedNotchBottomNav activeTab={activeTab} onTabPress={handleTabPress} isListening={false} />
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lessons" component={WorksheetsScreen} />
      <Tab.Screen name="Live" component={LiveDialogueScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    try {
      const hasSeen = getAppSetting("has_seen_onboarding", "false");
      if (hasSeen === "true") {
        setInitialRoute("MainTabs");
      } else {
        setInitialRoute("Onboarding");
      }
    } catch {
      setInitialRoute("Onboarding");
    }
  }, []);

  if (!initialRoute) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryForest} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Translate" component={TranslateScreen} />
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen name="Worksheets" component={WorksheetsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Offline" component={OfflineScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="LanguageDetails" component={LanguageDetailsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
