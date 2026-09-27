import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
} from "react-native";
import {
  Camera,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  CheckCircle,
  Copy,
  AlertCircle,
  X,
  RotateCcw,
  BookOpen,
  Printer,
  ChevronRight,
  Check,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate, type TranslationResult } from "../lib/translate";
import { speakNative } from "../services/speech";
import { logProgressEvent } from "../services/database";
import { extractTextFromImage } from "../services/ocr";
import { StatusBadge } from "../components/StatusBadge";
import { AudioButton } from "../components/AudioButton";

export function TranslateScreen({ navigation }: any) {
  const { lang, meta } = useLanguage();
  const [inputText, setInputText] = useState(
    "आज हम जानवरों के नाम सीखेंगे। हाथी, शेर, गाय, कुत्ता, बिल्ली।",
  );
  const [result, setResult] = useState<TranslationResult | null>(() =>
    translate("आज हम जानवरों के नाम सीखेंगे। हाथी, शेर, गाय, कुत्ता, बिल्ली।", lang),
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>("Text extracted successfully!");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleTranslate = (text: string) => {
    if (!text.trim()) return;
    const res = translate(text, lang);
    setResult(res);
    logProgressEvent("ocr", lang, res.tokens.length, text);
  };

  const handleCameraCapture = async () => {
    setOcrError(null);
    setOcrStatus(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission is required to scan blackboard notes.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      base64: true,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      processScannedImage(res.assets[0].uri, res.assets[0].base64);
    }
  };

  const handleGalleryPicker = async () => {
    setOcrError(null);
    setOcrStatus(null);
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      base64: true,
    });

    if (!res.canceled && res.assets && res.assets[0]) {
      processScannedImage(res.assets[0].uri, res.assets[0].base64);
    }
  };

  const processScannedImage = async (uri: string, base64?: string | null) => {
    setSelectedImage(uri);
    setIsProcessingOcr(true);
    setOcrError(null);
    setOcrStatus("Analyzing photo & extracting Devanagari text…");

    try {
      const res = await extractTextFromImage(base64, uri);

      if (res.success && res.text) {
        setInputText(res.text);
        handleTranslate(res.text);
        setOcrStatus("Text extracted successfully!");
      } else {
        setOcrError(
          res.error ||
            "Could not read text from this image. Please take a clear, well-lit photo of the text or type below.",
        );
        setOcrStatus(null);
      }
    } catch (err: any) {
      setOcrError(
        err?.message ||
          "OCR extraction failed. Check your internet connection or enter the text manually.",
      );
      setOcrStatus(null);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setOcrStatus(null);
    setOcrError(null);
  };

  const handleCopy = () => {
    if (result) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePrint = async () => {
    if (result) {
      try {
        await Share.share({
          message: `Bhasha Setu Bilingual Lesson:\n${inputText}\n\n${meta.name} (${meta.script}):\n${result.native}\n\nPronunciation:\n${result.roman}`,
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const samplePromptCategories = [
    { label: "जानवर", sub: "Animals", emoji: "🐘", text: "हाथी, शेर, गाय, कुत्ता, बिल्ली" },
    { label: "परिवार", sub: "Family", emoji: "👨‍👩‍👧‍👦", text: "माँ, पिता, भाई, बहन, दादा, दादी" },
    { label: "संख्या", sub: "Numbers", emoji: "🔢", text: "एक, दो, तीन, चार, पाँच, दस" },
    { label: "रंग", sub: "Colors", emoji: "🎨", text: "लाल, हरा, पीला, नीला, सफेद, काला" },
    { label: "विद्यालय", sub: "School", emoji: "🏫", text: "किताब, कलम, शिक्षक, कक्षा, बस्ता" },
  ];

  const relatedSentences = [
    { hi: "यह एक हाथी है।", native: "ᱱᱚᱣᱟ ᱫᱚ ᱢᱤᱫ ᱦᱟᱹᱛᱤ ᱠᱟᱱᱟ᱾", roman: "Nowa do mit' hati kana." },
    { hi: "यह एक गाय है।", native: "ᱱᱚᱣᱟ ᱫᱚ ᱢᱤᱫ ᱜᱟᱹᱭ ᱠᱟᱱᱟ᱾", roman: "Nowa do mit' gai kana." },
    { hi: "कुत्ता कहाँ है?", native: "ᱥᱮᱛᱟ ᱚᱠᱟᱨᱮ ᱢᱮᱱᱟᱭᱟ?", roman: "Seta okare menaya?" },
    { hi: "मुझे बिल्ली पसंद है।", native: "ᱤᱧ ᱵᱤᱞᱟᱹᱭ ᱠᱩᱥᱤᱭᱟᱭᱟ᱾", roman: "In bilai kusiyaya." },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner with Teacher Mascot & Badges */}
      <View style={styles.headerBadgeRow}>
        <StatusBadge label="BLACKBOARD OCR" variant="fln" />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Curriculum & Blackboard OCR</Text>
          <Text style={styles.headerSubtitle}>
            Scan Hindi text from board or notes and get instant translation in tribal language.
          </Text>
        </View>
        <View style={styles.headerIconBox}>
          <Text style={{ fontSize: 32 }}>👩‍🏫</Text>
        </View>
      </View>

      {/* Action Buttons: Scan Blackboard or Note & Gallery */}
      <View style={styles.scanActionsRow}>
        <TouchableOpacity
          style={styles.scanPrimaryBtn}
          onPress={handleCameraCapture}
          activeOpacity={0.85}
          disabled={isProcessingOcr}
        >
          <Camera size={18} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.scanPrimaryText}>Scan Blackboard or Note</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gallerySecondaryBtn}
          onPress={handleGalleryPicker}
          activeOpacity={0.85}
          disabled={isProcessingOcr}
        >
          <ImageIcon size={18} color={Colors.primaryForest} strokeWidth={2.2} />
          <Text style={styles.gallerySecondaryText}>Gallery / Image</Text>
        </TouchableOpacity>
      </View>

      {/* Blackboard Viewfinder Frame / Chalk Board Simulation */}
      <View style={styles.blackboardFrame}>
        <View style={styles.chalkContent}>
          {/* Corner target brackets */}
          <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
          <View style={[styles.cornerBracket, styles.bracketTopRight]} />
          <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
          <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.blackboardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.chalkTextContainer}>
              <Text style={styles.chalkTextMain}>आज हम जानवरों के नाम सीखेंगे।</Text>
              <Text style={styles.chalkTextSub}>हाथी, शेर, गाय, कुत्ता, बिल्ली।</Text>
            </View>
          )}

          {selectedImage && (
            <TouchableOpacity style={styles.closeImageBtn} onPress={clearImage}>
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* OCR Status Pill */}
      {isProcessingOcr ? (
        <View style={styles.ocrLoadingPill}>
          <ActivityIndicator size="small" color={Colors.primaryForest} />
          <Text style={styles.ocrLoadingPillText}>Extracting text from image...</Text>
        </View>
      ) : ocrStatus ? (
        <View style={styles.ocrSuccessPill}>
          <CheckCircle size={16} color="#2E7D32" />
          <Text style={styles.ocrSuccessPillText}>{ocrStatus}</Text>
        </View>
      ) : ocrError ? (
        <View style={styles.ocrErrorPill}>
          <AlertCircle size={16} color={Colors.terracotta} />
          <Text style={styles.ocrErrorPillText}>{ocrError}</Text>
        </View>
      ) : null}

      {/* Extracted Hindi Text Editor */}
      <View style={styles.editorCard}>
        <View style={styles.editorHeaderRow}>
          <Text style={styles.editorLabel}>Extracted / Edit Hindi Text</Text>
          <TouchableOpacity onPress={() => setInputText("")} activeOpacity={0.7}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={3}
          placeholder="Type or scan Hindi text..."
          placeholderTextColor={Colors.textMuted}
        />

        <View style={styles.charCountRow}>
          <Text style={styles.charCountText}>{inputText.length} / 500</Text>
        </View>

        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => handleTranslate(inputText)}
          activeOpacity={0.88}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.generateBtnText}>Generate Dual-Script Translation →</Text>
        </TouchableOpacity>
      </View>

      {/* Dual Script Output Card */}
      {result && (
        <View style={styles.outputCard}>
          <View style={styles.outputHeaderRow}>
            <Text style={styles.outputTitle}>{meta.name.toUpperCase()} DUAL-SCRIPT OUTPUT</Text>
            <View style={styles.scriptBadge}>
              <Text style={styles.scriptBadgeText}>{meta.script} Script</Text>
            </View>
          </View>

          {/* Native Script Box */}
          <View style={styles.nativeDisplayBox}>
            <Text style={styles.nativeScriptText}>{result.native}</Text>
            <TouchableOpacity
              style={styles.outputAudioBtn}
              onPress={() => speakNative(result.roman, meta.ttsLocale)}
              activeOpacity={0.8}
            >
              <Volume2 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Pronunciation */}
          <View style={styles.pronunciationBox}>
            <Text style={styles.pronunciationLabel}>Pronunciation (Roman)</Text>
            <Text style={styles.pronunciationText}>{result.roman}</Text>
          </View>

          {/* Word by Word Breakdown Table */}
          <Text style={styles.tableTitle}>Word-by-Word Breakdown</Text>
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 1.2 }]}>Hindi Word</Text>
              <Text style={[styles.thCell, { flex: 1.2 }]}>Meaning</Text>
              <Text style={[styles.thCell, { flex: 1.5 }]}>{meta.name}</Text>
              <Text style={[styles.thCell, { flex: 1.2 }]}>Phonetic</Text>
            </View>

            {result.tokens.map((tok, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 && { backgroundColor: "#FAF7F0" }]}
              >
                <Text style={[styles.tdCell, { flex: 1.2, fontWeight: "700" }]}>{tok.source}</Text>
                <Text style={[styles.tdCell, { flex: 1.2, color: Colors.textMuted }]}>
                  {tok.roman || "—"}
                </Text>
                <Text
                  style={[
                    styles.tdCell,
                    { flex: 1.5, fontWeight: "800", color: Colors.primaryForest },
                  ]}
                >
                  {tok.native || "—"}
                </Text>
                <Text style={[styles.tdCell, { flex: 1.2, fontStyle: "italic" }]}>
                  {tok.roman || "—"}
                </Text>
              </View>
            ))}
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.8}>
              {copied ? (
                <Check size={16} color="#2E7D32" />
              ) : (
                <Copy size={16} color={Colors.primaryForest} />
              )}
              <Text style={styles.actionBtnText}>{copied ? "Copied" : "Copy"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleSave} activeOpacity={0.8}>
              {isSaved ? (
                <Check size={16} color="#2E7D32" />
              ) : (
                <BookOpen size={16} color={Colors.primaryForest} />
              )}
              <Text style={styles.actionBtnText}>{isSaved ? "Saved" : "Save"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handlePrint} activeOpacity={0.8}>
              <Printer size={16} color={Colors.primaryForest} />
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setInputText("");
                setResult(null);
              }}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color={Colors.terracotta} />
              <Text style={[styles.actionBtnText, { color: Colors.terracotta }]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sample Lesson Prompts Horizontal Cards */}
      <View style={[styles.sectionHeaderRow, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>Sample Lesson Prompts</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptsRow}
      >
        {samplePromptCategories.map((cat, i) => (
          <TouchableOpacity
            key={i}
            style={styles.promptCard}
            onPress={() => {
              setInputText(cat.text);
              handleTranslate(cat.text);
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 28, marginBottom: 4 }}>{cat.emoji}</Text>
            <Text style={styles.promptCardLabel}>{cat.label}</Text>
            <Text style={styles.promptCardSub}>({cat.sub})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Related Classroom Sentences */}
      <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
        <Text style={styles.sectionTitle}>Related Classroom Sentences</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sentencesList}>
        {relatedSentences.map((sent, i) => (
          <View key={i} style={styles.sentenceItem}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.sentHindi}>{sent.hi}</Text>
              <Text style={styles.sentNative}>{sent.native}</Text>
              <Text style={styles.sentRoman}>{sent.roman}</Text>
            </View>
            <TouchableOpacity
              style={styles.sentAudioBtn}
              onPress={() => speakNative(sent.roman, meta.ttsLocale)}
            >
              <Volume2 size={16} color={Colors.primaryForest} />
            </TouchableOpacity>
          </View>
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
  headerBadgeRow: {
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
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  scanActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  scanPrimaryBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primaryForest,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: Colors.primaryForest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scanPrimaryText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  gallerySecondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 14,
  },
  gallerySecondaryText: {
    color: Colors.primaryForest,
    fontSize: 12.5,
    fontWeight: "800",
  },
  blackboardFrame: {
    backgroundColor: "#2B3A33",
    borderRadius: 18,
    borderWidth: 6,
    borderColor: "#8D6200",
    padding: 16,
    marginBottom: 12,
    minHeight: 150,
    justifyContent: "center",
  },
  chalkContent: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  cornerBracket: {
    position: "absolute",
    width: 16,
    height: 16,
    borderColor: "rgba(255,255,255,0.7)",
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  chalkTextContainer: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  chalkTextMain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  chalkTextSub: {
    fontSize: 14,
    color: "#E2EBE4",
    textAlign: "center",
    marginTop: 6,
  },
  blackboardImage: {
    width: "100%",
    height: 130,
    borderRadius: 8,
  },
  closeImageBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  ocrLoadingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.lightGreen,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  ocrLoadingPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  ocrSuccessPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  ocrSuccessPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  ocrErrorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.terracottaLight,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  ocrErrorPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  editorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  editorHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  editorLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 65,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCountRow: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  charCountText: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.warmOrange,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.warmOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  generateBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  outputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryForest,
    marginBottom: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  outputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  outputTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.primaryForest,
    letterSpacing: 0.5,
  },
  scriptBadge: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scriptBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  nativeDisplayBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4FAF6",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#C2E2D0",
  },
  nativeScriptText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primaryForest,
    lineHeight: 30,
  },
  outputAudioBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  pronunciationBox: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  pronunciationLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  pronunciationText: {
    fontSize: 13.5,
    fontStyle: "italic",
    color: Colors.text,
    marginTop: 2,
  },
  tableTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  tableContainer: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.lightGreen,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  thCell: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tdCell: {
    fontSize: 11,
    color: Colors.text,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#FAF7F0",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primaryForest,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  promptsRow: {
    gap: 10,
  },
  promptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 78,
  },
  promptCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  promptCardSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  sentencesList: {
    gap: 8,
  },
  sentenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sentHindi: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  sentNative: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primaryForest,
    marginTop: 2,
  },
  sentRoman: {
    fontSize: 11,
    fontStyle: "italic",
    color: Colors.textMuted,
    marginTop: 1,
  },
  sentAudioBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
});
