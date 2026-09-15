import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ConfidenceBar({ value }) {
  const { theme } = useTheme();

  const color =
    value >= 90
      ? theme.success
      : value >= 70
      ? theme.warning
      : theme.danger;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Confidence Score
        </Text>

        <Text style={[styles.value, { color }]}>
          {value}%
        </Text>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${value}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  label: {
    fontSize: 12,
  },

  value: {
    fontWeight: "700",
  },

  track: {
    height: 7,
    borderRadius: 10,
    overflow: "hidden",
  },

  fill: {
    height: "100%",
    borderRadius: 10,
  },
});