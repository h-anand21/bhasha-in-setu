import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Polygon, Circle, G } from "react-native-svg";
import { setAppSetting } from "../services/database";

const { width, height } = Dimensions.get("window");

interface SlideData {
  id: string;
  image: any;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonColor: string;
}

const ONBOARDING_SLIDES: SlideData[] = [
  {
    id: "1",
    image: require("../../assets/onboarding/onboarding_1.png"),
    title: "A Stronger Classroom\nfor Every Child",
    subtitle: "Simple tools to bridge Hindi/English\nwith tribal languages in Jharkhand.",
    buttonText: "Next →",
    buttonColor: "#E85D26",
  },
  {
    id: "2",
    image: require("../../assets/onboarding/onboarding_2.png"),
    title: "Translate Instantly\nin the Classroom",
    subtitle: "Speak, type or scan Hindi text and get\nclear translations with native audio.",
    buttonText: "Next →",
    buttonColor: "#E85D26",
  },
  {
    id: "3",
    image: require("../../assets/onboarding/onboarding_3.png"),
    title: "Learn Anywhere\nEven Offline",
    subtitle: "Download lessons, worksheets and\naudio to teach anytime, even without internet.",
    buttonText: "Get Started →",
    buttonColor: "#0D4330",
  },
];

export function OnboardingScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleFinish = () => {
    try {
      setAppSetting("has_seen_onboarding", "true");
    } catch (e) {
      console.warn("Save setting error:", e);
    }
    navigation.replace("MainTabs");
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentIndex && slideIndex >= 0 && slideIndex < ONBOARDING_SLIDES.length) {
      setCurrentIndex(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <View style={[styles.slideContainer, { width, height }]}>
            {/* Top Background Artwork */}
            <ImageBackground source={item.image} style={styles.backgroundImage} resizeMode="cover">
              {/* Top Navigation Bar with Skip Button */}
              <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 10, 24) }]}>
                {index < ONBOARDING_SLIDES.length - 1 ? (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleFinish}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Skip onboarding"
                  >
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 64, height: 32 }} />
                )}
              </View>
            </ImageBackground>

            {/* Bottom Arched White Card Sheet with Tribal Foliage & Patterns */}
            <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom + 10, 20) }]}>
              {/* Left Decorative Botanical Leaves */}
              <View style={styles.leftFlourish} pointerEvents="none">
                <Svg width={42} height={80} viewBox="0 0 42 80">
                  <Path
                    d="M-4,80 C12,65 24,45 10,25 C20,38 32,28 36,12 C28,26 14,35 6,55 Z"
                    fill="#3A8A64"
                    opacity={0.85}
                  />
                  <Path
                    d="M-6,70 C8,56 16,36 30,30 C18,44 10,58 2,75 Z"
                    fill="#F2A641"
                    opacity={0.9}
                  />
                  <Path
                    d="M-2,80 C6,70 18,65 28,68 C16,74 8,78 0,82 Z"
                    fill="#D97724"
                    opacity={0.8}
                  />
                </Svg>
              </View>

              {/* Right Decorative Botanical Leaves */}
              <View style={styles.rightFlourish} pointerEvents="none">
                <Svg width={42} height={80} viewBox="0 0 42 80">
                  <Path
                    d="M46,80 C30,65 18,45 32,25 C22,38 10,28 6,12 C14,26 28,35 36,55 Z"
                    fill="#3A8A64"
                    opacity={0.85}
                  />
                  <Path
                    d="M48,70 C34,56 26,36 12,30 C24,44 32,58 40,75 Z"
                    fill="#F2A641"
                    opacity={0.9}
                  />
                  <Path
                    d="M44,80 C36,70 24,65 14,68 C26,74 34,78 42,82 Z"
                    fill="#D97724"
                    opacity={0.8}
                  />
                </Svg>
              </View>

              {/* 3 Pagination Dots */}
              <View style={styles.dotsRow}>
                {ONBOARDING_SLIDES.map((_, dotIdx) => {
                  const isActive = dotIdx === currentIndex;
                  return (
                    <View
                      key={dotIdx}
                      style={[
                        styles.dot,
                        isActive ? styles.activeDot : styles.inactiveDot,
                        isActive && dotIdx === 2 && { backgroundColor: "#0D4330" },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Title & Subtitle */}
              <View style={styles.textContainer}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subtitleText}>{item.subtitle}</Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: item.buttonColor }]}
                onPress={handleNext}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={item.buttonText}
              >
                <Text style={styles.actionButtonText}>{item.buttonText}</Text>
              </TouchableOpacity>

              {/* Sohrai / Kohbar Traditional Tribal Pattern Footer */}
              <View style={styles.tribalBandContainer} pointerEvents="none">
                <Svg width={width - 48} height={18} viewBox={`0 0 ${width - 48} 18`}>
                  {/* Base geometric line */}
                  <Path
                    d={`M 0,16 L ${width - 48},16`}
                    stroke="#D97724"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity={0.7}
                  />
                  {/* Repeating terracotta triangles and diamond glyphs */}
                  {Array.from({ length: 14 }).map((_, i) => {
                    const segW = (width - 48) / 14;
                    const x = i * segW + segW / 2;
                    return (
                      <G key={i}>
                        <Polygon
                          points={`${x - 9},15 ${x},3 ${x + 9},15`}
                          fill="none"
                          stroke="#E28738"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                          opacity={0.75}
                        />
                        <Circle cx={x} cy={10} r={1.5} fill="#9C4A1A" opacity={0.8} />
                      </G>
                    );
                  })}
                </Svg>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF7EF",
  },
  slideContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  backgroundImage: {
    width: "100%",
    height: "62%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 22,
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5DFD5",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skipButtonText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#2D3748",
  },
  bottomSheet: {
    position: "relative",
    height: "42%",
    marginTop: "-9%",
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    paddingHorizontal: 26,
    paddingTop: 20,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E8DC",
    ...Platform.select({
      ios: {
        shadowColor: "#0F261C",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  leftFlourish: {
    position: "absolute",
    left: 4,
    bottom: 24,
    zIndex: 1,
  },
  rightFlourish: {
    position: "absolute",
    right: 4,
    bottom: 24,
    zIndex: 1,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
    zIndex: 2,
  },
  dot: {
    height: 9,
    borderRadius: 4.5,
  },
  activeDot: {
    width: 22,
    backgroundColor: "#E85D26",
  },
  inactiveDot: {
    width: 9,
    backgroundColor: "#FCE5D6",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 2,
  },
  titleText: {
    fontSize: 23,
    fontWeight: "900",
    color: "#0F382A",
    textAlign: "center",
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 14,
    color: "#4D6B5D",
    textAlign: "center",
    lineHeight: 20.5,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#E85D26",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  tribalBandContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 2,
    zIndex: 1,
  },
});
