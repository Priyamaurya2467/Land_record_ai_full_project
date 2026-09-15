import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { apiGet, apiPost } from "../api/client";
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

export default function Verification() {
  const { theme } = useTheme();
  const router = useRouter();

  const { documentId, fileName } = useLocalSearchParams();

  const [documentData, setDocumentData] = useState(null);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [approved, setApproved] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recordVerified, setRecordVerified] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) {
      Alert.alert(
        "Missing Document",
        "No document ID was provided for verification."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await apiGet(`/documents/${documentId}`);

      setDocumentData(data);

      const backendFields = Array.isArray(data?.fields)
        ? data.fields
        : [];

      setFields(backendFields);

      const initialValues = {};
      const initialApproved = {};

      backendFields.forEach((field) => {
        const value =
          field.verified_value ||
          field.field_value ||
          "";

        initialValues[field.field_name] = value;

        const affectedByIssue = Array.isArray(data?.issues)
          ? data.issues.some(
              (issue) =>
                !issue.resolved &&
                issue.field_name === field.field_name
            )
          : false;

        const confidence = Number(field.confidence || 0);

        const needsReview =
          affectedByIssue ||
          (REQUIRED_FIELDS.has(field.field_name) &&
            confidence < 75);

        initialApproved[field.field_name] = !needsReview;
      });

      setValues(initialValues);
      setApproved(initialApproved);

      if (data?.status === "verified") {
        setRecordVerified(true);
      }

      if (data?.status === "rejected") {
        setRejected(true);
      }
    } catch (error) {
      console.log("Verification load error:", error);

      Alert.alert(
        "Unable to Load Record",
        error.message || "Could not load document."
      );
    } finally {
      setLoading(false);
    }
  };

  const unresolvedIssues = useMemo(() => {
    if (!Array.isArray(documentData?.issues)) {
      return [];
    }

    return documentData.issues.filter(
      (issue) => !issue.resolved
    );
  }, [documentData]);

  const approvedCount = Object.values(approved).filter(Boolean).length;

  const totalFields = fields.length || 1;

  const progress = recordVerified
    ? 100
    : Math.round((approvedCount / totalFields) * 100);

  const updateField = (fieldName, value) => {
    setValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }));

    setApproved((previous) => ({
      ...previous,
      [fieldName]: false,
    }));
  };

  const approveField = (fieldName) => {
    setApproved((previous) => ({
      ...previous,
      [fieldName]: true,
    }));
  };

  const verifyRecord = () => {
    if (!documentId) {
      Alert.alert("Error", "Document ID is missing.");
      return;
    }

    const missingRequired = fields.filter((field) => {
      if (!REQUIRED_FIELDS.has(field.field_name)) {
        return false;
      }

      return !String(values[field.field_name] || "").trim();
    });

    if (missingRequired.length > 0) {
      Alert.alert(
        "Required Fields Missing",
        missingRequired
          .map(
            (field) =>
              `${FIELD_LABELS[field.field_name] || field.field_name}`
          )
          .join(", ")
      );
      return;
    }

    const pendingReview = fields.filter((field) => {
      const value = String(
        values[field.field_name] || ""
      ).trim();

      if (!value && !REQUIRED_FIELDS.has(field.field_name)) {
        return false;
      }

      return !approved[field.field_name];
    });

    if (pendingReview.length > 0) {
      Alert.alert(
        "Review Required",
        "Please review and approve all highlighted fields before verifying the record."
      );
      return;
    }

    Alert.alert(
      "Verify Record",
      "Are you sure you want to approve this record as a verified digital land record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Verify",
          onPress: submitVerification,
        },
      ]
    );
  };

  const submitVerification = async () => {
    try {
      setSubmitting(true);

      const corrections = fields
        .filter((field) => {
          const value = String(
            values[field.field_name] || ""
          ).trim();

          return value.length > 0;
        })
        .map((field) => ({
          field_id: field.id,
          corrected_value: String(
            values[field.field_name] || ""
          ).trim(),
        }));

      const response = await apiPost(
        "/documents/verify",
        {
          document_id: Number(documentId),
          corrections,
          approve: true,
          rejection_reason: null,
        }
      );

      setDocumentData(response);
      setRecordVerified(true);

      const allApproved = {};

      fields.forEach((field) => {
        allApproved[field.field_name] = true;
      });

      setApproved(allApproved);

      Alert.alert(
        "Record Verified",
        "The land record has been successfully verified.",
        [
          {
            text: "View Records",
            onPress: () => router.replace("/records"),
          },
        ]
      );
    } catch (error) {
      console.log("Verification error:", error);

      Alert.alert(
        "Verification Failed",
        error.message || "Unable to verify the record."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const rejectRecord = () => {
    Alert.alert(
      "Send Back Record",
      "Are you sure this record should be rejected and sent back for correction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Back",
          style: "destructive",
          onPress: submitRejection,
        },
      ]
    );
  };

  const submitRejection = async () => {
    try {
      setSubmitting(true);

      const response = await apiPost(
        "/documents/verify",
        {
          document_id: Number(documentId),
          corrections: [],
          approve: false,
          rejection_reason:
            "Record requires correction after human review.",
        },
      );

      setDocumentData(response);
      setRejected(true);

      Alert.alert(
        "Record Sent Back",
        "The record has been rejected and sent back for correction.",
        [
          {
            text: "View Records",
            onPress: () => router.replace("/records"),
          },
        ]
      );
    } catch (error) {
      console.log("Rejection error:", error);

      Alert.alert(
        "Action Failed",
        error.message || "Unable to reject the record."
      );
    } finally {
      setSubmitting(false);
    }
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
            { color: theme.textSecondary },
          ]}
        >
          Loading verification record...
        </Text>
      </View>
    );
  }

  if (!documentData) {
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
            styles.loadingText,
            { color: theme.text },
          ]}
        >
          Document could not be loaded.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={[
            styles.backHomeButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.backHomeText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recordStatus = recordVerified
    ? "Verified"
    : rejected
      ? "Rejected"
      : "Review";

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
            Human Verification
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Final review before creating a verified digital record
          </Text>
        </View>

        <View
          style={[
            styles.reviewBadge,
            {
              backgroundColor:
                recordVerified
                  ? theme.successLight
                  : theme.warningLight,
            },
          ]}
        >
          <Ionicons
            name={
              recordVerified
                ? "checkmark-circle-outline"
                : "person-outline"
            }
            size={14}
            color={
              recordVerified
                ? theme.success
                : theme.warning
            }
          />

          <Text
            style={{
              color: recordVerified
                ? theme.success
                : theme.warning,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            {recordVerified
              ? "VERIFIED"
              : rejected
                ? "REJECTED"
                : "REVIEW"}
          </Text>
        </View>
      </View>

      {/* RECORD CARD */}

      <View
        style={[
          styles.recordCard,
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
            size={23}
            color={theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "900",
              fontSize: 16,
            }}
          >
            {fileName ||
              documentData.filename ||
              `Document #${documentData.id}`}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 10,
              marginTop: 3,
            }}
          >
            Document #{documentData.id}
            {" • "}
            {documentData.district_hint || "District unavailable"}
          </Text>
        </View>

        <StatusBadge status={recordStatus} />
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
                fontSize: 10,
              }}
            >
              VERIFICATION PROGRESS
            </Text>

            <Text
              style={{
                color: theme.text,
                fontSize: 21,
                fontWeight: "900",
                marginTop: 3,
              }}
            >
              {approvedCount} / {fields.length}
            </Text>
          </View>

          <View
            style={[
              styles.progressIcon,
              {
                backgroundColor:
                  progress === 100
                    ? theme.successLight
                    : theme.warningLight,
              },
            ]}
          >
            <Ionicons
              name={
                progress === 100
                  ? "checkmark-done-outline"
                  : "time-outline"
              }
              size={23}
              color={
                progress === 100
                  ? theme.success
                  : theme.warning
              }
            />
          </View>
        </View>

        <ConfidenceBar value={progress} />

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 10,
            marginTop: 5,
          }}
        >
          {progress === 100
            ? "All applicable fields have been reviewed."
            : "Review the highlighted fields before approval."}
        </Text>
      </View>

      {/* VALIDATION ISSUES */}

      {unresolvedIssues.length > 0 && (
        <View
          style={[
            styles.issueBanner,
            {
              backgroundColor: theme.warningLight,
              borderColor: theme.warning,
            },
          ]}
        >
          <View style={styles.issueIcon}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={theme.warning}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
                fontSize: 13,
              }}
            >
              {unresolvedIssues.length} validation issue
              {unresolvedIssues.length > 1 ? "s" : ""} detected
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 10,
                lineHeight: 15,
                marginTop: 3,
              }}
            >
              Review these issues carefully before verifying
              the record.
            </Text>
          </View>
        </View>
      )}

      {/* EXTRACTED FIELDS */}

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
          styles.fieldsCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
              }}
            >
              Extracted Fields
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 9,
                marginTop: 3,
              }}
            >
              Review and correct values where necessary
            </Text>
          </View>

          <View
            style={[
              styles.aiSmallBadge,
              {
                backgroundColor:
                  theme.primaryLight,
              },
            ]}
          >
           

          </View>
        </View>

        {fields.map((field) => (
          <FieldEditor
            key={field.id}
            field={field}
            value={values[field.field_name] || ""}
            approved={Boolean(
              approved[field.field_name]
            )}
            theme={theme}
            hasIssue={unresolvedIssues.some(
              (issue) =>
                issue.field_name === field.field_name
            )}
            onChange={(value) =>
              updateField(
                field.field_name,
                value
              )
            }
            onApprove={() =>
              approveField(field.field_name)
            }
          />
        ))}
      </View>

      {/* ISSUES */}

      {unresolvedIssues.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text },
            ]}
          >
            Validation Issues
          </Text>

          {unresolvedIssues.map((issue) => (
            <View
              key={issue.id}
              style={[
                styles.issueCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.warning,
                },
              ]}
            >
              <View style={styles.issueCardHeader}>
                <View
                  style={[
                    styles.issueTypeIcon,
                    {
                      backgroundColor:
                        theme.warningLight,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={19}
                    color={theme.warning}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: "900",
                      fontSize: 13,
                    }}
                  >
                    {FIELD_LABELS[
                      issue.field_name
                    ] ||
                      issue.field_name ||
                      "Record Issue"}
                  </Text>

                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: 9,
                      marginTop: 2,
                    }}
                  >
                    {issue.issue_type}
                  </Text>
                </View>

                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor:
                        issue.severity === "high"
                          ? theme.dangerLight
                          : theme.warningLight,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        issue.severity === "high"
                          ? theme.danger
                          : theme.warning,
                      fontSize: 8,
                      fontWeight: "900",
                    }}
                  >
                    {String(
                      issue.severity || "medium"
                    ).toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  lineHeight: 16,
                  marginTop: 10,
                }}
              >
                {issue.message}
              </Text>
            </View>
          ))}
        </>
      )}

      {/* FINAL DECISION */}

      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Final Decision
      </Text>

      <View
        style={[
          styles.decisionCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.decisionHeader}>
          <View>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 10,
              }}
            >
              RECORD STATUS
            </Text>

            <Text
              style={{
                color: recordVerified
                  ? theme.success
                  : rejected
                    ? theme.danger
                    : theme.warning,
                fontSize: 19,
                fontWeight: "900",
                marginTop: 3,
              }}
            >
              {recordVerified
                ? "Verified"
                : rejected
                  ? "Rejected"
                  : "Pending Approval"}
            </Text>
          </View>

          <View
            style={[
              styles.decisionIcon,
              {
                backgroundColor:
                  recordVerified
                    ? theme.successLight
                    : rejected
                      ? theme.dangerLight
                      : theme.warningLight,
              },
            ]}
          >
            <Ionicons
              name={
                recordVerified
                  ? "checkmark-circle-outline"
                  : rejected
                    ? "close-circle-outline"
                    : "hourglass-outline"
              }
              size={23}
              color={
                recordVerified
                  ? theme.success
                  : rejected
                    ? theme.danger
                    : theme.warning
              }
            />
          </View>
        </View>

        {!recordVerified && !rejected && (
          <View style={styles.finalActions}>
            <TouchableOpacity
              disabled={submitting}
              onPress={rejectRecord}
              style={[
                styles.rejectButton,
                {
                  backgroundColor:
                    theme.dangerLight,
                  borderColor: theme.danger,
                  opacity: submitting ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="arrow-undo-outline"
                size={17}
                color={theme.danger}
              />

              <Text
                style={{
                  color: theme.danger,
                  fontWeight: "800",
                }}
              >
                Send Back
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting}
              onPress={verifyRecord}
              style={[
                styles.approveButton,
                {
                  backgroundColor:
                    theme.success,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#fff"
                  />

                  <Text
                    style={styles.approveText}
                  >
                    Verify & Approve
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function FieldEditor({
  field,
  value,
  approved,
  theme,
  hasIssue,
  onChange,
  onApprove,
}) {
  const confidence = Number(
    field.confidence || 0
  );

  const required = REQUIRED_FIELDS.has(
    field.field_name
  );

  const needsReview =
    hasIssue ||
    (required && confidence < 75);

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: needsReview
            ? theme.warningLight
            : theme.background,
          borderColor: needsReview
            ? theme.warning
            : theme.border,
        },
      ]}
    >
      <View style={styles.fieldHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 9,
              fontWeight: "700",
            }}
          >
            {(
              FIELD_LABELS[field.field_name] ||
              field.field_name
            ).toUpperCase()}
          </Text>

          <View style={styles.confidenceRow}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 9,
              }}
            >
              Confidence {confidence.toFixed(1)}%
            </Text>

            {needsReview && (
              <View
                style={[
                  styles.reviewPill,
                  {
                    backgroundColor:
                      theme.warning,
                  },
                ]}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 8,
                    fontWeight: "800",
                  }}
                >
                  REVIEW
                </Text>
              </View>
            )}
          </View>
        </View>

        {approved && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.success}
          />
        )}
      </View>

      <TextInput
        value={String(value)}
        onChangeText={onChange}
        placeholder={
          required
            ? "Required field"
            : "Optional field"
        }
        placeholderTextColor={
          theme.textSecondary
        }
        style={[
          styles.fieldInput,
          {
            color: theme.text,
            borderColor: theme.border,
            backgroundColor:
              theme.surface,
          },
        ]}
      />

      {needsReview && !approved && (
        <TouchableOpacity
          onPress={onApprove}
          style={[
            styles.approveField,
            {
              backgroundColor:
                theme.successLight,
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={14}
            color={theme.success}
          />

          <Text
            style={{
              color: theme.success,
              fontSize: 10,
              fontWeight: "800",
            }}
          >
            Approve Field
          </Text>
        </TouchableOpacity>
      )}
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
    fontSize: 13,
    fontWeight: "600",
  },

  backHomeButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  backHomeText: {
    color: "#fff",
    fontWeight: "800",
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

  reviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },

  recordCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  recordIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  progressCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  issueBanner: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  issueIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
  },

  fieldsCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  aiSmallBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
  },

  field: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 3,
  },

  reviewPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },

  fieldInput: {
    marginTop: 7,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "700",
  },

  approveField: {
    alignSelf: "flex-end",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  issueCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 9,
  },

  issueCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  issueTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
  },

  decisionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },

  decisionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  decisionIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  finalActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  rejectButton: {
    flex: 0.9,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  approveButton: {
    flex: 1.4,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  approveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
});