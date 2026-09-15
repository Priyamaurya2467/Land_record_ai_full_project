import React, { useEffect, useMemo, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import { apiGet } from "../api/client";

import ConfidenceBar from "../components/ConfidenceBar";
import StatusBadge from "../components/StatusBadge";

export default function Validation() {
  const { theme } = useTheme();

  const { fileName, documentId } = useLocalSearchParams();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) {
      setError("Document ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Validation document ID:", documentId);

      const data = await apiGet(`/documents/${documentId}`);

      console.log("Validation document:", data);

      setDocumentData(data);
    } catch (err) {
      console.log("Validation API error:", err);
      setError(err.message || "Unable to load validation data.");
    } finally {
      setLoading(false);
    }
  };

  const fields = documentData?.fields || [];
  const issues = documentData?.issues || [];

  const getField = (fieldName) => {
    return fields.find(
      (field) => field.field_name === fieldName
    );
  };

  const owner = getField("owner_name");
  const survey = getField("survey_number");
  const khasra = getField("khasra_number");
  const khata = getField("khata_number");
  const area = getField("plot_area");
  const village = getField("village");
  const district = getField("district");

  const matchCount = useMemo(() => {
    return fields.filter(
      (field) => field.confidence >= 90
    ).length;
  }, [fields]);

  const warningCount = useMemo(() => {
    return fields.filter(
      (field) =>
        field.confidence >= 75 &&
        field.confidence < 90
    ).length;
  }, [fields]);

  const criticalCount = issues.filter(
    (issue) => issue.severity === "high"
  ).length;

  const validationScore =
    documentData?.overall_confidence || 0;

  const statusLabel =
    documentData?.status === "needs_review"
      ? "Review"
      : documentData?.status === "verified"
      ? "Verified"
      : documentData?.status || "Processing";

  const getDisplayValue = (field) => {
    if (!field) return "Not extracted";

    return field.field_value || "Not extracted";
  };

  const getIssueTitle = (issue) => {
    if (issue.issue_type === "possible_duplicate") {
      return "Possible Duplicate Record";
    }

    if (issue.issue_type === "missing_field") {
      return "Missing Field";
    }

    if (issue.issue_type === "invalid_value") {
      return "Invalid Value";
    }

    if (issue.issue_type === "suspicious_value") {
      return "Suspicious Value";
    }

    return "Validation Issue";
  };

  const getIssueType = (issue) => {
    if (issue.severity === "high") {
      return "critical";
    }

    return "warning";
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingText,
            { color: theme.text },
          ]}
        >
          Loading validation results...
        </Text>

        <Text
          style={[
            styles.loadingSubtext,
            { color: theme.textSecondary },
          ]}
        >
          Fetching AI extraction and validation data
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <View
          style={[
            styles.errorIcon,
            { backgroundColor: theme.dangerLight },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={35}
            color={theme.danger}
          />
        </View>

        <Text
          style={[
            styles.errorTitle,
            { color: theme.text },
          ]}
        >
          Unable to Load Validation
        </Text>

        <Text
          style={[
            styles.errorText,
            { color: theme.textSecondary },
          ]}
        >
          {error}
        </Text>

        <TouchableOpacity
          onPress={loadDocument}
          style={[
            styles.retryButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.primaryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* HEADER */}

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
            styles.back,
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
            Record Validation
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 3,
            }}
          >
            AI extraction and rule-based validation
          </Text>
        </View>

        <View
          style={[
            styles.aiBadge,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={15}
            color={theme.primary}
          />

          <Text
            style={{
              color: theme.primary,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            AI VALIDATION
          </Text>
        </View>
      </View>

      {/* CASE */}

      <View
        style={[
          styles.caseCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.caseLeft}>
          <View
            style={[
              styles.caseIcon,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={theme.primary}
            />
          </View>

          <View>
            <Text
              style={{
                color: theme.text,
                fontWeight: "800",
              }}
            >
              {fileName ||
                documentData?.filename ||
                `Document #${documentId}`}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              {getDisplayValue(village)} •{" "}
              {getDisplayValue(district)} • Survey{" "}
              {getDisplayValue(survey)}
            </Text>
          </View>
        </View>

        <StatusBadge status={statusLabel} />
      </View>

      {/* SCORE */}

      <View
        style={[
          styles.scoreCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.scoreHeader}>
          <View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
              }}
            >
              Extraction Confidence
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 32,
                fontWeight: "900",
                marginTop: 3,
              }}
            >
              {Number(validationScore).toFixed(1)}%
            </Text>
          </View>

          <View
            style={[
              styles.scoreIcon,
              {
                backgroundColor:
                  issues.length > 0
                    ? theme.warningLight
                    : theme.successLight,
              },
            ]}
          >
            <Ionicons
              name={
                issues.length > 0
                  ? "alert-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={30}
              color={
                issues.length > 0
                  ? theme.warning
                  : theme.success
              }
            />
          </View>
        </View>

        <ConfidenceBar value={validationScore} />

        <Text
          style={{
            color:
              issues.length > 0
                ? theme.warning
                : theme.success,
            fontSize: 12,
            fontWeight: "700",
            marginTop: 6,
          }}
        >
          {issues.length > 0
            ? "Validation issues detected • Human review required"
            : "Validation passed • Ready for verification"}
        </Text>
      </View>

      {/* SUMMARY */}

      <View style={styles.summaryRow}>
        <Summary
          icon="checkmark-circle"
          value={matchCount}
          label="High Confidence"
          color={theme.success}
          bg={theme.successLight}
        />

        <Summary
          icon="alert-circle"
          value={warningCount}
          label="Review"
          color={theme.warning}
          bg={theme.warningLight}
        />

        <Summary
          icon="close-circle"
          value={criticalCount}
          label="Issues"
          color={theme.danger}
          bg={theme.dangerLight}
        />

        <Summary
          icon="shield-checkmark"
          value={fields.length}
          label="Fields"
          color={theme.primary}
          bg={theme.primaryLight}
        />
      </View>

      {/* EXTRACTED DATA */}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Extracted Record
      </Text>

      <View
        style={[
          styles.comparisonCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.tableHeader,
            { borderBottomColor: theme.border },
          ]}
        >
          <Text
            style={[
              styles.fieldColumn,
              { color: theme.textSecondary },
            ]}
          >
            FIELD
          </Text>

          <Text
            style={[
              styles.dataColumn,
              { color: theme.textSecondary },
            ]}
          >
            AI RESULT
          </Text>

          <View style={{ width: 28 }} />
        </View>

        {fields.map((field) => {
          const confidence =
            Number(field.confidence || 0);

          const highConfidence =
            confidence >= 90;

          const lowConfidence =
            confidence < 75;

          return (
            <TouchableOpacity
              key={field.id}
              onPress={() => {
                if (!highConfidence) {
                  setSelectedIssue({
                    field:
                      field.field_name,
                    ai:
                      field.field_value ||
                      "Not extracted",
                    database:
                      "Reference verification required",
                    confidence,
                    message:
                      "This field has lower confidence and should be checked against the original document.",
                  });
                }
              }}
              style={[
                styles.checkRow,
                { borderBottomColor: theme.border },
              ]}
            >
              <View style={styles.fieldColumn}>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {formatFieldName(
                    field.field_name
                  )}
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 10,
                    marginTop: 3,
                  }}
                >
                  {confidence.toFixed(1)}%
                  confidence
                </Text>
              </View>

              <Text
                numberOfLines={2}
                style={[
                  styles.dataColumn,
                  {
                    color: theme.text,
                    fontWeight: "600",
                  },
                ]}
              >
                {field.field_value ||
                  "Not extracted"}
              </Text>

              <Ionicons
                name={
                  highConfidence
                    ? "checkmark-circle"
                    : lowConfidence
                    ? "alert-circle"
                    : "help-circle"
                }
                size={19}
                color={
                  highConfidence
                    ? theme.success
                    : lowConfidence
                    ? theme.danger
                    : theme.warning
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* VALIDATION ISSUES */}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Detected Issues
      </Text>

      {issues.length === 0 ? (
        <View
          style={[
            styles.clearCard,
            {
              backgroundColor:
                theme.successLight,
              borderColor: theme.success,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={theme.success}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "800",
              }}
            >
              No Validation Issues
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                marginTop: 3,
              }}
            >
              All automated validation rules passed.
            </Text>
          </View>

          <Text
            style={{
              color: theme.success,
              fontWeight: "800",
              fontSize: 12,
            }}
          >
            CLEAR
          </Text>
        </View>
      ) : (
        issues.map((issue) => (
          <IssueCard
            key={issue.id}
            theme={theme}
            type={getIssueType(issue)}
            title={getIssueTitle(issue)}
            description={issue.message}
            confidence={
              issue.severity === "high"
                ? "HIGH"
                : "REVIEW"
            }
            onPress={() =>
              setSelectedIssue({
                field:
                  issue.field_name ||
                  "Record",
                ai:
                  getField(
                    issue.field_name
                  )?.field_value ||
                  "Not available",
                database:
                  "Reference verification required",
                confidence:
                  getField(
                    issue.field_name
                  )?.confidence || 70,
                message:
                  issue.message,
              })
            }
          />
        ))
      )}

      {/* DUPLICATE STATUS */}

      <View
        style={[
          styles.duplicateCard,
          {
            backgroundColor:
              issues.some(
                (issue) =>
                  issue.issue_type ===
                  "possible_duplicate"
              )
                ? theme.warningLight
                : theme.successLight,

            borderColor:
              issues.some(
                (issue) =>
                  issue.issue_type ===
                  "possible_duplicate"
              )
                ? theme.warning
                : theme.success,
          },
        ]}
      >
        <Ionicons
          name="copy-outline"
          size={22}
          color={
            issues.some(
              (issue) =>
                issue.issue_type ===
                "possible_duplicate"
            )
              ? theme.warning
              : theme.success
          }
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
            }}
          >
            Duplicate Record Check
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              marginTop: 3,
            }}
          >
            {issues.some(
              (issue) =>
                issue.issue_type ===
                "possible_duplicate"
            )
              ? "A possible duplicate was detected. Human verification is required."
              : "No duplicate record detected among indexed records."}
          </Text>
        </View>

        <Text
          style={{
            color: issues.some(
              (issue) =>
                issue.issue_type ===
                "possible_duplicate"
            )
              ? theme.warning
              : theme.success,
            fontWeight: "800",
            fontSize: 12,
          }}
        >
          {issues.some(
            (issue) =>
              issue.issue_type ===
              "possible_duplicate"
          )
            ? "REVIEW"
            : "CLEAR"}
        </Text>
      </View>

      {/* ACTIONS */}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/verification",
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
            styles.primaryButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color="#fff"
          />

          <Text style={styles.primaryText}>
            Send for Human Verification
          </Text>
        </TouchableOpacity>

        {issues.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              setSelectedIssue({
                field: "Validation Summary",
                ai: `${issues.length} issue(s) detected`,
                database:
                  "Reference verification required",
                confidence:
                  validationScore,
                message:
                  "Review the detected issues and compare the extracted record with the original document before approval.",
              })
            }
            style={[
              styles.secondaryButton,
              {
                backgroundColor:
                  theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.text}
            />

            <Text
              style={{
                color: theme.text,
                fontWeight: "700",
              }}
            >
              Investigate Issues
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ISSUE MODAL */}

      <IssueModal
        issue={selectedIssue}
        theme={theme}
        onClose={() =>
          setSelectedIssue(null)
        }
      />
    </ScrollView>
  );
}

/* ---------------- SUMMARY ---------------- */

function Summary({
  icon,
  value,
  label,
  color,
  bg,
}) {
  return (
    <View
      style={[
        styles.summary,
        { backgroundColor: bg },
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={color}
      />

      <Text
        style={{
          color,
          fontSize: 18,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color,
          fontSize: 9,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/* ---------------- ISSUE CARD ---------------- */

function IssueCard({
  theme,
  type,
  title,
  description,
  confidence,
  onPress,
}) {
  const critical = type === "critical";

  const color = critical
    ? theme.danger
    : theme.warning;

  const bg = critical
    ? theme.dangerLight
    : theme.warningLight;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.issueCard,
        {
          backgroundColor:
            theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.issueIcon,
          { backgroundColor: bg },
        ]}
      >
        <Ionicons
          name={
            critical
              ? "shield-outline"
              : "alert-outline"
          }
          size={21}
          color={color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.issueTitle}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
              flex: 1,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            {confidence}
          </Text>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 5,
          }}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.textSecondary}
      />
    </TouchableOpacity>
  );
}

/* ---------------- ISSUE MODAL ---------------- */

function IssueModal({
  issue,
  theme,
  onClose,
}) {
  if (!issue) return null;

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modal,
          {
            backgroundColor:
              theme.surface,
          },
        ]}
      >
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color:
                  theme.textSecondary,
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              VALIDATION ISSUE
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 21,
                fontWeight: "800",
                marginTop: 4,
              }}
            >
              {formatFieldName(
                issue.field
              )}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={25}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.compareBox}>
          <CompareValue
            label="AI Result"
            value={issue.ai}
            theme={theme}
          />

          <Ionicons
            name="swap-horizontal"
            size={20}
            color={theme.warning}
          />

          <CompareValue
            label="Reference"
            value={issue.database}
            theme={theme}
          />
        </View>

        <ConfidenceBar
          value={issue.confidence || 70}
        />

        <Text
          style={{
            color: theme.text,
            fontWeight: "800",
            marginTop: 15,
          }}
        >
          Recommended Action
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 12,
            lineHeight: 18,
            marginTop: 6,
          }}
        >
          {issue.message ||
            "Compare the original document with the reference record before approving this field."}
        </Text>

        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.closeButton,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
            }}
          >
            Close Investigation
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- COMPARE VALUE ---------------- */

function CompareValue({
  label,
  value,
  theme,
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 10,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: 14,
          fontWeight: "800",
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/* ---------------- HELPERS ---------------- */

function formatFieldName(value) {
  if (!value) return "Unknown Field";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 45,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 18,
    textAlign: "center",
  },

  loadingSubtext: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  errorIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginTop: 18,
  },

  errorText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 13,
    borderRadius: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  back: {
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

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },

  caseCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  caseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },

  caseIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  scoreCard: {
    marginTop: 13,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },

  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scoreIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 13,
  },

  summary: {
    flex: 1,
    borderRadius: 13,
    padding: 10,
    alignItems: "center",
    gap: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginTop: 25,
    marginBottom: 10,
  },

  comparisonCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    minHeight: 67,
  },

  fieldColumn: {
    flex: 1.3,
  },

  dataColumn: {
    flex: 1,
    paddingHorizontal: 3,
  },

  issueCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  issueIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  issueTitle: {
    flexDirection: "row",
    alignItems: "center",
  },

  clearCard: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  duplicateCard: {
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  actions: {
    gap: 10,
    marginTop: 18,
  },

  primaryButton: {
    padding: 15,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondaryButton: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modal: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 22,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  compareBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },

  closeButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
  },
});