import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function StatCard({
  title,
  value,
  icon = "stats-chart-outline",
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <Text style={[styles.value, { color: theme.text }]}>
        {value}
      </Text>

      <Text
        style={[
          styles.title,
          { color: theme.textSecondary },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31%",
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    margin: 6,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  value: {
    fontSize: 25,
    fontWeight: "800",
  },

  title: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
});