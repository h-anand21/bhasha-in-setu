import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Switch,
  Keyboard,
} from "react-native";
import {
  Mic,
  Volume2,
  Zap,
  Sparkles,
  Trash2,
  RotateCcw,
  Check,
  Radio,
  BookOpen,
  Send,
  Info,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";

type Turn = {
  id: number;
  hindi: string;
  native: string;
  roman: string;
  timestamp: string;
  ms: number;
};

export function LiveDialogueScreen() {
  const { lang, setLang, meta, languages } = useLanguage();

  // Input & state
  const [inputText, setInputText] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputLang, setInputLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [activeCategory, setActiveCategory] = useState<"classroom" | "daily" | "numbers">("classroom");

  // Turns stream
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 1,
      hindi: "नमस्ते बच्चों",
      native: translate("नमस्ते बच्चों", lang).native,
      roman: translate("नमस्ते बच्चों", lang).roman,
      timestamp: "Just now",
      ms: 1,
    },
  ]);

  const inputRef = useRef<TextInput>(null);
  const langRef = useRef(lang);
  langRef.current = lang;
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;

  // Soundwave animation
  const barAnim1 = useRef(new Animated.Value(10)).current;
  const barAnim2 = useRef(new Animated.Value(20)).current;
  const barAnim3 = useRef(new Animated.Value(14)).current;
  const barAnim4 = useRef(new Animated.Value(24)).current;
  const barAnim5 = useRef(new Animated.Value(12)).current;

  // Re-translate all existing turns when target tribal language changes
  useEffect(() => {
    setTurns((prev) =>
      prev.map((t) => {
        const res = translate(t.hindi, lang);
        return {
          ...t,
          native: res.native,
          roman: res.roman,
        };
      })
    );
  }, [lang]);

  // Soundwave animation when typing or voice mode is active
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isVoiceActive || inputText.trim().length > 0) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 44, duration: 250, useNativeDriver: false }),
            Animated.timing(barAnim1, { toValue: 8, duration: 250, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: 56, duration: 200, useNativeDriver: false }),
            Animated.timing(barAnim2, { toValue: 12, duration: 200, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: 50, duration: 280, useNativeDriver: false }),
            Animated.timing(barAnim3, { toValue: 14, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: 58, duration: 220, useNativeDriver: false }),
            Animated.timing(barAnim4, { toValue: 10, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: 40, duration: 260, useNativeDriver: false }),
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
  }, [isVoiceActive, inputText]);

  // Push phrase into the dialogue stream and play audio
  const pushTurn = (spokenPhrase: string) => {
    if (!spokenPhrase.trim()) return;
    const t0 = Date.now();
    const currentLangCode = langRef.current;
    const res = translate(spokenPhrase.trim(), currentLangCode);
    const ms = Math.max(1, Date.now() - t0);

    const newTurn: Turn = {
      id: Date.now() + Math.random(),
      hindi: spokenPhrase.trim(),
      native: res.native,
      roman: res.roman,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      ms,
    };

    setTurns((prev) => [newTurn, ...prev.filter((t) => t.hindi !== spokenPhrase.trim()).slice(0, 20)]);

    // Save to SQLite
    logProgressEvent("speech", currentLangCode, res.tokens.length, spokenPhrase.trim());

    // Auto-broadcast voice audio out loud if enabled
    if (autoSpeakRef.current && res.roman) {
      speakNative(res.roman, meta.ttsLocale);
    }
  };

  // Handle Voice Dictation Activation
  const handleMicPress = () => {
    setIsVoiceActive(true);
    inputRef.current?.focus();
  };

  // Real-time text change (as user speaks via keyboard mic or types)
  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  // When user finishes sentence (presses return or submit)
  const handleSubmitSentence = () => {
    if (inputText.trim()) {
      pushTurn(inputText.trim());
      setInputText("");
    }
  };

  // Categories of instant classroom commands
  const classroomPrompts = [
    "नमस्ते बच्चों",
    "सब बच्चे बैठ जाओ",
    "किताब खोलो और पढ़ो",
    "ध्यान से सुनो",
    "अपनी जगह पर जाओ",
    "तुमने आज क्या सीखा",
  ];

  const numbersPrompts = [
    "गिनती एक से दस सीखो",
    "एक दो तीन चार पाँच",
    "छह सात आठ नौ दस",
    "कितने बच्चे आए हैं",
  ];

  const dailyPrompts = [
    "सूरज निकला सुबह हुई",
    "हाथ साफ करो",
    "साफ पानी पियो",
    "खाना खाओ",
    "गाँव और हमारा स्कूल",
  ];

  const activePromptList =
    activeCategory === "classroom"
      ? classroomPrompts
      : activeCategory === "numbers"
      ? numbersPrompts
      : dailyPrompts;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Radio size={12} color={Colors.salGreen} />
          <Text style={styles.badgeText}>3D ACOUSTIC CLASSROOM BRIDGE</Text>
        </View>
        <Text style={styles.title}>Live Classroom Dialogue</Text>
        <Text style={styles.subtitle}>
          Speak Hindi ➔ Live Native{" "}
          <Text style={styles.targetLangHighlight}>
            {meta.name} ({meta.nativeName})
          </Text>{" "}
          voice broadcast.
        </Text>
      </View>

      {/* Target Language Switcher Bar (Mirrored from Web LangPicker) */}
      <View style={styles.langPickerCard}>
        <Text style={styles.sectionLabel}>TARGET TRIBAL LANGUAGE:</Text>
        <View style={styles.langTabsRow}>
          {languages.map((l) => {
            const isSelected = lang === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[styles.langTab, isSelected && styles.langTabActive]}
                onPress={() => setLang(l.code)}
                activeOpacity={0.8}
              >
                <View style={styles.langTabInner}>
                  <Text style={[styles.langName, isSelected && styles.langNameActive]}>
                    {l.name}
                  </Text>
                  <Text style={[styles.langNative, isSelected && styles.langNativeActive]}>
                    {l.nativeName} ({l.script})
                  </Text>
                </View>
                {isSelected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Teacher speaks Hindi / English Toggle */}
          <View style={styles.inputLangToggle}>
            <TouchableOpacity
              style={[styles.inputLangBtn, inputLang === "hi-IN" && styles.inputLangBtnActive]}
              onPress={() => setInputLang("hi-IN")}
            >
              <Text
                style={[styles.inputLangBtnText, inputLang === "hi-IN" && styles.inputLangBtnTextActive]}
              >
                Hindi (हिंदी)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputLangBtn, inputLang === "en-IN" && styles.inputLangBtnActive]}
              onPress={() => setInputLang("en-IN")}
            >
              <Text
                style={[styles.inputLangBtnText, inputLang === "en-IN" && styles.inputLangBtnTextActive]}
              >
                English
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auto Broadcast Audio Toggle */}
          <View style={styles.autoBroadcastBox}>
            <Text style={styles.autoBroadcastLabel}>Auto-voice:</Text>
            <Switch
              value={autoSpeak}
              onValueChange={setAutoSpeak}
              trackColor={{ false: "#D1D5DB", true: Colors.salGreen }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Voice Dictation Stage */}
      <View style={[styles.micStage, isVoiceActive && styles.micStageActive]}>
        {/* Equalizer Soundwave Bars */}
        <View style={styles.equalizerRow}>
          <Animated.View style={[styles.eqBar, { height: barAnim1 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim2 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim3 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim4 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim5 }]} />
        </View>

        {/* Big Mic Button */}
        <TouchableOpacity
          style={styles.micButton}
          onPress={handleMicPress}
          activeOpacity={0.85}
        >
          <Mic size={42} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.micStatusTitle}>
          {isVoiceActive ? "Speak via Keyboard Mic (🎙️)" : "Tap Mic to Speak in Hindi"}
        </Text>

        <Text style={styles.micInstructionText}>
          💡 Mic dabate hi keyboard khulega — keyboard ke <Text style={{ fontWeight: "900", color: Colors.terracotta }}>🎙️ mic icon</Text> par tap karke Hindi me bolte jayein!
        </Text>
      </View>

      {/* Live Voice Input Box */}
      <View style={styles.inputCard}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.sectionLabel}>YOUR SPOKEN SENTENCE (HINDI):</Text>
          {inputText.length > 0 && (
            <TouchableOpacity onPress={() => setInputText("")}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputBoxRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={() => setIsVoiceActive(true)}
            onBlur={() => setIsVoiceActive(false)}
            placeholder="Yahan bole gaye shabd dikhenge... (jaise: नमस्ते बच्चों)"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={handleSubmitSentence}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSubmitSentence}
            disabled={!inputText.trim()}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>Translate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1-Tap Classroom Commands (No Typing Needed!) */}
      <View style={styles.quickCard}>
        <View style={styles.quickHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} color={Colors.terracotta} />
            <Text style={styles.quickHeaderTitle}>1-Tap Classroom Voice Commands:</Text>
          </View>
        </View>
        <Text style={styles.quickSubtext}>
          Kisi bhi sentence par tap karein — turant translate hoga aur phone bolkar sunayega!
        </Text>

        {/* Category Tabs */}
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={[styles.catTab, activeCategory === "classroom" && styles.catTabActive]}
            onPress={() => setActiveCategory("classroom")}
          >
            <Text style={[styles.catTabText, activeCategory === "classroom" && styles.catTabTextActive]}>
              Classroom (कक्षा)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.catTab, activeCategory === "numbers" && styles.catTabActive]}
            onPress={() => setActiveCategory("numbers")}
          >
            <Text style={[styles.catTabText, activeCategory === "numbers" && styles.catTabTextActive]}>
              Numbers (गिनती)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.catTab, activeCategory === "daily" && styles.catTabActive]}
            onPress={() => setActiveCategory("daily")}
          >
            <Text style={[styles.catTabText, activeCategory === "daily" && styles.catTabTextActive]}>
              Daily & Habits (दैनिक)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prompt Chips */}
        <View style={styles.chipsRow}>
          {activePromptList.map((p) => (
            <TouchableOpacity
              key={p}
              style={styles.chip}
              onPress={() => pushTurn(p)}
              activeOpacity={0.75}
            >
              <Volume2 size={13} color={Colors.terracotta} />
              <Text style={styles.chipText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Live Dialogue Stream (Conversation History) */}
      <View style={styles.streamHeaderRow}>
        <View style={styles.streamHeaderLeft}>
          <Zap size={15} color={Colors.salGreen} />
          <Text style={styles.streamTitle}>
            Live Dialogue Stream ({turns.length})
          </Text>
        </View>
        {turns.length > 0 && (
          <TouchableOpacity
            style={styles.clearSessionBtn}
            onPress={() => setTurns([])}
            activeOpacity={0.7}
          >
            <Trash2 size={13} color={Colors.destructive} />
            <Text style={styles.clearSessionText}>Clear Stream</Text>
          </TouchableOpacity>
        )}
      </View>

      {turns.map((turn) => (
        <View key={turn.id} style={styles.turnCard}>
          <View style={styles.turnTopRow}>
            <View style={styles.turnLangBadge}>
              <Text style={styles.turnLangBadgeText}>
                {meta.name.toUpperCase()} • {meta.script}
              </Text>
            </View>
            <Text style={styles.turnTime}>{turn.timestamp}</Text>
          </View>

          {/* Teacher Spoken Hindi */}
          <Text style={styles.turnHindiText}>“{turn.hindi}”</Text>

          {/* Tribal Translation */}
          <View style={styles.turnNativeBox}>
            <Text style={styles.turnNativeText}>{turn.native}</Text>
            <TouchableOpacity
              style={styles.turnListenBtn}
              onPress={() => speakNative(turn.roman, meta.ttsLocale)}
              activeOpacity={0.8}
            >
              <Volume2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Roman Pronunciation Guide */}
          <Text style={styles.turnRomanText}>{turn.roman}</Text>
        </View>
      ))}
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
    paddingBottom: 60,
  },
  header: {
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.salGreen,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  targetLangHighlight: {
    fontWeight: "800",
    color: Colors.deepIndigo,
  },
  langPickerCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  langTabsRow: {
    flexDirection: "row",
    gap: 8,
  },
  langTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  langTabActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  langTabInner: {
    alignItems: "center",
  },
  langName: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  langNameActive: {
    color: "#FFFFFF",
  },
  langNative: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  langNativeActive: {
    color: "#FFF1EB",
    fontWeight: "700",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  inputLangToggle: {
    flexDirection: "row",
    backgroundColor: Colors.sand,
    borderRadius: 10,
    padding: 3,
  },
  inputLangBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  inputLangBtnActive: {
    backgroundColor: Colors.deepIndigo,
  },
  inputLangBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  inputLangBtnTextActive: {
    color: "#FFFFFF",
  },
  autoBroadcastBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  autoBroadcastLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
  },
  micStage: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  micStageActive: {
    borderColor: Colors.terracotta,
    backgroundColor: "#FFF9F6",
  },
  equalizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 44,
    marginBottom: 10,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: Colors.terracotta,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  micStatusTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    marginTop: 12,
  },
  micInstructionText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.destructive,
  },
  inputBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.sand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  sendBtnDisabled: {
    backgroundColor: "#D1D5DB",
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  quickCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  quickHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickHeaderTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  quickSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  catTab: {
    backgroundColor: Colors.sand,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  catTabActive: {
    backgroundColor: Colors.deepIndigo,
    borderColor: Colors.deepIndigo,
  },
  catTabText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  catTabTextActive: {
    color: "#FFFFFF",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.sand,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  streamHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  streamHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
  },
  clearSessionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearSessionText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.destructive,
  },
  turnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
    elevation: 2,
    shadowColor: Colors.deepIndigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  turnTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  turnLangBadge: {
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  turnLangBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.salGreen,
  },
  turnTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  turnHindiText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginVertical: 4,
  },
  turnNativeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.deepIndigoLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  turnNativeText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: Colors.deepIndigo,
    lineHeight: 28,
  },
  turnListenBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  turnRomanText: {
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 2,
  },
});
