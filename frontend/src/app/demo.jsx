import React, { useState } from "react";
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

const STEPS = [
  {
    title: "Historical Document Uploaded",
    subtitle:
      "A scanned land record is received for digitization.",
    icon: "cloud-upload-outline",
  },
  {
    title: "Detects Document",
    subtitle:
      "Language and document type are automatically identified.",
    icon: "scan-outline",
  },
  {
    title: "OCR & Field Extraction",
    subtitle:
      "Converts the historical document into structured fields.",
    icon: "document-text-outline",
  },
  {
    title: "Confidence Scoring",
    subtitle:
      "Every extracted field receives a confidence score.",
    icon: "analytics-outline",
  },
  {
    title: "Validation Conflict Detected",
    subtitle:
      "Detects a mismatch between extracted and reference data.",
    icon: "warning-outline",
  },
  {
    title: "Explains the Conflict",
    subtitle:
      "The system highlights exactly what needs human review.",
    icon: "sparkles-outline",
  },
  {
    title: "Human Correction",
    subtitle:
      "An authorized officer reviews and corrects the field.",
    icon: "create-outline",
  },
  {
    title: "Record Verified",
    subtitle:
      "The corrected record is approved and digitally verified.",
    icon: "checkmark-circle-outline",
  },
  {
    title: "GIS Intelligence",
    subtitle:
      "The verified parcel is connected with its geographic context.",
    icon: "map-outline",
  },
  {
    title: "Verified Digital Record",
    subtitle:
      "One historical land record has been transformed into a validated digital record.",
    icon: "shield-checkmark-outline",
  },
];

