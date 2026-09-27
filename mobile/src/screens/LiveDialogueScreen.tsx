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
  MicOff,
  Volume2,
  Zap,
  Sparkles,
  Trash2,
  RotateCcw,
  Check,
  Radio,
  X,
} from "lucide-react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { Audio } from "expo-av";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";

const SPEECH_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:transparent;">
  <script>
    var recognition = null;
    var keepListening = false;
    var currentLang = 'hi-IN';

    function createRecognizer() {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return null;
      var r = new SR();
      r.lang = currentLang;
      r.continuous = true;
      r.interimResults = true;
      r.maxAlternatives = 1;

      r.onstart = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SPEECH_START' }));
      };

      r.onresult = function(event) {
        var final = '';
        var interim = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SPEECH_RESULT',
          final: final.trim(),
          interim: interim.trim()
        }));
      };

      r.onerror = function(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SPEECH_ERROR',
          error: event.error || 'speech_error'
        }));
      };

      r.onend = function() {
        if (keepListening) {
          try {
            r.start();
          } catch(e) {}
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SPEECH_END' }));
        }
      };

      return r;
    }

    window.startSpeech = function(lang) {
      if (lang) currentLang = lang;
      keepListening = true;
      try {
        if (!recognition) {
          recognition = createRecognizer();
        } else {
          recognition.lang = currentLang;
        }
        if (recognition) {
          recognition.start();
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NOT_SUPPORTED' }));
        }
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SPEECH_ERROR',
          error: err.message
        }));
      }
    };

    window.stopSpeech = function() {
      keepListening = false;
      try {
        if (recognition) {
          recognition.stop();
        }
      } catch (err) {}
    };
  </script>
