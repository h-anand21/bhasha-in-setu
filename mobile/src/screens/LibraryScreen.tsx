import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Download,
  HardDriveDownload,
  Check,
  Volume2,
  Trash2,
  Search,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { Colors } from "../theme/colors";
import { useLanguage } from "../context/LanguageContext";
import { translate } from "../lib/translate";
import { speakNative } from "../services/speech";
import {
  getStoredLessons,
  syncAllLessons,
  toggleLessonSync,
  clearLessonsOfflineCache,
  type LessonRecord,
} from "../services/database";

export function LibraryScreen() {
  const { lang, meta } = useLanguage();
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openLessonId, setOpenLessonId] = useState<string | null>("fln-l1");
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    loadLessons();
  }, [activeCategory, search]);

  const loadLessons = () => {
    try {
      const data = getStoredLessons(activeCategory, search);
      setLessons(data);
    } catch (e) {
      console.warn("Error loading lessons from SQLite:", e);
    }
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      syncAllLessons();
      loadLessons();
      setIsSyncingAll(false);
    }, 900);
  };

  const handleToggleSync = (id: string) => {
    toggleLessonSync(id);
    loadLessons();
  };

  const handleClearCache = () => {
    clearLessonsOfflineCache();
    loadLessons();
  };

  const syncedCount = lessons.filter((l) => l.is_synced).length;
  const isAllSynced = syncedCount === lessons.length && lessons.length > 0;

  const categories = [
    { id: "all", label: `All (${lessons.length})` },
    { id: "oral", label: "Oral Language (OL)" },
    { id: "math", label: "Numeracy & Math (N)" },
    { id: "evs", label: "Environment (EVS)" },
    { id: "health", label: "Hygiene & Health (H)" },
    { id: "arts", label: "Rhymes & Arts (CA)" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <ShieldCheck size={12} color={Colors.salGreen} />
            <Text style={styles.badgeText}>SQLITE PERSISTENCE ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.title}>Offline Lesson Library</Text>
        <Text style={styles.subtitle}>
          Download once — teach for the whole semester with zero Wi-Fi or cellular data.
        </Text>
      </View>

      {/* 1-Click Sync All Button */}
      <TouchableOpacity
        style={[styles.syncAllBtn, isAllSynced && styles.syncAllBtnDone]}
        onPress={handleSyncAll}
        disabled={isSyncingAll || isAllSynced}
        activeOpacity={0.85}
      >
        {isSyncingAll ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.syncAllBtnText}>Syncing All 16 Lessons to SQLite…</Text>
          </>
        ) : isAllSynced ? (
          <>
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.syncAllBtnText}>All 16 Lessons Synced to SQLite (100% Offline)</Text>
          </>
        ) : (
          <>
            <Zap size={18} color="#FFFFFF" />
            <Text style={styles.syncAllBtnText}>⚡ Download All 16 Lessons (1-Click Term Sync)</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Storage Stat Overview Card */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{syncedCount}/{lessons.length}</Text>
          <Text style={styles.statLabel}>Lessons Cached</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>~8.5 MB</Text>
          <Text style={styles.statLabel}>SQLite Storage</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>0 ms</Text>
          <Text style={styles.statLabel}>Offline Latency</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBox}>
        <Search size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by lesson, number, or keyword (उदा. गिनती, मौसम)…"
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === activeCategory;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, isSelected && styles.catPillSelected]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.catPillText, isSelected && styles.catPillTextSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lesson List */}
      <View style={styles.lessonsList}>
        {lessons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No lessons matched your search filter.</Text>
          </View>
        ) : (
          lessons.map((lesson) => {
            const isOpen = openLessonId === lesson.id;
            return (
              <View key={lesson.id} style={styles.lessonCard}>
                <View style={styles.lessonHeaderRow}>
                  <View style={styles.lessonNumBox}>
                    <Text style={styles.lessonNumText}>L{lesson.lesson_number}</Text>
                  </View>

                  <View style={styles.lessonTitleCol}>
                    <Text style={styles.lessonTitleEn}>{lesson.title_en}</Text>
                    <Text style={styles.lessonTitleHi}>{lesson.title_hi}</Text>
                    <Text style={styles.lessonOutcome}>{lesson.outcome_en}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.syncToggleBtn,
                      lesson.is_synced && styles.syncToggleBtnDone,
                    ]}
                    onPress={() => handleToggleSync(lesson.id)}
                  >
                    {lesson.is_synced ? (
                      <Check size={14} color={Colors.salGreen} />
                    ) : (
                      <Download size={14} color={Colors.terracotta} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Open/Close Drawer Button */}
                <TouchableOpacity
                  style={styles.drawerToggleBtn}
                  onPress={() => setOpenLessonId(isOpen ? null : lesson.id)}
                >
                  <Text style={styles.drawerToggleText}>
                    {isOpen ? "Close Sentences" : `View ${lesson.lines.length} Practice Sentences`}
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={16} color={Colors.terracotta} />
                  ) : (
                    <ChevronDown size={16} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>

                {/* Expanded Sentences Drawer */}
                {isOpen && (
                  <View style={styles.sentencesDrawer}>
                    {lesson.lines.map((line, idx) => {
                      const out = translate(line, lang);
                      return (
                        <View key={idx} style={styles.sentenceRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.lineHindi}>{line}</Text>
                            <Text style={styles.lineNative}>{out.native}</Text>
                            <Text style={styles.lineRoman}>{out.roman}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.lineAudioBtn}
                            onPress={() => speakNative(out.roman, meta.ttsLocale)}
                          >
                            <Volume2 size={16} color={Colors.terracotta} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Storage Footer Management */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
          <Trash2 size={14} color={Colors.destructive} />
          <Text style={styles.clearCacheText}>Clear Offline Cache</Text>
        </TouchableOpacity>
        <Text style={styles.storageNote}>Engine: SQLite (Local Device Storage)</Text>
      </View>
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
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.salGreenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.salGreen,
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
  syncAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.terracotta,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  syncAllBtnDone: {
    backgroundColor: Colors.salGreen,
  },
  syncAllBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.deepIndigo,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 10,
  },
  catPill: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  catPillSelected: {
    backgroundColor: Colors.deepIndigo,
    borderColor: Colors.deepIndigo,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
  },
  catPillTextSelected: {
    color: "#FFFFFF",
  },
  lessonsList: {
    gap: 10,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  lessonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lessonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lessonNumBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.terracottaLight,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.terracotta,
  },
  lessonTitleCol: {
    flex: 1,
  },
  lessonTitleEn: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  lessonTitleHi: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  lessonOutcome: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.salGreen,
    marginTop: 2,
  },
  syncToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.terracottaLight,
    justifyContent: "center",
    alignItems: "center",
  },
  syncToggleBtnDone: {
    backgroundColor: Colors.salGreenLight,
  },
  drawerToggleBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.sandDark,
    marginTop: 10,
    paddingTop: 8,
  },
  drawerToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.terracotta,
  },
  sentencesDrawer: {
    marginTop: 10,
    backgroundColor: Colors.sand,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  sentenceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lineHindi: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  lineNative: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.deepIndigo,
    marginVertical: 2,
  },
  lineRoman: {
    fontSize: 10,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  lineAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.terracottaLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  clearCacheBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearCacheText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.destructive,
  },
  storageNote: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
