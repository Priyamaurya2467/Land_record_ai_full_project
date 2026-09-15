import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { apiGet } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import ConfidenceBar from "../components/ConfidenceBar";
import StatusBadge from "../components/StatusBadge";

const REQUIRED_FIELDS = new Set([
  "owner_name",
  "survey_number",
  "village",
  "district",
]);

const FIELD_LABELS = {
  owner_name: "Land Owner",
  survey_number: "Survey Number",
  khasra_number: "Khasra Number",
  khata_number: "Khata Number",
  plot_area: "Plot Area",
  village: "Village",
  tehsil: "Tehsil",
  district: "District",
  land_classification: "Land Classification",
  mutation_number: "Mutation Number",
  registration_number: "Registration Number",
  registration_date: "Registration Date",
};

export default function Investigation() {
  const { theme } = useTheme();
  const router = useRouter();

  const { documentId, fileName } = useLocalSearchParams();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);

      const data = await apiGet(`/documents/${documentId}`);

      console.log("Investigation document:", data);

      setDocumentData(data);
    } catch (error) {
      console.log("Investigation load error:", error);

      Alert.alert(
        "Unable to load record",
        error.message || "Could not load investigation data."
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = useMemo(() => {
    return Array.isArray(documentData?.fields)
      ? documentData.fields
      : [];
  }, [documentData]);

  const issues = useMemo(() => {
    return Array.isArray(documentData?.issues)
      ? documentData.issues
      : [];
  }, [documentData]);

  const unresolvedIssues = useMemo(() => {
    return issues.filter((issue) => !issue.resolved);
  }, [issues]);

  const averageFieldConfidence = useMemo(() => {
    const populated = fields.filter(
      (field) =>
        String(field.field_value || "").trim().length > 0
    );

    if (!populated.length) {
      return Number(documentData?.overall_confidence || 0);
    }

    const total = populated.reduce(
      (sum, field) => sum + Number(field.confidence || 0),
      0
    );

    return Math.round(total / populated.length);
  }, [fields, documentData]);

  const displayConfidence = Math.round(
    Number(documentData?.overall_confidence || averageFieldConfidence || 0)
  );

  const recordStatus = documentData?.status || "needs_review";

  const recordTitle =
    fileName ||
    documentData?.filename ||
    `Document #${documentId}`;

  const ownerName =
    getFieldValue(fields, "owner_name") || "Not extracted";

  const village =
    getFieldValue(fields, "village") || "Not extracted";

  const district =
    getFieldValue(fields, "district") ||
    documentData?.district_hint ||
    "Not extracted";

  const surveyNumber =
    getFieldValue(fields, "survey_number") || "Not extracted";

  const riskLevel = unresolvedIssues.some(
    (issue) => issue.severity === "high"
  )
    ? "High"
    : unresolvedIssues.length
    ? "Medium"
    : "Low";

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
            { color: theme.textSecondary },
          ]}
        >
          Loading investigation data...
        </Text>
      </View>
    );
  }

  if (!documentId) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={48}
          color={theme.textSecondary}
        />

        <Text
          style={[
            styles.errorTitle,
            { color: theme.text },
          ]}
        >
          Document ID missing
        </Text>

        <Text
          style={[
            styles.errorText,
            { color: theme.textSecondary },
          ]}
        >
          This investigation screen must be opened with a
          document ID.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.primaryText}>
            Back to Dashboard
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
            Record Investigation
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Investigate conflicts, validation and record evidence
          </Text>
        </View>

        <View
          style={[
            styles.aiBadge,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="sparkles-outline"
            size={15}
            color={theme.ai}
          />

          <Text
            style={{
              color: theme.ai,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            AI ASSIST
          </Text>
        </View>
      </View>

      {/* RECORD IDENTITY */}

      <View
        style={[
          styles.identityCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.recordIcon,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="document-text-outline"
            size={25}
            color={theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "900",
              fontSize: 15,
            }}
            numberOfLines={1}
          >
            {recordTitle}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 10,
              marginTop: 4,
            }}
            numberOfLines={2}
          >
            {ownerName} • {village} • {district}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 9,
              marginTop: 3,
            }}
          >
            Survey: {surveyNumber}
          </Text>
        </View>

        <StatusBadge
          status={
            recordStatus === "verified"
              ? "Verified"
              : recordStatus === "rejected"
              ? "Rejected"
              : "Review"
          }
        />
      </View>

      {/* RISK BANNER */}

      <View
        style={[
          styles.riskBanner,
          {
            backgroundColor:
              riskLevel === "High"
                ? theme.dangerLight
                : riskLevel === "Medium"
                ? theme.warningLight
                : theme.successLight,

            borderColor:
              riskLevel === "High"
                ? theme.danger
                : riskLevel === "Medium"
                ? theme.warning
                : theme.success,
          },
        ]}
      >
        <View
          style={[
            styles.riskIcon,
            {
              backgroundColor:
                riskLevel === "High"
                  ? theme.danger
                  : riskLevel === "Medium"
                  ? theme.warning
                  : theme.success,
            },
          ]}
        >
          <Ionicons
            name={
              riskLevel === "Low"
                ? "checkmark-outline"
                : "warning-outline"
            }
            size={20}
            color="#fff"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
            }}
          >
            {unresolvedIssues.length
              ? `${unresolvedIssues.length} validation issue${
                  unresolvedIssues.length > 1 ? "s" : ""
                } detected`
              : "No unresolved validation issues"}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              lineHeight: 17,
              marginTop: 3,
            }}
          >
            {unresolvedIssues.length
              ? "Human investigation is recommended before approval."
              : "The backend validation checks currently show no unresolved conflicts."}
          </Text>
        </View>
      </View>

      {/* TABS */}

      <View
        style={[
          styles.tabs,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Tab
          label="Overview"
          active={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
          theme={theme}
        />

        <Tab
          label="Issues"
          active={activeTab === "issues"}
          onPress={() => setActiveTab("issues")}
          theme={theme}
        />

        <Tab
          label="Evidence"
          active={activeTab === "evidence"}
          onPress={() => setActiveTab("evidence")}
          theme={theme}
        />
      </View>

      {/* OVERVIEW */}

      {activeTab === "overview" && (
        <>
          <SectionTitle
            title="AI Investigation Summary"
            theme={theme}
          />

          <View
            style={[
              styles.aiCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.aiHeader}>
              <View
                style={[
                  styles.aiIcon,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Ionicons
                  name="sparkles"
                  size={20}
                  color={theme.ai}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "800",
                  }}
                >
                  Anvexa AI Analysis
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  Backend validation insight
                </Text>
              </View>

              <Text
                style={{
                  color:
                    displayConfidence >= 75
                      ? theme.success
                      : theme.warning,
                  fontWeight: "800",
                  fontSize: 11,
                }}
              >
                {displayConfidence}% confidence
              </Text>
            </View>

            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                lineHeight: 20,
                marginTop: 15,
              }}
            >
              {unresolvedIssues.length
                ? `The AI extraction completed with ${unresolvedIssues.length} validation issue${
                    unresolvedIssues.length > 1 ? "s" : ""
                  }. The extracted fields should be reviewed against the original land record before final approval.`
                : "The AI extraction completed without unresolved validation issues. The extracted fields can proceed through the verification workflow."}
            </Text>

            <View style={{ marginTop: 14 }}>
              <ConfidenceBar value={displayConfidence} />
            </View>
          </View>

          {/* EXTRACTED RECORD */}

          <SectionTitle
            title="Extracted Record"
            theme={theme}
          />

          <View
            style={[
              styles.dataCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            {fields
              .filter(
                (field) =>
                  String(field.field_value || "").trim() !== ""
              )
              .map((field) => (
                <DataRow
                  key={field.id}
                  theme={theme}
                  label={
                    FIELD_LABELS[field.field_name] ||
                    field.field_name
                  }
                  value={field.field_value}
                  confidence={field.confidence}
                />
              ))}
          </View>

          {/* QUICK ISSUE PREVIEW */}

          {unresolvedIssues.length > 0 && (
            <>
              <SectionTitle
                title="Conflict Analysis"
                theme={theme}
              />

              {unresolvedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  theme={theme}
                  issue={issue}
                  fields={fields}
                />
              ))}
            </>
          )}

          {/* RECORD SUMMARY */}

          <SectionTitle
            title="Investigation Summary"
            theme={theme}
          />

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <SummaryRow
              theme={theme}
              icon="document-text-outline"
              label="Document Status"
              value={formatStatus(recordStatus)}
            />

            <SummaryRow
              theme={theme}
              icon="analytics-outline"
              label="Overall Confidence"
              value={`${displayConfidence}%`}
            />

            <SummaryRow
              theme={theme}
              icon="alert-circle-outline"
              label="Unresolved Issues"
              value={String(unresolvedIssues.length)}
            />

            <SummaryRow
              theme={theme}
              icon="location-outline"
              label="District"
              value={district}
            />
          </View>
        </>
      )}

      {/* ISSUES */}

      {activeTab === "issues" && (
        <>
          <SectionTitle
            title="Validation Issues"
            theme={theme}
          />

          {unresolvedIssues.length === 0 ? (
            <EmptyState
              theme={theme}
              icon="checkmark-circle-outline"
              title="No unresolved issues"
              description="The backend currently reports no pending validation conflicts for this record."
            />
          ) : (
            unresolvedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                theme={theme}
                issue={issue}
                fields={fields}
              />
            ))
          )}

          {issues.length > unresolvedIssues.length && (
            <View
              style={[
                styles.resolvedNotice,
                {
                  backgroundColor: theme.successLight,
                  borderColor: theme.success,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={theme.success}
              />

              <Text
                style={{
                  flex: 1,
                  color: theme.text,
                  fontSize: 10,
                  lineHeight: 16,
                }}
              >
                {issues.length - unresolvedIssues.length} issue
                {issues.length - unresolvedIssues.length > 1
                  ? "s were"
                  : " was"}{" "}
                previously resolved.
              </Text>
            </View>
          )}
        </>
      )}

      {/* EVIDENCE */}

      {activeTab === "evidence" && (
        <>
          <SectionTitle
            title="Investigation Evidence"
            theme={theme}
          />

          <View
            style={[
              styles.evidenceCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <EvidenceItem
              theme={theme}
              icon="document-text-outline"
              title="Original Document"
              subtitle={recordTitle}
            />

            <EvidenceItem
              theme={theme}
              icon="scan-outline"
              title="OCR Extraction"
              subtitle={`${displayConfidence}% extraction confidence`}
            />

            <EvidenceItem
              theme={theme}
              icon="git-compare-outline"
              title="Validation Result"
              subtitle={`${unresolvedIssues.length} unresolved issue${
                unresolvedIssues.length === 1 ? "" : "s"
              }`}
            />

            <EvidenceItem
              theme={theme}
              icon="map-outline"
              title="GIS Reference"
              subtitle={
                documentData?.latitude &&
                documentData?.longitude
                  ? `${documentData.latitude}, ${documentData.longitude}`
                  : "No GIS coordinates available"
              }
            />
          </View>
        </>
      )}

      {/* ACTIONS */}

      <SectionTitle
        title="Investigation Decision"
        theme={theme}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/verification",
              params: {
                documentId: String(documentId),
                fileName: String(
                  fileName ||
                    documentData?.filename ||
                    ""
                ),
              },
            })
          }
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Ionicons
            name="person-check-outline"
            size={18}
            color="#fff"
          />

          <Text style={styles.primaryText}>
            Send for Human Verification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/gis")}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="map-outline"
            size={18}
            color={theme.text}
          />

          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
            }}
          >
            Investigate on GIS
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 10,
          textAlign: "center",
          marginTop: 13,
        }}
      >
        Investigation data is generated from the current
        backend document and validation results.
      </Text>
    </ScrollView>
  );
}

