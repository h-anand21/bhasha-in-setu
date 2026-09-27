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
  Square,
  Play,
  Share2,
} from "lucide-react-native";
import { Audio } from "expo-av";
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
  audioUri?: string;
  ms: number;
};

type ModeType = "continuous" | "recording";

export function LiveDialogueScreen() {
  const { lang, setLang, meta, languages } = useLanguage();

  // Mode Selection: Continuous Stream vs Push-to-Talk Recording
  const [activeMode, setActiveMode] = useState<ModeType>("continuous");

  // Continuous Mode State
  const [liveInputText, setLiveInputText] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputLang, setInputLang] = useState<"hi-IN" | "en-IN">("hi-IN");

  // Push-to-Talk Recording Mode State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [lastRecordedUri, setLastRecordedUri] = useState<string | null>(null);
  const [recordedPhrases, setRecordedPhrases] = useState<string>("नमस्ते बच्चों");

  // Turn-based live dialogue stream
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 1,
      hindi: "नमस्ते बच्चों",
      native: translate("नमस्ते बच्चों", lang).native,
      roman: translate("नमस्ते बच्चों", lang).roman,
      timestamp: "Initial",
      ms: 1,
    },
  ]);

  const inputRef = useRef<TextInput>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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

  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Re-translate all existing turns when target language changes
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

  // Soundwave and pulsing ring animation loop
  useEffect(() => {
    let animLoop: Animated.CompositeAnimation | null = null;
    let pulseLoop: Animated.CompositeAnimation | null = null;

    if (isRecording || liveInputText.trim().length > 0) {
      animLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(barAnim1, { toValue: 46, duration: 250, useNativeDriver: false }),
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
            Animated.timing(barAnim5, { toValue: 42, duration: 260, useNativeDriver: false }),
            Animated.timing(barAnim5, { toValue: 8, duration: 260, useNativeDriver: false }),
          ]),
        ])
      );
      animLoop.start();

      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();
    } else {
      barAnim1.setValue(10);
      barAnim2.setValue(16);
      barAnim3.setValue(12);
      barAnim4.setValue(18);
      barAnim5.setValue(10);
      pulseAnim.setValue(1.0);
    }

    return () => {
      if (animLoop) animLoop.stop();
      if (pulseLoop) pulseLoop.stop();
    };
  }, [isRecording, liveInputText]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Push sentence into Dialogue Stream and auto-speak
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      audioUri,
      ms,
    };

    setTurns((prev) => [newTurn, ...prev.filter((t) => t.hindi !== spokenPhrase.trim()).slice(0, 20)]);

    // Save progress event to SQLite
    logProgressEvent("speech", currentLangCode, res.tokens.length, spokenPhrase.trim());

    // Auto-broadcast tribal pronunciation through speaker
    if (autoSpeakRef.current && res.roman) {
      speakNative(res.roman, meta.ttsLocale);
    }
  };

  // Recording Mode Handlers (Push-to-Talk)
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Microphone permission is required to record audio.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err) {
      console.warn("Recording start failed:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setLastRecordedUri(uri || null);

      // Playback audio mode reset
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Push turn with the recorded audio
      const textToDeliver = recordedPhrases.trim() || "नमस्ते बच्चों";
      pushTurn(textToDeliver, uri || undefined);
    } catch (err) {
      console.warn("Recording stop failed:", err);
      setRecording(null);
    }
  };

  // Playback recorded audio from device
  const playRecordedAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (e) {
      console.warn("Playback error:", e);
    }
  };

  // Quick Classroom Prompts categorized for teaching
  const classroomPrompts = [
    { title: "नमस्ते बच्चों", cat: "Greeting" },
    { title: "सब बच्चे बैठ जाओ", cat: "Discipline" },
    { title: "किताब खोलो और पढ़ो", cat: "Activity" },
    { title: "खाना खाओ और पानी पियो", cat: "Nutrition" },
    { title: "गिनती एक से दस सीखो", cat: "Math FLN" },
    { title: "तुमने आज क्या सीखा", cat: "Questions" },
    { title: "हाथ साफ करो", cat: "Hygiene" },
    { title: "सूरज निकला सुबह हुई", cat: "Story" },
    { title: "शाबाश, बहुत अच्छा काम किया", cat: "Praise" },
    { title: "कल सब बच्चे समय पर आना", cat: "Closing" },
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Radio size={12} color={Colors.salGreen} />
          <Text style={styles.badgeText}>3D ACOUSTIC CLASSROOM BRIDGE</Text>
        </View>
        <Text style={styles.title}>Live Classroom Dialogue</Text>
        <Text style={styles.subtitle}>
          Speak Hindi ➔ Tablet synthesizes{" "}
          <Text style={styles.targetLangHighlight}>
            {meta.name} ({meta.nativeName})
          </Text>{" "}
          audio in real-time.
        </Text>
      </View>

      {/* Target Tribal Language Selector (Same as Web LangPicker) */}
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
                    {l.nativeName}
                  </Text>
                </View>
                {isSelected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Language & Auto-Broadcast Controls */}
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

      {/* TWO MODE TABS: Continuous Live Stream vs Push-to-Talk Recording */}
      <View style={styles.modeTabsContainer}>
        <TouchableOpacity
          style={[styles.modeTab, activeMode === "continuous" && styles.modeTabActive]}
          onPress={() => setActiveMode("continuous")}
          activeOpacity={0.8}
        >
          <Radio size={14} color={activeMode === "continuous" ? "#FFFFFF" : Colors.terracotta} />
          <Text style={[styles.modeTabText, activeMode === "continuous" && styles.modeTabTextActive]}>
            1. Continuous Live Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeMode === "recording" && styles.modeTabActive]}
          onPress={() => setActiveMode("recording")}
          activeOpacity={0.8}
        >
          <Mic size={14} color={activeMode === "recording" ? "#FFFFFF" : Colors.deepIndigo} />
          <Text style={[styles.modeTabText, activeMode === "recording" && styles.modeTabTextActive]}>
            2. Push-to-Talk Recording
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= MODE 1: CONTINUOUS LIVE STREAM ================= */}
      {activeMode === "continuous" && (
        <View style={styles.continuousContainer}>
          {/* Active Voice Input Box (Keyboard Mic / Direct Voice) */}
          <View style={styles.liveDictationCard}>
            <View style={styles.liveDictationHeader}>
              <View style={styles.liveDictationBadge}>
                <Radio size={12} color={Colors.terracotta} />
                <Text style={styles.liveDictationBadgeText}>DIRECT CONTINUOUS SPEECH</Text>
              </View>
              {liveInputText.length > 0 && (
                <TouchableOpacity onPress={() => setLiveInputText("")}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.textInputBox}>
              <TextInput
                ref={inputRef}
                style={styles.largeTextInput}
                value={liveInputText}
                onChangeText={(text) => {
                  setLiveInputText(text);
                }}
                placeholder="Yahan tap karein aur keyboard ke 🎙️ mic par bolte jayein..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                onSubmitEditing={() => {
                  if (liveInputText.trim()) {
                    pushTurn(liveInputText.trim());
                    setLiveInputText("");
                  }
                }}
              />
            </View>

            {/* Live Instant Translation Preview as you speak */}
            {liveInputText.trim().length > 0 && (
              <View style={styles.livePreviewCard}>
                <View style={styles.livePreviewTop}>
                  <Text style={styles.previewLabel}>LIVE TRANSLATION PREVIEW:</Text>
                  <Text style={styles.previewBadge}>{meta.script}</Text>
                </View>
                <Text style={styles.previewNativeText}>
                  {translate(liveInputText, lang).native}
                </Text>
                <Text style={styles.previewRomanText}>
                  {translate(liveInputText, lang).roman}
                </Text>

                <TouchableOpacity
                  style={styles.broadcastBtn}
                  onPress={() => {
                    pushTurn(liveInputText.trim());
                    setLiveInputText("");
                  }}
                  activeOpacity={0.8}
                >
                  <Volume2 size={16} color="#FFFFFF" />
                  <Text style={styles.broadcastBtnText}>🔊 Broadcast to Classroom ({meta.name})</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Continuous Voice Instruction */}
            <View style={styles.voiceGuideBanner}>
              <Text style={styles.voiceGuideTitle}>💡 How Continuous Speaking Works:</Text>
              <Text style={styles.voiceGuideText}>
                1. Text box par tap karein ➔ aapke mobile keyboard par **🎙️ mic icon** dikhega.
              </Text>
              <Text style={styles.voiceGuideText}>
                2. Keyboard mic dabakar bina ruke continuous bolte jayein — har sentence screen par live translate hota rahega!
              </Text>
              <Text style={styles.voiceGuideText}>
                3. Ya niche kisi bhi Classroom Command par tap karein — turant audio bolkar sunai dega!
              </Text>
            </View>
          </View>

          {/* Quick Classroom Commands (1-Tap Instant Speech Delivery) */}
          <View style={styles.quickHeader}>
            <Sparkles size={14} color={Colors.terracotta} />
            <Text style={styles.quickTitle}>Fast Classroom Commands (Tap to Speak):</Text>
          </View>
          <View style={styles.chipsRow}>
            {classroomPrompts.map((p) => (
              <TouchableOpacity
                key={p.title}
                style={styles.chip}
                onPress={() => pushTurn(p.title)}
                activeOpacity={0.75}
              >
                <Volume2 size={12} color={Colors.terracotta} />
                <Text style={styles.chipText}>{p.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ================= MODE 2: PUSH-TO-TALK RECORDING ================= */}
      {activeMode === "recording" && (
        <View style={styles.recordingStage}>
          {/* Equalizer Soundwave Bars */}
          <View style={styles.equalizerRow}>
            <Animated.View style={[styles.eqBar, { height: barAnim1 }]} />
            <Animated.View style={[styles.eqBar, { height: barAnim2 }]} />
            <Animated.View style={[styles.eqBar, { height: barAnim3 }]} />
            <Animated.View style={[styles.eqBar, { height: barAnim4 }]} />
            <Animated.View style={[styles.eqBar, { height: barAnim5 }]} />
          </View>

          {/* Big Recording Button */}
          <View style={styles.micButtonContainer}>
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
              style={[styles.micButton, isRecording ? styles.micButtonRecording : styles.micButtonIdle]}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.85}
            >
              {isRecording ? (
                <Square size={34} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Mic size={40} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={[styles.micStatusTitle, isRecording && styles.micStatusTitleActive]}>
            {isRecording
              ? `🔴 Recording Audio (${formatSeconds(recordSeconds)})`
              : "Tap Mic to Start Recording"}
          </Text>

          <Text style={styles.micSubText}>
            {isRecording
              ? "Bolen... Tap again to STOP & deliver translation"
              : "Records voice file with native playback and tribal speech"}
          </Text>

          {/* Phrase to deliver with this recording */}
          <View style={styles.recordingInputBox}>
            <Text style={styles.sectionLabel}>SPOKEN PHRASE FOR THIS RECORDING:</Text>
            <TextInput
              style={styles.recordingTextInput}
              value={recordedPhrases}
              onChangeText={setRecordedPhrases}
              placeholder="Jaise: नमस्ते बच्चों..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {lastRecordedUri && (
            <TouchableOpacity
              style={styles.playRecordedBtn}
              onPress={() => playRecordedAudio(lastRecordedUri)}
              activeOpacity={0.8}
            >
              <Play size={16} color={Colors.deepIndigo} />
              <Text style={styles.playRecordedBtnText}>▶ Listen to Last Recorded Audio</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ================= SHARED LIVE DIALOGUE STREAM ================= */}
      <View style={styles.streamHeaderRow}>
        <View style={styles.streamHeaderLeft}>
          <Zap size={14} color={Colors.salGreen} />
          <Text style={styles.streamTitle}>
            Live Dialogue Stream ({turns.length} turns)
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

          {turn.audioUri && (
            <TouchableOpacity
              style={styles.turnAudioTag}
              onPress={() => playRecordedAudio(turn.audioUri!)}
            >
              <Play size={12} color={Colors.salGreen} />
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
    paddingBottom: 50,
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
    paddingHorizontal: 6,
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
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
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
  modeTabsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modeTabActive: {
    backgroundColor: Colors.terracotta,
    borderColor: Colors.terracotta,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  continuousContainer: {
    marginBottom: 10,
  },
  liveDictationCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  liveDictationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  liveDictationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDictationBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.terracotta,
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.destructive,
  },
  textInputBox: {
    backgroundColor: Colors.sand,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  largeTextInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 65,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  livePreviewCard: {
    marginTop: 12,
    backgroundColor: Colors.deepIndigoLight,
    borderRadius: 14,
    padding: 12,
  },
  livePreviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  previewLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.deepIndigo,
  },
  previewBadge: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.terracotta,
  },
  previewNativeText: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.deepIndigo,
    marginVertical: 4,
    lineHeight: 28,
  },
  previewRomanText: {
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.textMuted,
    marginBottom: 8,
  },
  broadcastBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.terracotta,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  broadcastBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  voiceGuideBanner: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(224, 90, 71, 0.08)",
    borderRadius: 12,
  },
  voiceGuideTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.terracotta,
    marginBottom: 4,
  },
  voiceGuideText: {
    fontSize: 10,
    color: Colors.text,
    lineHeight: 15,
    marginTop: 2,
  },
  recordingStage: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
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
  micButtonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
  pulseRing: {
    position: "absolute",
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  micButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  micButtonIdle: {
    backgroundColor: Colors.terracotta,
  },
  micButtonRecording: {
    backgroundColor: Colors.destructive,
  },
  micStatusTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    marginTop: 14,
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
  recordingInputBox: {
    width: "100%",
    marginTop: 14,
  },
  recordingTextInput: {
    backgroundColor: Colors.sand,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  playRecordedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.deepIndigoLight,
    borderRadius: 10,
  },
  playRecordedBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.deepIndigo,
  },
  quickHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.text,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipText: {
    fontSize: 11,
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
