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
  ActivityIndicator,
} from "react-native";
import {
  Mic,
  Square,
  Play,
  Volume2,
  Zap,
  Sparkles,
  Trash2,
  Check,
  Radio,
  Send,
  AlertCircle,
  Headphones,
  Layers,
  VolumeX,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import {
  speakDialogue,
  speakNative,
  testSpeaker,
  playRecordedAudio,
  stopSpeech,
} from "../services/speech";
import { logProgressEvent } from "../services/database";
import {
  startAudioRecording,
  stopAudioRecording,
  transcribeAudioFile,
} from "../services/stt";

type Turn = {
  id: number;
  hindi: string;
  native: string;
  roman: string;
  timestamp: string;
  ms: number;
  audioUri?: string;
};

export function LiveDialogueScreen() {
  const { lang, setLang, meta, languages } = useLanguage();

  // Mode: "direct" (instant zero-latency dialogue) vs "record" (audio recording & playback)
  const [activeMode, setActiveMode] = useState<"direct" | "record">("direct");

  // Input & state
  const [inputText, setInputText] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputLang, setInputLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [activeCategory, setActiveCategory] = useState<"classroom" | "daily" | "numbers">("classroom");

  // Recording mode state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [lastRecordedUri, setLastRecordedUri] = useState<string | null>(null);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "info" | "success" | "error" | "recording";
  }>({
    text: "Select a language above and tap any command or enter Hindi text.",
    type: "info",
  });

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
  const barAnim2 = useRef(new Animated.Value(18)).current;
  const barAnim3 = useRef(new Animated.Value(14)).current;
  const barAnim4 = useRef(new Animated.Value(22)).current;
  const barAnim5 = useRef(new Animated.Value(12)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Soundwave & pulse animation during active recording
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (isRecording) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 46, duration: 240, useNativeDriver: false }),
            Animated.timing(barAnim1, { toValue: 10, duration: 240, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim2, { toValue: 58, duration: 190, useNativeDriver: false }),
            Animated.timing(barAnim2, { toValue: 14, duration: 190, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim3, { toValue: 52, duration: 260, useNativeDriver: false }),
            Animated.timing(barAnim3, { toValue: 12, duration: 260, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim4, { toValue: 60, duration: 210, useNativeDriver: false }),
            Animated.timing(barAnim4, { toValue: 16, duration: 210, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(barAnim5, { toValue: 42, duration: 250, useNativeDriver: false }),
            Animated.timing(barAnim5, { toValue: 10, duration: 250, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    } else {
      barAnim1.setValue(10);
      barAnim2.setValue(16);
      barAnim3.setValue(12);
      barAnim4.setValue(18);
      barAnim5.setValue(10);
      pulseAnim.setValue(1);
    }

    return () => {
      if (animLoop) animLoop.stop();
      if (pulseLoop) pulseLoop.stop();
    };
  }, [isRecording]);

  // Push phrase into dialogue stream and immediately play audio
  const pushTurn = (spokenPhrase: string, audioUri?: string) => {
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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      ms,
      audioUri,
    };

    setTurns((prev) => [
      newTurn,
      ...prev.filter((t) => t.hindi !== spokenPhrase.trim()).slice(0, 20),
    ]);

    // Save to SQLite
    logProgressEvent("speech", currentLangCode, res.tokens.length, spokenPhrase.trim());

    // Auto-broadcast voice audio out loud if enabled
    if (autoSpeakRef.current) {
      speakDialogue(res.native, res.roman, currentLangCode);
    }
  };

  // Direct Mode Voice Input / Text Submit
  const handleDirectSubmit = () => {
    if (inputText.trim()) {
      pushTurn(inputText.trim());
      setInputText("");
      setStatusMessage({
        text: `✅ Translated & Spoken: "${inputText.trim()}"`,
        type: "success",
      });
    }
  };

  // Toggle Hardware Microphone Recording
  const handleMicToggle = async () => {
    if (isTranscribing) return;

    if (!isRecording) {
      // START RECORDING
      setStatusMessage({
        text: "🎙️ Listening... Speak clearly in Hindi! (बोलिए...)",
        type: "recording",
      });
      const res = await startAudioRecording();
      if (!res.success) {
        setStatusMessage({
          text: res.error || "Microphone permission was denied.",
          type: "error",
        });
        return;
      }
      setIsRecording(true);
      setRecordSeconds(0);
      setLastRecordedUri(null);
    } else {
      // STOP RECORDING
      setIsRecording(false);
      setStatusMessage({
        text: "⏳ Processing voice recording...",
        type: "info",
      });

      const recRes = await stopAudioRecording();
      if (!recRes.success || !recRes.uri) {
        setStatusMessage({
          text: recRes.error || "Audio recording could not be saved.",
          type: "error",
        });
        return;
      }

      setLastRecordedUri(recRes.uri);
      setIsTranscribing(true);
      setStatusMessage({
        text: "⏳ Recognizing voice with AI... (आवाज़ पहचानी जा रही है...)",
        type: "info",
      });

      // Transcribe via Whisper
      const sttRes = await transcribeAudioFile(recRes.uri);
      setIsTranscribing(false);

      if (sttRes.success && sttRes.text) {
        const spoken = sttRes.text.trim();
        setInputText(spoken);
        setStatusMessage({
          text: `✅ Recognized: "${spoken}" — Voice translated & spoken!`,
          type: "success",
        });
        pushTurn(spoken, recRes.uri);
      } else {
        setStatusMessage({
          text:
            sttRes.error ||
            "Voice clear nahi sunai di. Please neeche 'Play My Recording' dabakar check karein ya 1-Tap command chunein.",
          type: "error",
        });
      }
    }
  };

  // Recording timer (auto stops at 15s)
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 15) {
            handleMicToggle();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Categories of instant classroom commands (100% offline & instant)
  const classroomPrompts = [
    "नमस्ते बच्चों",
    "सब बच्चे बैठ जाओ",
    "किताब खोलो और पढ़ो",
    "ध्यान से सुनो",
    "अपनी जगह पर जाओ",
    "शाबाश बच्चों",
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

      {/* Target Language Switcher Bar */}
      <View style={styles.langPickerCard}>
        <View style={styles.langPickerHeader}>
          <Text style={styles.sectionLabel}>TARGET TRIBAL LANGUAGE:</Text>
          <TouchableOpacity
            style={styles.testSpeakerBtn}
            onPress={testSpeaker}
            activeOpacity={0.8}
          >
            <Volume2 size={13} color={Colors.terracotta} />
            <Text style={styles.testSpeakerText}>🔊 Test Sound</Text>
          </TouchableOpacity>
        </View>

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
                style={[
                  styles.inputLangBtnText,
                  inputLang === "hi-IN" && styles.inputLangBtnTextActive,
                ]}
              >
                Hindi (हिंदी)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputLangBtn, inputLang === "en-IN" && styles.inputLangBtnActive]}
              onPress={() => setInputLang("en-IN")}
            >
              <Text
                style={[
                  styles.inputLangBtnText,
                  inputLang === "en-IN" && styles.inputLangBtnTextActive,
                ]}
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

      {/* Mode Switcher Tabs: Direct Live Dialogue vs Voice Audio Recording */}
      <View style={styles.modeTabsContainer}>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === "direct" && styles.modeTabActive]}
          onPress={() => setActiveMode("direct")}
          activeOpacity={0.8}
        >
          <Zap
            size={16}
            color={activeMode === "direct" ? "#FFFFFF" : Colors.terracotta}
          />
          <Text
            style={[
              styles.modeTabText,
              activeMode === "direct" && styles.modeTabTextActive,
            ]}
          >
            Direct Continuous Mode (तुरंत अनुवाद)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeMode === "record" && styles.modeTabActive]}
          onPress={() => setActiveMode("record")}
          activeOpacity={0.8}
        >
          <Mic
            size={16}
            color={activeMode === "record" ? "#FFFFFF" : Colors.deepIndigo}
          />
          <Text
            style={[
              styles.modeTabText,
              activeMode === "record" && styles.modeTabTextActive,
            ]}
          >
            Audio Recording Mode (रिकॉर्डिंग)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= SECTION 1: DIRECT CONTINUOUS MODE ================= */}
      {activeMode === "direct" && (
        <View style={styles.directSection}>
          {/* Quick Voice / Text Input Box */}
          <View style={styles.inputCard}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.sectionLabel}>SPEAK OR TYPE IN HINDI (लाइव अनुवाद):</Text>
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
                onChangeText={setInputText}
                placeholder="Yahan Hindi me likhein ya bole (jaise: नमस्ते बच्चों)..."
                placeholderTextColor={Colors.textMuted}
                returnKeyType="send"
                onSubmitEditing={handleDirectSubmit}
              />
              <TouchableOpacity
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleDirectSubmit}
                disabled={!inputText.trim()}
              >
                <Send size={15} color="#FFFFFF" />
                <Text style={styles.sendBtnText}>Translate & Speak</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 1-Tap Classroom Commands (Zero Latency, Instant Speech) */}
          <View style={styles.quickCard}>
            <View style={styles.quickHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Sparkles size={16} color={Colors.terracotta} />
                <Text style={styles.quickHeaderTitle}>1-Tap Instant Voice Commands:</Text>
              </View>
              <Text style={styles.quickBadge}>⚡ ZERO DELAY</Text>
            </View>
            <Text style={styles.quickSubtext}>
              Kisi bhi command par tap karein — bina recording ke turant translate hoga aur phone speaker se bolega!
            </Text>

            {/* Category Tabs */}
            <View style={styles.categoryRow}>
              <TouchableOpacity
                style={[
                  styles.catTab,
                  activeCategory === "classroom" && styles.catTabActive,
                ]}
                onPress={() => setActiveCategory("classroom")}
              >
                <Text
                  style={[
                    styles.catTabText,
                    activeCategory === "classroom" && styles.catTabTextActive,
                  ]}
                >
                  Classroom (कक्षा)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.catTab,
                  activeCategory === "numbers" && styles.catTabActive,
                ]}
                onPress={() => setActiveCategory("numbers")}
              >
                <Text
                  style={[
                    styles.catTabText,
                    activeCategory === "numbers" && styles.catTabTextActive,
                  ]}
                >
                  Numbers (गिनती)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.catTab,
                  activeCategory === "daily" && styles.catTabActive,
                ]}
                onPress={() => setActiveCategory("daily")}
              >
                <Text
                  style={[
                    styles.catTabText,
                    activeCategory === "daily" && styles.catTabTextActive,
                  ]}
                >
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
                  onPress={() => {
                    pushTurn(p);
                    setStatusMessage({
                      text: `✅ Spoken: "${p}" in ${meta.name}`,
                      type: "success",
                    });
                  }}
                  activeOpacity={0.75}
                >
                  <Volume2 size={14} color={Colors.terracotta} />
                  <Text style={styles.chipText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* ================= SECTION 2: AUDIO RECORDING & AI MODE ================= */}
      {activeMode === "record" && (
        <View style={styles.recordSection}>
          <View style={[styles.micStage, isRecording && styles.micStageRecording]}>
            {/* Equalizer Soundwave Bars */}
            <View style={styles.equalizerRow}>
              <Animated.View
                style={[
                  styles.eqBar,
                  isRecording && styles.eqBarRecording,
                  { height: barAnim1 },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  isRecording && styles.eqBarRecording,
                  { height: barAnim2 },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  isRecording && styles.eqBarRecording,
                  { height: barAnim3 },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  isRecording && styles.eqBarRecording,
                  { height: barAnim4 },
                ]}
              />
              <Animated.View
                style={[
                  styles.eqBar,
                  isRecording && styles.eqBarRecording,
                  { height: barAnim5 },
                ]}
              />
            </View>

            {/* Big Mic Button with Pulsing Ring */}
            <View style={styles.micButtonWrapper}>
              {isRecording && (
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.micButton,
                  isRecording && styles.micButtonRecording,
                  isTranscribing && styles.micButtonDisabled,
                ]}
                onPress={handleMicToggle}
                activeOpacity={0.85}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
                ) : isRecording ? (
                  <Square size={34} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Mic size={38} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Status Title & Duration */}
            <Text
              style={[
                styles.micStatusTitle,
                isRecording && styles.micStatusTitleRecording,
              ]}
            >
              {isTranscribing
                ? "⏳ Recognizing Voice with AI..."
                : isRecording
                ? `🔴 Recording... (00:${recordSeconds < 10 ? "0" : ""}${recordSeconds}s) — Tap to Stop`
                : "Tap Mic to Record Voice Message"}
            </Text>

            {/* Play Recorded Audio Button */}
            {lastRecordedUri && !isRecording && (
              <TouchableOpacity
                style={styles.playRecordingBtn}
                onPress={() => playRecordedAudio(lastRecordedUri)}
                activeOpacity={0.8}
              >
                <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.playRecordingBtnText}>
                  ▶ Play My Recorded Voice (अपनी आवाज़ सुनें)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Feedback Message Banner */}
      <View
        style={[
          styles.feedbackBox,
          statusMessage.type === "recording" && styles.feedbackBoxRecording,
          statusMessage.type === "success" && styles.feedbackBoxSuccess,
          statusMessage.type === "error" && styles.feedbackBoxError,
        ]}
      >
        {statusMessage.type === "error" ? (
          <AlertCircle size={14} color={Colors.destructive} />
        ) : statusMessage.type === "success" ? (
          <Check size={14} color={Colors.salGreen} />
        ) : statusMessage.type === "recording" ? (
          <Radio size={14} color={Colors.destructive} />
        ) : (
          <Headphones size={14} color={Colors.deepIndigo} />
        )}
        <Text
          style={[
            styles.feedbackText,
            statusMessage.type === "recording" && styles.feedbackTextRecording,
            statusMessage.type === "success" && styles.feedbackTextSuccess,
            statusMessage.type === "error" && styles.feedbackTextError,
          ]}
        >
          {statusMessage.text}
        </Text>
      </View>

      {/* ================= CONVERSATION FEED / DIALOGUE STREAM ================= */}
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
              onPress={() => speakDialogue(turn.native, turn.roman, lang)}
              activeOpacity={0.8}
            >
              <Volume2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Roman Pronunciation Guide */}
          <Text style={styles.turnRomanText}>{turn.roman}</Text>

          {/* Play Original Voice Audio if available */}
          {turn.audioUri && (
            <TouchableOpacity
              style={styles.turnAudioTag}
              onPress={() => playRecordedAudio(turn.audioUri!)}
              activeOpacity={0.7}
            >
              <Play size={11} color={Colors.salGreen} fill={Colors.salGreen} />
              <Text style={styles.turnAudioTagText}>Play Teacher's Voice Recording</Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 12,
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
    marginTop: 3,
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
    marginBottom: 12,
  },
  langPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  testSpeakerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.sand,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  testSpeakerText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.terracotta,
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
    marginTop: 10,
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
  modeTabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  modeTabActive: {
    backgroundColor: Colors.deepIndigo,
    borderColor: Colors.deepIndigo,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text,
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  directSection: {
    marginBottom: 4,
  },
  recordSection: {
    marginBottom: 4,
  },
  micStage: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  micStageRecording: {
    borderColor: Colors.destructive,
    backgroundColor: "#FFF5F5",
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
  eqBarRecording: {
    backgroundColor: Colors.destructive,
  },
  micButtonWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 96,
    height: 96,
  },
  pulseRing: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  micButtonRecording: {
    backgroundColor: Colors.destructive,
    shadowColor: Colors.destructive,
  },
  micButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  micStatusTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
    marginTop: 10,
    textAlign: "center",
  },
  micStatusTitleRecording: {
    color: Colors.destructive,
  },
  playRecordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.salGreen,
    borderRadius: 10,
  },
  playRecordingBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  feedbackBoxRecording: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  feedbackBoxSuccess: {
    backgroundColor: Colors.salGreenLight,
    borderColor: "rgba(46, 125, 50, 0.2)",
  },
  feedbackBoxError: {
    backgroundColor: "#FEE2E2",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  feedbackText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: "600",
    flexShrink: 1,
  },
  feedbackTextRecording: {
    color: Colors.destructive,
    fontWeight: "800",
  },
  feedbackTextSuccess: {
    color: Colors.salGreen,
    fontWeight: "800",
  },
  feedbackTextError: {
    color: Colors.destructive,
    fontWeight: "700",
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
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
    paddingHorizontal: 13,
    paddingVertical: 10,
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
    marginBottom: 12,
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
  quickBadge: {
    fontSize: 9,
    fontWeight: "900",
    color: Colors.salGreen,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
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
  turnAudioTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  turnAudioTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.salGreen,
  },
});
