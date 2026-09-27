import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Rect, Circle } from "react-native-svg";
import { Home, BookOpen, Mic, User } from "lucide-react-native";
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

  // Floating navbar geometry
  const navMargin = 16;
  const navWidth = width - navMargin * 2;
  const navHeight = 74;
  const cx = navWidth / 2;

  // Cutout notch dimensions
  const notchRadius = 40;
  const notchFillet = 16;
  const notchDepth = 38;
  const pillRadius = 34;

  // Elevation above bottom safe area
  const bottomPosition = Math.max(insets.bottom + 10, 20);

  // Exact mathematical Bezier path for scooped notch cutout
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

  // Custom 3-bar Progress Icon matching the reference image
  const renderProgressIcon = (isActive: boolean) => {
    const barColor = isActive ? "#FFFFFF" : "#4A5568";
    return (
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <Rect x="2.5" y="8" width="3" height="9" rx="1.5" fill={barColor} />
        <Rect x="8.5" y="3" width="3" height="14" rx="1.5" fill={barColor} />
        <Rect x="14.5" y="6" width="3" height="11" rx="1.5" fill={barColor} />
      </Svg>
    );
  };

  // Helper to render tab item with exact reference active pill
  const renderTabItem = (
    tab: NavTabType,
    label: string,
    renderIcon: (isActive: boolean) => React.ReactNode,
  ) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress(tab)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.iconContainer}>
          {isActive ? (
            /* Active Orange Capsule with Gradient and Smooth Stadium Pill Shape */
            <View style={styles.activeCapsule}>
              <Svg width={58} height={36} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="orangeCapsuleGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#FF7A1A" />
                    <Stop offset="100%" stopColor="#FF4B00" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width={58} height={36} rx={18} fill="url(#orangeCapsuleGrad)" />
              </Svg>
              <View style={styles.iconWrapper}>{renderIcon(true)}</View>
            </View>
          ) : (
            /* Inactive Clean Icon */
            <View style={styles.inactiveIconWrapper}>{renderIcon(false)}</View>
          )}
        </View>
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
      </TouchableOpacity>
    );
  };

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
      {/* SVG Background Container with Clouds and Soft Shadow */}
      <View style={[styles.svgContainer, { width: navWidth, height: navHeight }]}>
        <Svg width={navWidth} height={navHeight} viewBox={`0 0 ${navWidth} ${navHeight}`}>
          <Defs>
            <LinearGradient id="navbarBgGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="50%" stopColor="#FAFCFF" />
              <Stop offset="100%" stopColor="#F2F7FD" />
            </LinearGradient>
            <LinearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E3F0FD" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#D2E6FB" stopOpacity="0.4" />
            </LinearGradient>
            <LinearGradient id="navbarBorderGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
              <Stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>

          {/* Base Navbar Shape */}
          <Path
            d={d}
            fill="url(#navbarBgGradient)"
            stroke="url(#navbarBorderGradient)"
            strokeWidth="1.2"
          />

          {/* Subtle Aesthetic Cloud Silhouettes (matching reference design) */}
          <Path
            d={`M 15,${navHeight - 10} Q 40,${navHeight - 34} 70,${navHeight - 20} Q 95,${navHeight - 40} 130,${navHeight - 24} L 140,${navHeight} L 15,${navHeight} Z`}
            fill="url(#cloudGrad)"
            opacity={0.5}
          />
          <Path
            d={`M ${navWidth - 140},${navHeight - 22} Q ${navWidth - 110},${navHeight - 42} ${navWidth - 75},${navHeight - 24} Q ${navWidth - 45},${navHeight - 36} ${navWidth - 15},${navHeight - 12} L ${navWidth - 15},${navHeight} L ${navWidth - 140},${navHeight} Z`}
            fill="url(#cloudGrad)"
            opacity={0.5}
          />
        </Svg>
      </View>

      {/* Navigation Tabs Row */}
      <View style={[styles.buttonsRow, { height: navHeight }]}>
        {/* Left Tabs: Home & Lessons */}
        <View style={styles.tabHalf}>
          {renderTabItem("Home", "Home", (isActive) => (
            <Home
              size={21}
              color={isActive ? "#FFFFFF" : "#4A5568"}
              fill={isActive ? "#FFFFFF" : "none"}
              strokeWidth={isActive ? 2 : 2.2}
            />
          ))}

          {renderTabItem("Lessons", "Lessons", (isActive) => (
            <BookOpen
              size={21}
              color={isActive ? "#FFFFFF" : "#4A5568"}
              strokeWidth={isActive ? 2.6 : 2.2}
            />
          ))}
        </View>

        {/* Center Clearance Gap for Floating Mic */}
        <View style={styles.centerGap} pointerEvents="none" />

        {/* Right Tabs: Progress & Profile */}
        <View style={styles.tabHalf}>
          {renderTabItem("Progress", "Progress", (isActive) => renderProgressIcon(isActive))}

          {renderTabItem("Profile", "Profile", (isActive) => (
            <User
              size={21}
              color={isActive ? "#FFFFFF" : "#4A5568"}
              strokeWidth={isActive ? 2.6 : 2.2}
            />
          ))}
        </View>
      </View>

      {/* Floating Center Microphone */}
      <View style={styles.floatingMicWrapper} pointerEvents="box-none">
        {isListening ? (
          /* Active / Listening State: Pulsing Concentric Soundwave Arcs */
          <View style={styles.listeningWaves} pointerEvents="none">
            <Svg width={110} height={80} viewBox="0 0 110 80">
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
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
      },
      android: {
        elevation: 14,
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
    width: 74,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
    paddingTop: 4,
  },
  iconContainer: {
    width: 58,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCapsule: {
    width: 58,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#FF5722",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.38,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#4A5568",
    marginTop: 2,
  },
  activeTabLabel: {
    color: "#FF5E14",
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
