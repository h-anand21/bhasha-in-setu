import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  Sparkles,
  Award,
  Volume2,
  CheckCircle2,
  Users,
  Mic,
  Camera,
  FileSpreadsheet,
  BookOpen,
  ChevronRight,
  Heart,
} from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { getProgressStats, type ProgressStats } from "../services/database";
import { speakNative } from "../services/speech";
import { StatusBadge } from "../components/StatusBadge";
import { MetricCard } from "../components/MetricCard";

const { width } = Dimensions.get("window");

export function ProgressScreen() {
  const { lang, meta } = useLanguage();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "usage" | "achievements">(
    "overview",
  );

  useEffect(() => {
    try {
      const data = getProgressStats();
      setStats(data);
    } catch (e) {
      console.warn("Progress load error:", e);
    }
  }, []);

  const topPracticedWords = [
    { rank: 1, hi: "पानी", en: "Water", native: "ᱫᱟᱜ", count: "28 times" },
    { rank: 2, hi: "किताब", en: "Book", native: "ᱯᱩᱛᱷᱤ", count: "25 times" },
    { rank: 3, hi: "स्कूल", en: "School", native: "ᱤᱥᱠᱩᱞ", count: "22 times" },
    { rank: 4, hi: "दोस्त", en: "Friend", native: "ᱜᱟᱛᱮ", count: "18 times" },
    { rank: 5, hi: "खेल", en: "Play", native: "ᱮᱱᱮᱡ", count: "16 times" },
  ];

  const skillBars = [
    { skill: "Listening", percent: 88, color: Colors.warmOrange },
    { skill: "Speaking", percent: 76, color: Colors.terracotta },
    { skill: "Reading", percent: 82, color: "#3B82F6" },
    { skill: "Vocabulary", percent: 69, color: "#8B5CF6" },
  ];

  const achievementBadges = [
    {
      title: "First Translation",
      desc: "1st translation completed",
      emoji: "🎯",
      color: "#E8F5E9",
      border: "#2E7D32",
    },
    {
      title: "10 Speech Sessions",
      desc: "Completed 10 live sessions",
      emoji: "🎙️",
      color: "#FCEEEA",
      border: Colors.terracotta,
    },
    {
      title: "8 Worksheets",
      desc: "Generated 8 worksheets",
      emoji: "📄",
      color: "#E3F2FD",
      border: "#1565C0",
    },
    {
      title: "FLN Supporter",
      desc: "Helping inclusive education",
      emoji: "⭐",
      color: "#F3E8FF",
      border: "#7C3AED",
    },
    {
      title: "Offline Expert",
      desc: "Downloaded all lessons",
      emoji: "💾",
      color: "#FFF1C7",
      border: "#D9A441",
    },
    {
      title: "Language Champion",
      desc: "100+ words practiced",
      emoji: "🏆",
      color: "#FEF3C7",
      border: "#B45309",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header Badge */}
      <View style={styles.badgeRow}>
        <StatusBadge label="REAL-TIME SQLITE METRICS" variant="sqlite" />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Classroom FLN Progress</Text>
          <Text style={styles.headerSubtitle}>
            Track bilingual learning impact and foundational literacy goals in your classroom.
          </Text>
        </View>
        <View style={styles.headerIconBox}>
          <Text style={{ fontSize: 32 }}>📊</Text>
        </View>
      </View>

      {/* Tab Switcher: Overview | Language Skills | Usage | Achievements */}
      <View style={styles.tabContainer}>
        {(["overview", "skills", "usage", "achievements"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
            onPress={() => setActiveTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>
              {t === "overview"
                ? "Overview"
                : t === "skills"
                  ? "Skills"
                  : t === "usage"
                    ? "Usage"
                    : "Badges"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <View>
          {/* 4 Metric Cards */}
          <View style={styles.metricsGrid}>
            <MetricCard
              value={stats?.totalWords || 142}
              label="Bilingual Words Practiced"
              highlightColor={Colors.primaryForest}
            />
            <MetricCard
              value={stats?.speechSessions || 12}
              label="Live Speech Sessions"
              highlightColor={Colors.terracotta}
            />
            <MetricCard
              value={stats?.worksheetsGenerated || 8}
              label="Worksheets Generated"
              highlightColor={Colors.ochre}
            />
            <MetricCard
              value={`${stats?.syncedLessonsCount || 16}/16`}
              label="Lessons Available Offline"
              highlightColor={Colors.primaryForest}
            />
          </View>

          {/* Main NIPUN Target Card */}
          <View style={styles.nipunCard}>
            <View style={styles.nipunHeader}>
              <Award size={18} color={Colors.ochre} />
              <Text style={styles.nipunTitle}>NIPUN Bharat Foundational Literacy Target</Text>
            </View>

            <View style={styles.nipunStatsRow}>
              <Text style={styles.nipunPercent}>86%</Text>
              <Text style={styles.nipunStatus}>Target Met</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "86%" }]} />
            </View>

            <Text style={styles.nipunExplanation}>
              Great progress! Children are able to understand meanings and express themselves in
              their mother tongue and Hindi.
            </Text>
          </View>

          {/* District Pilot Coverage */}
          <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>District Pilot Coverage (Jharkhand)</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.districtsList}>
            <View style={styles.districtCard}>
              <View style={styles.districtIconBox}>
                <MapPin size={18} color={Colors.primaryForest} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.districtName}>East Singhbhum</Text>
                <Text style={styles.districtSub}>• Santhali (Ol Chiki)</Text>
              </View>
              <View style={styles.districtGauge}>
                <Text style={styles.districtPercent}>92%</Text>
              </View>
            </View>

            <View style={styles.districtCard}>
              <View style={[styles.districtIconBox, { backgroundColor: "#FFF1C7" }]}>
                <MapPin size={18} color={Colors.ochre} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.districtName}>West Singhbhum</Text>
                <Text style={styles.districtSub}>• Ho (Warang Citi)</Text>
              </View>
              <View style={[styles.districtGauge, { borderColor: Colors.ochre }]}>
                <Text style={[styles.districtPercent, { color: Colors.ochre }]}>84%</Text>
              </View>
            </View>

            <View style={styles.districtCard}>
              <View style={[styles.districtIconBox, { backgroundColor: "#E3F2FD" }]}>
                <MapPin size={18} color="#1565C0" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.districtName}>Ranchi / Khunti</Text>
                <Text style={styles.districtSub}>• Mundari (Devanagari)</Text>
              </View>
              <View style={[styles.districtGauge, { borderColor: "#1565C0" }]}>
                <Text style={[styles.districtPercent, { color: "#1565C0" }]}>78%</Text>
              </View>
            </View>
          </View>

          {/* Most Practiced Words */}
          <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Most Practiced Words</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wordsList}>
            {topPracticedWords.map((item) => (
              <View key={item.rank} style={styles.wordRow}>
                <View style={styles.wordRankBadge}>
                  <Text style={styles.wordRankText}>{item.rank}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.wordMain}>
                    {item.hi}{" "}
                    <Text style={{ color: Colors.textMuted, fontSize: 12 }}>({item.en})</Text>
                  </Text>
                  <Text style={styles.wordNative}>{item.native}</Text>
                </View>
                <Text style={styles.wordCount}>{item.count}</Text>
                <TouchableOpacity
                  style={styles.wordAudioBtn}
                  onPress={() => speakNative(item.native, meta.ttsLocale)}
                >
                  <Volume2 size={14} color={Colors.primaryForest} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === "skills" && (
        <View>
          <View style={styles.skillsCard}>
            <Text style={styles.skillsCardTitle}>Language Skills Progress</Text>
            <Text style={styles.skillsCardSub}>
              Evaluated across 4 key linguistic competencies in {meta.name}
            </Text>

            {skillBars.map((s, idx) => (
              <View key={idx} style={styles.skillBarItem}>
                <View style={styles.skillLabelRow}>
                  <Text style={styles.skillName}>{s.skill}</Text>
                  <Text style={[styles.skillPercent, { color: s.color }]}>{s.percent}%</Text>
                </View>
                <View style={styles.skillBarBg}>
                  <View
                    style={[
                      styles.skillBarFill,
                      { width: `${s.percent}%`, backgroundColor: s.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* 7-Day Activity Trend Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Learning Activity Trend (Last 7 Days)</Text>
            <View style={styles.chartLegendsRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.primaryForest }]} />
                <Text style={styles.legendText}>Translations</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.warmOrange }]} />
                <Text style={styles.legendText}>Speech</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={styles.legendText}>Worksheets</Text>
              </View>
            </View>

            {/* SVG Trend Line */}
            <Svg width={width - 64} height={120} viewBox="0 0 300 120">
              <Path
                d="M 10,90 Q 60,30 110,60 T 210,40 T 290,20"
                fill="none"
                stroke={Colors.primaryForest}
                strokeWidth="3"
              />
              <Path
                d="M 10,100 Q 70,70 120,40 T 220,55 T 290,45"
                fill="none"
                stroke={Colors.warmOrange}
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <Circle cx="210" cy="40" r="4" fill={Colors.primaryForest} />
              <Circle cx="290" cy="20" r="4" fill={Colors.primaryForest} />
            </Svg>

            <View style={styles.chartDaysRow}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"].map((d, i) => (
                <Text key={i} style={styles.chartDayText}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* TAB 3: USAGE */}
      {activeTab === "usage" && (
        <View>
          <View style={styles.usageCard}>
            <Text style={styles.usageCardTitle}>Offline Usage & Storage</Text>
            <View style={styles.usageStatsRow}>
              <View style={styles.usageStatItem}>
                <Text style={styles.usageStatNum}>16 / 16</Text>
                <Text style={styles.usageStatLabel}>Lessons Synced</Text>
              </View>
              <View style={styles.usageStatItem}>
                <Text style={styles.usageStatNum}>8.5 MB</Text>
                <Text style={styles.usageStatLabel}>Cached Audio</Text>
              </View>
              <View style={styles.usageStatItem}>
                <Text style={styles.usageStatNum}>0 ms</Text>
                <Text style={styles.usageStatLabel}>Latency</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Top Classroom Activities</Text>
          <View style={styles.activitiesList}>
            <View style={styles.activityItem}>
              <Mic size={18} color={Colors.terracotta} />
              <Text style={styles.activityName}>Live Dialogue (Speech)</Text>
              <Text style={styles.activityCount}>42 times</Text>
            </View>
            <View style={styles.activityItem}>
              <Camera size={18} color={Colors.primaryForest} />
              <Text style={styles.activityName}>Blackboard OCR (Translate)</Text>
              <Text style={styles.activityCount}>35 scans</Text>
            </View>
            <View style={styles.activityItem}>
              <FileSpreadsheet size={18} color={Colors.ochre} />
              <Text style={styles.activityName}>Worksheets Generated</Text>
              <Text style={styles.activityCount}>18 printed</Text>
            </View>
            <View style={styles.activityItem}>
              <BookOpen size={18} color="#7C3AED" />
              <Text style={styles.activityName}>Flashcards Practiced</Text>
              <Text style={styles.activityCount}>25 sessions</Text>
            </View>
          </View>
        </View>
      )}

      {/* TAB 4: ACHIEVEMENTS */}
      {activeTab === "achievements" && (
        <View>
          <View style={styles.achievementsGrid}>
            {achievementBadges.map((b, idx) => (
              <View
                key={idx}
                style={[
                  styles.achievementCard,
                  { backgroundColor: "#FFFFFF", borderColor: b.border },
                ]}
              >
                <Text style={{ fontSize: 32, marginBottom: 6 }}>{b.emoji}</Text>
                <Text style={styles.achievementTitle}>{b.title}</Text>
                <Text style={styles.achievementDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>

          {/* Classroom Impact Quote */}
          <View style={styles.impactCard}>
            <Heart size={20} color={Colors.terracotta} />
            <Text style={styles.impactQuote}>
              "Language inclusion helps every child feel seen, heard and confident in the
              classroom."
            </Text>
            <Text style={styles.impactAuthor}>— NIPUN Bharat Mission</Text>
          </View>
        </View>
      )}
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
  badgeRow: {
    marginBottom: 8,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EFECE4",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  tabBtnTextActive: {
    color: Colors.primaryForest,
    fontWeight: "800",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  nipunCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  nipunHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  nipunTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
  nipunStatsRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 8,
  },
  nipunPercent: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  nipunStatus: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2E7D32",
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "#E8F2EC",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryForest,
    borderRadius: 5,
  },
  nipunExplanation: {
    fontSize: 11.5,
    color: Colors.textMuted,
    lineHeight: 16,
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
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  districtsList: {
    gap: 8,
  },
  districtCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  districtName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Colors.text,
  },
  districtSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  districtGauge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
  districtPercent: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  wordsList: {
    gap: 8,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.softYellow,
    alignItems: "center",
    justifyContent: "center",
  },
  wordRankText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.ochre,
  },
  wordMain: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  wordNative: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  wordCount: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginRight: 6,
  },
  wordAudioBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  skillsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  skillsCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  skillsCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  skillBarItem: {
    marginBottom: 12,
  },
  skillLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  skillName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  skillPercent: {
    fontSize: 12,
    fontWeight: "800",
  },
  skillBarBg: {
    height: 8,
    backgroundColor: "#EFECE4",
    borderRadius: 4,
    overflow: "hidden",
  },
  skillBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  chartLegendsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  chartDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chartDayText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  usageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  usageCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 12,
  },
  usageStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  usageStatItem: {
    alignItems: "center",
  },
  usageStatNum: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  usageStatLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 8,
  },
  activityCount: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  achievementCard: {
    width: (width - 42) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  achievementTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
  impactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  impactQuote: {
    fontSize: 13,
    fontStyle: "italic",
    color: Colors.text,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  impactAuthor: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryForest,
    marginTop: 6,
  },
});
