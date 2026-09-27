import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, G, Rect } from "react-native-svg";
import { Colors } from "../theme/colors";

interface CulturalDividerProps {
  color?: string;
  height?: number;
}

export const CulturalDivider: React.FC<CulturalDividerProps> = ({
  color = "#D9A441",
  height = 14,
}) => {
  const { width } = useWindowDimensions();
  const patternWidth = 24;
  const count = Math.ceil(width / patternWidth);

  return (
    <View style={[styles.container, { height }]}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <G fill="none" stroke={color} strokeWidth="1.2" opacity={0.5}>
          {Array.from({ length: count }).map((_, i) => (
            <Path
              key={i}
              d={`M ${i * patternWidth},${height / 2} L ${i * patternWidth + 6},2 L ${i * patternWidth + 12},${height - 2} L ${i * patternWidth + 18},2 L ${(i + 1) * patternWidth},${height / 2}`}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
