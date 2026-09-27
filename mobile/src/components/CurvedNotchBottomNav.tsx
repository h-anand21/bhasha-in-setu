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
import { Home, BookOpen, Mic, BarChart2, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  // Elevated floating pill dimensions
  const navMargin = 16;
  const navWidth = width - navMargin * 2;
  const navHeight = 72;
  const cx = navWidth / 2;

  // Cutout notch dimensions
  const notchRadius = 40; // radius of the concave notch
  const notchFillet = 16; // smooth transition curve into horizontal edge
  const notchDepth = 38; // depth of the scoop
  const pillRadius = 32; // roundness of the entire navbar container

  // Safe area bottom position (elevated higher as requested)
  const bottomPosition = Math.max(insets.bottom + 12, 22);

  // Exact mathematical Bezier path for the concave scooped notch navbar
  const d = `
    M ${pillRadius},0
    L ${cx - notchRadius - notchFillet},0
    C ${cx - notchRadius},0 ${cx - notchRadius + 6},${notchDepth * 0.35} ${cx - notchRadius + 10},${notchDepth * 0.65}
    C ${cx - 16},${notchDepth + 4} ${cx + 16},${notchDepth + 4} ${cx + notchRadius - 10},${notchDepth * 0.65}
    C ${cx + notchRadius - 6},${notchDepth * 0.35} ${cx + notchRadius},0 ${cx + notchRadius + notchFillet},0
    L ${navWidth - pillRadius},0
    Q ${navWidth},0 ${navWidth},${pillRadius}
    L ${navWidth},${navHeight - pillRadius}
    Q ${navWidth},${navHeight} ${navWidth - pillRadius},${navHeight}
    L ${pillRadius},${navHeight}
    Q 0,${navHeight} 0,${navHeight - pillRadius}
    L 0,${pillRadius}
    Q 0,0 ${pillRadius},0
    Z
  `;

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: bottomPosition,
          left: navMargin,
          right: navMargin,
          width: navWidth,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* SVG Background container with soft layered shadow */}
      <View style={[styles.svgContainer, { width: navWidth, height: navHeight }]}>
        <Svg width={navWidth} height={navHeight} viewBox={`0 0 ${navWidth} ${navHeight}`}>
          <Defs>
            <LinearGradient id="navbarBgGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="100%" stopColor="#F5F9FD" stopOpacity="0.98" />
            </LinearGradient>
            <LinearGradient id="navbarBorderGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          <Path
            d={d}
            fill="url(#navbarBgGradient)"
            stroke="url(#navbarBorderGradient)"
            strokeWidth="1.2"
          />
        </Svg>
      </View>

      {/* Navigation Tabs Row */}
      <View style={[styles.buttonsRow, { height: navHeight }]}>
        {/* Left Tabs: Home & Lessons */}
        <View style={styles.tabHalf}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Home")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <View style={[styles.iconBox, activeTab === "Home" && styles.activePillBox]}>
              <Home
                size={23}
                color={activeTab === "Home" ? "#FFFFFF" : "#526071"}
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
            <View style={[styles.iconBox, activeTab === "Lessons" && styles.activePillBox]}>
              <BookOpen
                size={23}
                color={activeTab === "Lessons" ? "#FFFFFF" : "#526071"}
                strokeWidth={activeTab === "Lessons" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Lessons" && styles.activeTabLabel]}>
              Lessons
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Clearance Gap for Floating Mic */}
        <View style={styles.centerGap} pointerEvents="none" />

        {/* Right Tabs: Progress & Profile */}
        <View style={styles.tabHalf}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => onTabPress("Progress")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Progress"
          >
            <View style={[styles.iconBox, activeTab === "Progress" && styles.activePillBox]}>
              <BarChart2
                size={23}
                color={activeTab === "Progress" ? "#FFFFFF" : "#526071"}
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
            <View style={[styles.iconBox, activeTab === "Profile" && styles.activePillBox]}>
              <User
                size={23}
                color={activeTab === "Profile" ? "#FFFFFF" : "#526071"}
                strokeWidth={activeTab === "Profile" ? 2.6 : 2}
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === "Profile" && styles.activeTabLabel]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Center Microphone */}
      <View style={styles.floatingMicWrapper} pointerEvents="box-none">
        {isListening ? (
          /* Active / Listening State: Pulsing Concentric Soundwave Arcs */
          <View style={styles.listeningWaves} pointerEvents="none">
            <Svg width={110} height={80} viewBox="0 0 110 80">
              {/* Left wave arcs */}
              <Path
                d="M 24,25 Q 16,40 24,55"
                fill="none"
                stroke="#FF385C"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity={0.85}
              />
              <Path
                d="M 14,18 Q 4,40 14,62"
                fill="none"
                stroke="#FF385C"
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0.5}
              />
              {/* Right wave arcs */}
              <Path
                d="M 86,25 Q 94,40 86,55"
                fill="none"
                stroke="#FF385C"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity={0.85}
              />
              <Path
                d="M 96,18 Q 106,40 96,62"
                fill="none"
                stroke="#FF385C"
                strokeWidth="3"
                strokeLinecap="round"
                opacity={0.5}
              />
            </Svg>
          </View>
        ) : (
          /* Idle State: 3 Upward Sunburst Rays */
          <View style={styles.idleSunburst} pointerEvents="none">
            <Svg width={70} height={32} viewBox="0 0 70 32">
              <Line
                x1="35"
                y1="2"
                x2="35"
                y2="13"
                stroke="#FFA000"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <Line
                x1="18"
                y1="7"
                x2="25"
                y2="16"
                stroke="#FF7043"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <Line
                x1="52"
                y1="7"
                x2="45"
                y2="16"
                stroke="#FF7043"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}

        {/* Mic Circle Button */}
        <TouchableOpacity
          style={[styles.micCircleButton, isListening && styles.micCircleButtonListening]}
          onPress={() => onTabPress("Live")}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="Live Speech Mic"
        >
          <Mic size={29} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 8,
  },
  tabHalf: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
  },
  centerGap: {
    width: 72,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    minWidth: 56,
  },
  iconBox: {
    width: 58,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  activePillBox: {
    backgroundColor: "#FF6422",
    shadowColor: "#FF6422",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#526071",
    marginTop: 1,
  },
  activeTabLabel: {
    color: "#FF6422",
    fontWeight: "800",
  },
  floatingMicWrapper: {
    position: "absolute",
    top: -26,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  idleSunburst: {
    position: "absolute",
    top: -18,
    alignItems: "center",
  },
  listeningWaves: {
    position: "absolute",
    top: -6,
    alignItems: "center",
    justifyContent: "center",
  },
  micCircleButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FF6422",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#FF6422",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  micCircleButtonListening: {
    backgroundColor: "#FF385C",
    shadowColor: "#FF385C",
  },
});
