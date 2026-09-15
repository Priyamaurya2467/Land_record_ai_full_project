import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";

export default function LandingPage() {
  const { theme } = useTheme();

  const goToDemo = () => {
    router.push("/demo");
  };

  const goToLogin = () => {
    router.push("/login");
  };

  const goToRegister = () => {
    router.push("/registration");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* =========================================
            NAVIGATION
        ========================================= */}

        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.brand}
            activeOpacity={0.8}
            onPress={() => router.replace("/")}
          >
            <View
              style={[
                styles.logoBox,
                { backgroundColor: theme.primary },
              ]}
            >
              <Ionicons
                name="map-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.brandName,
                  { color: theme.text },
                ]}
              >
                Anvexa Manthan
              </Text>

              <Text
                style={[
                  styles.brandSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                LAND INTELLIGENCE CENTER
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.navActions}>
            <TouchableOpacity
              onPress={goToLogin}
              style={styles.signInButton}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.signInText,
                  { color: theme.text },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToRegister}
              style={[
                styles.navGetStarted,
                { backgroundColor: theme.primary },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.navGetStartedText}>
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* =========================================
            HERO SECTION
        ========================================= */}

        <View style={styles.heroSection}>
          <View style={styles.heroLeft}>
            <View
              style={[
                styles.heroBadge,
                {
                  backgroundColor: theme.primaryLight,
                },
              ]}
            >
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: theme.success },
                ]}
              />

              <Text
                style={[
                  styles.heroBadgeText,
                  { color: theme.primary },
                ]}
              >
                AI-POWERED LAND RECORD INTELLIGENCE
              </Text>
            </View>

            <Text
              style={[
                styles.heroTitle,
                { color: theme.text },
              ]}
            >
              Transform Historical{"\n"}
              Land Records into{"\n"}
              <Text style={{ color: theme.primary }}>
                Digital Intelligence
              </Text>
            </Text>

            <Text
              style={[
                styles.heroDescription,
                { color: theme.textSecondary },
              ]}
            >
              Anvexa Manthan uses AI, OCR, intelligent
              validation and GIS technology to transform
              complex historical land records into
              structured, traceable and verified digital
              records.
            </Text>

            {/* HERO ACTIONS */}

            <View style={styles.heroActions}>
              <TouchableOpacity
                onPress={goToDemo}
                style={[
                  styles.primaryHeroButton,
                  { backgroundColor: theme.primary },
                ]}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryHeroButtonText}>
                  Explore Workflow
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToRegister}
                style={[
                  styles.secondaryHeroButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.secondaryHeroButtonText,
                    { color: theme.text },
                  ]}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>

            {/* TRUST LINE */}

            <View style={styles.trustRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={theme.success}
              />

              <Text
                style={[
                  styles.trustText,
                  { color: theme.textSecondary },
                ]}
              >
                Structured • Validated • Traceable
              </Text>
            </View>
          </View>

          {/* HERO INTELLIGENCE CARD */}

          <View
            style={[
              styles.heroVisual,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.visualHeader}>
              <View>
                <Text
                  style={[
                    styles.visualEyebrow,
                    { color: theme.textSecondary },
                  ]}
                >
                  ANVEXA AI
                </Text>

                <Text
                  style={[
                    styles.visualTitle,
                    { color: theme.text },
                  ]}
                >
                  Intelligence Pipeline
                </Text>
              </View>

              <View
                style={[
                  styles.aiStatus,
                  {
                    backgroundColor:
                      theme.successLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: theme.success },
                  ]}
                />

                <Text
                  style={[
                    styles.aiStatusText,
                    { color: theme.success },
                  ]}
                >
                  ACTIVE
                </Text>
              </View>
            </View>

            <PipelineItem
              theme={theme}
              number="01"
              icon="cloud-upload-outline"
              title="Document Upload"
              subtitle="Historical record received"
              completed
            />

            <PipelineItem
              theme={theme}
              number="02"
              icon="scan-outline"
              title="AI + OCR"
              subtitle="Fields automatically extracted"
              completed
            />

            <PipelineItem
              theme={theme}
              number="03"
              icon="shield-checkmark-outline"
              title="Validation"
              subtitle="Conflicts intelligently detected"
              active
            />

            <PipelineItem
              theme={theme}
              number="04"
              icon="map-outline"
              title="GIS Intelligence"
              subtitle="Verified parcel connected"
            />

            <View
              style={[
                styles.visualFooter,
                { backgroundColor: theme.background },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={16}
                color={theme.primary}
              />

              <Text
                style={[
                  styles.visualFooterText,
                  { color: theme.textSecondary },
                ]}
              >
                From document to verified intelligence
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================
            CORE CAPABILITIES
        ========================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text
              style={[
                styles.sectionEyebrow,
                { color: theme.primary },
              ]}
            >
              WHY ANVEXA MANTHAN
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              Built for intelligent land records
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              A unified intelligence layer for digitizing,
              understanding, validating and connecting
              historical land records.
            </Text>
          </View>

          <View style={styles.capabilityGrid}>
            <CapabilityCard
              theme={theme}
              icon="document-text-outline"
              title="AI + OCR"
              description="Extract structured information from scanned and historical records."
            />

            <CapabilityCard
              theme={theme}
              icon="language-outline"
              title="Multilingual"
              description="Understand land records across languages and document formats."
            />

            <CapabilityCard
              theme={theme}
              icon="shield-checkmark-outline"
              title="Validation"
              description="Identify inconsistencies and conflicts against reference data."
            />

            <CapabilityCard
              theme={theme}
              icon="map-outline"
              title="GIS Intelligence"
              description="Connect verified records with geographic parcel context."
            />

            <CapabilityCard
              theme={theme}
              icon="analytics-outline"
              title="Confidence Scoring"
              description="Assign confidence scores to extracted fields for review."
            />

            <CapabilityCard
              theme={theme}
              icon="people-outline"
              title="Human Verification"
              description="Keep authorized officers in control of critical corrections."
            />
          </View>
        </View>

        {/* =========================================
            HOW IT WORKS
        ========================================= */}

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text
              style={[
                styles.sectionEyebrow,
                { color: theme.primary },
              ]}
            >
              HOW IT WORKS
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              From record to verified intelligence
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                { color: theme.textSecondary },
              ]}
            >
              Anvexa Manthan combines AI automation with
              human verification to create a reliable
              digital land-record workflow.
            </Text>
          </View>

          <View style={styles.workflow}>
            <WorkflowStep
              theme={theme}
              number="01"
              icon="cloud-upload-outline"
              title="Upload"
              description="Upload historical land documents."
            />

            <WorkflowConnector theme={theme} />

            <WorkflowStep
              theme={theme}
              number="02"
              icon="scan-outline"
              title="Extract"
              description="AI identifies and extracts fields."
            />

            <WorkflowConnector theme={theme} />

            <WorkflowStep
              theme={theme}
              number="03"
              icon="search-outline"
              title="Validate"
              description="Rules detect inconsistencies."
            />

            <WorkflowConnector theme={theme} />

            <WorkflowStep
              theme={theme}
              number="04"
              icon="person-outline"
              title="Verify"
              description="Officer reviews critical conflicts."
            />

            <WorkflowConnector theme={theme} />

            <WorkflowStep
              theme={theme}
              number="05"
              icon="map-outline"
              title="Connect"
              description="Verified parcel connects to GIS."
            />
          </View>
        </View>

        {/* =========================================
            INTERACTIVE DEMO
        ========================================= */}

        <View
          style={[
            styles.demoSection,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.demoContent}>
            <View
              style={[
                styles.demoIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >
              <Ionicons
                name="play-circle-outline"
                size={27}
                color={theme.primary}
              />
            </View>

            <Text
              style={[
                styles.demoEyebrow,
                { color: theme.primary },
              ]}
            >
              INTERACTIVE AI DEMO
            </Text>

            <Text
              style={[
                styles.demoTitle,
                { color: theme.text },
              ]}
            >
              See Anvexa Manthan in action
            </Text>

            <Text
              style={[
                styles.demoDescription,
                { color: theme.textSecondary },
              ]}
            >
              Follow a historical land record through
              OCR, field extraction, confidence scoring,
              validation, human correction and GIS
              intelligence.
            </Text>

            <TouchableOpacity
              onPress={goToDemo}
              style={[
                styles.demoButton,
                { backgroundColor: theme.primary },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.demoButtonText}>
                Explore the AI Workflow
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* DEMO MINI PIPELINE */}

          <View style={styles.demoMiniPipeline}>
            <MiniPipeline
              theme={theme}
              icon="document-outline"
              label="DOCUMENT"
            />

            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.textSecondary}
            />

            <MiniPipeline
              theme={theme}
              icon="scan-outline"
              label="OCR"
            />

            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.textSecondary}
            />

            <MiniPipeline
              theme={theme}
              icon="shield-checkmark-outline"
              label="VALIDATE"
            />

            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.textSecondary}
            />

            <MiniPipeline
              theme={theme}
              icon="map-outline"
              label="GIS"
            />
          </View>
        </View>

        {/* =========================================
            IMPACT SECTION
        ========================================= */}

        <View style={styles.impactSection}>
          <View style={styles.sectionHeading}>
            <Text
              style={[
                styles.sectionEyebrow,
                { color: theme.primary },
              ]}
            >
              INTELLIGENCE AT SCALE
            </Text>

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
              ]}
            >
              Designed for reliable digital transformation
            </Text>
          </View>

          <View style={styles.impactGrid}>
            <ImpactCard
              theme={theme}
              icon="flash-outline"
              value="AI"
              label="Automated Extraction"
              description="Reduce manual data entry from historical records."
            />

            <ImpactCard
              theme={theme}
              icon="checkmark-circle-outline"
              value="95%"
              label="Confidence"
              description="Every extracted field can be evaluated for confidence."
            />

            <ImpactCard
              theme={theme}
              icon="warning-outline"
              value="Smart"
              label="Conflict Detection"
              description="Surface inconsistencies before records are approved."
            />

            <ImpactCard
              theme={theme}
              icon="map-outline"
              value="GIS"
              label="Spatial Intelligence"
              description="Connect digital records to their geographic context."
            />
          </View>
        </View>

        {/* =========================================
            FINAL CTA
        ========================================= */}

        <View
          style={[
            styles.finalCTA,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <View style={styles.finalCTAContent}>
            <Text style={styles.finalCTAEyebrow}>
              ANVEXA MANTHAN
            </Text>

            <Text style={styles.finalCTATitle}>
              Build the future of intelligent land records.
            </Text>

            <Text style={styles.finalCTADescription}>
              Experience a unified workflow for
              digitization, validation, verification and
              GIS-connected land intelligence.
            </Text>

            <View style={styles.finalActions}>
              <TouchableOpacity
                onPress={goToRegister}
                style={styles.finalPrimaryButton}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.finalPrimaryButtonText,
                    { color: theme.primary },
                  ]}
                >
                  Get Started
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={theme.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToLogin}
                style={styles.finalSecondaryButton}
                activeOpacity={0.8}
              >
                <Text style={styles.finalSecondaryButtonText}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* =========================================
            FOOTER
        ========================================= */}

        <View style={styles.footer}>
          <View>
            <Text
              style={[
                styles.footerBrand,
                { color: theme.text },
              ]}
            >
              Anvexa Manthan
            </Text>

            <Text
              style={[
                styles.footerSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              Land Intelligence Center
            </Text>
          </View>

          <Text
            style={[
              styles.footerText,
              { color: theme.textSecondary },
            ]}
          >
            Intelligent • Verified • Connected
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================
   PIPELINE ITEM
========================================= */

function PipelineItem({
  theme,
  number,
  icon,
  title,
  subtitle,
  completed,
  active,
}) {
  return (
    <View style={styles.pipelineRow}>
      <View
        style={[
          styles.pipelineIcon,
          {
            backgroundColor: completed
              ? theme.successLight
              : active
              ? theme.primaryLight
              : theme.background,
            borderColor: completed
              ? theme.success
              : active
              ? theme.primary
              : theme.border,
          },
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark"
              : icon
          }
          size={17}
          color={
            completed
              ? theme.success
              : active
              ? theme.primary
              : theme.textSecondary
          }
        />
      </View>

      <View style={styles.pipelineText}>
        <View style={styles.pipelineTitleRow}>
          <Text
            style={[
              styles.pipelineNumber,
              { color: theme.textSecondary },
            ]}
          >
            {number}
          </Text>

          <Text
            style={[
              styles.pipelineTitle,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>
        </View>

        <Text
          style={[
            styles.pipelineSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* =========================================
   CAPABILITY CARD
========================================= */

function CapabilityCard({
  theme,
  icon,
  title,
  description,
}) {
  return (
    <View
      style={[
        styles.capabilityCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.capabilityIcon,
          {
            backgroundColor: theme.primaryLight,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <Text
        style={[
          styles.capabilityTitle,
          { color: theme.text },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.capabilityDescription,
          { color: theme.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

/* =========================================
   WORKFLOW STEP
========================================= */

function WorkflowStep({
  theme,
  number,
  icon,
  title,
  description,
}) {
  return (
    <View style={styles.workflowStep}>
      <View
        style={[
          styles.workflowIcon,
          {
            backgroundColor: theme.primaryLight,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <Text
        style={[
          styles.workflowNumber,
          { color: theme.primary },
        ]}
      >
        {number}
      </Text>

      <Text
        style={[
          styles.workflowTitle,
          { color: theme.text },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.workflowDescription,
          { color: theme.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

/* =========================================
   WORKFLOW CONNECTOR
========================================= */

function WorkflowConnector({ theme }) {
  return (
    <View
      style={[
        styles.workflowConnector,
        { backgroundColor: theme.border },
      ]}
    >
      <Ionicons
        name="arrow-forward"
        size={13}
        color={theme.textSecondary}
      />
    </View>
  );
}

/* =========================================
   MINI PIPELINE
========================================= */

function MiniPipeline({
  theme,
  icon,
  label,
}) {
  return (
    <View style={styles.miniPipelineItem}>
      <Ionicons
        name={icon}
        size={17}
        color={theme.primary}
      />

      <Text
        style={[
          styles.miniPipelineText,
          { color: theme.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* =========================================
   IMPACT CARD
========================================= */

function ImpactCard({
  theme,
  icon,
  value,
  label,
  description,
}) {
  return (
    <View
      style={[
        styles.impactCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.impactTop}>
        <Ionicons
          name={icon}
          size={20}
          color={theme.primary}
        />

        <Text
          style={[
            styles.impactValue,
            { color: theme.primary },
          ]}
        >
          {value}
        </Text>
      </View>

      <Text
        style={[
          styles.impactLabel,
          { color: theme.text },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.impactDescription,
          { color: theme.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 45,
  },

  /* NAVBAR */

  navbar: {
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    fontSize: 15,
    fontWeight: "900",
  },

  brandSubtitle: {
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 2,
  },

  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  signInButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  signInText: {
    fontSize: 11,
    fontWeight: "800",
  },

  navGetStarted: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  navGetStartedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  /* HERO */

  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    flexDirection: "row",
    gap: 40,
    alignItems: "center",
  },

  heroLeft: {
    flex: 1,
    maxWidth: 610,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  heroBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  heroTitle: {
    fontSize: 43,
    lineHeight: 51,
    fontWeight: "900",
    marginTop: 18,
    letterSpacing: -1,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 21,
    maxWidth: 590,
    marginTop: 17,
  },

  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },

  primaryHeroButton: {
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryHeroButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  secondaryHeroButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryHeroButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
  },

  trustText: {
    fontSize: 9,
    fontWeight: "700",
  },

  /* HERO VISUAL */

  heroVisual: {
    width: 390,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
  },

  visualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  visualEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  visualTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
  },

  aiStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  aiStatusText: {
    fontSize: 7,
    fontWeight: "900",
  },

  pipelineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  pipelineIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pipelineText: {
    flex: 1,
    marginLeft: 11,
  },

  pipelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  pipelineNumber: {
    fontSize: 7,
    fontWeight: "900",
  },

  pipelineTitle: {
    fontSize: 11,
    fontWeight: "900",
  },

  pipelineSubtitle: {
    fontSize: 9,
    marginTop: 3,
  },

  visualFooter: {
    marginTop: 3,
    padding: 11,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  visualFooterText: {
    fontSize: 9,
    fontWeight: "700",
  },

  /* GENERAL SECTION */

  section: {
    paddingHorizontal: 24,
    marginTop: 75,
  },

  sectionHeading: {
    maxWidth: 680,
  },

  sectionEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  sectionTitle: {
    fontSize: 27,
    fontWeight: "900",
    marginTop: 6,
  },

  sectionDescription: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 620,
  },

  /* CAPABILITIES */

  capabilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 25,
  },

  capabilityCard: {
    width: 205,
    minHeight: 155,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  capabilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  capabilityTitle: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 13,
  },

  capabilityDescription: {
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },

  /* WORKFLOW */

  workflow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 30,
  },

  workflowStep: {
    flex: 1,
    alignItems: "center",
    minWidth: 115,
  },

  workflowIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  workflowNumber: {
    fontSize: 7,
    fontWeight: "900",
    marginTop: 9,
  },

  workflowTitle: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },

  workflowDescription: {
    fontSize: 8,
    lineHeight: 13,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 110,
  },

  workflowConnector: {
    width: 27,
    height: 2,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  /* DEMO */

  demoSection: {
    marginHorizontal: 24,
    marginTop: 75,
    padding: 25,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 35,
  },

  demoContent: {
    flex: 1,
    maxWidth: 600,
  },

  demoIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  demoEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  demoTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },

  demoDescription: {
    fontSize: 11,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: 560,
  },

  demoButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 17,
    minHeight: 45,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  demoButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  demoMiniPipeline: {
    width: 300,
    padding: 17,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  miniPipelineItem: {
    alignItems: "center",
    gap: 5,
  },

  miniPipelineText: {
    fontSize: 7,
    fontWeight: "900",
  },

  /* IMPACT */

  impactSection: {
    paddingHorizontal: 24,
    marginTop: 75,
  },

  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 25,
  },

  impactCard: {
    flex: 1,
    minWidth: 180,
    minHeight: 145,
    padding: 17,
    borderRadius: 16,
    borderWidth: 1,
  },

  impactTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  impactValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  impactLabel: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 15,
  },

  impactDescription: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
  },

  /* FINAL CTA */

  finalCTA: {
    marginHorizontal: 24,
    marginTop: 75,
    borderRadius: 22,
    padding: 35,
  },

  finalCTAContent: {
    maxWidth: 700,
  },

  finalCTAEyebrow: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    opacity: 0.8,
  },

  finalCTATitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
    marginTop: 7,
  },

  finalCTADescription: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 11,
    lineHeight: 18,
    maxWidth: 600,
    marginTop: 8,
  },

  finalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  finalPrimaryButton: {
    backgroundColor: "#FFFFFF",
    minHeight: 45,
    paddingHorizontal: 17,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  finalPrimaryButtonText: {
    fontSize: 10,
    fontWeight: "900",
  },

  finalSecondaryButton: {
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  finalSecondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  /* FOOTER */

  footer: {
    marginTop: 35,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerBrand: {
    fontSize: 12,
    fontWeight: "900",
  },

  footerSubtitle: {
    fontSize: 7,
    fontWeight: "700",
    marginTop: 2,
  },

  footerText: {
    fontSize: 8,
    fontWeight: "700",
  },
});