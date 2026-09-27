import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import {
  Settings as SettingsIcon,
  Edit2,
  ChevronRight,
  BookOpen,
  Globe2,
  GraduationCap,
  FileSpreadsheet,
  Mic,
  Cloud,
  HardDrive,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export function ProfileScreen({ navigation }: any) {
  const { meta, lang } = useLanguage();
  const insets = useSafeAreaInsets();

  const achievements = [
    {
      title: "First Translation",
      sub: "Completed",
      icon: "🛡️",
      color: "#E8F5E9",
      border: "#2E7D32",
    },
    {
      title: "10",
      sub: "Live Sessions",
      icon: "🎙️",
      color: "#FCEEEA",
      border: Colors.terracotta,
    },
    {
      title: "8",
      sub: "Worksheets Generated",
      icon: "📄",
      color: "#E3F2FD",
      border: "#1565C0",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 6, 16),
          paddingBottom: insets.bottom + 115,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <SettingsIcon size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Teacher Profile Card with Jharkhand Landscape Motif */}
      <View style={styles.profileCard}>
        {/* Landscape SVG Background at bottom of card */}
        <View style={styles.cardSvgBg} pointerEvents="none">
          <Svg width={width - 32} height={100} viewBox="0 0 340 100">
            <Defs>
              <LinearGradient id="bgHills" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#E2EBE4" stopOpacity="0.7" />
                <Stop offset="100%" stopColor="#FAF7F0" stopOpacity="0.2" />
              </LinearGradient>
            </Defs>
            {/* Hills */}
            <Path d="M0,60 Q80,20 160,50 T340,30 L340,100 L0,100 Z" fill="url(#bgHills)" />
            {/* Small Village Thatched Huts & Trees Motif */}
            <Path d="M 240,75 L 255,50 L 270,75 Z" fill="#D9A441" opacity={0.35} />
            <Path d="M 270,75 L 285,45 L 300,75 Z" fill="#1F5A43" opacity={0.3} />
            <Circle cx="50" cy="40" r="14" fill="#E8F2EC" />
            <Circle cx="85" cy="25" r="18" fill="#E8F2EC" />
          </Svg>
        </View>

        <View style={styles.avatarRow}>
          {/* Avatar Container with Edit Badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBox}>
              <Text style={{ fontSize: 36 }}>👨‍🏫</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarEditBadge}
              onPress={() => navigation.navigate("Settings")}
              activeOpacity={0.8}
            >
              <Edit2 size={11} color="#FFFFFF" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          {/* Teacher Details */}
          <View style={styles.profileDetails}>
            <Text style={styles.teacherName}>Himanshu Kumar</Text>
            <Text style={styles.teacherRole}>Teacher</Text>
            <Text style={styles.teacherSchool}>📍 Govt. Primary School, Ranchi</Text>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>🏅 Grade 1–3 (FLN)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Motivational Teacher Philosophy Card */}
      <View style={styles.quoteCard}>
        <View style={styles.sproutIconCircle}>
          <Text style={{ fontSize: 18 }}>🌿</Text>
        </View>
        <Text style={styles.quoteText}>"Bridging classrooms through our mother tongues."</Text>
        <TouchableOpacity style={styles.quoteEditBtn} onPress={() => {}} activeOpacity={0.7}>
          <Edit2 size={14} color={Colors.primaryForest} />
        </TouchableOpacity>
      </View>

      {/* Section 1: My Classroom Setup */}
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
        {/* Classroom Mother Tongue */}
        <TouchableOpacity
          style={styles.setupItem}
          onPress={() => navigation.navigate("LanguageSelection")}
          activeOpacity={0.75}
        >
          <View style={[styles.setupIconBox, { backgroundColor: "#FFF1C7" }]}>
            <Globe2 size={18} color={Colors.ochre} />
          </View>
          <View style={styles.setupTextCol}>
            <Text style={styles.setupLabel}>Classroom Mother Tongue</Text>
            <Text style={styles.setupVal}>
              {meta.name} ({meta.script})
            </Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.setupDivider} />

        {/* Grade Level */}
        <View style={styles.setupItem}>
          <View style={[styles.setupIconBox, { backgroundColor: Colors.lightGreen }]}>
            <GraduationCap size={18} color={Colors.primaryForest} />
          </View>
          <View style={styles.setupTextCol}>
            <Text style={styles.setupLabel}>Grade Level</Text>
            <Text style={styles.setupVal}>Class 1 (FLN)</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </View>

        <View style={styles.setupDivider} />

        {/* Subjects */}
        <View style={styles.setupItem}>
          <View style={[styles.setupIconBox, { backgroundColor: "#E3F2FD" }]}>
            <BookOpen size={18} color="#1565C0" />
          </View>
          <View style={styles.setupTextCol}>
            <Text style={styles.setupLabel}>Subjects</Text>
            <Text style={styles.setupVal}>Language • EVS • Math</Text>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </View>
      </View>

      {/* Section 2: Quick Stats 2x2 Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Progress")} activeOpacity={0.7}>
          <Text style={styles.editText}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {/* Stat 1: Words Practiced */}
        <View style={styles.statGridCard}>
          <View style={[styles.statIconBox, { backgroundColor: "#FFF1C7" }]}>
            <BookOpen size={20} color={Colors.ochre} />
          </View>
          <View style={styles.statTextCol}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Words Practiced</Text>
          </View>
        </View>

        {/* Stat 2: Speech Sessions */}
        <View style={styles.statGridCard}>
          <View style={[styles.statIconBox, { backgroundColor: "#FCEEEA" }]}>
            <Mic size={20} color={Colors.terracotta} />
          </View>
          <View style={styles.statTextCol}>
            <Text style={[styles.statNumber, { color: Colors.terracotta }]}>12</Text>
            <Text style={styles.statLabel}>Speech Sessions</Text>
          </View>
        </View>

        {/* Stat 3: Worksheets Generated */}
        <View style={styles.statGridCard}>
          <View style={[styles.statIconBox, { backgroundColor: "#E3F2FD" }]}>
            <FileSpreadsheet size={20} color="#1565C0" />
          </View>
          <View style={styles.statTextCol}>
            <Text style={[styles.statNumber, { color: "#1565C0" }]}>8</Text>
            <Text style={styles.statLabel}>Worksheets Generated</Text>
          </View>
        </View>

        {/* Stat 4: Lessons Offline */}
        <View style={styles.statGridCard}>
          <View style={[styles.statIconBox, { backgroundColor: Colors.lightGreen }]}>
            <Cloud size={20} color={Colors.primaryForest} />
          </View>
          <View style={styles.statTextCol}>
            <Text style={[styles.statNumber, { color: Colors.primaryForest }]}>16 / 16</Text>
            <Text style={styles.statLabel}>Lessons Offline</Text>
          </View>
        </View>
      </View>

      {/* Section 3: My Achievements */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>My Achievements</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Progress")} activeOpacity={0.7}>
          <Text style={styles.editText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.achievementsRow}>
        {achievements.map((ach, idx) => (
          <View key={idx} style={[styles.achieveCard, { borderColor: ach.border }]}>
            <View style={[styles.achieveIconCircle, { backgroundColor: ach.color }]}>
              <Text style={{ fontSize: 20 }}>{ach.icon}</Text>
            </View>
            <Text style={styles.achieveTitle}>{ach.title}</Text>
            <Text style={styles.achieveSub}>{ach.sub}</Text>
          </View>
        ))}
      </View>

      {/* Settings & Storage Access Links */}
      <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
        <Text style={styles.sectionTitle}>Account & Offline Management</Text>
      </View>

      <View style={styles.menuCard}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.75}
        >
          <View style={styles.menuIconBox}>
            <SettingsIcon size={18} color={Colors.primaryForest} />
          </View>
          <Text style={styles.menuItemText}>App Preferences & Voice Settings</Text>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.setupDivider} />

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Offline")}
          activeOpacity={0.75}
        >
          <View style={[styles.menuIconBox, { backgroundColor: "#FFF1C7" }]}>
            <HardDrive size={18} color={Colors.ochre} />
          </View>
          <Text style={styles.menuItemText}>Offline Storage & Cache (8.5 MB Cached)</Text>
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
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSvgBg: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBox: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.lightGreen,
    borderWidth: 2,
    borderColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryForest,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },
  teacherRole: {
    fontSize: 12.5,
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
    backgroundColor: "#FFF1C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#F2D88C",
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#8D6200",
  },
  quoteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sproutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteText: {
    flex: 1,
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.text,
    marginLeft: 10,
    marginRight: 6,
    lineHeight: 16,
  },
  quoteEditBtn: {
    padding: 4,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  setupTextCol: {
    flex: 1,
    marginLeft: 10,
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
    backgroundColor: Colors.background,
    marginVertical: 6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statGridCard: {
    width: (width - 42) / 2,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 1,
    lineHeight: 13,
  },
  achievementsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  achieveCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  achieveIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  achieveTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  achieveSub: {
    fontSize: 9.5,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 1,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
});
