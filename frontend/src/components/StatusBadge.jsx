import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function StatusBadge({ status = "Pending" }) {
  const { theme } = useTheme();

  const config = {
    Verified: {
      icon: "checkmark-circle",
      color: theme.success,
      bg: theme.successLight,
      label: "Verified",
    },

    Pending: {
      icon: "time",
      color: theme.warning,
      bg: theme.warningLight,
      label: "Pending",
    },

    Review: {
      icon: "alert-circle",
      color: theme.warning,
      bg: theme.warningLight,
      label: "Needs Review",
    },

    Rejected: {
      icon: "close-circle",
      color: theme.danger,
      bg: theme.dangerLight,
      label: "Rejected",
    },

    Processing: {
      icon: "sync",
      color: theme.primary,
      bg: theme.primaryLight,
      label: "Processing",
    },
  };

  const item = config[status] || config.Pending;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: item.bg,
        },
      ]}
    >
      <Ionicons
        name={item.icon}
        size={14}
        color={item.color}
      />

      <Text
        style={[
          styles.text,
          {
            color: item.color,
          },
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },

  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});