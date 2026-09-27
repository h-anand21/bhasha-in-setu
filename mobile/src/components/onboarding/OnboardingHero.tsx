import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingHeroProps {
  image: any;
  isLast: boolean;
  heroHeight: number;
  onSkip: () => void;
  scrollX: Animated.Value;
  index: number;
}

export function OnboardingHero({
  image,
  isLast,
  heroHeight,
  onSkip,
  scrollX,
  index,
}: OnboardingHeroProps) {
  const insets = useSafeAreaInsets();

  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-width * 0.12, 0, width * 0.12],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { height: heroHeight }]}>
      <Animated.View style={[styles.imageWrapper, { transform: [{ translateX }] }]}>
        <ImageBackground
          source={image}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Floating Skip Button */}
      <View style={[styles.skipContainer, { top: Math.max(insets.top + 14, 28) }]}>
        {!isLast ? (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 68, height: 42 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FAF7F0",
  },
  imageWrapper: {
    width: width * 1.14,
    height: "100%",
    marginLeft: -width * 0.07,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  skipContainer: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 223, 213, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#173D34",
    letterSpacing: 0.2,
  },
});
