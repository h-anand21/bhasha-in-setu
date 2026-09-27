import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Polygon, Circle, G } from "react-native-svg";

const { width } = Dimensions.get("window");

export function CulturalBorder() {
  const patternWidth = width - 48;
  const segmentCount = 14;
  const segW = patternWidth / segmentCount;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Left Decorative Botanical Leaves */}
      <View style={styles.leftFoliage}>
        <Svg width={38} height={60} viewBox="0 0 38 60">
          <Path
            d="M-2,60 C10,48 20,34 8,18 C16,28 26,20 30,8 C23,19 11,26 4,42 Z"
            fill="#3A8A64"
            opacity={0.88}
          />
          <Path
            d="M-4,52 C6,42 13,27 24,22 C14,33 8,44 1,58 Z"
            fill="#F2A641"
            opacity={0.92}
          />
          <Path
            d="M-1,60 C5,52 14,48 22,50 C12,55 6,58 0,61 Z"
            fill="#D97724"
            opacity={0.85}
          />
        </Svg>
      </View>

      {/* Right Decorative Botanical Leaves */}
      <View style={styles.rightFoliage}>
        <Svg width={38} height={60} viewBox="0 0 38 60">
          <Path
            d="M40,60 C28,48 18,34 30,18 C22,28 12,20 8,8 C15,19 27,26 34,42 Z"
            fill="#3A8A64"
            opacity={0.88}
          />
          <Path
            d="M42,52 C32,42 25,27 14,22 C24,33 30,44 37,58 Z"
            fill="#F2A641"
            opacity={0.92}
          />
          <Path
            d="M39,60 C33,52 24,48 16,50 C26,55 32,58 38,61 Z"
            fill="#D97724"
            opacity={0.85}
          />
        </Svg>
      </View>

      {/* Sohrai Geometric Tribal Pattern Strip */}
      <Svg width={patternWidth} height={16} viewBox={`0 0 ${patternWidth} 16`}>
        {/* Baseline in Terracotta */}
        <Path
          d={`M 0,14 L ${patternWidth},14`}
          stroke="#D97724"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Geometric Terracotta & Ochre Motifs */}
        {Array.from({ length: segmentCount }).map((_, i) => {
          const cx = i * segW + segW / 2;
          return (
            <G key={i}>
              <Polygon
                points={`${cx - 8},14 ${cx},2 ${cx + 8},14`}
                fill="none"
                stroke="#E28738"
                strokeWidth="1.6"
                strokeLinejoin="round"
                opacity={0.8}
              />
              <Circle cx={cx} cy={9} r={1.4} fill="#9C4A1A" opacity={0.85} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingTop: 4,
    paddingBottom: 2,
  },
  leftFoliage: {
    position: "absolute",
    left: -14,
    bottom: 2,
  },
  rightFoliage: {
    position: "absolute",
    right: -14,
    bottom: 2,
  },
});