</body>
</html>
`;

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

  // Control states
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [inputLang, setInputLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [inputText, setInputText] = useState("");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Turn-based live dialogue stream (like web version)
  const [turns, setTurns] = useState<Turn[]>([
    {
      id: 1,
      hindi: "नमस्ते बच्चों",
      native: translate("नमस्ते बच्चों", lang).native,
      roman: translate("नमस्ते बच्चों", lang).roman,
      timestamp: "Default",
      ms: 1,
    },
  ]);

  const webViewRef = useRef<WebView>(null);
  const inputRef = useRef<TextInput>(null);
  const langRef = useRef(lang);
  langRef.current = lang;
  const autoSpeakRef = useRef(autoSpeak);
  autoSpeakRef.current = autoSpeak;
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  // Soundwave animation
  const barAnim1 = useRef(new Animated.Value(10)).current;
  const barAnim2 = useRef(new Animated.Value(20)).current;
  const barAnim3 = useRef(new Animated.Value(14)).current;
  const barAnim4 = useRef(new Animated.Value(24)).current;
  const barAnim5 = useRef(new Animated.Value(12)).current;

  // Concentric radar ring pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Re-translate all existing turns when language changes
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

    if (isListening) {
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
  }, [isListening]);

  // Push a new spoken sentence turn into the live dialogue stream
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

    setTurns((prev) => [newTurn, ...prev.filter((t) => t.hindi !== spokenPhrase.trim()).slice(0, 15)]);

    // Log progress event in SQLite
    logProgressEvent("speech", currentLangCode, res.tokens.length, spokenPhrase.trim());

    // Auto-broadcast voice audio out loud if enabled
    if (autoSpeakRef.current && res.roman) {
      speakNative(res.roman, meta.ttsLocale);
    }
  };

  // Toggle Continuous Microphone Listening
  const handleMicToggle = async () => {
    if (isListening) {
      // User tapped to turn off listening
      setIsListening(false);
      setInterimText("");
      webViewRef.current?.injectJavaScript(`if (window.stopSpeech) { window.stopSpeech(); } true;`);
      setVoiceNotice("Microphone paused. Tap to resume continuous listening.");
    } else {
      // User tapped to start listening continuously
      setVoiceNotice("Requesting microphone…");
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setVoiceNotice("Microphone permission denied. Allow mic in settings or use keyboard.");
        inputRef.current?.focus();
        return;
      }

      setIsListening(true);
      setVoiceNotice(`🔴 Continuous listening active (${inputLang === "hi-IN" ? "Hindi" : "English"})…`);
      webViewRef.current?.injectJavaScript(
        `if (window.startSpeech) { window.startSpeech('${inputLang}'); } true;`
      );
    }
  };

  // Handle live recognition stream from WebView
  const onWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "SPEECH_RESULT") {
        if (data.interim) {
          setInterimText(data.interim);
        }
        if (data.final) {
          setInterimText("");
          pushTurn(data.final);
          setVoiceNotice(`Spoken: "${data.final}"`);
        }
      } else if (data.type === "SPEECH_START") {
        setIsListening(true);
        setVoiceNotice("🔴 Listening continuously... Bolen Hindi me!");
      } else if (data.type === "SPEECH_END") {
        // If still listening in state, restart
        if (isListeningRef.current) {
          webViewRef.current?.injectJavaScript(
            `if (window.startSpeech) { window.startSpeech('${inputLang}'); } true;`
          );
        }
      } else if (data.type === "SPEECH_ERROR" || data.type === "NOT_SUPPORTED") {
        console.warn("Speech recognition notice:", data.error || data.type);
        setVoiceNotice("💡 Keyboard mic ready: Tap text box and use keyboard 🎙️ mic to dictate!");
      }
    } catch (e) {
      console.warn("Speech message error:", e);
    }
  };

  // Quick Classroom Prompts
  const quickPrompts = [
    "नमस्ते बच्चों",
    "सब बच्चे बैठ जाओ",
    "किताब खोलो और पढ़ो",
    "खाना खाओ और पानी पियो",
    "गिनती एक से दस सीखो",
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
      {/* Hidden Web Speech Engine */}
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{
          html: SPEECH_HTML,
          baseUrl: "https://bhashasetu.local",
        }}
        onMessage={onWebViewMessage}
        mediaCapturePermissionGrantType="grant"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.hiddenWebView}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Radio size={12} color={Colors.salGreen} />
          <Text style={styles.badgeText}>3D ACOUSTIC CLASSROOM BRIDGE</Text>
        </View>
        <Text style={styles.title}>Live Classroom Dialogue</Text>
        <Text style={styles.subtitle}>
          Speak Hindi continuously — tablet synthesizes{" "}
          <Text style={styles.targetLangHighlight}>
            {meta.name} ({meta.nativeName})
          </Text>{" "}
          audio in real-time.
        </Text>
      </View>

      {/* Language Switcher Bar (Mirrored from Web LangPicker) */}
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

      {/* 3D Microphone Stage (Direct Continuous Speaking) */}
      <View style={[styles.micStage, isListening && styles.micStageActive]}>
        {/* Equalizer Soundwave Bars */}
        <View style={styles.equalizerRow}>
          <Animated.View style={[styles.eqBar, { height: barAnim1 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim2 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim3 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim4 }]} />
          <Animated.View style={[styles.eqBar, { height: barAnim5 }]} />
        </View>

        {/* Big Mic Button with Glowing Acoustic Rings */}
        <View style={styles.micButtonContainer}>
          {isListening && (
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
            style={[styles.micButton, isListening ? styles.micButtonListening : styles.micButtonIdle]}
            onPress={handleMicToggle}
            activeOpacity={0.85}
          >
            {isListening ? (
              <MicOff size={40} color="#FFFFFF" />
            ) : (
              <Mic size={42} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Status text */}
        <Text style={[styles.micStatusTitle, isListening && styles.micStatusTitleActive]}>
          {isListening
            ? `Listening continuously… speak now in ${inputLang === "hi-IN" ? "Hindi" : "English"}`
            : "Tap Mic to Start Continuous Speaking"}
        </Text>

        <Text style={styles.interimText}>
          {interimText
            ? `“${interimText}…”`
            : isListening
            ? "Bina roke bolte jayein — har sentence live translate aur broadcast hoga!"
            : "Direct speech stream: Ek baar tap karein aur continuous bolein"}
        </Text>

        {voiceNotice && (
          <View style={styles.noticeBox}>
            <Sparkles size={13} color={Colors.salGreen} />
            <Text style={styles.noticeText}>{voiceNotice}</Text>
          </View>
        )}
      </View>

      {/* Manual Hindi Input Fallback / Keyboard Mic */}
      <View style={styles.inputCard}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.sectionLabel}>OR TYPE / KEYBOARD MIC DICTATE:</Text>
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
            placeholder="Yahan type karein ya keyboard mic 🎙️ se bolein..."
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={() => {
              if (inputText.trim()) {
                pushTurn(inputText.trim());
                setInputText("");
              }
            }}
          />
          {inputText.trim().length > 0 && (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={() => {
                pushTurn(inputText.trim());
                setInputText("");
              }}
            >
              <Text style={styles.sendBtnText}>Translate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Classroom Commands (1-Tap Instant Broadcast) */}
      <View style={styles.quickHeader}>
        <Sparkles size={14} color={Colors.terracotta} />
        <Text style={styles.quickTitle}>Fast Classroom Prompts (Tap to Speak out loud):</Text>
      </View>
      <View style={styles.chipsRow}>
        {quickPrompts.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.chip}
            onPress={() => pushTurn(p)}
            activeOpacity={0.75}
          >
            <Volume2 size={12} color={Colors.terracotta} />
            <Text style={styles.chipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Live Dialogue Stream (Every Spoken Sentence in Current Session) */}
      <View style={styles.streamHeaderRow}>
        <View style={styles.streamHeaderLeft}>
          <Zap size={14} color={Colors.salGreen} />
          <Text style={styles.streamTitle}>
            Live Dialogue Stream ({turns.length} sentences)
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
  hiddenWebView: {
    width: 1,
    height: 1,
    position: "absolute",
    opacity: 0.01,
    bottom: -10,
    left: -10,
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
  micStage: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingVertical: 22,
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
    borderColor: "rgba(224, 90, 71, 0.4)",
    backgroundColor: "rgba(224, 90, 71, 0.1)",
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
  micButtonListening: {
    backgroundColor: Colors.destructive,
  },
  micStatusTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
    marginTop: 14,
  },
  micStatusTitleActive: {
    color: Colors.terracotta,
  },
  interimText: {
    fontSize: 12,
    fontStyle: "italic",
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
    minHeight: 18,
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
    marginBottom: 4,
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
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.text,
  },
  sendBtn: {
    backgroundColor: Colors.deepIndigo,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
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
});
