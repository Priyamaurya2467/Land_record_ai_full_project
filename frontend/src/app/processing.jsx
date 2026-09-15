import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { apiGet } from "../api/client";
import { useTheme } from "../context/ThemeContext";

import ConfidenceBar from "../components/ConfidenceBar";

export default function Processing() {
  const { theme } = useTheme();
  const { fileName,documentId } = useLocalSearchParams();

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(12);

  const steps = [
    {
      title: "Document Uploaded",
      description: "Document received successfully",
      icon: "cloud-done-outline",
    },
    {
      title: "Image Enhancement",
      description: "Improving document clarity",
      icon: "scan-outline",
    },
    {
      title: "Language Detection",
      description: "Detecting document language",
      icon: "language-outline",
    },
    {
      title: "OCR Processing",
      description: "Reading printed and handwritten text",
      icon: "text-outline",
    },
    {
      title: "Handwriting Recognition",
      description: "Analyzing handwritten content",
      icon: "create-outline",
    },
    {
      title: "Field Extraction",
      description: "Structuring land record fields",
      icon: "list-outline",
    },
    {
      title: "Confidence Scoring",
      description: "Calculating field-level confidence",
      icon: "analytics-outline",
    },
    {
      title: "Database Validation",
      description: "Cross-checking extracted information",
      icon: "server-outline",
    },
    {
      title: "GIS Matching",
      description: "Matching record with land parcel",
      icon: "map-outline",
    },
  ];

  useEffect(() => {
  if (!documentId) {
    console.log("No document ID received.");
    return;
  }

  console.log("Processing document:", documentId);

  const timer = setInterval(async () => {
    try {
      const document = await apiGet(`/documents/${documentId}`);

      console.log("Document status:", document);

      const status = document?.status;

      if (status === "processed" || status === "verified") {
        setCurrentStep(steps.length - 1);
        clearInterval(timer);
        return;
      }

      if (status === "needs_review") {
        setCurrentStep(steps.length - 1);
        clearInterval(timer);
        return;
      }

      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          return prev;
        }

        return prev + 1;
      });
    } catch (error) {
      console.log("Processing status error:", error);
    }
  }, 1500);

  return () => clearInterval(timer);
  }, [documentId]);

  useEffect(() => {
    const calculated =
      Math.min(
        100,
        Math.round(
          ((currentStep + 1) / steps.length) * 100
        )
      );

    setProgress(calculated);
  }, [currentStep]);

  const completed = currentStep >= steps.length - 1;

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/"); } }}
          style={[
            styles.backButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
            ]}
          >
            Document Processing
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 3,
            }}
          >
            Intelligent processing pipeline
          </Text>
        </View>
      </View>

      {/* DOCUMENT */}
      <View
        style={[
          styles.documentCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.documentIcon,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={28}
            color={theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.fileName,
              { color: theme.text },
            ]}
            numberOfLines={1}
          >
            {fileName || "Historical_Land_Record.pdf"}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            Historical Land Record • AI Processing
          </Text>
        </View>

        <View
          style={[
            styles.liveBadge,
            { backgroundColor: theme.successLight },
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.success },
            ]}
          />

          <Text
            style={{
              color: theme.success,
              fontSize: 11,
              fontWeight: "700",
            }}
          >
            LIVE
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
        <View style={styles.progressHeader}>
          <View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
              }}
            >
              Processing Progress
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 30,
                fontWeight: "800",
                marginTop: 4,
              }}
            >
              {progress}%
            </Text>
          </View>

          
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
                width: `${progress}%`,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            marginTop: 9,
          }}
        >
          {completed
            ? "Processing completed successfully"
            : steps[currentStep].description}
        </Text>
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

      <View
        style={[
          styles.pipelineCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <View
              key={step.title}
              style={styles.stepRow}
            >

              {/* LINE + ICON */}
              <View style={styles.timeline}>
                <View
                  style={[
                    styles.stepIcon,
                    {
                      backgroundColor:
                        isCompleted
                          ? theme.successLight
                          : isActive
                          ? theme.primaryLight
                          : theme.background,
                      borderColor:
                        isCompleted
                          ? theme.success
                          : isActive
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      isCompleted
                        ? "checkmark"
                        : step.icon
                    }
                    size={17}
                    color={
                      isCompleted
                        ? theme.success
                        : isActive
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                </View>

                {index !== steps.length - 1 && (
                  <View
                    style={[
                      styles.line,
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

              {/* CONTENT */}
              <View style={styles.stepContent}>
                <View style={styles.stepTop}>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color:
                          isActive || isCompleted
                            ? theme.text
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {step.title}
                  </Text>

                  {isActive && (
                    <View
                      style={[
                        styles.processingBadge,
                        {
                          backgroundColor:
                            theme.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        PROCESSING
                      </Text>
                    </View>
                  )}

                  {isCompleted && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.success}
                    />
                  )}
                </View>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

     


      {/* CONFIDENCE */}
      <View
        style={[
          styles.confidenceCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.confidenceHeader}>
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Overall Confidence Score
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Based on OCR, extraction and validation signals
            </Text>
          </View>

          <Text
            style={{
              color: theme.success,
              fontSize: 24,
              fontWeight: "800",
            }}
          >
            95%
          </Text>
        </View>

        <ConfidenceBar value={95} />
      </View>

      {/* NEXT ACTION */}
      {completed && (
        <TouchableOpacity
          onPress={() => router.push({
            pathname:"/extraction",
            params:{
              fileName:String(fileName||""),
              documentId:String(documentId||"")
            }
          }
          )}
          style={[
            styles.continueButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.continueText}>
            View Live Extraction
          </Text>

          <Ionicons
            name="arrow-forward"
            size={19}
            color="#fff"
          />
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

function Metric({ icon, value, label, theme }) {
  return (
    <View
      style={[
        styles.metric,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={theme.primary}
      />

      <Text
        style={{
          color: theme.text,
          fontSize: 20,
          fontWeight: "800",
          marginTop: 8,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 11,
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 45,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
  },

  documentCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  documentIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  fileName: {
    fontSize: 14,
    fontWeight: "800",
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 6,
  },

  progressCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aiIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  progressTrack: {
    height: 9,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 15,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginTop: 25,
    marginBottom: 11,
  },

  pipelineCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 17,
  },

  stepRow: {
    flexDirection: "row",
    minHeight: 72,
  },

  timeline: {
    width: 42,
    alignItems: "center",
  },

  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },

  stepContent: {
    flex: 1,
    paddingLeft: 9,
    paddingBottom: 13,
  },

  stepTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  processingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },

  metric: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    margin: "1%",
  },

  confidenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
  },

  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  continueButton: {
    marginTop: 18,
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  continueText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});
