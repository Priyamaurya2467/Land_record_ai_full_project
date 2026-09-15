import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function AICommandBar({ onSearch }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name="sparkles-outline"
        size={22}
        color={theme.ai}
      />

      <TextInput
        placeholder="Ask Anvexa AI anything about land records..."
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        onSubmitEditing={(e) => onSearch?.(e.nativeEvent.text)}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons name="search" size={19} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    paddingLeft: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 15,
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },

  button: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});