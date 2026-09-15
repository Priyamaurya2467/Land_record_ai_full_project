import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { apiGet } from "../api/client";
import { useTheme } from "../context/ThemeContext";

export default function ExtractionScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const { fileName, documentId } = useLocalSearchParams();

  const [documentData, setDocumentData] = useState(null);
  const [fields, setFields] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // -----------------------------------------------------
  // Load document from backend
  // -----------------------------------------------------

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) {
        setLoadError("Document ID was not received.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");

        const document = await apiGet(
          `/documents/${documentId}`
        );

        console.log(
          "Extraction document response:",
          document
        );

        setDocumentData(document);

        const extractedFields =
          Array.isArray(document?.fields)
            ? document.fields
            : [];

        const validationIssues =
          Array.isArray(document?.issues)
            ? document.issues
            : [];

        setFields(extractedFields);
        setIssues(validationIssues);

        console.log(
          "Extracted fields:",
          extractedFields
        );

        console.log(
          "Validation issues:",
          validationIssues
        );
      } catch (error) {
        console.log(
          "Extraction document error:",
          error
        );

        setLoadError(
          error?.message ||
            "Unable to load processed record."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  // -----------------------------------------------------
  // Field map
  // -----------------------------------------------------

  const fieldMap = useMemo(() => {
    const map = {};

    fields.forEach((field) => {
      if (field?.field_name) {
        map[field.field_name] = field;
      }
    });

    return map;
  }, [fields]);

  const getFieldValue = (name) => {
    return fieldMap[name]?.field_value || "";
  };

  const getFieldConfidence = (name) => {
    return Number(fieldMap[name]?.confidence || 0);
  };

  // -----------------------------------------------------
  // Overall confidence
  // -----------------------------------------------------

  const overallConfidence = Number(
    documentData?.overall_confidence || 0
  );

  // -----------------------------------------------------
  // Status
  // -----------------------------------------------------

  const status =
    documentData?.status || "processed";

  const statusText = String(status)
    .replace("DocumentStatus.", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );

  const getStatusColor = () => {
    if (status === "processed") {
      return "#16A34A";
    }

    if (status === "verified") {
      return "#16A34A";
    }

    if (status === "needs_review") {
      return "#D97706";
    }

    if (status === "rejected") {
      return "#DC2626";
    }

    return theme.primary;
  };

  // -----------------------------------------------------
  // Field definitions
  // -----------------------------------------------------

  const fieldDefinitions = [
    {
      key: "owner_name",
      label: "Owner Name",
      icon: "person-outline",
    },
    {
      key: "survey_number",
      label: "Survey Number",
      icon: "locate-outline",
    },
    {
      key: "khasra_number",
      label: "Khasra Number",
      icon: "document-text-outline",
    },
    {
      key: "khata_number",
      label: "Khata Number",
      icon: "folder-outline",
    },
    {
      key: "plot_area",
      label: "Land Area",
      icon: "resize-outline",
      suffix: " Hectare",
    },
    {
      key: "village",
      label: "Village",
      icon: "home-outline",
    },
    {
      key: "tehsil",
      label: "Tehsil",
      icon: "business-outline",
    },
    {
      key: "district",
      label: "District",
      icon: "map-outline",
    },
    {
      key: "land_classification",
      label: "Land Type",
      icon: "leaf-outline",
    },
  ];

  // -----------------------------------------------------
  // Loading
  // -----------------------------------------------------

  if (loading) {
    return (
      <View
        style={[
          styles.loadingScreen,
          {
            backgroundColor:
              theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingScreenText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Loading extraction...
        </Text>
      </View>
    );
  }

  // -----------------------------------------------------
  // Main UI
  // -----------------------------------------------------

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          style={[
            styles.backButton,
            {
              backgroundColor:
                theme.surface,
              borderColor:
                theme.border,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Extraction
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Land record intelligence
          </Text>
        </View>
      </View>

      {/* Error */}

      {loadError ? (
        <View
          style={[
            styles.errorCard,
            {
              backgroundColor:
                "#FEF2F2",
              borderColor:
                "#FECACA",
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={22}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {loadError}
          </Text>
        </View>
      ) : null}

      {/* File Card */}

      <View
        style={[
          styles.fileCard,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.fileIcon,
            {
              backgroundColor:
                theme.primaryLight,
            },
          ]}
        >
          <Ionicons
            name="document-text"
            size={27}
            color={theme.primary}
          />
        </View>

        <View style={styles.fileInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.fileName,
              {
                color: theme.text,
              },
            ]}
          >
            {fileName ||
              documentData?.filename ||
              "Land Record"}
          </Text>

          <Text
            style={[
              styles.fileStatus,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Backend status:{" "}
            {statusText}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                `${getStatusColor()}18`,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  getStatusColor(),
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  getStatusColor(),
              },
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      {/* Confidence */}

      <View
        style={[
          styles.confidenceCard,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={
            styles.confidenceHeader
          }
        >
          <View>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              OVERALL EXTRACTION
              CONFIDENCE
            </Text>

            <Text
              style={[
                styles.confidenceValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {overallConfidence.toFixed(1)}%
            </Text>
          </View>

        
        </View>

        <View
          style={[
            styles.progressBackground,
            {
              backgroundColor:
                theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    overallConfidence
                  )
                )}%`,
                backgroundColor:
                  overallConfidence >=
                  75
                    ? "#16A34A"
                    : "#D97706",
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.confidenceHint,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          OCR and AI field recognition
          confidence.
        </Text>
      </View>

      {/* Validation Summary */}

      <View
        style={[
          styles.validationSummary,
          {
            backgroundColor:
              issues.length > 0
                ? "#FFF7ED"
                : "#F0FDF4",
            borderColor:
              issues.length > 0
                ? "#FED7AA"
                : "#BBF7D0",
          },
        ]}
      >
        <View
          style={[
            styles.validationIcon,
            {
              backgroundColor:
                issues.length > 0
                  ? "#FFEDD5"
                  : "#DCFCE7",
            },
          ]}
        >
          <Ionicons
            name={
              issues.length > 0
                ? "warning-outline"
                : "checkmark-circle-outline"
            }
            size={23}
            color={
              issues.length > 0
                ? "#D97706"
                : "#16A34A"
            }
          />
        </View>

        <View
          style={styles.validationInfo}
        >
          <Text
            style={[
              styles.validationTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {issues.length > 0
              ? `${issues.length} validation issue${
                  issues.length > 1
                    ? "s"
                    : ""
                } detected`
              : "No validation issues detected"}
          </Text>

          <Text
            style={[
              styles.validationSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {issues.length > 0
              ? "Human verification is required before approval."
              : "The extracted record passed validation rules."}
          </Text>
        </View>
      </View>

      {/* Issues */}

      {issues.length > 0 ? (
        <View style={styles.issueSection}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Validation Alerts
              </Text>

              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                AI detected records that
                require human review
              </Text>
            </View>
          </View>

          {issues.map((issue) => {
            const severity =
              String(
                issue?.severity ||
                  "medium"
              ).toLowerCase();

            const severityColor =
              severity === "high"
                ? "#DC2626"
                : severity === "medium"
                ? "#D97706"
                : "#2563EB";

            return (
              <View
                key={issue.id}
                style={[
                  styles.issueCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor:
                      `${severityColor}45`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.issueIcon,
                    {
                      backgroundColor:
                        `${severityColor}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle"
                    size={21}
                    color={
                      severityColor
                    }
                  />
                </View>

                <View
                  style={
                    styles.issueContent
                  }
                >
                  <View
                    style={
                      styles.issueHeader
                    }
                  >
                    <Text
                      style={[
                        styles.issueField,
                        {
                          color:
                            theme.text,
                        },
                      ]}
                    >
                      {issue.field_name ||
                        "Record"}
                    </Text>

                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor:
                            `${severityColor}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          {
                            color:
                              severityColor,
                          },
                        ]}
                      >
                        {severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.issueType,
                      {
                        color:
                          severityColor,
                      },
                    ]}
                  >
                    {String(
                      issue.issue_type ||
                        "validation_issue"
                    )
                      .replace(
                        /_/g,
                        " "
                      )
                      .replace(
                        /\b\w/g,
                        (c) =>
                          c.toUpperCase()
                      )}
                  </Text>

                  <Text
                    style={[
                      styles.issueMessage,
                      {
                        color:
                          theme.textSecondary,
                      },
                    ]}
                  >
                    {issue.message}
                  </Text>

                  <Text
                    style={[
                      styles.issueStatus,
                      {
                        color:
                          issue.resolved
                            ? "#16A34A"
                            : "#D97706",
                      },
                    ]}
                  >
                    {issue.resolved
                      ? "Resolved"
                      : "Pending verification"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Extracted Fields */}

      <View
        style={[
          styles.sectionHeader,
          {
            marginTop:
              issues.length > 0
                ? 8
                : 0,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Extracted Land Details
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Values detected from the
            uploaded document
          </Text>
        </View>

        <Text
          style={[
            styles.fieldCount,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {fields.filter(
            (field) =>
              field?.field_value
          ).length}{" "}
          extracted
        </Text>
      </View>

      <View style={styles.fieldsGrid}>
        {fieldDefinitions.map(
          (field) => {
            const value =
              getFieldValue(
                field.key
              );

            const confidence =
              getFieldConfidence(
                field.key
              );

            const hasValue =
              Boolean(value);

            return (
              <View
                key={field.key}
                style={[
                  styles.fieldCard,
                  {
                    backgroundColor:
                      theme.surface,
                    borderColor:
                      theme.border,
                  },
                ]}
              >
                <View
                  style={styles.fieldTop}
                >
                  <View
                    style={[
                      styles.fieldIcon,
                      {
                        backgroundColor:
                          theme.primaryLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={field.icon}
                      size={18}
                      color={
                        theme.primary
                      }
                    />
                  </View>

                  {hasValue ? (
                    <Text
                      style={[
                        styles.fieldConfidence,
                        {
                          color:
                            confidence >=
                            75
                              ? "#16A34A"
                              : "#D97706",
                        },
                      ]}
                    >
                      {confidence.toFixed(
                        1
                      )}
                      %
                    </Text>
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  {field.label}
                </Text>

                <Text
                  style={[
                    styles.fieldValue,
                    {
                      color: hasValue
                        ? theme.text
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {hasValue
                    ? `${value}${
                        field.suffix ||
                        ""
                      }`
                    : "Not extracted"}
                </Text>
              </View>
            );
          }
        )}
      </View>

      {/* Continue */}

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname:
              "/validation",
            params: {
              fileName: String(
                fileName ||
                  documentData?.filename ||
                  ""
              ),
              documentId: String(
                documentId || ""
              ),
            },
          })
        }
        style={[
          styles.continueButton,
          {
            backgroundColor:
              theme.primary,
          },
        ]}
      >
        <View>
          <Text
            style={styles.continueTitle}
          >
            Continue to Validation
          </Text>

          <Text
            style={
              styles.continueSubtitle
            }
          >
            Review AI results and
            validation rules
          </Text>
        </View>

        <Ionicons
          name="arrow-forward"
          size={21}
          color="#fff"
        />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
  },

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingScreenText: {
    marginTop: 14,
    fontSize: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    marginLeft: 14,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
  },

  fileCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  fileIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  fileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  fileName: {
    fontSize: 15,
    fontWeight: "700",
  },

  fileStatus: {
    fontSize: 12,
    marginTop: 5,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  confidenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  confidenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  confidenceValue: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
  },

  aiBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  aiBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  progressBackground: {
    height: 8,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
  },

  confidenceHint: {
    fontSize: 11,
    marginTop: 8,
  },

  validationSummary: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  validationIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  validationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  validationTitle: {
    fontSize: 14,
    fontWeight: "800",
  },

  validationSubtitle: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  issueSection: {
    marginBottom: 24,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  fieldCount: {
    fontSize: 11,
    fontWeight: "600",
  },

  issueCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    marginBottom: 10,
  },

  issueIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  issueContent: {
    flex: 1,
    marginLeft: 12,
  },

  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  issueField: {
    fontSize: 14,
    fontWeight: "800",
  },

  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  severityText: {
    fontSize: 9,
    fontWeight: "900",
  },

  issueType: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  issueMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  issueStatus: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 8,
  },

  fieldsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },

  fieldCard: {
    width: "31.8%",
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    margin: 5,
  },

  fieldTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  fieldConfidence: {
    fontSize: 11,
    fontWeight: "800",
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 13,
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 5,
  },

  errorCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    marginLeft: 10,
    flex: 1,
  },

  continueButton: {
    borderRadius: 17,
    padding: 18,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  continueTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  continueSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    marginTop: 4,
  },
});