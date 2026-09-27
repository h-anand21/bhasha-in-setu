import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award, WifiOff, CheckCircle2, Database } from "lucide-react-native";
import { Colors } from "../theme/colors";

export type BadgeVariant = "fln" | "offline" | "synced" | "sqlite" | "warning";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = "fln", icon }) => {
  const getStyles = () => {
    switch (variant) {
      case "fln":
        return {
          bg: Colors.softYellow,
          border: "#E9CD7A",
          text: "#8D6200",
          icon: <Award size={13} color="#8D6200" strokeWidth={2.5} />,
        };
      case "offline":
        return {
          bg: Colors.lightGreen,
          border: "#C2E2D0",
          text: Colors.primaryForest,
          icon: <WifiOff size={13} color={Colors.primaryForest} strokeWidth={2.5} />,
        };
      case "synced":
        return {
          bg: "#E3F2FD",
          border: "#BBDEFB",
          text: "#1565C0",
          icon: <CheckCircle2 size={13} color="#1565C0" strokeWidth={2.5} />,
        };
      case "sqlite":
        return {
          bg: "#E8F5E9",
          border: "#C8E6C9",
          text: "#2E7D32",
          icon: <Database size={13} color="#2E7D32" strokeWidth={2.5} />,
        };
      case "warning":
        return {
          bg: Colors.terracottaLight,
          border: "#F7C6B7",
          text: Colors.terracottaDark,
          icon: <Award size={13} color={Colors.terracottaDark} strokeWidth={2.5} />,
        };
    }
  };

  const styleConfig = getStyles();

  return (
    <View
      style={[styles.badge, { backgroundColor: styleConfig.bg, borderColor: styleConfig.border }]}
    >
      {icon ? icon : styleConfig.icon}
      <Text style={[styles.text, { color: styleConfig.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
