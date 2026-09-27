import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { onboardingData } from "../../data/onboardingData";

const { width } = Dimensions.get("window");

interface OnboardingPaginationProps {
  scrollX: Animated.Value;
  currentIndex: number;
}

export function OnboardingPagination({ scrollX, currentIndex }: OnboardingPaginationProps) {
  return (
    <View style={styles.container}>
      {onboardingData.map((item, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [9, 24, 9],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.65, 1, 0.65],
          extrapolate: "clamp",
        });

        const activeColor = item.buttonColor;

        return (
          <Animated.View
            key={item.id}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor:
                  currentIndex === index ? activeColor : "#F9DCCB",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginVertical: 4,
  },
  dot: {
    height: 9,
    borderRadius: 4.5,
  },
});
