import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native";
import {
  Globe2,
  Moon,
  Type,
  Volume2,
  Sliders,
  Camera,
  Check,
  ChevronRight,
  Shield,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { AppHeader } from "../components/AppHeader";

export function SettingsScreen({ navigation }: any) {
  const { meta } = useLanguage();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [showRoman, setShowRoman] = useState(true);
  const [wordBreakdown, setWordBreakdown] = useState(true);
  const [autoEnhance, setAutoEnhance] = useState(true);
  const [detectLines, setDetectLines] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title="Settings"
        subtitle="App preferences, translation options & OCR vision"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* APP PREFERENCES */}
      <Text style={styles.groupHeader}>APP PREFERENCES</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Globe2 size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>App Language</Text>
          <Text style={styles.settingValue}>English</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Moon size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Theme</Text>
          <Text style={styles.settingValue}>Light (Warm Khadi)</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Type size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Text Size</Text>
          <Text style={styles.settingValue}>Medium</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Volume2 size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Voice Speed</Text>
          <Text style={styles.settingValue}>Normal (1.0x)</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Volume2 size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Auto Speak Translations</Text>
          <Switch
            value={autoSpeak}
            onValueChange={setAutoSpeak}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Sliders size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* TRANSLATION SETTINGS */}
      <Text style={styles.groupHeader}>TRANSLATION SETTINGS</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate("LanguageSelection")}
        >
          <Globe2 size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Default Target Language</Text>
          <Text style={styles.settingValue}>{meta.name}</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Type size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Show Roman Pronunciation</Text>
          <Switch
            value={showRoman}
            onValueChange={setShowRoman}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Sliders size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Word-by-Word Breakdown</Text>
          <Switch
            value={wordBreakdown}
            onValueChange={setWordBreakdown}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* CAMERA & OCR */}
      <Text style={styles.groupHeader}>CAMERA & BLACKBOARD OCR</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Camera size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Image Processing Quality</Text>
          <Text style={styles.settingValue}>High</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Sliders size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Auto Enhance Blackboard Photo</Text>
          <Switch
            value={autoEnhance}
            onValueChange={setAutoEnhance}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <Type size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Detect Multiple Lines</Text>
          <Switch
            value={detectLines}
            onValueChange={setDetectLines}
            trackColor={{ false: "#D1D5DB", true: Colors.primaryForest }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* ABOUT & APP INFO */}
      <Text style={styles.groupHeader}>ABOUT & LEGAL</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Shield size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>v1.0.0 (FLN Edition)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <HelpCircle size={18} color={Colors.primaryForest} />
          <Text style={styles.settingLabel}>Help & Documentation</Text>
          <ChevronRight size={16} color={Colors.textMuted} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textMuted,
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },
  settingLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  settingValue: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.background,
  },
});
