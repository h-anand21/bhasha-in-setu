import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from "react-native";
import { Volume2, VolumeX } from "lucide-react-native";
import { Colors } from "../theme/colors";

interface AudioButtonProps {
  onPress: () => void;
  isPlaying?: boolean;
  isLoading?: boolean;
  size?: number;
  variant?: "primary" | "secondary" | "ghost";
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  onPress,
  isPlaying = false,
  isLoading = false,
  size = 38,
  variant = "primary",
}) => {
  const getBackgroundColor = () => {
    if (variant === "secondary") return Colors.lightGreen;
    if (variant === "ghost") return "transparent";
    return isPlaying ? Colors.warmOrange : Colors.primaryForest;
  };

  const getIconColor = () => {
    if (variant === "secondary") return Colors.primaryForest;
    if (variant === "ghost") return Colors.primaryForest;
    return "#FFFFFF";
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "ghost" ? 0 : 1,
          borderColor: variant === "secondary" ? "#C2E2D0" : "transparent",
        },
      ]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={isPlaying ? "Stop audio" : "Play pronunciation"}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <Volume2 size={size * 0.52} color={getIconColor()} strokeWidth={2.4} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
