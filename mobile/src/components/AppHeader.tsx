import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, HelpCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  onHelpPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  badge,
  showBack = false,
  onBackPress,
  rightAction,
  onHelpPress,
}) => {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 12);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onBackPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBtn} />
        )}

        {badge ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {rightAction ? (
          rightAction
        ) : onHelpPress ? (
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onHelpPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Help"
          >
            <HelpCircle size={20} color={Colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBtn} />
        )}
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  badgeContainer: {
    backgroundColor: Colors.softYellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F2D88C",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#996B00",
    letterSpacing: 0.3,
  },
  titleSection: {
    marginTop: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
});
