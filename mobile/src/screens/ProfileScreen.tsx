import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  User,
  Settings as SettingsIcon,
  HardDrive,
  Edit2,
  ChevronRight,
  BookOpen,
  Award,
  Globe2,
  GraduationCap,
  Layers,
  Heart,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { MetricCard } from "../components/MetricCard";

export function ProfileScreen({ navigation }: any) {
  const { meta, lang } = useLanguage();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.8}
        >
          <SettingsIcon size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Teacher Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarBox}>
            <Text style={{ fontSize: 36 }}>👨‍🏫</Text>
            <View style={styles.onlinePill} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.teacherName}>Himanshu Kumar</Text>
            <Text style={styles.teacherRole}>FLN Lead Teacher</Text>
            <Text style={styles.teacherSchool}>Govt. Primary School, Ranchi (Jharkhand)</Text>
            <View style={styles.gradeBadge}>
              <GraduationCap size={12} color={Colors.primaryForest} />
              <Text style={styles.gradeBadgeText}>Grade 1–3 (FLN Mission)</Text>
            </View>
          </View>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>"Bridging classrooms through our mother tongues."</Text>
        </View>
      </View>

      {/* Classroom Setup Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Classroom Setup</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("LanguageSelection")}
          activeOpacity={0.7}
        >
          <Text style={styles.editText}>Edit →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setupCard}>
        <TouchableOpacity
          style={styles.setupItem}
          onPress={() => navigation.navigate("LanguageSelection")}
          activeOpacity={0.75}
        >
          <View style={styles.setupIconBox}>
            <Globe2 size={18} color={Colors.primaryForest} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.setupLabel}>Classroom Mother Tongue</Text>
            <Text style={styles.setupVal}>
              {meta.name} ({meta.script} Script)
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.setupDivider} />

        <View style={styles.setupItem}>
          <View style={[styles.setupIconBox, { backgroundColor: "#FFF1C7" }]}>
            <GraduationCap size={18} color={Colors.ochre} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.setupLabel}>Grade Level</Text>
            <Text style={styles.setupVal}>Class 1–3 FLN Foundational</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </View>

        <View style={styles.setupDivider} />

        <View style={styles.setupItem}>
          <View style={[styles.setupIconBox, { backgroundColor: "#E3F2FD" }]}>
            <Layers size={18} color="#1565C0" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.setupLabel}>Target Subjects</Text>
            <Text style={styles.setupVal}>Language • EVS • Basic Math</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Progress")}>
          <Text style={styles.editText}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <MetricCard value="142" label="Words Practiced" highlightColor={Colors.primaryForest} />
        <MetricCard value="12" label="Speech Sessions" highlightColor={Colors.terracotta} />
        <MetricCard value="8" label="Worksheets" highlightColor={Colors.ochre} />
        <MetricCard value="16/16" label="Offline" highlightColor={Colors.primaryForest} />
      </View>

      {/* Quick Menu Actions */}
      <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>App Settings & Offline</Text>
      </View>

      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.75}
        >
          <SettingsIcon size={18} color={Colors.primaryForest} />
          <Text style={styles.menuItemText}>App & Translation Settings</Text>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.setupDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Offline")}
          activeOpacity={0.75}
        >
          <HardDrive size={18} color={Colors.primaryForest} />
          <Text style={styles.menuItemText}>Offline Storage & Cache (8.5 MB)</Text>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  onlinePill: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  teacherName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  teacherRole: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
    marginTop: 1,
  },
  teacherSchool: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  gradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  quoteBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  quoteText: {
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text,
  },
  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  setupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  setupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  setupIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  setupLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  setupVal: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 1,
  },
  setupDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
});