export default function Demo() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const nextStep = () => {
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
  };

  const goBackToLanding = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
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
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              style={[
                styles.eyebrow,
                { color: theme.primary },
              ]}
            >
              ANVEXA MANTHAN
            </Text>

            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Interactive Demo
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: theme.textSecondary },
              ]}
            >
              From historical document to verified digital record
            </Text>
          </View>

          <View
            style={[
              styles.demoBadge,
              {
                backgroundColor: theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name="play-circle-outline"
              size={16}
              color={theme.primary}
            />

            <Text
              style={[
                styles.demoBadgeText,
                { color: theme.primary },
              ]}
            >
              DEMO
            </Text>
          </View>
        </View>

        {/* PROGRESS */}
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.progressTop}>
            <Text
              style={[
                styles.progressLabel,
                { color: theme.text },
              ]}
            >
              Processing Progress
            </Text>

            <Text
              style={[
                styles.progressCount,
                { color: theme.textSecondary },
              ]}
            >
              {currentStep + 1} / {STEPS.length}
            </Text>
          </View>

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.border },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.primary,
                  width: `${
                    ((currentStep + 1) / STEPS.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {/* PIPELINE */}
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Intelligence Pipeline
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pipeline}
        >
          {STEPS.map((item, index) => {
            const completed = index < currentStep;
            const active = index === currentStep;

            return (
              <View
                key={index}
                style={styles.pipelineItem}
              >
                <View
                  style={[
                    styles.pipelineDot,
                    {
                      backgroundColor: completed
                        ? theme.success
                        : active
                        ? theme.primary
                        : theme.surface,

                      borderColor:
                        completed || active
                          ? "transparent"
                          : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      completed
                        ? "checkmark"
                        : item.icon
                    }
                    size={14}
                    color={
                      completed || active
                        ? "#FFFFFF"
                        : theme.textSecondary
                    }
                  />
                </View>

                {index < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.pipelineLine,
                      {
                        backgroundColor:
                          index < currentStep
                            ? theme.success
                            : theme.border,
                      },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* MAIN STEP CARD */}
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name={step.icon}
              size={32}
              color={theme.primary}
            />
          </View>

          <Text
            style={[
              styles.stepNumber,
              { color: theme.primary },
            ]}
          >
            STEP {currentStep + 1}
          </Text>

          <Text
            style={[
              styles.stepTitle,
              { color: theme.text },
            ]}
          >
            {step.title}
          </Text>

          <Text
            style={[
              styles.stepDescription,
              { color: theme.textSecondary },
            ]}
          >
            {step.subtitle}
          </Text>

          {/* STEP 1 */}
          {currentStep === 0 && (
            <DemoInfo
              theme={theme}
              icon="document-outline"
              label="SOURCE DOCUMENT"
              value="Historical Land Record • Hindi"
            />
          )}

          {/* STEP 2 */}
          {currentStep === 1 && (
            <DemoInfo
              theme={theme}
              icon="language-outline"
              label="DETECTION"
              value="Hindi • Land Record • High Confidence"
            />
          )}

          {/* STEP 3 */}
          {currentStep === 2 && (
            <View style={styles.fieldGrid}>
              <DemoField
                theme={theme}
                label="Owner"
                value="Ramesh Chandra"
              />

              <DemoField
                theme={theme}
                label="Survey No."
                value="124/2"
              />

              <DemoField
                theme={theme}
                label="Khasra"
                value="K-458"
              />

              <DemoField
                theme={theme}
                label="Area"
                value="2.45 Ha"
              />
            </View>
          )}

          {/* STEP 4 */}
          {currentStep === 3 && (
            <View
              style={[
                styles.confidenceBox,
                {
                  backgroundColor:
                    theme.successLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.confidenceLabel,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                OVERALL CONFIDENCE SCORE
              </Text>

              <Text
                style={[
                  styles.confidenceValue,
                  { color: theme.success },
                ]}
              >
                95%
              </Text>

              <View
                style={[
                  styles.confidenceTrack,
                  {
                    backgroundColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      backgroundColor: theme.success,
                      width: "95%",
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* STEP 5 */}
          {currentStep === 4 && (
            <View
              style={[
                styles.warningBox,
                {
                  backgroundColor:
                    theme.warningLight,
                  borderColor: theme.warning,
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={22}
                color={theme.warning}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.warningTitle,
                    { color: theme.text },
                  ]}
                >
                  Validation mismatch
                </Text>

                <Text
                  style={[
                    styles.warningText,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  Plot area: Extracted 2.45 Ha,
                  reference data shows 2.41 Ha.
                </Text>
              </View>
            </View>
          )}

          {/* STEP 6 */}
          {currentStep === 5 && (
            <DemoInfo
              theme={theme}
              icon="bulb-outline"
              label=" EXPLANATION"
              value="Area mismatch requires officer review before approval."
            />
          )}

          {/* STEP 7 */}
          {currentStep === 6 && (
            <View
              style={[
                styles.correctionBox,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.smallLabel,
                  { color: theme.textSecondary },
                ]}
              >
                HUMAN CORRECTION
              </Text>

              <View style={styles.changeRow}>
                <Text
                  style={[
                    styles.oldValue,
                    { color: theme.danger },
                  ]}
                >
                  2.45 Ha
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={theme.textSecondary}
                />

                <Text
                  style={[
                    styles.newValue,
                    { color: theme.success },
                  ]}
                >
                  2.41 Ha
                </Text>
              </View>

              <Text
                style={[
                  styles.correctionNote,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                Officer reviewed supporting records
                and corrected the extracted value.
              </Text>
            </View>
          )}

          {/* STEP 8 */}
          {currentStep === 7 && (
            <DemoInfo
              theme={theme}
              icon="shield-checkmark-outline"
              label="VERIFICATION STATUS"
              value="Verified by Authorized Officer"
            />
          )}

          {/* STEP 9 */}
          {currentStep === 8 && (
            <DemoInfo
              theme={theme}
              icon="location-outline"
              label="GIS MATCH"
              value="Parcel K-458 • Boundary Match 98%"
            />
          )}

          {/* STEP 10 */}
          {currentStep === 9 && (
            <View
              style={[
                styles.successCard,
                {
                  backgroundColor:
                    theme.successLight,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={42}
                color={theme.success}
              />

              <Text
                style={[
                  styles.successTitle,
                  { color: theme.success },
                ]}
              >
                Verified Digital Record
              </Text>

              <Text
                style={[
                  styles.successText,
                  {
                    color: theme.textSecondary,
                  },
                ]}
              >
                Historical land data is now
                structured, validated, traceable
                and ready for authorized use.
              </Text>
            </View>
          )}
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity
            disabled={currentStep === 0}
            onPress={previousStep}
            style={[
              styles.secondaryButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                opacity:
                  currentStep === 0 ? 0.45 : 1,
              },
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color={theme.text}
            />

            <Text
              style={[
                styles.secondaryButtonText,
                { color: theme.text },
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {!isLast ? (
            <TouchableOpacity
              onPress={nextStep}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Next Step
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={resetDemo}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.primary,
                },
              ]}
            >
              <Ionicons
                name="refresh"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                Replay Demo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* DISCLAIMER */}
        <View
          style={[
            styles.disclaimer,
            { borderColor: theme.border },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={15}
            color={theme.textSecondary}
          />

          <Text
            style={[
              styles.disclaimerText,
              { color: theme.textSecondary },
            ]}
          >
            This interactive demonstration uses
            sample land-record data to illustrate
            the Anvexa Manthan AI workflow. It does
            not process a real government record.
          </Text>
        </View>

        {/* BACK TO LANDING */}
        <TouchableOpacity
          onPress={goBackToLanding}
          style={styles.backLink}
        >
          <Ionicons
            name="arrow-back-outline"
            size={15}
            color={theme.primary}
          />

          <Text
            style={[
              styles.backLinkText,
              { color: theme.primary },
            ]}
          >
            Back to Landing Page
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* -------------------------------- */
/* DEMO INFO COMPONENT */
/* -------------------------------- */

function DemoInfo({
  theme,
  icon,
  label,
  value,
}) {
  return (
    <View
      style={[
        styles.infoBox,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={theme.primary}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.smallLabel,
            { color: theme.textSecondary },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.infoValue,
            { color: theme.text },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* -------------------------------- */
/* DEMO FIELD COMPONENT */
/* -------------------------------- */

function DemoField({
  theme,
  label,
  value,
}) {
  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.smallLabel,
          { color: theme.textSecondary },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.fieldValue,
          { color: theme.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* -------------------------------- */
/* STYLES */
/* -------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    marginTop: 4,
  },

  subtitle: {
    fontSize: 11,
    marginTop: 5,
    maxWidth: 290,
    lineHeight: 17,
  },

  demoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },

  demoBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  progressCard: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderRadius: 16,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 11,
    fontWeight: "800",
  },

  progressCount: {
    fontSize: 10,
    fontWeight: "700",
  },

  progressTrack: {
    height: 6,
    borderRadius: 10,
    marginTop: 11,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 12,
  },

  pipeline: {
    paddingRight: 10,
  },

  pipelineItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  pipelineDot: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pipelineLine: {
    width: 25,
    height: 2,
  },

  mainCard: {
    marginTop: 25,
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
  },

  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  stepNumber: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 18,
  },

  stepTitle: {
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5,
  },

  stepDescription: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  infoBox: {
    marginTop: 22,
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  smallLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 18,
  },

  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },

  field: {
    width: "47%",
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
  },

  fieldValue: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 5,
  },

  confidenceBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 15,
  },

  confidenceLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  confidenceValue: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: 4,
  },

  confidenceTrack: {
    height: 7,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },

  confidenceFill: {
    height: "100%",
    borderRadius: 10,
  },

  warningBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
  },

  warningTitle: {
    fontSize: 12,
    fontWeight: "900",
  },

  warningText: {
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  correctionBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  oldValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  newValue: {
    fontSize: 18,
    fontWeight: "900",
  },

  correctionNote: {
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },

  successCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },

  successTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginTop: 9,
  },

  successText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  secondaryButtonText: {
    fontSize: 11,
    fontWeight: "900",
  },

  primaryButton: {
    flex: 1.3,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  disclaimer: {
    marginTop: 18,
    padding: 12,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  disclaimerText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 18,
  },

  backLinkText: {
    fontSize: 11,
    fontWeight: "800",
  },
});