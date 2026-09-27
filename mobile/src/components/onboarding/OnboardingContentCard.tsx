import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingPagination } from "./OnboardingPagination";
import { OnboardingButton } from "./OnboardingButton";
import { CulturalBorder } from "./CulturalBorder";

const { width } = Dimensions.get("window");

interface OnboardingContentCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  cardHeight: number;
  onPressButton: () => void;
  scrollX: Animated.Value;
  currentIndex: number;
  index: number;
}

export function OnboardingContentCard({
  title,
  description,
  buttonLabel,
  buttonColor,
  cardHeight,
  onPressButton,
  scrollX,
  currentIndex,
  index,
}: OnboardingContentCardProps) {
  const insets = useSafeAreaInsets();

  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const textTranslateY = scrollX.interpolate({
    inputRange,
    outputRange: [16, 0, 16],
    extrapolate: "clamp",
  });

  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.3, 1, 0.3],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[
        styles.card,
        {
          height: cardHeight,
          paddingBottom: Math.max(insets.bottom + 8, 18),
        },
      ]}
    >
      {/* 1. Pagination Indicators */}
      <OnboardingPagination scrollX={scrollX} currentIndex={currentIndex} />

      {/* 2 & 3. Heading and Description */}
      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </Animated.View>

      {/* 4. Primary CTA Button */}
      <View style={styles.buttonContainer}>
        <OnboardingButton
          label={buttonLabel}
          color={buttonColor}
          onPress={onPressButton}
        />
      </View>

      {/* 5. Cultural Tribal Pattern Decoration */}
      <CulturalBorder />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width,
    backgroundColor: "#FFFDF8",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    paddingHorizontal: 26,
    paddingTop: 18,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E9DF",
    ...Platform.select({
      ios: {
        shadowColor: "#0F2E24",
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  textSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: "#063F36",
    textAlign: "center",
    lineHeight: 31,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14.5,
    color: "#587067",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 9,
    paddingHorizontal: 6,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 4,
    marginVertical: 4,
  },
});
