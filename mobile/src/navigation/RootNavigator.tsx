import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Home,
  Mic,
  Camera,
  FileSpreadsheet,
  BookOpen,
  BarChart3,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { HomeScreen } from "../screens/HomeScreen";
import { LiveDialogueScreen } from "../screens/LiveDialogueScreen";
import { TranslateScreen } from "../screens/TranslateScreen";
import { WorksheetsScreen } from "../screens/WorksheetsScreen";
import { LibraryScreen } from "../screens/LibraryScreen";
import { ProgressScreen } from "../screens/ProgressScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.sand,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.cardBorder,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 16,
          color: Colors.text,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: Colors.cardBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.terracotta,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "Bhasha Setu",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerProgressBtn}
              onPress={() => navigation.navigate("Progress")}
            >
              <BarChart3 size={18} color={Colors.terracotta} />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Live"
        component={LiveDialogueScreen}
        options={{
          title: "Live Dialogue",
          tabBarLabel: "Live Mic",
          tabBarIcon: ({ color, size }) => <Mic size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          title: "Blackboard Vision",
          tabBarLabel: "Vision OCR",
          tabBarIcon: ({ color, size }) => <Camera size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Worksheets"
        component={WorksheetsScreen}
        options={{
          title: "Worksheets & Cards",
          tabBarLabel: "Worksheets",
          tabBarIcon: ({ color, size }) => <FileSpreadsheet size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: "Offline Library",
          tabBarLabel: "Library",
          tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.sand,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 16,
          color: Colors.text,
        },
        headerTintColor: Colors.terracotta,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: "FLN Retention Progress",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerProgressBtn: {
    marginRight: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.terracottaLight,
    justifyContent: "center",
    alignItems: "center",
  },
});
