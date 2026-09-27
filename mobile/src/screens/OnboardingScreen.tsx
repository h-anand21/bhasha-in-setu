import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAppSetting } from "../services/database";

const { width: W, height: H } = Dimensions.get("window");

export const slides = [
  {
    image: require("../../assets/onboarding/onboarding-1.png"),
    title: "A Stronger Classroom\nfor Every Child",
    description:
      "Simple tools to bridge Hindi/English\nwith tribal languages in Jharkhand.",
    button: "Next",
    buttonColor: "#FF5A00",
  },
  {
    image: require("../../assets/onboarding/onboarding-2.png"),
    title: "Translate Instantly\nin the Classroom",
    description:
      "Speak, type or scan Hindi text and get\nclear translations with native audio.",
    button: "Next",
    buttonColor: "#FF5A00",
  },
  {
    image: require("../../assets/onboarding/onboarding-3.png"),
    title: "Learn Anywhere\nEven Offline",
    description:
      "Download lessons, worksheets and\naudio to teach anytime, even without internet.",
    button: "Get Started",
    buttonColor: "#005B49",
  },
];

export function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const slide = slides[index];

  const finishOnboarding = () => {
    try {
      setAppSetting("has_seen_onboarding", "true");
    } catch (e) {
      console.warn("Save setting error:", e);
    }
    navigation.replace("MainTabs");
  };

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* =========================================
          HERO IMAGE
      ========================================= */}
      <View style={styles.hero}>
        <Image
          source={slide.image}
          style={[
            styles.heroImage,
            index === 0 && {
              transform: [{ translateY: 42 }],
            },
          ]}
          resizeMode="cover"
        />

        {/* Skip Button */}
        {index < slides.length - 1 ? (
          <TouchableOpacity
            style={[
              styles.skip,
              {
                top: Math.max(insets.top + 10, 26),
              },
            ]}
            onPress={finishOnboarding}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80, height: 44 }} />
        )}
      </View>

      {/* =========================================
          CONTENT CARD (Full Width & Seamless Overlap)
      ========================================= */}
      <View
        style={[
          styles.contentCard,
          {
            paddingBottom: Math.max(insets.bottom + 10, 22),
          },
        ]}
      >
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && [
                  styles.activeDot,
                  index === 2 && { backgroundColor: "#005B49" },
                ],
              ]}
            />
          ))}
        </View>

        {/* Heading */}
        <Text style={styles.title}>{slide.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{slide.description}</Text>

        {/* Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: slide.buttonColor,
            },
          ]}
          onPress={next}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={slide.button}
        >
          <Text style={styles.buttonText}>{slide.button}</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Bottom Tribal Decoration */}
        <View style={styles.bottomDecoration} pointerEvents="none">
          <View style={styles.sideLeavesLeft}>
            <Text style={styles.leaf}>❯</Text>
            <Text style={styles.leafOrange}>❯</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.pattern}>
            {Array.from({ length: 13 }).map((_, i) => (
              <View key={i} style={styles.patternItem}>
                <View style={styles.patternDiamond} />
                <View style={styles.patternDot} />
              </View>
            ))}
          </View>

          <View style={styles.sideLeavesRight}>
            <Text style={styles.leaf}>❮</Text>
            <Text style={styles.leafOrange}>❮</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFDF8",
    overflow: "hidden",
  },

  // =========================================
  // HERO (72% screen height to show extensive lower classroom details)
  // =========================================
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: W,
    height: H * 0.72,
    overflow: "hidden",
    backgroundColor: "#FAF7F0",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  // =========================================
  // SKIP
  // =========================================
  skip: {
    position: "absolute",
    right: 18,
    minWidth: 92,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: {
          width: 0,
          height: 3,
        },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  skipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#12372A",
  },

  // =========================================
  // CONTENT CARD (38% height, deep overlap over lower hero)
  // =========================================
  contentCard: {
    position: "absolute",
    left: -2,
    right: -2,
    bottom: -2,
    width: W + 4,
    height: H * 0.38,
    backgroundColor: "#FFFDF8",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 14,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: {
          width: 0,
          height: -8,
        },
      },
      android: {
        elevation: 14,
      },
    }),
  },

  // =========================================
  // PAGINATION
  // =========================================
  pagination: {
    height: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 5,
    backgroundColor: "#F8DCCF",
  },
  activeDot: {
    width: 34,
    backgroundColor: "#FF5A00",
  },

  // =========================================
  // TITLE
  // =========================================
  title: {
    width: "100%",
    textAlign: "center",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    color: "#064B3F",
    letterSpacing: -0.4,
    marginBottom: 2,
  },

  // =========================================
  // DESCRIPTION
  // =========================================
  description: {
    width: "100%",
    textAlign: "center",
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "500",
    color: "#587067",
    paddingHorizontal: 8,
    marginBottom: 6,
  },

  // =========================================
  // BUTTON
  // =========================================
  button: {
    width: "94%",
    height: 54,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: {
          width: 0,
          height: 5,
        },
      },
      android: {
        elevation: 7,
      },
    }),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
    fontWeight: "600",
  },

  // =========================================
  // DECORATION
  // =========================================
  bottomDecoration: {
    width: "100%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 0,
  },
  line: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    height: 1.5,
    backgroundColor: "#E6B36C",
    opacity: 0.7,
  },
  pattern: {
    width: "80%",
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  patternItem: {
    width: 16,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  patternDiamond: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: "#E6B36C",
    transform: [
      {
        rotate: "45deg",
      },
    ],
  },
  patternDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF8A25",
  },
  sideLeavesLeft: {
    position: "absolute",
    left: 4,
    bottom: 4,
    flexDirection: "row",
  },
  sideLeavesRight: {
    position: "absolute",
    right: 4,
    bottom: 4,
    flexDirection: "row",
  },
  leaf: {
    fontSize: 22,
    color: "#3E9B5B",
    fontWeight: "900",
  },
  leafOrange: {
    fontSize: 20,
    color: "#E99D3F",
    fontWeight: "900",
    marginLeft: -4,
  },
});
