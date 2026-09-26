import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { LanguageProvider } from "./src/context/LanguageContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { getDatabase } from "./src/services/database";

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      // Initialize local SQLite tables and seeds
      getDatabase();
      setDbReady(true);
    } catch (e) {
      console.warn("DB Initialization error:", e);
      setDbReady(true);
    }
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NavigationContainer>
          <StatusBar style="dark" backgroundColor="#F9F6F0" />
          <RootNavigator />
        </NavigationContainer>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
