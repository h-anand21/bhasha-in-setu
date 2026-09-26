import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Mic,
  Camera,
  FileSpreadsheet,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe2,
  Sparkles,
  ArrowRight,
  Volume2,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { speakNative } from "../services/speech";
import { type LangCode } from "../lib/lexicon";

const { width } = Dimensions.get("window");

export function HomeScreen({ navigation }: any) {
  const { lang, setLang, meta, languages } = useLanguage();
  const [activeRotationIndex, setActiveRotationIndex] = useState(0);

  // Auto rotation banner every 6 seconds to highlight all three languages
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveRotationIndex((prev) => (prev + 1) % languages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [languages]);

  const culturalPills = [
    { script: "ᱚᱞ ᱪᱤᱠᱤ", word: "ᱫᱟᱠᱟ", meaning: "Daka (Food)", lang: "Santhali" },
    { script: "𑢹𑣉𑣉", word: "𑣔𑣂𑣜𑣂𑣙", meaning: "Tising (Today)", lang: "Ho" },
    { script: "मुंडारी", word: "सिंगी", meaning: "Singi (Sun)", lang: "Mundari" },
    { script: "ᱚᱞ ᱪᱤᱠᱤ", word: "ᱞᱮᱠᱷᱟ", meaning: "Lekha (Count)", lang: "Santhali" },
    { script: "𑢹𑣉𑣉", word: "𑣞𑣁𑣁", meaning: "Daa (Water)", lang: "Ho" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top FLN Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.flnBadge}>
          <Sparkles size={13} color={Colors.terracotta} />
          <Text style={styles.flnBadgeText}>NIPUN BHARAT FLN MISSION</Text>
        </View>
        <View style={styles.offlineBadge}>
          <ShieldCheck size={13} color={Colors.salGreen} />
          <Text style={styles.offlineBadgeText}>100% OFFLINE</Text>
        </View>
      </View>

      {/* Hero Header */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Bhasha Setu</Text>
        <Text style={styles.heroSubHindi}>भाषा सेतु • मातृभाषा शिक्षण सेतु</Text>
        <Text style={styles.heroDescription}>
          Bridging Hindi classrooms to indigenous Santhali, Ho, and Mundari mother tongues on
          low-cost school tablets with zero internet.
        </Text>
      </View>

      {/* Cultural Script Ribbon */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.marqueeRow}
      >
        {culturalPills.map((pill, i) => (
          <TouchableOpacity
            key={i}
            style={styles.marqueePill}
            onPress={() => speakNative(pill.meaning.split(" ")[0])}
            activeOpacity={0.7}
          >
            <Text style={styles.marqueeScript}>{pill.word}</Text>
            <Text style={styles.marqueeMeaning}>{pill.meaning}</Text>
            <Volume2 size={12} color={Colors.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Language Holographic Selector Cards */}
      <View style={styles.sectionHeader}>
        <Globe2 size={18} color={Colors.terracotta} />
        <Text style={styles.sectionTitle}>Select Classroom Mother Tongue</Text>
      </View>

      <View style={styles.langCardsRow}>
        {languages.map((l) => {
          const isSelected = lang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.langCard, isSelected && styles.langCardSelected]}
              onPress={() => setLang(l.code as LangCode)}
              activeOpacity={0.8}
            >
              <View style={styles.langCardHeader}>
                <Text style={[styles.langNative, isSelected && styles.langNativeSelected]}>
                  {l.nativeName}
                </Text>
                {isSelected && (
                  <View style={styles.activeDot}>
                    <View style={styles.activeDotInner} />
                  </View>
                )}
              </View>
              <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                {l.name}
              </Text>
              <Text style={styles.langScript}>Script: {l.script}</Text>
              <Text style={styles.langSpeakers}>{l.speakers} speakers</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Language Status Banner */}
      <View style={styles.activeBanner}>
        <View style={styles.activeBannerLeft}>
          <Text style={styles.activeBannerTitle}>Active Target: {meta.name}</Text>
          <Text style={styles.activeBannerSubtitle}>
            Native Script: {meta.nativeName} ({meta.script}) • Instant Edge Audio
          </Text>
        </View>
        <TouchableOpacity
          style={styles.activeBannerBtn}
          onPress={() => speakNative(meta.name)}
        >
          <Volume2 size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quick Access Tools Grid */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
        Complete Teaching Suite
      </Text>

      {/* Tool 1: Live Dialogue */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate("Live")}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconBox, { backgroundColor: "#FCEEEA" }]}>
          <Mic size={24} color={Colors.terracotta} />
        </View>
        <View style={styles.toolContent}>
          <View style={styles.toolTopRow}>
            <Text style={styles.toolTitle}>Live Classroom Dialogue</Text>
            <View style={styles.latencyBadge}>
              <Zap size={11} color={Colors.salGreen} />
              <Text style={styles.latencyText}>0.8ms</Text>
            </View>
          </View>
          <Text style={styles.toolDesc}>
            Teacher speaks Hindi; students hear tribal mother tongue through tablet speaker.
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Tool 2: Camera OCR */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate("Translate")}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconBox, { backgroundColor: "#EBF3EA" }]}>
          <Camera size={24} color={Colors.salGreen} />
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>Blackboard & Notes OCR</Text>
          <Text style={styles.toolDesc}>
            Scan blackboard chalk notes and textbooks to generate dual-script translations.
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Tool 3: Bilingual Worksheets */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate("Worksheets")}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconBox, { backgroundColor: "#FEF3C7" }]}>
          <FileSpreadsheet size={24} color={Colors.accentGold} />
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>Bilingual Worksheets & Flashcards</Text>
          <Text style={styles.toolDesc}>
            Printable NIPUN matching & tracing activity sheets with PDF print & share.
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Tool 4: Offline Lesson Library */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate("Library")}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconBox, { backgroundColor: "#ECEFF5" }]}>
          <BookOpen size={24} color={Colors.deepIndigo} />
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>Offline Lesson Library (SQLite)</Text>
          <Text style={styles.toolDesc}>
            16 NIPUN lessons cached locally in SQLite. Teach the whole term with no internet.
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Tool 5: Progress Analytics */}
      <TouchableOpacity
        style={styles.toolCard}
        onPress={() => navigation.navigate("Progress")}
        activeOpacity={0.8}
      >
        <View style={[styles.toolIconBox, { backgroundColor: "#F3E8FF" }]}>
          <BarChart3 size={24} color="#7C3AED" />
        </View>
        <View style={styles.toolContent}>
          <Text style={styles.toolTitle}>Classroom FLN Progress</Text>
          <Text style={styles.toolDesc}>
            District-wise retention analytics for Dumka, Chaibasa, and Khunti primary schools.
          </Text>
        </View>
        <ArrowRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  flnBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.terracottaLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F5C8BA",
  },
  flnBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.terracotta,
  },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C5E3C1",
  },
  offlineBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.salGreen,
  },
  heroSection: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroSubHindi: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.terracotta,
    marginTop: 2,
  },
  heroDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 6,
  },
  marqueeRow: {
    gap: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  marqueePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  marqueeScript: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginRight: 6,
  },
  marqueeMeaning: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  langCardsRow: {
    flexDirection: "row",
    gap: 10,
  },
  langCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  langCardSelected: {
    borderColor: Colors.terracotta,
    backgroundColor: "#FFFAF8",
  },
  langCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  langNative: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.deepIndigo,
  },
  langNativeSelected: {
    color: Colors.terracotta,
  },
  activeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.terracottaLight,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.terracotta,
  },
  langName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  langNameSelected: {
    color: Colors.terracottaDark,
  },
  langScript: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  langSpeakers: {
    fontSize: 9,
    color: Colors.textLight,
    marginTop: 1,
  },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.deepIndigo,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
  },
  activeBannerLeft: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  activeBannerSubtitle: {
    fontSize: 11,
    color: "#CBD5E1",
    marginTop: 2,
  },
  activeBannerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  toolIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  toolContent: {
    flex: 1,
  },
  toolTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
  },
  latencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  latencyText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.salGreen,
  },
  toolDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
});
