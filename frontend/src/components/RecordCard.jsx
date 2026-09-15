import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

import StatusBadge from "./StatusBadge";
import ConfidenceBar from "./ConfidenceBar";

export default function RecordCard({
  record,
  onPress,
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.header}>

        <View style={styles.iconBox}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={theme.primary}
          />
        </View>

        <View style={styles.info}>
          <Text
            style={[
              styles.id,
              { color: theme.text },
            ]}
          >
            {record.id}
          </Text>

          <Text
            style={[
              styles.location,
              { color: theme.textSecondary },
            ]}
          >
            {record.village} • {record.district}
          </Text>
        </View>

        <StatusBadge status={record.status} />
      </View>

      <View
        style={[
          styles.details,
          { borderTopColor: theme.border },
        ]}
      >
        <View>
          <Text
            style={[
              styles.label,
              { color: theme.textSecondary },
            ]}
          >
            Owner
          </Text>

          <Text
            style={[
              styles.value,
              { color: theme.text },
            ]}
          >
            {record.owner}
          </Text>
        </View>

        <View>
          <Text
            style={[
              styles.label,
              { color: theme.textSecondary },
            ]}
          >
            Survey No.
          </Text>

          <Text
            style={[
              styles.value,
              { color: theme.text },
            ]}
          >
            {record.survey}
          </Text>
        </View>

        <View>
          <Text
            style={[
              styles.label,
              { color: theme.textSecondary },
            ]}
          >
            Area
          </Text>

          <Text
            style={[
              styles.value,
              { color: theme.text },
            ]}
          >
            {record.area}
          </Text>
        </View>
      </View>

      <ConfidenceBar value={record.confidence} />

      <View style={styles.footer}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
          }}
        >
          AI processed • {record.updated}
        </Text>

        <Ionicons
          name="arrow-forward"
          size={17}
          color={theme.primary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
  },

  id: {
    fontSize: 14,
    fontWeight: "800",
  },

  location: {
    fontSize: 12,
    marginTop: 3,
  },

  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    marginTop: 15,
    paddingTop: 14,
  },

  label: {
    fontSize: 10,
    marginBottom: 3,
  },

  value: {
    fontSize: 13,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
});