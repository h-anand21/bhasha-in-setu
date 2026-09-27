import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect, G } from "react-native-svg";
import {
  Mic,
  Camera,
  FileSpreadsheet,
  BookOpen,
  BarChart3,
  ChevronRight,
  Volume2,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { speakNative } from "../services/speech";
import { type LangCode } from "../lib/lexicon";
import { StatusBadge } from "../components/StatusBadge";
import { AudioButton } from "../components/AudioButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export function HomeScreen({ navigation }: any) {
  const { lang, setLang, meta, languages } = useLanguage();
  const insets = useSafeAreaInsets();

  const scriptSamples = [
    { script: "Ol Chiki", char: "ᱚ", sample: "ᱡᱚᱦᱟᱨ", langName: "Santhali" },
    { script: "Warang Citi", char: "𑢹", sample: "𑣔𑣂𑣜𑣂𑣙", langName: "Ho" },
    { script: "Devanagari", char: "अ", sample: "सिंगी", langName: "Mundari" },
    { script: "Latin", char: "W", sample: "Johar", langName: "Phonetic" },
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
      {/* Top Badges */}
      <View style={styles.topBadgeRow}>
        <StatusBadge label="NIPUN BHARAT FLN READY" variant="fln" />
        <StatusBadge label="100% OFFLINE READY" variant="offline" />
      </View>

      {/* Hero Header with Teacher Illustration */}
      <View style={styles.heroCard}>
        {/* Subtle Background SVG Hills Motif */}
        <View style={styles.heroSvgBg} pointerEvents="none">
          <Svg width={width - 32} height={140} viewBox="0 0 340 140">
            <Defs>
              <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#E2EBE4" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path
              d="M0,100 Q60,40 140,80 T280,50 Q310,70 340,90 L340,140 L0,140 Z"
              fill="url(#hillGrad)"
            />
            <Circle cx="40" cy="50" r="14" fill="#E8F2EC" />
            <Circle cx="80" cy="30" r="20" fill="#E8F2EC" />
            <Path d="M 220,95 L 235,70 L 250,95 Z" fill="#D9A441" opacity={0.3} />
            <Path d="M 245,95 L 260,65 L 275,95 Z" fill="#1F5A43" opacity={0.25} />
          </Svg>
        </View>

        <View style={styles.heroContentRow}>
          <View style={styles.heroTextCol}>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitle}>Bhasha</Text>
              <Text style={styles.brandTitleAccent}> Setu</Text>
            </View>
            <Text style={styles.heroSubHindi}>भाषा सेतु</Text>
            <Text style={styles.heroTagline}>
              Bridging classrooms through India's mother tongues.
            </Text>
          </View>

          {/* Teacher Avatar */}
          <TouchableOpacity
            style={styles.teacherAvatarContainer}
            onPress={() => navigation.navigate("Profile")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="View Profile"
          >
            <View style={styles.teacherAvatarRing}>
              <View style={styles.teacherAvatarInner}>
                <Text style={{ fontSize: 26 }}>👩‍🏫</Text>
              </View>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Languages of the Classroom Carousel */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderTitleRow}>
          <BookOpen size={16} color={Colors.primaryForest} />
          <Text style={styles.sectionTitle}>Languages of the Classroom</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Library")} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scriptCarousel}
      >
        {scriptSamples.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.scriptCard}
            onPress={() => speakNative(item.sample)}
            activeOpacity={0.8}
          >
            <View style={styles.scriptCardTop}>
              <Text style={styles.scriptChar}>{item.char}</Text>
              <Volume2 size={15} color={Colors.primaryForest} />
            </View>
            <Text style={styles.scriptLabel}>{item.script}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Select Classroom Mother Tongue */}
      <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
        <View style={styles.sectionHeaderTitleRow}>
          <Text style={{ fontSize: 16 }}>🌐</Text>
          <Text style={styles.sectionTitle}>Select Classroom Mother Tongue</Text>
        </View>
      </View>
      <Text style={styles.sectionSubtitle}>Choose the language used by your learners.</Text>

      <View style={styles.motherTongueRow}>
        {languages.map((l) => {
          const isSelected = lang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.motherTongueCard, isSelected && styles.motherTongueCardSelected]}
              onPress={() => setLang(l.code as LangCode)}
              activeOpacity={0.85}
            >
              {/* Radio Check Circle */}
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
              </View>

              {/* Native Script Text */}
              <Text
                style={[styles.motherTongueScript, isSelected && styles.motherTongueScriptSelected]}
                numberOfLines={1}
              >
                {l.nativeName}
              </Text>

              <Text style={styles.motherTongueName}>{l.name}</Text>
              <Text style={styles.motherTongueSub}>{l.script}</Text>

              {/* Listen button */}
              <TouchableOpacity
                style={[styles.listenBtn, isSelected && styles.listenBtnSelected]}
                onPress={() => speakNative(l.name)}
                activeOpacity={0.7}
              >
                <Volume2 size={12} color={isSelected ? "#FFFFFF" : Colors.primaryForest} />
                <Text style={[styles.listenBtnText, isSelected && styles.listenBtnTextSelected]}>
                  Listen
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Classroom Language Hero Banner */}
      <View style={styles.activeLangHero}>
        <View style={styles.activeLangBadge}>
          <BookOpen size={12} color="#FFF1C7" />
          <Text style={styles.activeLangBadgeText}>ACTIVE CLASSROOM LANGUAGE</Text>
        </View>

        <View style={styles.activeLangRow}>
          <View style={styles.activeLangInfo}>
            <Text style={styles.activeLangTitle}>{meta.name}</Text>
            <Text style={styles.activeLangScriptSub}>{meta.script} Script</Text>

            {/* Native Greeting Word */}
            <Text style={styles.activeGreetingScript}>
              {lang === "sat" ? "ᱡᱚᱦᱟᱨ" : lang === "hoc" ? "𑣔𑣂𑣜𑣂𑣙" : "जोहार"}
            </Text>
            <Text style={styles.activeGreetingPhonetic}>(Johar - Hello)</Text>

            {/* Hear Greeting CTA */}
            <TouchableOpacity
              style={styles.hearGreetingBtn}
              onPress={() => speakNative("Johar")}
              activeOpacity={0.8}
            >
              <Volume2 size={16} color={Colors.primaryForest} strokeWidth={2.4} />
              <Text style={styles.hearGreetingText}>Hear greeting</Text>
            </TouchableOpacity>
          </View>

          {/* Classroom kids avatar */}
          <View style={styles.activeLangVisual}>
            <Text style={{ fontSize: 44 }}>👧🏽🧒🏻</Text>
          </View>
        </View>
      </View>

      {/* Complete Teaching Suite 2-Column Grid */}
      <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
        <View style={styles.sectionHeaderTitleRow}>
          <Text style={{ fontSize: 16 }}>▦</Text>
          <Text style={styles.sectionTitle}>Complete Teaching Suite</Text>
        </View>
      </View>
      <Text style={styles.sectionSubtitle}>Everything you need for a bilingual classroom.</Text>

      <View style={styles.toolsGrid}>
        {/* Tool 1: Live Dialogue */}
        <TouchableOpacity
          style={styles.toolGridCard}
          onPress={() => navigation.navigate("Live")}
          activeOpacity={0.85}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: "#FCEEEA" }]}>
            <Mic size={22} color={Colors.terracotta} />
          </View>
          <Text style={styles.toolCardTitle}>Live Dialogue</Text>
          <Text style={styles.toolCardDesc}>Speak → Translate → Hear</Text>
          <View style={styles.toolCardBadge}>
            <Zap size={10} color={Colors.terracotta} />
            <Text style={styles.toolBadgeText}>0.8s response</Text>
            <ChevronRight size={12} color={Colors.terracotta} />
          </View>
        </TouchableOpacity>

        {/* Tool 2: Blackboard OCR */}
        <TouchableOpacity
          style={styles.toolGridCard}
          onPress={() => navigation.navigate("Translate")}
          activeOpacity={0.85}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: "#E8F2EC" }]}>
            <Camera size={22} color={Colors.primaryForest} />
          </View>
          <Text style={styles.toolCardTitle}>Blackboard OCR</Text>
          <Text style={styles.toolCardDesc}>Scan Hindi text from board</Text>
          <View style={[styles.toolCardBadge, { backgroundColor: "#E8F2EC" }]}>
            <Camera size={10} color={Colors.primaryForest} />
            <Text style={[styles.toolBadgeText, { color: Colors.primaryForest }]}>
              Camera & Gallery
            </Text>
            <ChevronRight size={12} color={Colors.primaryForest} />
          </View>
        </TouchableOpacity>

        {/* Tool 3: Worksheets */}
        <TouchableOpacity
          style={styles.toolGridCard}
          onPress={() => navigation.navigate("Worksheets")}
          activeOpacity={0.85}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: "#FFF1C7" }]}>
            <FileSpreadsheet size={22} color={Colors.ochre} />
          </View>
          <Text style={styles.toolCardTitle}>Worksheets</Text>
          <Text style={styles.toolCardDesc}>Flashcards & PDF practice</Text>
          <View style={[styles.toolCardBadge, { backgroundColor: "#FFF1C7" }]}>
            <FileSpreadsheet size={10} color={Colors.ochre} />
            <Text style={[styles.toolBadgeText, { color: Colors.ochre }]}>Print / Share</Text>
            <ChevronRight size={12} color={Colors.ochre} />
          </View>
        </TouchableOpacity>

        {/* Tool 4: Offline Library */}
        <TouchableOpacity
          style={styles.toolGridCard}
          onPress={() => navigation.navigate("Library")}
          activeOpacity={0.85}
        >
          <View style={[styles.toolIconCircle, { backgroundColor: "#E3F2FD" }]}>
            <BookOpen size={22} color="#1565C0" />
          </View>
          <Text style={styles.toolCardTitle}>Offline Library</Text>
          <Text style={styles.toolCardDesc}>Lessons available offline</Text>
          <View style={[styles.toolCardBadge, { backgroundColor: "#E3F2FD" }]}>
            <Check size={10} color="#1565C0" />
            <Text style={[styles.toolBadgeText, { color: "#1565C0" }]}>16/16 synced</Text>
            <ChevronRight size={12} color="#1565C0" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Classroom Progress Card */}
      <TouchableOpacity
        style={styles.progressCard}
        onPress={() => navigation.navigate("Progress")}
        activeOpacity={0.88}
      >
        <View style={styles.progressCardHeader}>
          <View style={styles.progressIconBox}>
            <BarChart3 size={18} color="#7C3AED" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.progressCardTitle}>Classroom Progress</Text>
            <Text style={styles.progressCardSubtitle}>Track learning & FLN goals</Text>
          </View>
        </View>

        <View style={styles.progressMetricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: Colors.primaryForest }]}>142</Text>
            <Text style={styles.metricLabel}>Words Practiced</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: Colors.terracotta }]}>12</Text>
            <Text style={styles.metricLabel}>Speech Sessions</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: Colors.ochre }]}>8</Text>
            <Text style={styles.metricLabel}>Worksheets Generated</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* FLN Gauge */}
          <View style={styles.flnGaugeContainer}>
            <View style={styles.flnGaugeCircle}>
              <Text style={styles.flnGaugePercent}>86%</Text>
            </View>
            <Text style={styles.flnGaugeLabel}>FLN Target Met</Text>
          </View>
        </View>
      </TouchableOpacity>
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
    paddingBottom: 110, // clearance for curved bottom navigation
  },
  topBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroSvgBg: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  heroContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.primaryForest,
    letterSpacing: -0.5,
  },
  brandTitleAccent: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.terracotta,
    letterSpacing: -0.5,
  },
  heroSubHindi: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.secondaryForest,
    marginTop: 1,
  },
  heroTagline: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: 4,
  },
  teacherAvatarContainer: {
    position: "relative",
  },
  teacherAvatarRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.lightGreen,
    borderWidth: 2,
    borderColor: Colors.secondaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
  teacherAvatarInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    position: "absolute",
    bottom: 2,
    right: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sectionHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  scriptCarousel: {
    gap: 10,
    paddingVertical: 4,
  },
  scriptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 84,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  scriptCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scriptChar: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  scriptLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  motherTongueRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  motherTongueCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  motherTongueCardSelected: {
    borderColor: Colors.primaryForest,
    backgroundColor: "#F4FAF6",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  radioCircleSelected: {
    borderColor: Colors.primaryForest,
    backgroundColor: Colors.primaryForest,
  },
  motherTongueScript: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primaryForest,
    textAlign: "center",
    marginVertical: 2,
  },
  motherTongueScriptSelected: {
    color: Colors.primaryForest,
  },
  motherTongueName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  motherTongueSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  listenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  listenBtnSelected: {
    backgroundColor: Colors.primaryForest,
  },
  listenBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  listenBtnTextSelected: {
    color: "#FFFFFF",
  },
  activeLangHero: {
    backgroundColor: Colors.primaryForest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.primaryForest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  activeLangBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  activeLangBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF1C7",
    letterSpacing: 0.5,
  },
  activeLangRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeLangInfo: {
    flex: 1,
  },
  activeLangTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  activeLangScriptSub: {
    fontSize: 12,
    color: "#C2E2D0",
    marginTop: 1,
  },
  activeGreetingScript: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFF1C7",
    marginTop: 6,
  },
  activeGreetingPhonetic: {
    fontSize: 11,
    color: "#E8F2EC",
    marginBottom: 10,
  },
  hearGreetingBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  hearGreetingText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  activeLangVisual: {
    paddingLeft: 10,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  toolGridCard: {
    width: (width - 42) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  toolIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  toolCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 2,
  },
  toolCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 14,
    marginBottom: 8,
  },
  toolCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FCEEEA",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  toolBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  progressCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  progressCardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  progressMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: "900",
  },
  metricLabel: {
    fontSize: 9.5,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 12,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  flnGaugeContainer: {
    alignItems: "center",
    flex: 1,
  },
  flnGaugeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    borderWidth: 2.5,
    borderColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  flnGaugePercent: {
    fontSize: 10.5,
    fontWeight: "900",
    color: "#2E7D32",
  },
  flnGaugeLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: 2,
    textAlign: "center",
  },
});
