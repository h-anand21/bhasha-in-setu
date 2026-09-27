import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

interface MetricCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  highlightColor?: string;
  sublabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  icon,
  highlightColor = Colors.primaryForest,
  sublabel,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {icon ? <View style={styles.iconBox}>{icon}</View> : null}
        <Text style={[styles.value, { color: highlightColor }]}>{value}</Text>
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    minWidth: 72,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  iconBox: {
    marginRight: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: Colors.textMuted,
    lineHeight: 15,
  },
  sublabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
});
