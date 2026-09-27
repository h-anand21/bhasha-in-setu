import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  HardDrive,
  CheckCircle2,
  Download,
  Trash2,
  Music,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { StatusBadge } from "../components/StatusBadge";

export function OfflineScreen({ navigation }: any) {
  const downloadedLessons = [
    { title: "Lesson 1 — My Classroom", size: "12 MB", count: "5 activities" },
    { title: "Lesson 2 — My Family", size: "8 MB", count: "4 activities" },
    { title: "Lesson 3 — Animals", size: "10 MB", count: "6 activities" },
    { title: "Lesson 4 — Numbers", size: "7 MB", count: "5 activities" },
    { title: "Lesson 5 — Colors", size: "6 MB", count: "4 activities" },
    { title: "Lesson 6 — Food & Fruits", size: "8 MB", count: "4 activities" },
    { title: "Lesson 7 — Body Parts", size: "7 MB", count: "5 activities" },
    { title: "Lesson 8 — My School", size: "9 MB", count: "5 activities" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title="Offline & Storage"
        subtitle="Manage cached lessons, voice audio & SQLite database"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Offline Ready Status Banner */}
      <View style={styles.bannerCard}>
        <View style={styles.bannerIconBox}>
          <CheckCircle2 size={24} color="#2E7D32" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>App is ready for offline use!</Text>
          <Text style={styles.bannerSub}>
            All core lessons, audio and worksheets are cached locally on this device.
          </Text>
        </View>
      </View>

      {/* Storage Gauge Card */}
      <View style={styles.storageCard}>
        <View style={styles.storageHeaderRow}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <Text style={styles.storageUsedText}>8.5 MB / 200 MB (4%)</Text>
        </View>

        <View style={styles.storageBarBg}>
          <View style={[styles.storageBarFill, { width: "4%" }]} />
        </View>

        <View style={styles.storageStatsRow}>
          <View style={styles.statCol}>
            <BookOpen size={18} color={Colors.primaryForest} />
            <Text style={styles.statVal}>16 / 16</Text>
            <Text style={styles.statLabel}>Lessons Cached</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Music size={18} color={Colors.terracotta} />
            <Text style={styles.statVal}>1,248</Text>
            <Text style={styles.statLabel}>Audio Files</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <HardDrive size={18} color={Colors.ochre} />
            <Text style={styles.statVal}>0 MB</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
        </View>
      </View>

      {/* Downloaded Content List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Downloaded Content</Text>
        <Text style={styles.manageText}>Manage</Text>
      </View>

      <View style={styles.contentList}>
        {downloadedLessons.map((item, idx) => (
          <View key={idx} style={styles.contentItem}>
            <View style={styles.contentIconBox}>
              <BookOpen size={16} color={Colors.primaryForest} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.contentTitle}>{item.title}</Text>
              <Text style={styles.contentSub}>
                {item.size} • {item.count}
              </Text>
            </View>
            <CheckCircle2 size={18} color="#2E7D32" />
          </View>
        ))}
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
  bannerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C8E6C9",
    marginBottom: 16,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1B5E20",
  },
  bannerSub: {
    fontSize: 11,
    color: "#2E7D32",
    marginTop: 2,
    lineHeight: 15,
  },
  storageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  storageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storageTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Colors.text,
  },
  storageUsedText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  storageBarBg: {
    height: 8,
    backgroundColor: "#EFECE4",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  storageBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryForest,
    borderRadius: 4,
  },
  storageStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
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
  manageText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  contentList: {
    gap: 8,
  },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  contentTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  contentSub: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
