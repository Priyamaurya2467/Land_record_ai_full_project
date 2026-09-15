import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import ConfidenceBar from "../components/ConfidenceBar";
import StatusBadge from "../components/StatusBadge";

const filters = ["All", "AI", "Validation", "Officer"];

export default function Audit() {
  const { theme } = useTheme();
  const router = useRouter();

  const { documentId } = useLocalSearchParams();

  const [documentData, setDocumentData] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudit();
  }, [documentId]);

  const loadAudit = async () => {
    if (!documentId) {
      Alert.alert(
        "Missing Document",
        "No document ID was provided for the audit trail."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [document, audit] = await Promise.all([
        apiGet(`/documents/${documentId}`),
        apiGet(`/documents/${documentId}/audit`),
      ]);

      setDocumentData(document);

      const events = Array.isArray(audit)
        ? audit
        : Array.isArray(audit?.items)
          ? audit.items
          : [];

      setAuditEvents(events);
    } catch (error) {
      console.log("Audit loading error:", error);

      Alert.alert(
        "Unable to Load Audit Trail",
        error.message || "Could not load audit information."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((event) => {
      if (filter === "All") {
        return true;
      }

      const action = String(
        event.action || ""
      ).toLowerCase();

      if (filter === "AI") {
        return (
          action.includes("process") ||
          action.includes("ocr") ||
          action.includes("extract") ||
          action.includes("ai")
        );
      }

      if (filter === "Validation") {
        return (
          action.includes("valid") ||
          action.includes("review") ||
          action.includes("issue")
        );
      }

      if (filter === "Officer") {
        return (
          action.includes("verify") ||
          action.includes("reject") ||
          action.includes("correct")
        );
      }

      return true;
    });
  }, [auditEvents, filter]);

  const summary = useMemo(() => {
    let ai = 0;
    let validation = 0;
    let corrections = 0;
    let approvals = 0;

    auditEvents.forEach((event) => {
      const action = String(
        event.action || ""
      ).toLowerCase();

      if (
        action.includes("process") ||
        action.includes("ocr") ||
        action.includes("extract") ||
        action.includes("ai")
      ) {
        ai++;
      }

      if (
        action.includes("valid") ||
        action.includes("issue") ||
        action.includes("review")
      ) {
        validation++;
      }

      if (action.includes("correct")) {
        corrections++;
      }

      if (action.includes("verify")) {
        approvals++;
      }
    });

    return {
      total: auditEvents.length,
      ai,
      validation,
      corrections,
      approvals,
    };
  }, [auditEvents]);

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
          Loading audit trail...
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
          Document not found.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={[
            styles.homeButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={styles.homeButtonText}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const confidence = Number(
    documentData.overall_confidence || 0
  );

  return (
    <>
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
              Audit Trail
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 3,
              }}
            >
              Complete history of record activity
            </Text>
          </View>

          <View
            style={[
              styles.secureBadge,
              {
                backgroundColor:
                  theme.successLight,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={theme.success}
            />

            <Text
              style={{
                color: theme.success,
                fontSize: 9,
                fontWeight: "900",
              }}
            >
              AUDITABLE
            </Text>
          </View>
        </View>

        {/* RECORD */}

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
                fontSize: 15,
                fontWeight: "900",
              }}
            >
              {documentData.filename}
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
              {documentData.district_hint ||
                "District unavailable"}
            </Text>
          </View>

          <StatusBadge
            status={
              documentData.status === "verified"
                ? "Verified"
                : documentData.status ===
                    "rejected"
                  ? "Rejected"
                  : "Review"
            }
          />
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryGrid}>
          <SummaryCard
            theme={theme}
            value={String(summary.total).padStart(
              2,
              "0"
            )}
            label="Audit Events"
            icon="list-outline"
          />

          <SummaryCard
            theme={theme}
            value={String(summary.ai).padStart(
              2,
              "0"
            )}
            label="AI / Processing"
            icon="sparkles-outline"
          />

          <SummaryCard
            theme={theme}
            value={String(
              summary.validation
            ).padStart(2, "0")}
            label="Validation"
            icon="alert-circle-outline"
          />

          <SummaryCard
            theme={theme}
            value={String(
              summary.approvals
            ).padStart(2, "0")}
            label="Approvals"
            icon="checkmark-done-outline"
          />
        </View>

        {/* INTEGRITY */}

        <View
          style={[
            styles.integrityCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.integrityIcon,
              {
                backgroundColor:
                  theme.successLight,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={23}
              color={theme.success}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 13,
                fontWeight: "900",
              }}
            >
              Audit History
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 10,
                lineHeight: 15,
                marginTop: 4,
              }}
            >
              {auditEvents.length > 0
                ? `${auditEvents.length} recorded event${
                    auditEvents.length > 1
                      ? "s"
                      : ""
                  } for this document.`
                : "No audit events have been recorded yet."}
            </Text>
          </View>

          <Ionicons
            name={
              auditEvents.length > 0
                ? "checkmark-circle"
                : "information-circle"
            }
            size={21}
            color={
              auditEvents.length > 0
                ? theme.success
                : theme.textSecondary
            }
          />
        </View>

        {/* DOCUMENT CONFIDENCE */}

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Processing Snapshot
        </Text>

        <View
          style={[
            styles.explainCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.explainHeader}>
            <View
              style={[
                styles.aiIcon,
                {
                  backgroundColor:
                    theme.primaryLight,
                },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={21}
                color={theme.ai}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                AI Extraction Confidence
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  marginTop: 3,
                }}
              >
                Actual document processing result
              </Text>
            </View>

            <Text
              style={{
                color:
                  confidence >= 75
                    ? theme.success
                    : theme.warning,
                fontWeight: "900",
              }}
            >
              {confidence.toFixed(1)}%
            </Text>
          </View>

          <ConfidenceBar value={confidence} />

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 9,
              lineHeight: 14,
              marginTop: 6,
            }}
          >
            This value comes from the backend OCR and
            extraction pipeline.
          </Text>
        </View>

        {/* FILTER */}

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Activity Timeline
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((item) => {
            const active = filter === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: active
                      ? theme.primary
                      : theme.surface,
                    borderColor: active
                      ? theme.primary
                      : theme.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active
                      ? "#fff"
                      : theme.textSecondary,
                    fontSize: 10,
                    fontWeight: "800",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TIMELINE */}

        <View
          style={[
            styles.timelineCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="time-outline"
                size={35}
                color={theme.textSecondary}
              />

              <Text
                style={{
                  color: theme.text,
                  fontWeight: "800",
                  marginTop: 9,
                }}
              >
                No matching events
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 10,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Try another audit filter.
              </Text>
            </View>
          ) : (
            filteredEvents.map((event, index) => (
              <AuditEvent
                key={event.id}
                event={event}
                theme={theme}
                last={
                  index ===
                  filteredEvents.length - 1
                }
                onPress={() =>
                  setSelectedEvent(event)
                }
              />
            ))
          )}
        </View>

        {/* CURRENT STATE */}

        <Text
          style={[
            styles.sectionTitle,
            { color: theme.text },
          ]}
        >
          Current Record State
        </Text>

        <View
          style={[
            styles.finalCard,
            {
              backgroundColor:
                documentData.status === "verified"
                  ? theme.successLight
                  : documentData.status ===
                      "rejected"
                    ? theme.dangerLight
                    : theme.warningLight,

              borderColor:
                documentData.status === "verified"
                  ? theme.success
                  : documentData.status ===
                      "rejected"
                    ? theme.danger
                    : theme.warning,
            },
          ]}
        >
          <View
            style={[
              styles.finalIcon,
              {
                backgroundColor:
                  documentData.status ===
                  "verified"
                    ? theme.success
                    : documentData.status ===
                        "rejected"
                      ? theme.danger
                      : theme.warning,
              },
            ]}
          >
            <Ionicons
              name={
                documentData.status ===
                "verified"
                  ? "checkmark-done"
                  : documentData.status ===
                      "rejected"
                    ? "close"
                    : "time-outline"
              }
              size={24}
              color="#fff"
            />
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 19,
              fontWeight: "900",
              marginTop: 12,
            }}
          >
            {documentData.status ===
            "verified"
              ? "Verified Digital Record"
              : documentData.status ===
                  "rejected"
                ? "Rejected Record"
                : "Record Under Review"}
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
              lineHeight: 17,
              marginTop: 5,
            }}
          >
            Current state is based on the actual
            backend document status.
          </Text>

          <View style={styles.finalDetails}>
            <Detail
              theme={theme}
              label="Document ID"
              value={`#${documentData.id}`}
            />

            <Detail
              theme={theme}
              label="Status"
              value={String(
                documentData.status
              ).toUpperCase()}
            />

            <Detail
              theme={theme}
              label="Confidence"
              value={`${confidence.toFixed(1)}%`}
            />
          </View>
        </View>

        {/* NAVIGATION */}

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.replace("/records")}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Ionicons
              name="documents-outline"
              size={17}
              color={theme.primary}
            />

            <Text
              style={{
                color: theme.text,
                fontSize: 11,
                fontWeight: "800",
              }}
            >
              View Records
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/gis")}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name="map-outline"
              size={17}
              color="#fff"
            />

            <Text
              style={{
                color: "#fff",
                fontSize: 11,
                fontWeight: "900",
              }}
            >
              Open GIS
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 9,
            textAlign: "center",
            marginTop: 15,
          }}
        >
          Live backend audit trail
        </Text>
      </ScrollView>

      {/* EVENT MODAL */}

      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSelectedEvent(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modal,
              {
                backgroundColor: theme.surface,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  Event Details
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 10,
                    marginTop: 3,
                  }}
                >
                  Audit event #
                  {selectedEvent?.id}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setSelectedEvent(null)
                }
                style={[
                  styles.closeButton,
                  {
                    backgroundColor:
                      theme.background,
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            {selectedEvent && (
              <>
                <View
                  style={[
                    styles.modalIcon,
                    {
                      backgroundColor:
                        theme.primaryLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      getEventIcon(
                        selectedEvent.action
                      )
                    }
                    size={24}
                    color={theme.primary}
                  />
                </View>

                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: "900",
                    marginTop: 13,
                  }}
                >
                  {formatAction(
                    selectedEvent.action
                  )}
                </Text>

                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11,
                    lineHeight: 18,
                    marginTop: 6,
                  }}
                >
                  {selectedEvent.details ||
                    "No additional details were recorded for this event."}
                </Text>

                <View style={styles.modalMeta}>
                  <Meta
                    theme={theme}
                    icon="person-outline"
                    label="Actor"
                    value={
                      selectedEvent.user_id
                        ? `User #${selectedEvent.user_id}`
                        : "System"
                    }
                  />

                  <Meta
                    theme={theme}
                    icon="time-outline"
                    label="Timestamp"
                    value={formatDate(
                      selectedEvent.timestamp
                    )}
                  />

                  <Meta
                    theme={theme}
                    icon="checkmark-circle-outline"
                    label="Action"
                    value={
                      selectedEvent.action ||
                      "Unknown"
                    }
                  />
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setSelectedEvent(null)
                  }
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor:
                        theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "900",
                      fontSize: 12,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function formatAction(action) {
  if (!action) {
    return "System Activity";
  }

  return String(action)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getEventIcon(action) {
  const value = String(
    action || ""
  ).toLowerCase();

  if (value.includes("verify")) {
    return "checkmark-circle-outline";
  }

  if (value.includes("reject")) {
    return "close-circle-outline";
  }

  if (
    value.includes("process") ||
    value.includes("ocr")
  ) {
    return "scan-outline";
  }

  if (
    value.includes("valid") ||
    value.includes("issue")
  ) {
    return "alert-circle-outline";
  }

  if (value.includes("upload")) {
    return "cloud-upload-outline";
  }

  return "time-outline";
}

function formatDate(timestamp) {
  if (!timestamp) {
    return "Timestamp unavailable";
  }

  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return String(timestamp);
  }
}

function SummaryCard({
  theme,
  value,
  label,
  icon,
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={theme.primary}
      />

      <Text
        style={{
          color: theme.text,
          fontSize: 20,
          fontWeight: "900",
          marginTop: 8,
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 8,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function AuditEvent({
  event,
  theme,
  last,
  onPress,
}) {
  const color = getEventColor(
    event.action,
    theme
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.eventRow}
    >
      <View style={styles.eventTimeline}>
        <View
          style={[
            styles.eventDot,
            {
              backgroundColor: color,
            },
          ]}
        />

        {!last && (
          <View
            style={[
              styles.eventLine,
              {
                backgroundColor:
                  theme.border,
              },
            ]}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.eventTop}>
          <View
            style={[
              styles.eventIcon,
              {
                backgroundColor:
                  theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name={getEventIcon(event.action)}
              size={16}
              color={color}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              {formatAction(event.action)}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 9,
                marginTop: 2,
              }}
            >
              {event.user_id
                ? `User #${event.user_id}`
                : "System"}
            </Text>
          </View>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 8,
            }}
          >
            {formatShortDate(
              event.timestamp
            )}
          </Text>
        </View>

        <Text
          numberOfLines={3}
          style={{
            color: theme.textSecondary,
            fontSize: 10,
            lineHeight: 15,
            marginTop: 7,
            marginBottom: last ? 0 : 18,
          }}
        >
          {event.details ||
            "No additional event details recorded."}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getEventColor(action, theme) {
  const value = String(
    action || ""
  ).toLowerCase();

  if (value.includes("verify")) {
    return theme.success;
  }

  if (
    value.includes("valid") ||
    value.includes("issue") ||
    value.includes("review")
  ) {
    return theme.warning;
  }

  if (
    value.includes("reject")
  ) {
    return theme.danger;
  }

  if (
    value.includes("process") ||
    value.includes("ocr") ||
    value.includes("extract")
  ) {
    return theme.ai;
  }

  return theme.primary;
}

function formatShortDate(timestamp) {
  if (!timestamp) {
    return "";
  }

  try {
    return new Date(timestamp).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "";
  }
}

function Detail({
  theme,
  label,
  value,
}) {
  return (
    <View style={styles.detail}>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 8,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.text,
          fontSize: 10,
          fontWeight: "900",
          marginTop: 3,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Meta({
  theme,
  icon,
  label,
  value,
}) {
  return (
    <View style={styles.meta}>
      <Ionicons
        name={icon}
        size={15}
        color={theme.primary}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 8,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            color: theme.text,
            fontSize: 10,
            fontWeight: "700",
            marginTop: 2,
          }}
        >
          {value}
        </Text>
      </View>
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

  homeButton: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },

  homeButtonText: {
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

  secureBadge: {
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
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
    marginTop: 10,
  },

  summaryCard: {
    width: "48%",
    margin: "1%",
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
  },

  integrityCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  integrityIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
  },

  explainCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
  },

  explainHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  filters: {
    gap: 7,
    paddingBottom: 10,
  },

  filterButton: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  timelineCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 35,
  },

  eventRow: {
    flexDirection: "row",
  },

  eventTimeline: {
    width: 24,
    alignItems: "center",
  },

  eventDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 6,
    zIndex: 2,
  },

  eventLine: {
    width: 1,
    flex: 1,
    marginTop: -1,
  },

  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  eventTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  finalCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },

  finalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  finalDetails: {
    flexDirection: "row",
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#CFE8DA",
  },

  detail: {
    flex: 1,
  },

  actions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  primaryButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
  },

  modal: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 35,
    maxHeight: "85%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  modalMeta: {
    marginTop: 16,
    gap: 11,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  modalButton: {
    marginTop: 18,
    borderRadius: 12,
    padding: 13,
    alignItems: "center",
  },
});