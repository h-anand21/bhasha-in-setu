import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
} from "react-native";
import {
  Mic,
  Volume2,
  Zap,
  Sparkles,
  History,
  RotateCcw,
  X,
  Keyboard as KeyboardIcon,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";

export function LiveDialogueScreen() {
  const { lang, meta } = useLanguage();
  const [inputText, setInputText] = useState("नमस्ते बच्चों");
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [history, setHistory] = useState<
    { hindi: string; native: string; roman: string; timestamp: string }[]
  >([]);

  const inputRef = useRef<TextInput>(null);

  // Soundwave animation bars
  const barAnim1 = useRef(new Animated.Value(10)).current;
  const barAnim2 = useRef(new Animated.Value(20)).current;
  const barAnim3 = useRef(new Animated.Value(14)).current;
  const barAnim4 = useRef(new Animated.Value(24)).current;
  const barAnim5 = useRef(new Animated.Value(12)).current;

  // Real-time live translate whenever input text or language changes
  useEffect(() => {
    if (inputText.trim()) {
      const res = translate(inputText, lang);
      setResult(res);
    } else {
      setResult(null);
    }
  }, [inputText, lang]);

  // Soundwave animation when typing or voice input is active
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isListening || inputText.trim().length > 0) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 32, duration: 250, useNativeDriver: false }),
            Animated.timing(barAnim1, { toValue: 8, duration: 250, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: 44, duration: 200, useNativeDriver: false }),
            Animated.timing(barAnim2, { toValue: 12, duration: 200, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: 38, duration: 280, useNativeDriver: false }),
            Animated.timing(barAnim3, { toValue: 14, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: 48, duration: 220, useNativeDriver: false }),
            Animated.timing(barAnim4, { toValue: 10, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: 30, duration: 260, useNativeDriver: false }),
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
  }, [isListening, inputText]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setResult(null);
      return;
    }

    // Instant local inference (<0.8ms)
    const res = translate(text, lang);
    setResult(res);

    // Save to SQLite
    logProgressEvent("speech", lang, res.tokens.length, text);
  };

  const handleSpeakAudio = () => {
    if (result && result.roman) {
      speakNative(result.roman, meta.ttsLocale);

      // Add to session history only when teacher actively delivers/speaks the phrase
      setHistory((prev) => [
        {
          hindi: inputText,
          native: result.native,
          roman: result.roman,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev.filter((h) => h.hindi !== inputText).slice(0, 8),
      ]);
    }
  };

  const handleMicPress = () => {
    setIsListening(true);
    // Focus keyboard so user can use the native mic on Gboard / mobile keyboard
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setIsListening(false);
  };

  const quickPrompts = [
    "नमस्ते बच्चों",
    "किताब खोलो और पढ़ो",
    "खाना खाओ और पानी पियो",
    "गिनती सीखो",
    "सब बच्चे बैठ जाओ",
    "तुमने आज क्या सीखा",
    "हाथ साफ करो",
    "सूरज निकला सुबह हुई",
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Live Classroom Dialogue</Text>
          <Text style={styles.subtitle}>
            Speak Hindi ➔ Live Native {meta.name} ({meta.script})
          </Text>
        </View>
        <View style={styles.latencyBadge}>
          <Zap size={11} color={Colors.salGreen} />
          <Text style={styles.latencyText}>0.8ms local</Text>
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
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          <Mic size={36} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.micStatusTitle}>
          {isListening ? "Voice Input Ready" : "Tap Mic to Speak in Hindi"}
        </Text>
        <Text style={styles.micHintText}>
          💡 Mobile keyboard open hone par keyboard ke 🎙️ mic icon par bolen — live translate hoga!
        </Text>
      </View>

      {/* Real-time Voice & Text Input Box */}
      <View style={styles.inputContainer}>
        <View style={styles.inputLabelRow}>
          <Text style={styles.inputLabel}>TEACHER'S HINDI SPEECH / INPUT:</Text>
          {inputText.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.clearBadge}>
                <X size={12} color={Colors.destructive} />
                <Text style={styles.clearText}>Clear</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputBox}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Aap jo bolenge ya likhenge, wahi exact translate hoga..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={2}
            onFocus={() => setIsListening(true)}
            onBlur={() => setIsListening(false)}
          />
        </View>
      </View>

      {/* Dual Script Output Card */}
      {result && result.native.length > 0 ? (
        <View style={styles.outputCard}>
          <View style={styles.outputTopRow}>
            <Text style={styles.sourceHindiLabel}>YOUR SPOKEN PHRASE (HINDI)</Text>
            <View style={styles.nativeBadge}>
              <Text style={styles.nativeBadgeText}>
                {meta.name.toUpperCase()} • {meta.script}
              </Text>
            </View>
          </View>

          <Text style={styles.sourceHindiText}>{inputText}</Text>

          <View style={styles.divider} />

          <Text style={styles.targetNativeLabel}>
            AUTHENTIC TRIBAL SCRIPT ({meta.script})
          </Text>
          <Text style={styles.targetNativeText}>{result.native}</Text>

          <Text style={styles.romanLabel}>ROMANIZED PRONUNCIATION GUIDE FOR TEACHER</Text>
          <Text style={styles.romanText}>{result.roman}</Text>

          {/* Action Row */}
          <View style={styles.outputActionRow}>
            <TouchableOpacity
              style={styles.speakBtn}
              onPress={handleSpeakAudio}
              activeOpacity={0.8}
            >
              <Volume2 size={20} color="#FFFFFF" />
              <Text style={styles.speakBtnText}>🔊 Speak in {meta.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.repeatBtn}
              onPress={handleSpeakAudio}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color={Colors.deepIndigo} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Quick Classroom Instruction Chips (Optional Presets) */}
      <Text style={styles.quickTitle}>Quick Classroom Commands (Tap to Use):</Text>
      <View style={styles.chipsRow}>
        {quickPrompts.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.chip}
            onPress={() => {
              setInputText(p);
              handleTextChange(p);
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
            <Text style={styles.historyTitle}>Spoken Sentences History</Text>
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
                  <Volume2 size={15} color={Colors.terracotta} />
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
    marginBottom: 14,
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
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  equalizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 44,
    marginBottom: 10,
  },
  eqBar: {
    width: 6,
    backgroundColor: Colors.terracotta,
    borderRadius: 4,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    backgroundColor: Colors.salGreen,
    transform: [{ scale: 1.05 }],
  },
  micStatusTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 10,
  },
  micHintText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 12,
    lineHeight: 15,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  inputLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
  },
  clearBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.destructiveLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clearText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.destructive,
  },
  inputBox: {
    backgroundColor: Colors.sand,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textInput: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "600",
    minHeight: 46,
    textAlignVertical: "top",
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
