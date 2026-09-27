import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import {
  Printer,
  Volume2,
  Sparkles,
  ChevronRight,
  Download,
  Share2,
  Check,
  RotateCw,
  BookOpen,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { FLASHCARD_SETS, SAMPLE_LESSONS, EMOJI_FOR } from "../lib/lexicon";
import { translate, translateWord } from "../lib/translate";
import { speakNative } from "../services/speech";
import { generateAndShareWorksheetPDF } from "../services/pdf";
import { logProgressEvent } from "../services/database";
import { StatusBadge } from "../components/StatusBadge";
import { CulturalDivider } from "../components/CulturalDivider";

const { width } = Dimensions.get("window");

export function WorksheetsScreen() {
  const { lang, meta } = useLanguage();
  const [selectedTopicId, setSelectedTopicId] = useState(FLASHCARD_SETS[0]!.id);
  const [selectedLessonId, setSelectedLessonId] = useState(SAMPLE_LESSONS[0]!.id);
  const [activeTab, setActiveTab] = useState<"flashcards" | "practice" | "worksheet">("flashcards");
  const [isPrinting, setIsPrinting] = useState(false);
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);

  const currentTopic = FLASHCARD_SETS.find((t) => t.id === selectedTopicId) || FLASHCARD_SETS[0]!;
  const currentLesson = SAMPLE_LESSONS.find((l) => l.id === selectedLessonId) || SAMPLE_LESSONS[0]!;

  const handlePrintPDF = async () => {
    setIsPrinting(true);
    try {
      const matchWords = currentTopic.words.slice(0, 5).map((w) => {
        const trans = translateWord(w, lang);
        return {
          hindi: w,
          native: trans.native,
          roman: trans.roman,
          emoji: EMOJI_FOR[w] || "🔤",
        };
      });

      const lessonSentences = currentLesson.lines.map((line) => {
        const t = translate(line, lang);
        return {
          hindi: line,
          native: t.native,
          roman: t.roman,
        };
      });

      await generateAndShareWorksheetPDF({
        topicLabel: currentTopic.label,
        topicLabelEn: currentTopic.labelEn,
        langMeta: meta,
        lessonTitle: currentLesson.titleEn,
        lessonOutcome: currentLesson.outcomeEn,
        matchWords,
        fillBlanks: currentTopic.words.slice(0, 4),
        lessonSentences,
      });

      logProgressEvent("worksheet", lang, currentTopic.words.length, currentTopic.id);
    } catch (e) {
      console.warn("Print error:", e);
    } finally {
      setIsPrinting(false);
    }
  };

  const topicTemplates = [
    { title: "Animals", hi: "जानवर", icon: "🐘", desc: "Match the pairs" },
    { title: "Family", hi: "परिवार", icon: "👨‍👩‍👧‍👦", desc: "Fill in the blanks" },
    { title: "Numbers", hi: "संख्या", icon: "🔢", desc: "Count and write" },
    { title: "Colors", hi: "रंग", icon: "🎨", desc: "Identify and color" },
    { title: "Body Parts", hi: "शरीर के अंग", icon: "🖐️", desc: "Label the parts" },
    { title: "My School", hi: "मेरा स्कूल", icon: "🏫", desc: "Read and say" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Badge & Header */}
      <View style={styles.badgeRow}>
        <StatusBadge label="NIPUN BHARAT FLN READY" variant="fln" />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Bilingual Worksheets & Flashcards</Text>
          <Text style={styles.subtitle}>
            Create and practice worksheets in Hindi and {meta.name} ({meta.script}) for foundational
            learning.
          </Text>
        </View>
        <View style={styles.headerIconBox}>
          <Text style={{ fontSize: 32 }}>📚</Text>
        </View>
      </View>

      {/* Primary CTA: Print / Share PDF */}
      <TouchableOpacity
        style={styles.printCtaBtn}
        onPress={handlePrintPDF}
        disabled={isPrinting}
        activeOpacity={0.88}
      >
        <Printer size={20} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.printCtaText}>
          {isPrinting ? "Generating PDF..." : "Print / Share Worksheet (PDF)"}
        </Text>
        <ChevronRight size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Section 1: Choose Thematic Topic */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
        <Text style={styles.sectionTitle}>Choose Topic</Text>
        <TouchableOpacity style={{ marginLeft: "auto" }}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicCarousel}
      >
        {FLASHCARD_SETS.map((set) => {
          const isSelected = set.id === selectedTopicId;
          const firstWord = set.words[0] || "";
          const emoji = EMOJI_FOR[firstWord] || "📖";
          return (
            <TouchableOpacity
              key={set.id}
              style={[styles.topicCard, isSelected && styles.topicCardSelected]}
              onPress={() => setSelectedTopicId(set.id)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 26, marginBottom: 4 }}>{emoji}</Text>
              <Text style={[styles.topicCardTitle, isSelected && styles.topicCardTitleSelected]}>
                {set.labelEn}
              </Text>
              <Text style={styles.topicCardSub}>({set.label})</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section 2: Select Lesson (NIPUN Bharat) */}
      <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>2</Text>
        </View>
        <Text style={styles.sectionTitle}>Select Lesson (NIPUN Bharat)</Text>
        <TouchableOpacity style={{ marginLeft: "auto" }}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.lessonCarousel}
      >
        {SAMPLE_LESSONS.map((l, idx) => {
          const isSelected = l.id === selectedLessonId;
          return (
            <TouchableOpacity
              key={l.id}
              style={[styles.lessonCard, isSelected && styles.lessonCardSelected]}
              onPress={() => setSelectedLessonId(l.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.lessonCardNum, isSelected && styles.lessonCardNumSelected]}>
                L{idx + 1}
              </Text>
              <Text
                style={[styles.lessonCardTitle, isSelected && styles.lessonCardTitleSelected]}
                numberOfLines={1}
              >
                {l.titleEn}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section 3: Flashcards Preview */}
      <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>3</Text>
        </View>
        <Text style={styles.sectionTitle}>Flashcards Preview</Text>
        <TouchableOpacity style={{ marginLeft: "auto" }}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flashcardsGrid}>
        {currentTopic.words.map((word, idx) => {
          const g = translateWord(word, lang);
          const emoji = EMOJI_FOR[word] || "🔤";
          const isFlipped = flippedCardIndex === idx;

          return (
            <TouchableOpacity
              key={word}
              style={[styles.flashcardItem, isFlipped && styles.flashcardItemFlipped]}
              onPress={() => {
                setFlippedCardIndex(isFlipped ? null : idx);
                speakNative(g.roman, meta.ttsLocale);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.flashcardEmoji}>{emoji}</Text>
              <Text style={styles.flashcardHindi}>{word}</Text>
              <Text style={styles.flashcardNative}>{g.native}</Text>
              <Text style={styles.flashcardRoman}>{g.roman}</Text>

              <View style={styles.cardSpeakerBtn}>
                <Volume2 size={13} color={Colors.primaryForest} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section 4: A4 Printable Worksheet Preview */}
      <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
        <Text style={styles.sectionTitle}>Printable Worksheet Preview</Text>
        <TouchableOpacity onPress={handlePrintPDF}>
          <Text style={styles.seeAllText}>View / Print →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.a4WorksheetPaper}>
        {/* Sohrai-inspired geometric border top */}
        <CulturalDivider color="#D9A441" height={16} />

        <View style={styles.wsHeader}>
          <Text style={styles.wsHeaderTitle}>
            {currentTopic.label} ({currentTopic.labelEn})
          </Text>
          <Text style={styles.wsHeaderSub}>
            {currentTopic.labelEn} • Bilingual Worksheet • {meta.name}
          </Text>
          <View style={styles.wsMetadataRow}>
            <Text style={styles.wsMetaText}>नाम (Name): ___________</Text>
            <Text style={styles.wsMetaText}>कक्षा (Class): ___</Text>
            <Text style={styles.wsMetaText}>तिथि (Date): _______</Text>
          </View>
        </View>

        {/* 1. Match the Pairs */}
        <View style={styles.wsExerciseBlock}>
          <Text style={styles.wsExerciseTitle}>1. मिलान करो (Match the Pairs)</Text>
          {currentTopic.words.slice(0, 4).map((w, idx) => {
            const trans = translateWord(w, lang);
            return (
              <View key={idx} style={styles.wsMatchRow}>
                <Text style={styles.wsMatchLeft}>
                  {w} ({EMOJI_FOR[w] || "•"})
                </Text>
                <Text style={styles.wsDot}>•</Text>
                <Text style={styles.wsDot}>•</Text>
                <Text style={styles.wsMatchRight}>
                  {trans.native} ({trans.roman})
                </Text>
              </View>
            );
          })}
        </View>

        {/* 2. Fill in the Blanks */}
        <View style={styles.wsExerciseBlock}>
          <Text style={styles.wsExerciseTitle}>2. रिक्त स्थान भरो (Fill in the Blanks)</Text>
          <Text style={styles.wsBlankLine}>(क) यह एक _________ है।</Text>
          <Text style={styles.wsBlankLine}>(ख) _________ जंगल में रहता है।</Text>
          <Text style={styles.wsBlankLine}>(ग) _________ हमारे घर का जानवर है।</Text>
        </View>

        {/* 3. Read and Say */}
        <View style={styles.wsExerciseBlock}>
          <Text style={styles.wsExerciseTitle}>3. पढ़ो और बोलो (Read and Say)</Text>
          {currentLesson.lines.slice(0, 2).map((l, i) => {
            const out = translate(l, lang);
            return (
              <View key={i} style={styles.wsSentenceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wsSentHindi}>{l}</Text>
                  <Text style={styles.wsSentNative}>{out.native}</Text>
                </View>
                <TouchableOpacity
                  style={styles.wsSentAudio}
                  onPress={() => speakNative(out.roman, meta.ttsLocale)}
                >
                  <Volume2 size={14} color={Colors.primaryForest} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Bottom Actions for Worksheet */}
        <View style={styles.wsBottomActions}>
          <TouchableOpacity
            style={styles.wsDownloadBtn}
            onPress={handlePrintPDF}
            activeOpacity={0.8}
          >
            <Download size={16} color={Colors.primaryForest} />
            <Text style={styles.wsDownloadText}>Download PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.wsShareBtn} onPress={handlePrintPDF} activeOpacity={0.8}>
            <Printer size={16} color="#FFFFFF" />
            <Text style={styles.wsShareText}>Print / Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 5: Worksheet Templates */}
      <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Worksheet Templates</Text>
        <Text style={styles.sectionSubtitle}>Choose a pre-designed template</Text>
      </View>

      <View style={styles.templateGrid}>
        {topicTemplates.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.templateCard}
            onPress={handlePrintPDF}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 30, marginBottom: 4 }}>{item.icon}</Text>
            <Text style={styles.templateTitle}>{item.title}</Text>
            <Text style={styles.templateDesc}>{item.desc}</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1C7",
    alignItems: "center",
    justifyContent: "center",
  },
  printCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.warmOrange,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: Colors.warmOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  printCtaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  stepBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  topicCarousel: {
    gap: 10,
    paddingBottom: 4,
  },
  topicCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 90,
  },
  topicCardSelected: {
    borderColor: Colors.primaryForest,
    backgroundColor: "#F4FAF6",
  },
  topicCardTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.text,
  },
  topicCardTitleSelected: {
    color: Colors.primaryForest,
  },
  topicCardSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  lessonCarousel: {
    gap: 8,
    paddingBottom: 4,
  },
  lessonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    minWidth: 80,
  },
  lessonCardSelected: {
    backgroundColor: Colors.primaryForest,
    borderColor: Colors.primaryForest,
  },
  lessonCardNum: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  lessonCardNumSelected: {
    color: "#FFFFFF",
  },
  lessonCardTitle: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  lessonCardTitleSelected: {
    color: "#E8F2EC",
  },
  flashcardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  flashcardItem: {
    width: (width - 40) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  flashcardItemFlipped: {
    borderColor: Colors.primaryForest,
    backgroundColor: "#F4FAF6",
  },
  flashcardEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  flashcardHindi: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  flashcardNative: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.primaryForest,
    marginTop: 2,
  },
  flashcardRoman: {
    fontSize: 11,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  cardSpeakerBtn: {
    marginTop: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  a4WorksheetPaper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E0D6",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  wsHeader: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  wsHeaderTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  wsHeaderSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wsMetadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
  },
  wsMetaText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  wsExerciseBlock: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FAF7F0",
  },
  wsExerciseTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  wsMatchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  wsMatchLeft: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    width: "35%",
  },
  wsDot: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  wsMatchRight: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primaryForest,
    width: "45%",
    textAlign: "right",
  },
  wsBlankLine: {
    fontSize: 11.5,
    color: Colors.text,
    paddingVertical: 4,
  },
  wsSentenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  wsSentHindi: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  wsSentNative: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primaryForest,
    marginTop: 2,
  },
  wsSentAudio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  wsBottomActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  wsDownloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.lightGreen,
    paddingVertical: 10,
    borderRadius: 10,
  },
  wsDownloadText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  wsShareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primaryForest,
    paddingVertical: 10,
    borderRadius: 10,
  },
  wsShareText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  templateCard: {
    width: (width - 42) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
  templateDesc: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
