import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import { apiGet, apiPost } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import ConfidenceBar from "../components/ConfidenceBar";
import StatusBadge from "../components/StatusBadge";

export default function Verification() {
  const { theme } = useTheme();

  const router = useRouter();

  const {
    documentId,
    fileName,
  } = useLocalSearchParams();

  const {
    role,
    canVerify,
  } = useAuth();

  // =====================================================
  // STATE
  // =====================================================

  const [documentData, setDocumentData] =
    useState(null);

  const [fields, setFields] =
    useState([]);

  const [values, setValues] =
    useState({});

  const [approved, setApproved] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [recordVerified, setRecordVerified] =
    useState(false);

  const [rejected, setRejected] =
    useState(false);

  const [error, setError] =
    useState("");

  const [showApprovalConfirm, setShowApprovalConfirm] =
    useState(false);

  const [showRejectConfirm, setShowRejectConfirm] =
    useState(false);

  // =====================================================
  // LOAD DOCUMENT
  // =====================================================

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) {
      setLoading(false);
      setError(
        "No document ID was received."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log(
        "Loading verification document:",
        documentId
      );

      const data = await apiGet(
        `/documents/${documentId}`
      );

      console.log(
        "Verification document response:",
        data
      );

      setDocumentData(data);

      const backendFields =
        Array.isArray(data?.fields)
          ? data.fields
          : [];

      setFields(backendFields);

      const initialValues = {};

      backendFields.forEach((field) => {
        initialValues[field.field_name] =
          field.verified_value ||
          field.field_value ||
          "";
      });

      setValues(initialValues);

      const status =
        String(data?.status || "").toLowerCase();

      setRecordVerified(
        status === "verified" ||
        status === "processed"
      );

      setRejected(
        status === "rejected"
      );
    } catch (error) {
      console.log(
        "Verification load error:",
        error
      );

      setError(
        error?.message ||
          "Could not load the document."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  const updateField = (
    fieldName,
    value
  ) => {
    if (!canVerify) {
      return;
    }

    setValues((previous) => ({
      ...previous,
      [fieldName]: value,
    }));

    setApproved((previous) => ({
      ...previous,
      [fieldName]: false,
    }));
  };

  // =====================================================
  // APPROVE FIELD LOCALLY
  // =====================================================

  const approveField = (
    fieldName
  ) => {
    if (!canVerify) {
      return;
    }

    setApproved((previous) => ({
      ...previous,
      [fieldName]: true,
    }));
  };

  // =====================================================
  // FIELD LABEL
  // =====================================================

  const getFieldLabel = (name) => {
    const labels = {
      owner_name: "Land Owner",
      survey_number: "Survey Number",
      khasra_number: "Khasra Number",
      khata_number: "Khata Number",
      plot_area: "Plot Area",
      village: "Village",
      tehsil: "Tehsil",
      district: "District",
      land_classification: "Land Type",
      mutation_number: "Mutation Number",
      registration_number:
        "Registration Number",
      registration_date:
        "Registration Date",
    };

    return (
      labels[name] ||
      name
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, (c) =>
          c.toUpperCase()
        )
    );
  };

  // =====================================================
  // REVIEW COUNTS
  // =====================================================

  const unresolvedIssues = useMemo(() => {
    return (
      documentData?.issues?.filter(
        (issue) => !issue.resolved
      ) || []
    );
  }, [documentData]);

  const approvedCount =
    Object.values(approved).filter(
      Boolean
    ).length;

  const totalFields =
    fields.length;

  const progress =
    recordVerified
      ? 100
      : totalFields > 0
      ? Math.round(
          (approvedCount /
            totalFields) *
            100
        )
      : 0;

  // =====================================================
  // VERIFY BUTTON
  // =====================================================

  const verifyRecord = () => {
  if (!canVerify) {
    setError(
      "Only a Verifier or Admin can verify and approve records."
    );
    return;
  }

  if (!documentId) {
    setError("Document ID is unavailable.");
    return;
  }

  const missingFields = fields.filter(
    (field) =>
      !String(values[field.field_name] || "").trim()
  );

  if (missingFields.length > 0) {
    setError(
      `Please complete ${missingFields.length} field${
        missingFields.length > 1 ? "s" : ""
      } before approval.`
    );
    return;
  }

  setError("");
  setShowApprovalConfirm(true);
};

  // =====================================================
  // SUBMIT VERIFICATION
  // =====================================================

  const submitVerification =
    async () => {
      if (!canVerify) {
        setError(
          "You do not have permission to verify this record."
        );
        setShowApprovalConfirm(false);
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const corrections =
          fields
            .filter((field) => {
              const currentValue =
                String(
                  values[
                    field.field_name
                  ] || ""
                ).trim();

              const originalValue =
                String(
                  field.field_value ||
                    ""
                ).trim();

              return (
                currentValue !==
                originalValue
              );
            })
            .map((field) => ({
              field_id: field.id,
              corrected_value:
                String(
                  values[
                    field.field_name
                  ] || ""
                ).trim(),
            }));

        const payload = {
          document_id:
            Number(documentId),

          corrections,

          approve: true,

          rejection_reason: null,
        };

        console.log(
          "================================"
        );

        console.log(
          "VERIFYING DOCUMENT"
        );

        console.log(
          "Role:",
          role
        );

        console.log(
          "Document ID:",
          documentId
        );

        console.log(
          "Verification payload:",
          payload
        );

        console.log(
          "================================"
        );

        const response =
          await apiPost(
            "/documents/verify",
            payload
          );

        console.log(
          "Verification API response:",
          response
        );

        setDocumentData(response);

        setRecordVerified(true);
        setRejected(false);

        const allApproved = {};

        fields.forEach(
          (field) => {
            allApproved[
              field.field_name
            ] = true;
          }
        );

        setApproved(allApproved);

        setShowApprovalConfirm(false);

        setError("");

      } catch (error) {
        console.log(
          "================================"
        );

        console.log(
          "VERIFICATION API ERROR"
        );

        console.log(error);

        console.log(
          "================================"
        );

        setError(
          error?.message ||
            "Unable to verify the document."
        );

        setShowApprovalConfirm(false);
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // REJECT
  // =====================================================

  const rejectRecord = () => {
    if (!canVerify) {
      setError(
        "Only a Verifier or Admin can reject records."
      );
      return;
    }

    if (!documentId) {
      setError(
        "Document ID is unavailable."
      );
      return;
    }

    setError("");
    setShowRejectConfirm(true);
  };

  // =====================================================
  // SUBMIT REJECTION
  // =====================================================

  const submitRejection =
    async () => {
      if (!canVerify) {
        setError(
          "You do not have permission to reject this record."
        );
        setShowRejectConfirm(false);
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const payload = {
          document_id:
            Number(documentId),

          corrections: [],

          approve: false,

          rejection_reason:
            "Record requires correction after human review.",
        };

        console.log(
          "Rejection payload:",
          payload
        );

        const response =
          await apiPost(
            "/documents/verify",
            payload
          );

        console.log(
          "Rejection response:",
          response
        );

        setDocumentData(response);

        setRejected(true);
        setRecordVerified(false);

        setShowRejectConfirm(false);
      } catch (error) {
        console.log(
          "Rejection error:",
          error
        );

        setError(
          error?.message ||
            "Unable to reject the document."
        );

        setShowRejectConfirm(false);
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // LOADING
  // =====================================================

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
            styles.loadingText,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          Loading verification record...
        </Text>
      </View>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ScrollView
      style={{
        backgroundColor:
          theme.background,
      }}
      contentContainerStyle={
        styles.container
      }
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(
                "/records"
              );
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
            size={20}
            color={theme.text}
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            Human Verification
          </Text>

          <Text
            style={{
              color:
                theme.textSecondary,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Final review before creating a
            verified digital record
          </Text>
        </View>

        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                canVerify
                  ? theme.primaryLight
                  : theme.background,
              borderColor:
                theme.border,
            },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={13}
            color={
              canVerify
                ? theme.primary
                : theme.textSecondary
            }
          />

          <Text
            style={{
              color: canVerify
                ? theme.primary
                : theme.textSecondary,
              fontSize: 9,
              fontWeight: "900",
            }}
          >
            {String(
              role || "viewer"
            ).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* VIEWER WARNING */}

      {!canVerify && (
        <View
          style={[
            styles.permissionBanner,
            {
              backgroundColor:
                theme.warningLight,
              borderColor:
                theme.warning,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={21}
            color={theme.warning}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              View Only
            </Text>

            <Text
              style={{
                color:
                  theme.textSecondary,
                fontSize: 10,
                marginTop: 3,
              }}
            >
              Viewer accounts can inspect
              records but cannot verify,
              approve or reject them.
            </Text>
          </View>
        </View>
      )}

      {/* ERROR */}

      {error !== "" && (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor:
                theme.dangerLight,
              borderColor:
                theme.danger,
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={theme.danger}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              Action Failed
            </Text>

            <Text
              style={{
                color:
                  theme.textSecondary,
                fontSize: 10,
                marginTop: 3,
              }}
            >
              {error}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              setError("")
            }
          >
            <Ionicons
              name="close"
              size={18}
              color={
                theme.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {/* RECORD */}

      <View
        style={[
          styles.recordCard,
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
            styles.recordIcon,
            {
              backgroundColor:
                theme.primaryLight,
            },
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
            Document #{documentId}
          </Text>

          <Text
            style={{
              color:
                theme.textSecondary,
              fontSize: 10,
              marginTop: 3,
            }}
            numberOfLines={1}
          >
            {fileName ||
              documentData?.filename ||
              "Land Record"}
          </Text>
        </View>

        <StatusBadge
          status={
            recordVerified
              ? "Verified"
              : rejected
              ? "Rejected"
              : "Review"
          }
        />
      </View>

      {/* PROGRESS */}

      <View
        style={[
          styles.progressCard,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.progressHeader}
        >
          <View>
            <Text
              style={{
                color:
                  theme.textSecondary,
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
              {recordVerified
                ? `${totalFields}/${totalFields}`
                : `${approvedCount}/${totalFields}`}
            </Text>
          </View>

          <View
            style={[
              styles.progressIcon,
              {
                backgroundColor:
                  recordVerified
                    ? theme.successLight
                    : theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name={
                recordVerified
                  ? "checkmark-done-outline"
                  : "create-outline"
              }
              size={23}
              color={
                recordVerified
                  ? theme.success
                  : theme.primary
              }
            />
          </View>
        </View>

        <ConfidenceBar
          value={progress}
        />

        <Text
          style={{
            color:
              theme.textSecondary,
            fontSize: 10,
            marginTop: 4,
          }}
        >
          {recordVerified
            ? "All fields have been reviewed and the record is verified."
            : `${approvedCount} of ${totalFields} fields reviewed.`}
        </Text>
      </View>

      {/* ISSUES */}

      {unresolvedIssues.length >
        0 &&
        !recordVerified && (
          <View
            style={[
              styles.issueBanner,
              {
                backgroundColor:
                  theme.warningLight,
                borderColor:
                  theme.warning,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color={theme.warning}
            />

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "800",
                }}
              >
                {
                  unresolvedIssues.length
                }{" "}
                validation issue
                {unresolvedIssues.length >
                1
                  ? "s"
                  : ""}{" "}
                require review
              </Text>

              <Text
                style={{
                  color:
                    theme.textSecondary,
                  fontSize: 11,
                  marginTop: 3,
                  lineHeight: 16,
                }}
              >
                Review the flagged fields
                before approving this record.
              </Text>
            </View>
          </View>
        )}

      {/* FIELDS */}

      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.text,
          },
        ]}
      >
        Extracted Record
      </Text>

      <View
        style={[
          styles.fieldsCard,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.cardHeader}
        >
          <Text
            style={{
              color: theme.text,
              fontWeight: "900",
            }}
          >
            AI Extracted Fields
          </Text>

          <View
            style={[
              styles.aiBadge,
              {
                backgroundColor:
                  theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={13}
              color={theme.primary}
            />

            <Text
              style={{
                color: theme.primary,
                fontSize: 9,
                fontWeight: "800",
              }}
            >
              AI
            </Text>
          </View>
        </View>

        {fields.map((field) => {
          const affected =
            unresolvedIssues.some(
              (issue) =>
                issue.field_name ===
                field.field_name
            );

          return (
            <FieldEditor
              key={field.id}
              field={field}
              label={getFieldLabel(
                field.field_name
              )}
              value={
                values[
                  field.field_name
                ] || ""
              }
              approved={
                approved[
                  field.field_name
                ] || recordVerified
              }
              needsReview={affected}
              canEdit={canVerify}
              theme={theme}
              onChange={(value) =>
                updateField(
                  field.field_name,
                  value
                )
              }
              onApprove={() =>
                approveField(
                  field.field_name
                )
              }
            />
          );
        })}
      </View>

      {/* VALIDATION ISSUES */}

      {unresolvedIssues.length >
        0 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Validation Issues
            </Text>

            {unresolvedIssues.map(
              (issue) => (
                <View
                  key={issue.id}
                  style={[
                    styles.issueCard,
                    {
                      backgroundColor:
                        theme.warningLight,
                      borderColor:
                        issue.severity ===
                        "high"
                          ? theme.danger
                          : theme.warning,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      issue.severity ===
                      "high"
                        ? "alert-circle"
                        : "warning-outline"
                    }
                    size={22}
                    color={
                      issue.severity ===
                      "high"
                        ? theme.danger
                        : theme.warning
                    }
                  />

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          theme.text,
                        fontWeight:
                          "800",
                      }}
                    >
                      {issue.issue_type
                        ?.replace(
                          /_/g,
                          " "
                        )
                        ?.replace(
                          /\b\w/g,
                          (c) =>
                            c.toUpperCase()
                        )}
                    </Text>

                    <Text
                      style={{
                        color:
                          theme.textSecondary,
                        fontSize: 11,
                        lineHeight: 17,
                        marginTop: 4,
                      }}
                    >
                      {issue.message}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color:
                        issue.severity ===
                        "high"
                          ? theme.danger
                          : theme.warning,
                      fontSize: 9,
                      fontWeight: "900",
                    }}
                  >
                    {issue.severity?.toUpperCase()}
                  </Text>
                </View>
              )
            )}
          </>
        )}

      {/* FINAL DECISION */}

      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.text,
          },
        ]}
      >
        Final Decision
      </Text>

      <View
        style={[
          styles.decisionCard,
          {
            backgroundColor:
              theme.surface,
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={styles.decisionHeader}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color:
                  theme.textSecondary,
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
                ? "Verified Digital Record"
                : rejected
                ? "Record Rejected"
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
                  ? "checkmark-circle"
                  : rejected
                  ? "close-circle"
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

        <Text
          style={{
            color:
              theme.textSecondary,
            fontSize: 11,
            lineHeight: 17,
            marginTop: 10,
          }}
        >
          {recordVerified
            ? "The record has been verified and the officer decision has been added to the audit trail."
            : rejected
            ? "The record was rejected and marked for correction."
            : "Approval will create a verified digital record and add the officer decision to the audit trail."}
        </Text>

        {/* PERMISSION */}

        {!canVerify &&
          !recordVerified &&
          !rejected && (
            <View
              style={[
                styles.lockedAction,
                {
                  backgroundColor:
                    theme.background,
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color={
                  theme.textSecondary
                }
              />

              <Text
                style={{
                  color:
                    theme.textSecondary,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                Verification is available
                only to Verifier and Admin
                accounts.
              </Text>
            </View>
          )}

        {/* FINAL ACTIONS */}

        {canVerify &&
          !recordVerified &&
          !rejected && (
            <View
              style={styles.finalActions}
            >
              <TouchableOpacity
                disabled={submitting}
                onPress={
                  rejectRecord
                }
                style={[
                  styles.rejectButton,
                  {
                    backgroundColor:
                      theme.dangerLight,
                    borderColor:
                      theme.danger,
                    opacity:
                      submitting
                        ? 0.6
                        : 1,
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
                    color:
                      theme.danger,
                    fontWeight:
                      "800",
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
      backgroundColor: theme.success,
      opacity: submitting ? 0.6 : 1,
    },
  ]}
>
  {submitting ? (
    <ActivityIndicator color="#fff" size="small" />
  ) : (
    <>
      <Ionicons
        name="checkmark-circle-outline"
        size={18}
        color="#fff"
      />

      <Text style={styles.approveText}>
        Verify & Approve
      </Text>
    </>
  )}
              </TouchableOpacity>
            </View>
          )}

        {/* APPROVAL CONFIRMATION */}

        {showApprovalConfirm && (
          <View
            style={[
              styles.confirmBox,
              {
                backgroundColor:
                  theme.successLight,
                borderColor:
                  theme.success,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={25}
              color={theme.success}
            />

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "900",
                  fontSize: 13,
                }}
              >
                Approve this record?
              </Text>

              <Text
                style={{
                  color:
                    theme.textSecondary,
                  fontSize: 10,
                  marginTop: 3,
                }}
              >
                This will mark Document #
                {documentId} as a verified
                digital land record.
              </Text>
            </View>

            <TouchableOpacity
              disabled={submitting}
              onPress={() =>
                setShowApprovalConfirm(
                  false
                )
              }
              style={[
                styles.smallCancel,
                {
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting}
              onPress={
                submitVerification
              }
              style={[
                styles.smallConfirm,
                {
                  backgroundColor:
                    theme.success,
                  opacity:
                    submitting
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "900",
                  }}
                >
                  Confirm
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* REJECTION CONFIRMATION */}

        {showRejectConfirm && (
          <View
            style={[
              styles.confirmBox,
              {
                backgroundColor:
                  theme.dangerLight,
                borderColor:
                  theme.danger,
              },
            ]}
          >
            <Ionicons
              name="arrow-undo-outline"
              size={25}
              color={theme.danger}
            />

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "900",
                  fontSize: 13,
                }}
              >
                Send this record back?
              </Text>

              <Text
                style={{
                  color:
                    theme.textSecondary,
                  fontSize: 10,
                  marginTop: 3,
                }}
              >
                The record will be marked as
                rejected and returned for
                correction.
              </Text>
            </View>

            <TouchableOpacity
              disabled={submitting}
              onPress={() =>
                setShowRejectConfirm(
                  false
                )
              }
              style={[
                styles.smallCancel,
                {
                  borderColor:
                    theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting}
              onPress={
                submitRejection
              }
              style={[
                styles.smallConfirm,
                {
                  backgroundColor:
                    theme.danger,
                  opacity:
                    submitting
                      ? 0.6
                      : 1,
                },
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: "900",
                  }}
                >
                  Send Back
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* VERIFIED */}

        {recordVerified && (
          <TouchableOpacity
            onPress={() =>
              router.replace(
                "/records"
              )
            }
            style={[
              styles.approveButton,
              {
                backgroundColor:
                  theme.primary,
                marginTop: 16,
              },
            ]}
          >
            <Ionicons
              name="documents-outline"
              size={18}
              color="#fff"
            />

            <Text
              style={
                styles.approveText
              }
            >
              View Verified Records
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// =======================================================
// FIELD EDITOR
// =======================================================

function FieldEditor({
  field,
  label,
  value,
  approved,
  needsReview,
  canEdit,
  theme,
  onChange,
  onApprove,
}) {
  const confidence = Number(
    field?.confidence || 0
  );

  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor:
            needsReview
              ? theme.warningLight
              : theme.background,

          borderColor:
            needsReview
              ? theme.warning
              : theme.border,
        },
      ]}
    >
      <View
        style={styles.fieldHeader}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color:
                theme.textSecondary,
              fontSize: 9,
              fontWeight: "700",
            }}
          >
            {label.toUpperCase()}
          </Text>

          <View
            style={
              styles.confidenceRow
            }
          >
            <Text
              style={{
                color:
                  theme.textSecondary,
                fontSize: 9,
              }}
            >
              Confidence{" "}
              {confidence.toFixed(1)}%
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
        value={value}
        onChangeText={onChange}
        editable={
          canEdit && !approved
        }
        style={[
          styles.fieldInput,
          {
            color: theme.text,
            borderColor:
              theme.border,
            backgroundColor:
              theme.surface,
            opacity:
              approved ||
              !canEdit
                ? 0.65
                : 1,
          },
        ]}
      />

      {needsReview &&
        !approved &&
        canEdit && (
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
                color:
                  theme.success,
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

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
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

  loadingText: {
    marginTop: 12,
    fontSize: 13,
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

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },

  permissionBanner: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  errorBox: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
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
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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

  aiBadge: {
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
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
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

  lockedAction: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  confirmBox: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  smallCancel: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  smallConfirm: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});