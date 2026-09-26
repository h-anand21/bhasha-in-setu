import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Camera,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  Share2,
  CheckCircle,
  Copy,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";

export function TranslateScreen() {
  const { lang, meta } = useLanguage();
  const [inputText, setInputText] = useState("सूरज निकला सुबह हुई और सब बच्चे स्कूल आए");
  const [result, setResult] = useState<TranslationResult | null>(() =>
    translate("सूरज निकला सुबह हुई और सब बच्चे स्कूल आए", lang)
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = (text: string) => {
    if (!text.trim()) return;
    const res = translate(text, lang);
    setResult(res);
    logProgressEvent("ocr", lang, res.tokens.length, text);
  };

  const handleCameraCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required to scan blackboard notes.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      processScannedImage(res.assets[0].uri);
    }
  };

  const handleGalleryPicker = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      processScannedImage(res.assets[0].uri);
    }
  };

  const processScannedImage = (uri: string) => {
    setSelectedImage(uri);
    setIsProcessingOcr(true);

    // Simulate on-device OCR extraction from blackboard chalk note
    setTimeout(() => {
      setIsProcessingOcr(false);
      const blackboardSamples = [
        "पाठशाला में गुरुजी पढ़ाते हैं और सब बच्चे सुनते हैं",
        "सूरज चाँद नदी पहाड़ और हमारा सुंदर गाँव",
        "एक दो तीन चार पाँच छह सात आठ नौ दस",
        "हाथ धोना और साफ पानी पीना अच्छी आदत है",
      ];
      const extractedText =
        blackboardSamples[Math.floor(Math.random() * blackboardSamples.length)]!;
      setInputText(extractedText);
      handleTranslate(extractedText);
    }, 1200);
  };

  const sampleLessons = [
    "सूरज निकला सुबह हुई और सब बच्चे स्कूल आए",
    "किताब खोलो और ध्यान से पढ़ो",
    "आज हम गिनती एक से दस सीखेंगे",
    "किसान खेत में काम करता है",
    "गाय बकरी कुत्ता और बिल्ली",
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Curriculum & Blackboard OCR</Text>
        <Text style={styles.subtitle}>
          Scan classroom blackboards, charts, and lesson notes into {meta.name} ({meta.script})
        </Text>
      </View>

      {/* Camera / OCR Action Box */}
      <View style={styles.scannerCard}>
        <View style={styles.scannerIconRow}>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={handleCameraCapture}
            activeOpacity={0.8}
          >
            <Camera size={20} color="#FFFFFF" />
            <Text style={styles.scanBtnText}>Scan Blackboard Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={handleGalleryPicker}
            activeOpacity={0.8}
          >
            <ImageIcon size={20} color={Colors.deepIndigo} />
            <Text style={styles.galleryBtnText}>From Gallery</Text>
          </TouchableOpacity>
        </View>

        {isProcessingOcr && (
          <View style={styles.ocrLoadingBox}>
            <Sparkles size={18} color={Colors.terracotta} />
            <Text style={styles.ocrLoadingText}>Processing Blackboard Vision OCR on-device…</Text>
          </View>
        )}

        {selectedImage && (
          <View style={styles.previewBox}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <Text style={styles.previewLabel}>Scanned Blackboard Photo</Text>
          </View>
        )}
      </View>

      {/* Input Box */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>ENTER OR EDIT LESSON TEXT (HINDI):</Text>
        <TextInput
          style={styles.inputArea}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={3}
          placeholder="Paste or type Hindi textbook sentences…"
          placeholderTextColor={Colors.textMuted}
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => handleTranslate(inputText)}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.submitBtnText}>Generate Dual-Script Translation</Text>
        </TouchableOpacity>
      </View>

      {/* Translation Output Card */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultHeaderTitle}>
              {meta.name.toUpperCase()} DUAL-SCRIPT OUTPUT
            </Text>
            <View style={styles.scriptBadge}>
              <Text style={styles.scriptBadgeText}>{meta.script}</Text>
            </View>
          </View>

          {/* Native Script Display */}
          <View style={styles.nativeBox}>
            <Text style={styles.nativeText}>{result.native}</Text>
            <TouchableOpacity
              style={styles.nativeListenBtn}
              onPress={() => speakNative(result.roman, meta.ttsLocale)}
            >
              <Volume2 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Roman Phonetic Pronunciation */}
          <Text style={styles.romanLabel}>Romanized Acoustic Guide:</Text>
          <Text style={styles.romanText}>{result.roman}</Text>

          {/* Word-by-Word Tokenized Breakdown */}
          <Text style={styles.tokensSectionTitle}>Word-by-Word Vocabulary Breakdown:</Text>
          <View style={styles.tokensGrid}>
            {result.tokens.map((token, idx) => (
              <View key={idx} style={styles.tokenCard}>
                <Text style={styles.tokenSource}>{token.source}</Text>
                <Text style={styles.tokenNative}>{token.native || "—"}</Text>
                <View style={styles.tokenBottomRow}>
                  <Text style={styles.tokenRoman}>{token.roman || "—"}</Text>
                  {token.roman && (
                    <TouchableOpacity
                      onPress={() => speakNative(token.roman!, meta.ttsLocale)}
                    >
                      <Volume2 size={13} color={Colors.terracotta} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Preset Lesson Cards */}
      <Text style={styles.presetSectionTitle}>Sample FLN Curriculum Presets:</Text>
      {sampleLessons.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.presetItem}
          onPress={() => {
            setInputText(item);
            handleTranslate(item);
          }}
        >
          <Text style={styles.presetText}>• {item}</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
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
  scannerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  scannerIconRow: {
    flexDirection: "row",
    gap: 10,
  },
  scanBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scanBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  galleryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: 12,
    borderRadius: 12,
  },
  galleryBtnText: {
    color: Colors.deepIndigo,
    fontSize: 12,
    fontWeight: "800",
  },
  ocrLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: Colors.terracottaLight,
    borderRadius: 10,
  },
  ocrLoadingText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  previewBox: {
    marginTop: 12,
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  previewLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    marginBottom: 8,
  },
  inputArea: {
    backgroundColor: Colors.sand,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 70,
    textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.deepIndigo,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.terracottaLight,
    marginBottom: 18,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultHeaderTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
  },
  scriptBadge: {
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scriptBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.salGreen,
  },
  nativeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.deepIndigoLight,
    borderRadius: 14,
    padding: 14,
  },
  nativeText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: Colors.deepIndigo,
    lineHeight: 30,
  },
  nativeListenBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.terracotta,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  romanLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 12,
  },
  romanText: {
    fontSize: 14,
    fontWeight: "600",
    fontStyle: "italic",
    color: Colors.text,
    marginTop: 2,
  },
  tokensSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 18,
    marginBottom: 10,
  },
  tokensGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tokenCard: {
    width: "48%",
    backgroundColor: Colors.sand,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tokenSource: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  tokenNative: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.deepIndigo,
    marginVertical: 2,
  },
  tokenBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenRoman: {
    fontSize: 10,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  presetItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },
  presetText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "600",
  },
});
