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
  Check,
  Volume2,
  Trash2,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
  BookOpen,
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
import { StatusBadge } from "../components/StatusBadge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function LibraryScreen() {
  const { lang, meta } = useLanguage();
  const insets = useSafeAreaInsets();
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
    { id: "oral", label: "Oral Language" },
    { id: "math", label: "Math & Numeracy" },
    { id: "evs", label: "EVS & Nature" },
    { id: "health", label: "Health & Habits" },
    { id: "arts", label: "Arts & Rhymes" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 6, 16),
          paddingBottom: insets.bottom + 115,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Badges */}
      <View style={styles.badgeRow}>
        <StatusBadge label="SQLITE PERSISTENCE ACTIVE" variant="sqlite" />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Offline Lesson Library</Text>
          <Text style={styles.subtitle}>
            16 foundational lessons cached locally in SQLite. Teach anywhere with zero internet.
          </Text>
        </View>
        <View style={styles.headerIconBox}>
          <Text style={{ fontSize: 32 }}>🏛️</Text>
        </View>
      </View>

      {/* Storage Stats Row */}
      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>
            {syncedCount}/{lessons.length}
          </Text>
          <Text style={styles.statLabel}>Synced Lessons</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>8.5 MB</Text>
          <Text style={styles.statLabel}>Cached Audio</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statVal}>0 ms</Text>
          <Text style={styles.statLabel}>Offline Latency</Text>
        </View>
      </View>

      {/* Main Download All CTA Button */}
      <TouchableOpacity
        style={[styles.syncAllBtn, isAllSynced && styles.syncAllBtnDone]}
        onPress={handleSyncAll}
        disabled={isSyncingAll || isAllSynced}
        activeOpacity={0.88}
      >
        {isSyncingAll ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.syncAllBtnText}>Syncing All 16 Lessons...</Text>
          </>
        ) : isAllSynced ? (
          <>
            <Check size={18} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.syncAllBtnText}>All 16 Lessons Synced ✓</Text>
          </>
        ) : (
          <>
            <Download size={18} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.syncAllBtnText}>Download All 16 Lessons for Offline Use</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Search size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search lessons, topics or words..."
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {/* Category Pills Carousel */}
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
              activeOpacity={0.8}
            >
              <Text style={[styles.catPillText, isSelected && styles.catPillTextSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Lessons Accordion List */}
      <View style={styles.lessonsList}>
        {lessons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No lessons found matching your search.</Text>
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
                    style={[styles.syncToggleBtn, lesson.is_synced && styles.syncToggleBtnDone]}
                    onPress={() => handleToggleSync(lesson.id)}
                  >
                    {lesson.is_synced ? (
                      <Check size={14} color="#2E7D32" strokeWidth={2.8} />
                    ) : (
                      <Download size={14} color={Colors.primaryForest} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Open/Close Drawer Button */}
                <TouchableOpacity
                  style={styles.drawerToggleBtn}
                  onPress={() => setOpenLessonId(isOpen ? null : lesson.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.drawerToggleText}>
                    {isOpen
                      ? "Close Sentences"
                      : `View Practice Sentences (${lesson.lines.length})`}
                  </Text>
                  {isOpen ? (
                    <ChevronUp size={16} color={Colors.primaryForest} />
                  ) : (
                    <ChevronDown size={16} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>

                {/* Expanded Sentences */}
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
                            <Volume2 size={15} color={Colors.primaryForest} />
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

      {/* Storage Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
          <Trash2 size={13} color={Colors.terracotta} />
          <Text style={styles.clearCacheText}>Clear Offline Cache</Text>
        </TouchableOpacity>
        <Text style={styles.storageNote}>SQLite Local Storage</Text>
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
  badgeRow: {
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
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  subtitle: {
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
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  syncAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryForest,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: Colors.primaryForest,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 3,
  },
  syncAllBtnDone: {
    backgroundColor: "#2E7D32",
  },
  syncAllBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
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
    borderColor: Colors.border,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillSelected: {
    backgroundColor: Colors.primaryForest,
    borderColor: Colors.primaryForest,
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
    marginTop: 4,
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
    borderColor: Colors.border,
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
    backgroundColor: Colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.primaryForest,
  },
  lessonTitleCol: {
    flex: 1,
  },
  lessonTitleEn: {
    fontSize: 13.5,
    fontWeight: "800",
    color: Colors.text,
  },
  lessonTitleHi: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  lessonOutcome: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 2,
  },
  syncToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.lightGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  syncToggleBtnDone: {
    backgroundColor: "#E8F5E9",
  },
  drawerToggleBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    marginTop: 10,
    paddingTop: 8,
  },
  drawerToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryForest,
  },
  sentencesDrawer: {
    marginTop: 10,
    backgroundColor: Colors.background,
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
    borderColor: Colors.border,
  },
  lineHindi: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  lineNative: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primaryForest,
    marginVertical: 2,
  },
  lineRoman: {
    fontSize: 10,
    fontStyle: "italic",
    color: Colors.textMuted,
  },
  lineAudioBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.lightGreen,
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
    color: Colors.terracotta,
  },
  storageNote: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
