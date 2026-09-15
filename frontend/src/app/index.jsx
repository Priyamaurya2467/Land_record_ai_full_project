import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LandingPage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="map-outline" size={24} color="#ffffff" />
            </View>

            <View>
              <Text style={styles.brandName}>Anvexa Manthan</Text>
              <Text style={styles.brandSubtext}>
                Land Intelligence Center
              </Text>
            </View>
          </View>

          
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#2563EB"
            />

            <Text style={styles.heroBadgeText}>
              Intelligent Land Record Management
            </Text>
          </View>

          <Text style={styles.title}>
            Transforming{"\n"}
            <Text style={styles.titleHighlight}>Land Records</Text>
            {"\n"}
            with Intelligence
          </Text>

          <Text style={styles.description}>
            Digitize, validate and manage land records using AI-powered OCR,
            document intelligence, verification and GIS technology.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={() => router.push("/registration")}
            >
              <Text style={styles.secondaryButtonText}>
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>
                Land Intelligence Center
              </Text>

              <Text style={styles.previewSubtitle}>
                One platform. Complete land intelligence.
              </Text>
            </View>

            <View style={styles.statusDot} />
          </View>

          <View style={styles.previewDivider} />

          <View style={styles.featureGrid}>
            <Feature
              icon="document-text-outline"
              title="AI OCR"
              description="Extract data from scanned records"
            />

            <Feature
              icon="checkmark-circle-outline"
              title="Validation"
              description="Detect errors and conflicts"
            />

            <Feature
              icon="map-outline"
              title="GIS Mapping"
              description="Visualize parcels and locations"
            />

            <Feature
              icon="shield-checkmark-outline"
              title="Verification"
              description="Human-in-the-loop review"
            />
          </View>
        </View>

        {/* Bottom Trust Section */}
        <View style={styles.trustSection}>
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color="#64748B"
          />

          <Text style={styles.trustText}>
            Secure • Auditable • AI-Assisted • Government Ready
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Feature Component */
function Feature({ icon, title, description }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={20} color="#2563EB" />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 20,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#173B73",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  brandName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  brandSubtext: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  aiBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5B4BDB",
    marginLeft: 5,
  },

  /* Hero */
  hero: {
    alignItems: "center",
    paddingTop: 35,
    paddingBottom: 30,
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 20,
  },

  heroBadgeText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },

  title: {
    textAlign: "center",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: "#0F172A",
  },

  titleHighlight: {
    color: "#2563EB",
  },

  description: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
    maxWidth: 500,
  },

  /* Buttons */
  buttonContainer: {
    width: "100%",
    maxWidth: 420,
    marginTop: 28,
  },

  primaryButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#173B73",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  secondaryButton: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#173B73",
    fontSize: 15,
    fontWeight: "700",
  },

  /* Preview */
  previewCard: {
    width: "100%",
    maxWidth: 650,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  previewSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
  },

  previewDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 18,
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  feature: {
    width: "48%",
    flexDirection: "row",
    marginBottom: 18,
  },

  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
  },

  featureDescription: {
    fontSize: 9,
    lineHeight: 14,
    color: "#64748B",
    marginTop: 2,
  },

  /* Footer */
  trustSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  trustText: {
    fontSize: 10,
    color: "#64748B",
    marginLeft: 6,
  },
});