import React from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { OnboardingSlideItem } from "../../data/onboardingData";
import { OnboardingHero } from "./OnboardingHero";
import { OnboardingContentCard } from "./OnboardingContentCard";

const { width, height } = Dimensions.get("window");

interface OnboardingSlideProps {
  item: OnboardingSlideItem;
  index: number;
  totalSlides: number;
  onNext: () => void;
  onSkip: () => void;
  scrollX: Animated.Value;
  currentIndex: number;
}

export function OnboardingSlide({
  item,
  index,
  totalSlides,
  onNext,
  onSkip,
  scrollX,
  currentIndex,
}: OnboardingSlideProps) {
  // Exact layout sizing to guarantee seamless overlap and eliminate blank space
  const heroHeight = height * 0.60;
  const contentCardHeight = height * 0.48;

  const isLast = index === totalSlides - 1;

  return (
    <View style={[styles.slideContainer, { width, height }]}>
      {/* 1. Full Hero Illustration with Top Skip Button */}
      <OnboardingHero
        image={item.image}
        isLast={isLast}
        heroHeight={heroHeight}
        onSkip={onSkip}
        scrollX={scrollX}
        index={index}
      />

      {/* 2. Overlapping Warm-White Content Panel */}
      <View style={[styles.cardWrapper, { height: contentCardHeight }]}>
        <OnboardingContentCard
          title={item.title}
          description={item.description}
          buttonLabel={item.button}
          buttonColor={item.buttonColor}
          cardHeight={contentCardHeight}
          onPressButton={onNext}
          scrollX={scrollX}
          currentIndex={currentIndex}
          index={index}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    backgroundColor: "#FAF7F0",
    position: "relative",
    overflow: "hidden",
  },
  cardWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
});
