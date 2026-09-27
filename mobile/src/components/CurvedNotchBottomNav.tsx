import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, G, Line, Circle } from "react-native-svg";
import { Home, BookOpen, Mic, BarChart3, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../theme/colors";

export type NavTabType = "Home" | "Lessons" | "Live" | "Progress" | "Profile";

interface CurvedNotchBottomNavProps {
  activeTab: NavTabType;
  onTabPress: (tab: NavTabType) => void;
  isListening?: boolean;
}

export const CurvedNotchBottomNav: React.FC<CurvedNotchBottomNavProps> = ({
  activeTab,
  onTabPress,
  isListening = false,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const navMargin = 16;
  const navWidth = width - navMargin * 2;
  const navHeight = 68;
  const cx = navWidth / 2;
  const r = 36; // cutout radius
  const fillet = 14; // smooth transition curve radius
  const bottomPadding = Math.max(insets.bottom, 10);

  // Smooth SVG Path with curved concave notch around the center mic
  const pathData = `
    M 24,0
    L ${cx - r - fillet},0
    C ${cx - r},0 ${cx - r + 4},${fillet} ${cx - r + 8},${fillet + 8}
    C ${cx - 16},${r + 8} ${cx + 16},${r + 8} ${cx + r - 8},${fillet + 8}
    C ${cx + r - 4},${fillet} ${cx + r},0 ${cx + r + fillet},0
    L ${navWidth - 24},0
    Q ${navWidth},0 ${navWidth},24
    L ${navWidth},${navHeight - 20}
    Q ${navWidth},${navHeight} ${navWidth - 20},${navHeight}
    L 20,${navHeight}
    Q 0,${navHeight} 0,${navHeight - 20}
    L 0,24
    Q 0,0 24,0
    Z
  `;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: bottomPadding,
          left: navMargin,
          right: navMargin,
          width: navWidth,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* SVG Background with notch */}
      <View style={[styles.svgContainer, { width: navWidth, height: navHeight }]}>
        <Svg width={navWidth} height={navHeight} viewBox={`0 0 ${navWidth} ${navHeight}`}>
          <Defs>
            <LinearGradient id="navBgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
              <Stop offset="100%" stopColor="#FAF7F0" stopOpacity="0.96" />
            </LinearGradient>
            <LinearGradient id="navBorderGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#E5E0D6" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#F47A3C" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#E5E0D6" stopOpacity="0.8" />
            </LinearGradient>
          </Defs>
          <Path d={pathData} fill="url(#navBgGrad)" stroke="#E5E0D6" strokeWidth="1.2" />
        </Svg>
      </View>

      {/* Navigation Buttons Row */}
      <View style={[styles.buttonsContainer, { height: navHeight }]}>
        {/* Left Side: Home & Lessons */}
        <View style={styles.tabGroup}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Home")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <View
              style={[styles.iconContainer, activeTab === "Home" && styles.activePillContainer]}
            >
              <Home
                size={22}
                color={activeTab === "Home" ? "#FFFFFF" : Colors.textMuted}
                strokeWidth={activeTab === "Home" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Home" && styles.activeTabLabel]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Lessons")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Lessons"
          >
            <View
              style={[styles.iconContainer, activeTab === "Lessons" && styles.activePillContainer]}
            >
              <BookOpen
                size={22}
                color={activeTab === "Lessons" ? "#FFFFFF" : Colors.textMuted}
                strokeWidth={activeTab === "Lessons" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Lessons" && styles.activeTabLabel]}>
              Lessons
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Space for Floating Mic */}
        <View style={styles.centerGap} pointerEvents="none" />

        {/* Right Side: Progress & Profile */}
        <View style={styles.tabGroup}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Progress")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Progress"
          >
            <View
              style={[styles.iconContainer, activeTab === "Progress" && styles.activePillContainer]}
            >
              <BarChart3
                size={22}
                color={activeTab === "Progress" ? "#FFFFFF" : Colors.textMuted}
                strokeWidth={activeTab === "Progress" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Progress" && styles.activeTabLabel]}>
              Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Profile")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <View
              style={[styles.iconContainer, activeTab === "Profile" && styles.activePillContainer]}
            >
              <User
                size={22}
                color={activeTab === "Profile" ? "#FFFFFF" : Colors.textMuted}
                strokeWidth={activeTab === "Profile" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Profile" && styles.activeTabLabel]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Floating Mic Button */}
      <View style={styles.floatingMicWrapper} pointerEvents="box-none">
        {/* Glow rays / acoustic rings if listening or idle */}
        {isListening ? (
          <View style={styles.soundWaveRings}>
            <Svg width={100} height={100} viewBox="0 0 100 100">
              <Circle
                cx="50"
                cy="50"
                r="44"
                stroke="#FF5E3A"
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="4 4"
              />
              <Circle
                cx="50"
                cy="50"
                r="38"
                stroke="#FF5E3A"
                strokeWidth="2.5"
                strokeOpacity="0.5"
              />
            </Svg>
          </View>
        ) : (
          <View style={styles.idleRays}>
            <Svg width={84} height={40} viewBox="0 0 84 40">
              <Line
                x1="42"
                y1="2"
                x2="42"
                y2="10"
                stroke="#F47A3C"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Line
                x1="26"
                y1="6"
                x2="32"
                y2="13"
                stroke="#F47A3C"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <Line
                x1="58"
                y1="6"
                x2="52"
                y2="13"
                stroke="#F47A3C"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}

        <TouchableOpacity
          style={[styles.floatingMicButton, isListening && styles.listeningMicButton]}
          onPress={() => onTabPress("Live")}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Live Voice Dialogue"
        >
          <View style={styles.micInnerGlow}>
            <Mic size={30} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  tabGroup: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  centerGap: {
    width: 68,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minWidth: 54,
  },
  iconContainer: {
    width: 48,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  activePillContainer: {
    backgroundColor: Colors.warmOrange,
    shadowColor: Colors.warmOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    marginTop: 1,
  },
  activeTabLabel: {
    color: Colors.warmOrange,
    fontWeight: "700",
  },
  floatingMicWrapper: {
    position: "absolute",
    top: -22,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  idleRays: {
    position: "absolute",
    top: -18,
    alignItems: "center",
  },
  soundWaveRings: {
    position: "absolute",
    top: -16,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingMicButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.warmOrange,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.warmOrange,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  listeningMicButton: {
    backgroundColor: Colors.terracotta,
    borderColor: "#FFF0EB",
    shadowColor: Colors.terracotta,
  },
  micInnerGlow: {
    alignItems: "center",
    justifyContent: "center",
  },
});
