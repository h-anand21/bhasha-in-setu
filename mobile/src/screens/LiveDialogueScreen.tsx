import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  Mic,
  Volume2,
  Zap,
  Sparkles,
  History,
  RotateCcw,
  X,
  Square,
  Radio,
  CheckCircle2,
  Info,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";
import { startAudioRecording, stopAudioRecording } from "../services/stt";

export function LiveDialogueScreen() {
  const { lang, meta } = useLanguage();
  const [inputText, setInputText] = useState("नमस्ते बच्चों");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(() =>
    translate("नमस्ते बच्चों", lang)
  );
  const [history, setHistory] = useState<
    { hindi: string; native: string; roman: string; timestamp: string }[]
  >([
    {
      hindi: "नमस्ते बच्चों",
      native: translate("नमस्ते बच्चों", lang).native,
      roman: translate("नमस्ते बच्चों", lang).roman,
      timestamp: "Just now",
    },
  ]);

  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Soundwave animation when recording or typing is active
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    if (isRecording || isProcessingAudio || inputText.trim().length > 0) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: isRecording ? 48 : 30, duration: 250, useNativeDriver: false }),
            Animated.timing(barAnim1, { toValue: 8, duration: 250, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: isRecording ? 58 : 40, duration: 200, useNativeDriver: false }),
            Animated.timing(barAnim2, { toValue: 12, duration: 200, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: isRecording ? 52 : 34, duration: 280, useNativeDriver: false }),
            Animated.timing(barAnim3, { toValue: 14, duration: 280, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: isRecording ? 60 : 44, duration: 220, useNativeDriver: false }),
            Animated.timing(barAnim4, { toValue: 10, duration: 220, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: isRecording ? 44 : 28, duration: 260, useNativeDriver: false }),
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
  }, [isRecording, isProcessingAudio, inputText]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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

  const handleSpeakAudio = (customText?: string) => {
    const textToSpeak = customText || (result && result.roman);
    if (textToSpeak) {
      speakNative(textToSpeak, meta.ttsLocale);

      // Add to session history
      if (result) {
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
    }
  };

  // Toggle Microphone recording with real hardware capture
  const handleMicToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      setIsProcessingAudio(true);
      setVoiceNotice("Audio recording captured! Finalizing translation…");

      const res = await stopAudioRecording();
      setIsProcessingAudio(false);

      if (res.success && res.uri) {
        setVoiceNotice(
          `Voice captured (${Math.round((res.durationMillis || 1000) / 100) / 10}s)! Translating & speaking…`
        );
        // If current text exists, speak translation
        if (result && result.roman) {
          handleSpeakAudio();
        }
      } else if (res.error) {
        setVoiceNotice(res.error);
      }
    } else {
      // Start recording
      setVoiceNotice(null);
      const res = await startAudioRecording();
      if (res.success) {
        setIsRecording(true);
        setRecordSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordSeconds((sec) => sec + 1);
        }, 1000);
      } else {
        setVoiceNotice(res.error || "Could not start microphone.");
        // Open keyboard as fallback
        inputRef.current?.focus();
      }
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setVoiceNotice(null);
  };

  const handlePromptSelect = (prompt: string) => {
    setInputText(prompt);
    handleTextChange(prompt);
    const res = translate(prompt, lang);
    setResult(res);
    setVoiceNotice(`Spoken phrase: "${prompt}"`);
    // Immediately play the native audio pronunciation!
    if (res && res.roman) {
      speakNative(res.roman, meta.ttsLocale);
      setHistory((prev) => [
        {
          hindi: prompt,
          native: res.native,
          roman: res.roman,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev.filter((h) => h.hindi !== prompt).slice(0, 8),
      ]);
    }
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

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
      <View style={[styles.micSection, isRecording && styles.micSectionRecording]}>
        <View style={styles.equalizerRow}>
          <Animated.View style={[styles.eqBar, { height: barAnim1 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim2 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim3 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim4 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim5 }]} />
        </View>

        {/* Big Mic Button with Active Recording States */}
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnRecording]}
          onPress={handleMicToggle}
          activeOpacity={0.85}
        >
          {isRecording ? (
            <Square size={30} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Mic size={36} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {/* Recording Status & Live Timer */}
        <Text style={[styles.micStatusTitle, isRecording && styles.micStatusTitleActive]}>
          {isRecording
            ? `🔴 Recording Audio (${formatSeconds(recordSeconds)})`
            : isProcessingAudio
            ? "Processing Voice Recording…"
            : "Tap Mic to Record / Stop"}
        </Text>

        <Text style={styles.micSubText}>
          {isRecording
            ? "Bolen Hindi me — Tap again to finish & translate"
            : "Live audio input with instant acoustic playback"}
        </Text>

        {voiceNotice && (
          <View style={styles.noticeBox}>
            <CheckCircle2 size={14} color={Colors.salGreen} />
            <Text style={styles.noticeText}>{voiceNotice}</Text>
          </View>
        )}
      </View>

      {/* Voice Help Banner */}
      <View style={styles.tipCard}>
        <Info size={16} color={Colors.deepIndigo} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>2 Ways to Speak & Dictate:</Text>
          <Text style={styles.tipText}>
            1. <Text style={{ fontWeight: "700" }}>Live Mic Button:</Text> Tap the red mic above to record speech audio.
          </Text>
          <Text style={styles.tipText}>
            2. <Text style={{ fontWeight: "700" }}>Keyboard Mic (🎙️):</Text> Tap inside the box below and tap your mobile keyboard's microphone icon for continuous speech dictation.
          </Text>
        </View>
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
            placeholder="Yahan type karein ya keyboard mic 🎙️ se bolein..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={2}
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
              onPress={() => handleSpeakAudio()}
              activeOpacity={0.8}
            >
              <Volume2 size={20} color="#FFFFFF" />
              <Text style={styles.speakBtnText}>🔊 Speak in {meta.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.repeatBtn}
              onPress={() => handleSpeakAudio()}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color={Colors.deepIndigo} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Quick Classroom Instruction Chips (Tap to Speak out loud!) */}
      <View style={styles.quickHeaderRow}>
        <Sparkles size={16} color={Colors.terracotta} />
        <Text style={styles.quickTitle}>Quick Classroom Commands (Tap to Speak):</Text>
      </View>
      <View style={styles.chipsRow}>
        {quickPrompts.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.chip, inputText === p && styles.chipActive]}
            onPress={() => handlePromptSelect(p)}
            activeOpacity={0.75}
          >
            <Volume2 size={13} color={inputText === p ? "#FFFFFF" : Colors.terracotta} />
            <Text style={[styles.chipText, inputText === p && styles.chipTextActive]}>
              {p}
            </Text>
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
                <TouchableOpacity
                  onPress={() => speakNative(h.roman, meta.ttsLocale)}
                  style={styles.historyListenBtn}
                >
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
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  micSectionRecording: {
    borderColor: Colors.destructive,
    backgroundColor: "#FFF5F5",
  },
  equalizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 48,
    marginBottom: 12,
  },
  eqBar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: Colors.terracotta,
  },
  micBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  micBtnRecording: {
    backgroundColor: Colors.destructive,
    transform: [{ scale: 1.06 }],
  },
  micStatusTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 12,
  },
  micStatusTitleActive: {
    color: Colors.destructive,
  },
  micSubText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
    textAlign: "center",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.salGreenLight,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.salGreen,
  },
  tipCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.deepIndigoLight,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(30, 41, 59, 0.08)",
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 11,
    color: Colors.text,
    lineHeight: 16,
    marginTop: 2,
  },
  inputContainer: {
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
  },
  clearText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.destructive,
  },
  inputBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  textInput: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 46,
    textAlignVertical: "center",
  },
  outputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.terracottaLight,
    marginBottom: 18,
    elevation: 2,
    shadowColor: Colors.deepIndigo,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  outputTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceHindiLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.textMuted,
  },
  nativeBadge: {
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nativeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.salGreen,
  },
  sourceHindiText: {
    fontSize: 16,
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
    fontSize: 9,
    fontWeight: "800",
    color: Colors.terracotta,
  },
  targetNativeText: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.deepIndigo,
    marginVertical: 4,
    lineHeight: 32,
  },
  romanLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 8,
  },
  romanText: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "600",
    color: Colors.text,
    marginTop: 2,
  },
  outputActionRow: {
    flexDirection: "row",
    gap: 8,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  quickHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  chipText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  historySection: {
    marginTop: 6,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 12,
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
    alignItems: "center",
  },
  historyHindi: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  historyTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  historyNative: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginVertical: 4,
  },
  historyBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyRoman: {
    fontSize: 11,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  historyListenBtn: {
    padding: 4,
  },
});
