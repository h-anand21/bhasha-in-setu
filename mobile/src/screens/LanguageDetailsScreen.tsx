import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Volume2, CheckCircle2, Users, MapPin, BookOpen, ArrowRight } from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { speakNative } from "../services/speech";
import { AppHeader } from "../components/AppHeader";

export function LanguageDetailsScreen({ route, navigation }: any) {
  const { meta, lang, setLang } = useLanguage();

  const olChikiCharacters = [
    { char: "ᱚ", roman: "la" },
    { char: "ᱛ", roman: "at" },
    { char: "ᱜ", roman: "ag" },
    { char: "ᱝ", roman: "ang" },
    { char: "ᱞ", roman: "al" },
    { char: "ᱟ", roman: "laa" },
    { char: "ᱠ", roman: "aak" },
    { char: "ᱡ", roman: "aaj" },
    { char: "ᱢ", roman: "aam" },
    { char: "ᱣ", roman: "aaw" },
    { char: "ᱤ", roman: "li" },
    { char: "ᱥ", roman: "is" },
    { char: "ᱦ", roman: "ih" },
    { char: "ᱧ", roman: "iny" },
    { char: "ᱨ", roman: "ir" },
  ];

  const sampleWords = [
    { hi: "आज (Today)", native: "ᱛᱮᱦᱮᱧ", roman: "Tehenj" },
    { hi: "जानवर (Animals)", native: "ᱡᱤᱭᱟᱹᱞᱤ", roman: "Jiyali" },
    { hi: "हाथी (Elephant)", native: "ᱦᱟᱹᱛᱤ", roman: "Hati" },
    { hi: "गाय (Cow)", native: "ᱜᱟᱹᱭ", roman: "Gaay" },
    { hi: "कुत्ता (Dog)", native: "ᱥᱮᱛᱟ", roman: "Seta" },
  ];

  const handleConfirm = () => {
    navigation.navigate("MainTabs");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title={`${meta.name} (${meta.script})`}
        subtitle="Indigenous language profile & script overview"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Language Overview Card */}
      <View style={styles.overviewCard}>
        <View style={styles.cardTopRow}>
          <View style={styles.langIconBox}>
            <Text style={{ fontSize: 28 }}>📖</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.langTitle}>
              {meta.name} ({meta.nativeName})
            </Text>
            <Text style={styles.langDesc}>
              A major indigenous language of Jharkhand, Odisha, and West Bengal with standardized
              script.
            </Text>
          </View>
          <TouchableOpacity style={styles.speakerBtn} onPress={() => speakNative(meta.name)}>
            <Volume2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Users size={16} color={Colors.primaryForest} />
            <Text style={styles.statVal}>~7.2 Million</Text>
            <Text style={styles.statLabel}>Speakers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MapPin size={16} color={Colors.terracotta} />
            <Text style={styles.statVal}>Jharkhand</Text>
            <Text style={styles.statLabel}>Core Region</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <BookOpen size={16} color={Colors.ochre} />
            <Text style={styles.statVal}>{meta.script}</Text>
            <Text style={styles.statLabel}>Native Script</Text>
          </View>
        </View>
      </View>

      {/* Script Character Preview */}
      <Text style={styles.sectionTitle}>Script Preview ({meta.script})</Text>
      <View style={styles.charGrid}>
        {olChikiCharacters.map((c, i) => (
          <View key={i} style={styles.charBox}>
            <Text style={styles.charSymbol}>{c.char}</Text>
            <Text style={styles.charPhonetic}>{c.roman}</Text>
          </View>
        ))}
      </View>

      {/* Sample Vocabulary */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Sample Classroom Vocabulary</Text>
      <View style={styles.wordsList}>
        {sampleWords.map((w, idx) => (
          <View key={idx} style={styles.wordItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.wordHi}>{w.hi}</Text>
              <Text style={styles.wordNative}>{w.native}</Text>
              <Text style={styles.wordRoman}>Pronunciation: {w.roman}</Text>
            </View>
            <TouchableOpacity
              style={styles.wordAudioBtn}
              onPress={() => speakNative(w.roman, meta.ttsLocale)}
            >
              <Volume2 size={16} color={Colors.primaryForest} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Select & Continue CTA */}
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.88}>
        <Text style={styles.confirmBtnText}>Set {meta.name} as Classroom Language →</Text>
      </TouchableOpacity>
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
    paddingBottom: 40,
  },
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  langIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  langTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },
  langDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  speakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 3,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  charGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charBox: {
    width: "18%",
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  charSymbol: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  charPhonetic: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wordsList: {
    gap: 8,
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  wordHi: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Colors.text,
  },
  wordNative: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.primaryForest,
    marginTop: 2,
  },
  wordRoman: {
    fontSize: 10.5,
    fontStyle: "italic",
    color: Colors.textMuted,
    marginTop: 1,
  },
  wordAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtn: {
    backgroundColor: Colors.primaryForest,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    shadowColor: Colors.primaryForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
