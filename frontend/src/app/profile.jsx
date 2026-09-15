import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const showComingSoon = (feature) => {
    Alert.alert(
      "Coming Soon",
      `${feature} will be connected when the backend is integrated.`
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              System and account information
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="person-outline" size={23} color="#3157D5" />
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AM</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.name}>Anvexa Manthan</Text>
            <Text style={styles.role}>Land Record Verification Team</Text>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>System Active</Text>
            </View>
          </View>
        </View>

        {/* Project Information */}
        <Text style={styles.sectionTitle}>Project Information</Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="layers-outline"
            title="Project"
            value="Anvexa Manthan"
          />

          <InfoRow
            icon="document-text-outline"
            title="Problem Statement"
            value="SIH26018"
          />

          <InfoRow
            icon="business-outline"
            title="Organization"
            value="Department of Land Resources"
          />

          <InfoRow
            icon="sparkles-outline"
            title="System"
            value="AI-Powered Land Record Digitization"
            last
          />
        </View>

        {/* System Capabilities */}
        <Text style={styles.sectionTitle}>System Capabilities</Text>

        <View style={styles.capabilityGrid}>
          <Capability
            icon="scan-outline"
            title="OCR"
            subtitle="Document Extraction"
          />

          <Capability
            icon="shield-checkmark-outline"
            title="Validation"
            subtitle="Rule Checking"
          />

          <Capability
            icon="analytics-outline"
            title="AI Analysis"
            subtitle="Anomaly Detection"
          />

          <Capability
            icon="people-outline"
            title="Verification"
            subtitle="Human Review"
          />
        </View>

        

        {/* Version */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Anvexa Manthan</Text>
          <Text style={styles.footerText}>
            Intelligent Land Record Digitization & Validation
          </Text>
         
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- Components ---------------- */

function InfoRow({ icon, title, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.rowBorder]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={19} color="#3157D5" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Capability({ icon, title, subtitle }) {
  return (
    <View style={styles.capabilityCard}>
      <View style={styles.capabilityIcon}>
        <Ionicons name={icon} size={21} color="#3157D5" />
      </View>

      <Text style={styles.capabilityTitle}>{title}</Text>

      <Text style={styles.capabilitySubtitle}>{subtitle}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  value,
  warning,
  onPress,
  last,
}) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color="#3157D5" />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>

        {value && (
          <Text
            style={[
              styles.settingValue,
              warning && styles.warningValue,
            ]}
          >
            {value}
          </Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#A1A9B5"
      />
    </TouchableOpacity>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  content: {
    padding: 20,
    paddingTop: 15,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#7B8494",
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECF2",
    marginBottom: 25,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#3157D5",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172033",
  },

  role: {
    marginTop: 4,
    fontSize: 12,
    color: "#737D8D",
  },

  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 11,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8ECF2",
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EFF1F4",
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 11,
    color: "#8A94A6",
  },

  infoValue: {
    marginTop: 3,
    fontSize: 13,
    color: "#273146",
    fontWeight: "600",
  },

  capabilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  capabilityCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8ECF2",
  },

  capabilityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EAF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  capabilityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#172033",
  },

  capabilitySubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: "#858E9D",
  },

 

  footer: {
    alignItems: "center",
    paddingVertical: 10,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3157D5",
  },

  footerText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 10,
    color: "#8A94A6",
  },

 
});
