import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import {
  Mic,
  MicOff,
  Volume2,
  Zap,
  Sparkles,
  History,
  RotateCcw,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";

export function LiveDialogueScreen() {
  const { lang, meta } = useLanguage();
  const [inputText, setInputText] = useState("गिनती सीखो");
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [history, setHistory] = useState<
    { hindi: string; native: string; roman: string; timestamp: string }[]
  >([]);

  // Soundwave animation bars
  const barAnim1 = useRef(new Animated.Value(10)).current;
  const barAnim2 = useRef(new Animated.Value(25)).current;
  const barAnim3 = useRef(new Animated.Value(18)).current;
  const barAnim4 = useRef(new Animated.Value(30)).current;
  const barAnim5 = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    // Initial translation
    handleTranslate(inputText);
  }, [lang]);

  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isListening) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 35, duration: 250, useNativeDriver: false }),
            Animated.timing(barAnim1, { toValue: 8, duration: 250, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: 45, duration: 200, useNativeDriver: false }),
            Animated.timing(barAnim2, { toValue: 12, duration: 200, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: 40, duration: 280, useNativeDriver: false }),
            Animated.timing(barAnim3, { toValue: 15, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: 50, duration: 220, useNativeDriver: false }),
            Animated.timing(barAnim4, { toValue: 10, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: 32, duration: 260, useNativeDriver: false }),
            Animated.timing(barAnim5, { toValue: 8, duration: 260, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();
    } else {
      barAnim1.setValue(10);
      barAnim2.setValue(16);
      barAnim3.setValue(12);
      barAnim4.setValue(18);
      barAnim5.setValue(10);
    }

    return () => {
      if (animLoop) animLoop.stop();
    };
  }, [isListening]);

  const handleTranslate = (text: string) => {
    if (!text || !text.trim()) return;
    const res = translate(text, lang);
    setResult(res);

    // Save to SQLite progress
    logProgressEvent("speech", lang, res.tokens.length, text);

    // Add to visual history
    setHistory((prev) => [
      {
        hindi: text,
        native: res.native,
        roman: res.roman,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate real classroom mic input recognition turnaround
      setTimeout(() => {
        setIsListening(false);
        const presets = [
          "सब बच्चे बैठ जाओ",
          "किताब खोलो और पढ़ो",
          "खाना खाओ और पानी पियो",
          "तुमने आज क्या सीखा",
          "एक दो तीन चार पाँच",
        ];
        const nextPhrase = presets[Math.floor(Math.random() * presets.length)]!;
        setInputText(nextPhrase);
        handleTranslate(nextPhrase);
        speakNative(translate(nextPhrase, lang).roman, meta.ttsLocale);
      }, 1800);
    }
  };

  const quickPrompts = [
    "नमस्ते बच्चों",
    "किताब खोलो और पढ़ो",
    "गिनती सीखो",
    "खाना खाओ और पानी पियो",
    "सब बच्चे बैठ जाओ",
    "तुमने आज क्या सीखा",
    "हाथ साफ करो",
    "चित्र देखो और बोलो",
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Live Classroom Dialogue</Text>
          <Text style={styles.subtitle}>
            Teacher speaks Hindi ➔ Tablet outputs {meta.name} ({meta.script})
          </Text>
        </View>
        <View style={styles.latencyBadge}>
          <Zap size={12} color={Colors.salGreen} />
          <Text style={styles.latencyText}>0.8ms offline</Text>
        </View>
      </View>

      {/* Voice & Soundwave Equalizer Box */}
      <View style={styles.micSection}>
        <View style={styles.equalizerRow}>
          <Animated.View style={[styles.eqBar, { height: barAnim1 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim2 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim3 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim4 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim5 }]} />
        </View>

        <TouchableOpacity
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          onPress={handleMicToggle}
          activeOpacity={0.85}
        >
          {isListening ? (
            <Mic size={36} color="#FFFFFF" />
          ) : (
            <Mic size={36} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <Text style={styles.micStatusText}>
          {isListening
            ? "Listening to Teacher's Hindi speech…"
            : "Tap microphone to speak Hindi orally"}
        </Text>
      </View>

      {/* Manual Input or Edited Speech Box */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type or speak classroom instruction in Hindi…"
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={() => handleTranslate(inputText)}
        />
        <TouchableOpacity
          style={styles.translateBtn}
          onPress={() => {
            handleTranslate(inputText);
            if (result) speakNative(result.roman, meta.ttsLocale);
          }}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.translateBtnText}>Translate</Text>
        </TouchableOpacity>
      </View>

      {/* Dual Script Output Card */}
      {result && (
        <View style={styles.outputCard}>
          <View style={styles.outputTopRow}>
            <Text style={styles.sourceHindiLabel}>HINDI SOURCE</Text>
            <View style={styles.nativeBadge}>
              <Text style={styles.nativeBadgeText}>{meta.name.toUpperCase()} • {meta.script}</Text>
            </View>
          </View>
          <Text style={styles.sourceHindiText}>{inputText}</Text>

          <View style={styles.divider} />

          <Text style={styles.targetNativeLabel}>AUTHENTIC MOTHER TONGUE SCRIPT</Text>
          <Text style={styles.targetNativeText}>{result.native}</Text>

          <Text style={styles.romanLabel}>PRONUNCIATION GUIDE FOR TEACHER</Text>
          <Text style={styles.romanText}>{result.roman}</Text>

          {/* Action Row */}
          <View style={styles.outputActionRow}>
            <TouchableOpacity
              style={styles.speakBtn}
              onPress={() => speakNative(result.roman, meta.ttsLocale)}
            >
              <Volume2 size={18} color="#FFFFFF" />
              <Text style={styles.speakBtnText}>Speak Native Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.repeatBtn}
              onPress={() => speakNative(result.roman, meta.ttsLocale)}
            >
              <RotateCcw size={16} color={Colors.deepIndigo} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick Classroom Instruction Chips */}
      <Text style={styles.quickTitle}>Quick Classroom Commands (Tap to Speak):</Text>
      <View style={styles.chipsRow}>
        {quickPrompts.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => {
              setInputText(p);
              handleTranslate(p);
              const r = translate(p, lang);
              speakNative(r.roman, meta.ttsLocale);
            }}
          >
            <Text style={styles.chipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Session History Log */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <History size={16} color={Colors.textMuted} />
            <Text style={styles.historyTitle}>Recent Classroom Turns</Text>
          </View>
          {history.map((h, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={styles.historyTopRow}>
                <Text style={styles.historyHindi}>{h.hindi}</Text>
                <Text style={styles.historyTime}>{h.timestamp}</Text>
              </View>
              <Text style={styles.historyNative}>{h.native}</Text>
              <View style={styles.historyBottomRow}>
                <Text style={styles.historyRoman}>{h.roman}</Text>
                <TouchableOpacity onPress={() => speakNative(h.roman, meta.ttsLocale)}>
                  <Volume2 size={14} color={Colors.terracotta} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
  latencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  latencyText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.salGreen,
  },
  micSection: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  equalizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 50,
    marginBottom: 12,
  },
  eqBar: {
    width: 6,
    backgroundColor: Colors.terracotta,
    borderRadius: 4,
  },
  micBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  micBtnActive: {
    backgroundColor: Colors.destructive,
    transform: [{ scale: 1.05 }],
  },
  micStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 12,
  },
  inputBox: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
  },
  translateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  translateBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  outputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.terracottaLight,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  outputTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceHindiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  nativeBadge: {
    backgroundColor: Colors.deepIndigoLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nativeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.deepIndigo,
  },
  sourceHindiText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  targetNativeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.terracotta,
    letterSpacing: 0.5,
  },
  targetNativeText: {
    fontSize: 26,
    fontWeight: "900",
    color: Colors.deepIndigo,
    marginTop: 4,
    lineHeight: 34,
  },
  romanLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  romanText: {
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
    color: Colors.text,
    marginTop: 2,
  },
  outputActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  speakBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    borderRadius: 12,
  },
  speakBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  repeatBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  historySection: {
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textMuted,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyHindi: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  historyTime: {
    fontSize: 10,
    color: Colors.textLight,
  },
  historyNative: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginTop: 4,
  },
  historyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  historyRoman: {
    fontSize: 11,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
});
