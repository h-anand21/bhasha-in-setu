import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Printer,
  Volume2,
  Sparkles,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import {
  FLASHCARD_SETS,
  SAMPLE_LESSONS,
  EMOJI_FOR,
} from "../lib/lexicon";
import { translate, translateWord } from "../lib/translate";
import { speakNative } from "../services/speech";
import { generateAndShareWorksheetPDF } from "../services/pdf";
import { logProgressEvent } from "../services/database";

export function WorksheetsScreen() {
  const { lang, meta } = useLanguage();
  const [selectedTopicId, setSelectedTopicId] = useState(FLASHCARD_SETS[0]!.id);
  const [selectedLessonId, setSelectedLessonId] = useState(SAMPLE_LESSONS[0]!.id);
  const [isPrinting, setIsPrinting] = useState(false);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Sparkles size={12} color={Colors.terracotta} />
          <Text style={styles.badgeText}>NIPUN BHARAT FLN READY</Text>
        </View>
        <Text style={styles.title}>Bilingual Worksheets & Flashcards</Text>
        <Text style={styles.subtitle}>
          Curriculum printables in Hindi + {meta.name} ({meta.script})
        </Text>
      </View>

      {/* Action Buttons: Print PDF */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.printBtn}
          onPress={handlePrintPDF}
          disabled={isPrinting}
          activeOpacity={0.8}
        >
          <Printer size={18} color="#FFFFFF" />
          <Text style={styles.printBtnText}>
            {isPrinting ? "Generating PDF…" : "Print / Share Worksheet (PDF)"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Topic Selector Carousel */}
      <Text style={styles.sectionTitle}>Select Thematic Topic (10 Sets):</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicRow}
      >
        {FLASHCARD_SETS.map((set) => {
          const isSelected = set.id === selectedTopicId;
          return (
            <TouchableOpacity
              key={set.id}
              style={[styles.topicPill, isSelected && styles.topicPillSelected]}
              onPress={() => setSelectedTopicId(set.id)}
            >
              <Text style={[styles.topicPillText, isSelected && styles.topicPillTextSelected]}>
                {set.labelEn} ({set.label})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lesson Selector Carousel */}
      <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Select NIPUN Lesson (16 Lessons):</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicRow}
      >
        {SAMPLE_LESSONS.map((l, idx) => {
          const isSelected = l.id === selectedLessonId;
          return (
            <TouchableOpacity
              key={l.id}
              style={[styles.lessonPill, isSelected && styles.lessonPillSelected]}
              onPress={() => setSelectedLessonId(l.id)}
            >
              <Text style={[styles.lessonPillText, isSelected && styles.lessonPillTextSelected]}>
                L{idx + 1}: {l.title.replace(/^पाठ \d+ — /, "")}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section 1: Flashcards Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeading}>
          Picture Flashcards — {currentTopic.labelEn}
        </Text>
        <Text style={styles.sectionBadge}>Tap to Listen</Text>
      </View>

      <View style={styles.cardsGrid}>
        {currentTopic.words.map((word) => {
          const g = translateWord(word, lang);
          const emoji = EMOJI_FOR[word] || "🔤";
          return (
            <TouchableOpacity
              key={word}
              style={styles.flashcard}
              onPress={() => speakNative(g.roman, meta.ttsLocale)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardEmoji}>{emoji}</Text>
              <Text style={styles.cardHindi}>{word}</Text>
              <Text style={styles.cardNative}>{g.native}</Text>
              <Text style={styles.cardRoman}>({g.roman})</Text>
              <View style={styles.cardListenRow}>
                <Volume2 size={13} color={Colors.terracotta} />
                <Text style={styles.cardListenText}>Listen</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section 2: Interactive 4-Part Worksheet View */}
      <View style={styles.worksheetSheet}>
        <View style={styles.sohraiLine} />
        <View style={styles.worksheetHeader}>
          <Text style={styles.wsTitle}>
            Classroom Worksheet — {currentTopic.labelEn}
          </Text>
          <Text style={styles.wsSubtitle}>
            Languages: Hindi + {meta.name} ({meta.script}) • {currentLesson.titleEn}
          </Text>
          <Text style={styles.wsOutcomeBadge}>{currentLesson.outcomeEn}</Text>
        </View>

        {/* Part 1: Match Pairs */}
        <View style={styles.wsBlock}>
          <Text style={styles.wsBlockTitle}>
            1. Match — Join Hindi word with {meta.name} word:
          </Text>
          {currentTopic.words.slice(0, 4).map((w, idx) => {
            const trans = translateWord(w, lang);
            return (
              <View key={idx} style={styles.matchRow}>
                <View style={styles.matchLeft}>
                  <Text style={styles.matchHindi}>
                    {EMOJI_FOR[w] || "•"} {w}
                  </Text>
                  <Text style={styles.circle}>○</Text>
                </View>
                <View style={styles.matchRight}>
                  <Text style={styles.circle}>○</Text>
                  <Text style={styles.matchNative}>{trans.native}</Text>
                  <Text style={styles.matchRoman}>({trans.roman})</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Part 2: Fill in the Blanks */}
        <View style={styles.wsBlock}>
          <Text style={styles.wsBlockTitle}>
            2. Fill in the blanks — Write mother-tongue word:
          </Text>
          {currentTopic.words.slice(0, 3).map((w, i) => (
            <View key={i} style={styles.blankRow}>
              <Text style={styles.blankIndex}>{i + 1}.</Text>
              <Text style={styles.blankWord}>{w} =</Text>
              <View style={styles.dashedUnderline} />
            </View>
          ))}
        </View>

        {/* Part 3: Read and Say */}
        <View style={styles.wsBlock}>
          <Text style={styles.wsBlockTitle}>
            3. Read and say — Practice lesson sentences:
          </Text>
          {currentLesson.lines.map((line, idx) => {
            const out = translate(line, lang);
            return (
              <View key={idx} style={styles.sentenceItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sentHindi}>{line}</Text>
                  <Text style={styles.sentNative}>{out.native}</Text>
                  <Text style={styles.sentRoman}>{out.roman}</Text>
                </View>
                <TouchableOpacity
                  style={styles.sentSpeakBtn}
                  onPress={() => speakNative(out.roman, meta.ttsLocale)}
                >
                  <Volume2 size={16} color={Colors.terracotta} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
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
  header: {
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.terracottaLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.terracotta,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    marginBottom: 16,
  },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  printBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  topicRow: {
    gap: 8,
    paddingBottom: 6,
  },
  topicPill: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  topicPillSelected: {
    backgroundColor: Colors.deepIndigo,
    borderColor: Colors.deepIndigo,
  },
  topicPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  topicPillTextSelected: {
    color: "#FFFFFF",
  },
  lessonPill: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lessonPillSelected: {
    backgroundColor: Colors.salGreen,
    borderColor: Colors.salGreen,
  },
  lessonPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
  },
  lessonPillTextSelected: {
    color: "#FFFFFF",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  flashcard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  cardHindi: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  cardNative: {
    fontSize: 17,
    fontWeight: "900",
    color: Colors.deepIndigo,
    marginTop: 2,
  },
  cardRoman: {
    fontSize: 11,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  cardListenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.terracottaLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  cardListenText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.terracotta,
  },
  worksheetSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sohraiLine: {
    height: 4,
    backgroundColor: Colors.terracotta,
    borderRadius: 2,
    marginBottom: 12,
  },
  worksheetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    paddingBottom: 10,
    marginBottom: 14,
  },
  wsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },
  wsSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wsOutcomeBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.salGreen,
    marginTop: 4,
  },
  wsBlock: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.sandDark,
    paddingTop: 10,
  },
  wsBlockTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  matchLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchHindi: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  circle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  matchRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchNative: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.deepIndigo,
  },
  matchRoman: {
    fontSize: 10,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  blankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  blankIndex: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textMuted,
    marginRight: 6,
  },
  blankWord: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  dashedUnderline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textMuted,
    borderStyle: "dashed",
    marginLeft: 8,
    height: 14,
  },
  sentenceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.sand,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  sentHindi: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  sentNative: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginTop: 2,
  },
  sentRoman: {
    fontSize: 10,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  sentSpeakBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