function getFieldValue(fields, fieldName) {
  const field = fields.find(
    (item) => item.field_name === fieldName
  );

  return field?.verified_value || field?.field_value || "";
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function Tab({
  label,
  active,
  onPress,
  theme,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        active && {
          backgroundColor: theme.primaryLight,
        },
      ]}
    >
      <Text
        style={{
          color: active
            ? theme.primary
            : theme.textSecondary,
          fontWeight: active ? "800" : "600",
          fontSize: 11,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ title, theme }) {
  return (
    <Text
      style={[
        styles.sectionTitle,
        { color: theme.text },
      ]}
    >
      {title}
    </Text>
  );
}

function IssueCard({
  theme,
  issue,
  fields,
}) {
  const severity =
    String(issue.severity || "").toLowerCase();

  const isHigh = severity === "high";

  const color = isHigh
    ? theme.danger
    : theme.warning;

  const background = isHigh
    ? theme.dangerLight
    : theme.warningLight;

  const field = fields.find(
    (item) =>
      item.field_name === issue.field_name
  );

  const extractedValue =
    field?.verified_value ||
    field?.field_value ||
    "Not extracted";

  return (
    <View
      style={[
        styles.issueCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.issueIcon,
          { backgroundColor: background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={21}
          color={color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.issueHeader}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "900",
              fontSize: 13,
              flex: 1,
            }}
          >
            {FIELD_LABELS[issue.field_name] ||
              issue.field_name ||
              "Validation Issue"}
          </Text>

          <Text
            style={{
              color,
              fontSize: 9,
              fontWeight: "900",
            }}
          >
            {String(
              issue.severity || "review"
            ).toUpperCase()}
          </Text>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 9,
            marginTop: 4,
          }}
        >
          {issue.issue_type}
        </Text>

        <View
          style={[
            styles.issueMessage,
            {
              backgroundColor: background,
            },
          ]}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: 11,
              lineHeight: 17,
            }}
          >
            {issue.message}
          </Text>
        </View>

        <View style={styles.issueValueRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 8,
              }}
            >
              EXTRACTED VALUE
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 11,
                fontWeight: "800",
                marginTop: 3,
              }}
            >
              {extractedValue}
            </Text>
          </View>

          <View
            style={[
              styles.pendingBadge,
              {
                backgroundColor:
                  issue.resolved
                    ? theme.successLight
                    : background,
              },
            ]}
          >
            <Text
              style={{
                color: issue.resolved
                  ? theme.success
                  : color,
                fontSize: 8,
                fontWeight: "900",
              }}
            >
              {issue.resolved
                ? "RESOLVED"
                : "PENDING REVIEW"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function DataRow({
  theme,
  label,
  value,
  confidence,
}) {
  return (
    <View style={styles.dataRow}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 9,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: theme.text,
            fontSize: 12,
            fontWeight: "800",
            marginTop: 3,
          }}
        >
          {value}
        </Text>
      </View>

      <View style={{ width: 65 }}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 8,
            textAlign: "right",
          }}
        >
          CONFIDENCE
        </Text>

        <Text
          style={{
            color:
              Number(confidence || 0) >= 75
                ? theme.success
                : theme.warning,
            fontSize: 10,
            fontWeight: "900",
            textAlign: "right",
            marginTop: 3,
          }}
        >
          {Math.round(Number(confidence || 0))}%
        </Text>
      </View>
    </View>
  );
}

