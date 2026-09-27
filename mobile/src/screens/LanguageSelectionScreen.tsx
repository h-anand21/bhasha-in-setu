import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Search, Check, ChevronRight, Globe2, Volume2 } from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { type LangCode } from "../lib/lexicon";
import { AppHeader } from "../components/AppHeader";
import { speakNative } from "../services/speech";

export function LanguageSelectionScreen({ navigation }: any) {
  const { lang, setLang } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const popularLanguages = [
    {
      code: "sat",
      name: "Santhali",
      script: "Ol Chiki",
      native: "ᱥᱟᱱᱛᱟᱲᱤ",
      regions: "Jharkhand, Odisha, West Bengal",
    },
    { code: "hoc", name: "Ho", script: "Warang Citi", native: "𑢹𑣉𑣉", regions: "Jharkhand, Odisha" },
    {
      code: "unr",
      name: "Mundari",
      script: "Devanagari",
      native: "मुंडारी",
      regions: "Jharkhand, Chotanagpur",
    },
  ];

  const allLanguages = [
    {
      code: "sat",
      name: "Santhali",
      script: "Ol Chiki",
      native: "ᱥᱟᱱᱛᱟᱲᱤ",
      state: "Jharkhand, Odisha, West Bengal",
    },
    { code: "hoc", name: "Ho", script: "Warang Citi", native: "𑢹𑣉𑣉", state: "Jharkhand, Odisha" },
    { code: "unr", name: "Mundari", script: "Devanagari", native: "मुंडारी", state: "Jharkhand" },
    {
      code: "kur",
      name: "Kurmali",
      script: "Devanagari",
      native: "कुड़माली",
      state: "Jharkhand, West Bengal",
    },
    {
      code: "kud",
      name: "Kudmali",
      script: "Devanagari",
      native: "कुड़मालि",
      state: "Jharkhand, West Bengal",
    },
    {
      code: "sad",
      name: "Sadri",
      script: "Devanagari",
      native: "सादरी",
      state: "Jharkhand, Chhattisgarh",
    },
    {
      code: "kha",
      name: "Kharia",
      script: "Devanagari",
      native: "खड़िया",
      state: "Jharkhand, Odisha",
    },
    {
      code: "kru",
      name: "Kurukh (Oraon)",
      script: "Devanagari",
      native: "कुड़ुख़",
      state: "Jharkhand, Chhattisgarh",
    },
    {
      code: "bhu",
      name: "Bhumij",
      script: "Devanagari",
      native: "भूमिज",
      state: "Jharkhand, West Bengal",
    },
    {
      code: "mal",
      name: "Malto",
      script: "Devanagari",
      native: "माल्तो",
      state: "Jharkhand, Bihar",
    },
    { code: "pah", name: "Paharia", script: "Devanagari", native: "पहाड़िया", state: "Jharkhand" },
    {
      code: "gon",
      name: "Gondi",
      script: "Devanagari",
      native: "गोंडी",
      state: "Chhattisgarh, MP",
    },
    { code: "odi", name: "Odia (Tribal)", script: "Odia Script", native: "ଓଡ଼ିଆ", state: "Odisha" },
  ];

  const filteredLanguages = allLanguages.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.script.toLowerCase().includes(search.toLowerCase()) ||
      l.state.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (code: string) => {
    if (code === "sat" || code === "hoc" || code === "unr") {
      setLang(code as LangCode);
    }
    navigation.navigate("LanguageDetails", { langCode: code });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppHeader
        title="Choose Your Language"
        subtitle="Select the tribal mother tongue for classroom instruction and materials."
        showBack
        onBackPress={() => navigation.goBack()}
      />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search language, script or district..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Popular Languages Row */}
      <Text style={styles.sectionTitle}>Popular Classroom Languages</Text>
      <View style={styles.popularRow}>
        {popularLanguages.map((item) => {
          const isSelected = lang === item.code;
          return (
            <TouchableOpacity
              key={item.code}
              style={[styles.popularCard, isSelected && styles.popularCardSelected]}
              onPress={() => handleSelect(item.code)}
              activeOpacity={0.8}
            >
              <View style={[styles.popIconCircle, isSelected && styles.popIconCircleSelected]}>
                <Text style={{ fontSize: 16 }}>🌐</Text>
              </View>
              <Text style={[styles.popName, isSelected && styles.popNameSelected]}>
                {item.name}
              </Text>
              <Text style={styles.popScript}>({item.script})</Text>
              {isSelected && (
                <View style={styles.selectedCheck}>
                  <Check size={11} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* All Languages List */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
        All Regional Tribal Languages ({filteredLanguages.length})
      </Text>

      <View style={styles.allList}>
        {filteredLanguages.map((l) => {
          const isSelected = lang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              style={[styles.listItem, isSelected && styles.listItemSelected]}
              onPress={() => handleSelect(l.code)}
              activeOpacity={0.8}
            >
              <View style={styles.listIconBox}>
                <Globe2 size={16} color={Colors.primaryForest} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.listName}>{l.name}</Text>
                  <Text style={styles.listNative}>({l.native})</Text>
                </View>
                <Text style={styles.listSub}>
                  {l.script} • {l.state}
                </Text>
              </View>
              {isSelected ? (
                <View style={styles.listCheck}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <ChevronRight size={18} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: 40,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  popularRow: {
    flexDirection: "row",
    gap: 10,
  },
  popularCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: "relative",
  },
  popularCardSelected: {
    backgroundColor: Colors.primaryForest,
    borderColor: Colors.primaryForest,
  },
  popIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  popIconCircleSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  popName: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },
  popNameSelected: {
    color: "#FFFFFF",
  },
  popScript: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  selectedCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  allList: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listItemSelected: {
    borderColor: Colors.primaryForest,
    backgroundColor: "#F4FAF6",
  },
  listIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  listName: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Colors.text,
  },
  listNative: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  listSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryForest,
    alignItems: "center",
    justifyContent: "center",
  },
});