function SummaryRow({
  theme,
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons
        name={icon}
        size={17}
        color={theme.primary}
      />

      <Text
        style={{
          flex: 1,
          color: theme.textSecondary,
          fontSize: 10,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: 10,
          fontWeight: "900",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function EvidenceItem({
  theme,
  icon,
  title,
  subtitle,
}) {
  return (
    <View
      style={[
        styles.evidenceItem,
        { borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.evidenceIcon,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={theme.primary}
        />
      </View>

      <Text
        style={{
          color: theme.text,
          fontWeight: "800",
          fontSize: 11,
          marginTop: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 9,
          marginTop: 3,
        }}
        numberOfLines={2}
      >
        {subtitle}
      </Text>
    </View>
  );
}

function EmptyState({
  theme,
  icon,
  title,
  description,
}) {
  return (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={42}
        color={theme.success}
      />

      <Text
        style={{
          color: theme.text,
          fontSize: 14,
          fontWeight: "900",
          marginTop: 10,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 10,
          lineHeight: 16,
          textAlign: "center",
          marginTop: 5,
        }}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 15,
  },

  errorText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
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
    fontSize: 23,
    fontWeight: "900",
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },

  identityCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  recordIcon: {
    width: 47,
    height: 47,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  riskBanner: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  riskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  tabs: {
    marginTop: 17,
    padding: 4,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
  },

  aiCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },

  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  dataCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
  },

  issueCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 10,
  },

  issueIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  issueMessage: {
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },

  issueValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  pendingBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
  },

  resolvedNotice: {
    marginTop: 5,
    borderWidth: 1,
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  evidenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  evidenceItem: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 13,
    padding: 11,
  },

  evidenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
  },

  actions: {
    gap: 10,
  },

  primaryButton: {
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
});