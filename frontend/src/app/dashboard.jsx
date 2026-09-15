import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { apiGet } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { token, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const data = await apiGet("/dashboard/stats");

      setStats(data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadDashboard();
    }
  }, [token, loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2347C6" />

        <Text style={styles.loadingTitle}>
          Loading Land Intelligence Center
        </Text>

        <Text style={styles.loadingText}>
          Fetching the latest land-record statistics...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.errorIcon}>
          <Ionicons
            name="cloud-offline-outline"
            size={34}
            color="#D92D20"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.loadingText}>{error}</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadDashboard}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalDocuments = stats?.total_documents ?? 0;
  const processed = stats?.processed ?? 0;
  const pendingReview = stats?.pending_review ?? 0;
  const verified = stats?.verified ?? 0;
  const rejected = stats?.rejected ?? 0;
  const confidence = stats?.average_confidence ?? 0;
  const validationIssues = stats?.total_validation_issues ?? 0;
  const anomalies = stats?.anomaly_count ?? 0;

  const districtWise = stats?.district_wise ?? {};
  const statusWise = stats?.status_wise ?? {};

  return (
    <View style={styles.container}>
      {/* SIDEBAR */}

      <View style={styles.sidebar}>
        <View>
          <View style={styles.brandContainer}>
            <View style={styles.brandIcon}>
              <Ionicons
                name="map-outline"
                size={23}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>
                Anvexa Manthan
              </Text>

              <Text style={styles.brandSubtitle}>
                Land Intelligence Center
              </Text>
            </View>
          </View>

          <View style={styles.navigation}>
            <SidebarItem
              icon="grid-outline"
              label="Dashboard"
              active
              onPress={() => router.replace("/dashboard")}
            />

            <SidebarItem
              icon="cloud-upload-outline"
              label="Uploads"
              onPress={() => router.push("/upload")}
            />

            <SidebarItem
              icon="document-text-outline"
              label="Records"
              onPress={() => router.push("/records")}
            />

            <SidebarItem
              icon="person-outline"
              label="Profile"
              onPress={() => router.push("/profile")}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#667085"
          />

          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}

      <ScrollView
        style={styles.main}
        contentContainerStyle={styles.mainContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2347C6"
          />
        }
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>
              LAND RECORD INTELLIGENCE
            </Text>

            <Text style={styles.pageTitle}>
              Welcome to Anvexa Manthan
            </Text>

            <Text style={styles.pageDescription}>
              Your intelligent workspace for land-record
              digitization, validation and management.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => router.push("/upload")}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.uploadButtonText}>
              Upload Record
            </Text>
          </TouchableOpacity>
        </View>

        {/* KPI CARDS */}

        <View style={styles.statsGrid}>
          <StatCard
            icon="documents-outline"
            title="Total Documents"
            value={totalDocuments.toLocaleString()}
            subtitle="Records in system"
          />

          <StatCard
            icon="checkmark-circle-outline"
            title="Verified Records"
            value={verified.toLocaleString()}
            subtitle={`${confidence}% average confidence`}
          />

          <StatCard
            icon="time-outline"
            title="Pending Review"
            value={pendingReview.toLocaleString()}
            subtitle="Require verification"
          />

          <StatCard
            icon="warning-outline"
            title="Validation Issues"
            value={validationIssues.toLocaleString()}
            subtitle={`${anomalies} anomalies detected`}
          />
        </View>

        {/* QUICK ACTIONS */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Quick Actions
            </Text>

            <Text style={styles.sectionDescription}>
              Common land-record operations
            </Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          <ActionCard
            icon="cloud-upload-outline"
            title="Upload Record"
            description="Process a scanned land document"
            onPress={() => router.push("/upload")}
          />

          <ActionCard
            icon="documents-outline"
            title="View Records"
            description="Browse digitized land records"
            onPress={() => router.push("/records")}
          />

          <ActionCard
            icon="sparkles-outline"
            title="Workflow"
            description="Explore the Anvexa AI pipeline"
            onPress={() => router.push("/demo")}
          />
        </View>

        {/* PROCESSING OVERVIEW */}

        <View style={styles.twoColumn}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>
                  Processing Overview
                </Text>

                <Text style={styles.panelSubtitle}>
                  Current document status
                </Text>
              </View>

              <Ionicons
                name="analytics-outline"
                size={21}
                color="#2347C6"
              />
            </View>

            <StatusRow
              label="Processed"
              value={processed}
              total={totalDocuments}
            />

            <StatusRow
              label="Verified"
              value={verified}
              total={totalDocuments}
            />

            <StatusRow
              label="Pending Review"
              value={pendingReview}
              total={totalDocuments}
            />

            <StatusRow
              label="Rejected"
              value={rejected}
              total={totalDocuments}
            />
          </View>

          {/* DISTRICTS */}

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelTitle}>
                  District Distribution
                </Text>

                <Text style={styles.panelSubtitle}>
                  Documents by district
                </Text>
              </View>

              <Ionicons
                name="location-outline"
                size={21}
                color="#2347C6"
              />
            </View>

            {Object.keys(districtWise).length === 0 ? (
              <Text style={styles.emptyText}>
                No district information available.
              </Text>
            ) : (
              Object.entries(districtWise)
                .slice(0, 6)
                .map(([district, count]) => (
                  <View
                    key={district}
                    style={styles.districtRow}
                  >
                    <Text style={styles.districtName}>
                      {district}
                    </Text>

                    <Text style={styles.districtCount}>
                      {count}
                    </Text>
                  </View>
                ))
            )}
          </View>
        </View>

        {/* STATUS DETAILS */}

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelTitle}>
                System Status
              </Text>

              <Text style={styles.panelSubtitle}>
                Live statistics from the land-record database
              </Text>
            </View>

            <View style={styles.operationalBadge}>
              <View style={styles.operationalDot} />

              <Text style={styles.operationalText}>
                Connected
              </Text>
            </View>
          </View>

          <View style={styles.systemGrid}>
            <SystemMetric
              label="Processed"
              value={statusWise.processed ?? processed}
            />

            <SystemMetric
              label="Needs Review"
              value={
                statusWise.needs_review ?? pendingReview
              }
            />

            <SystemMetric
              label="Verified"
              value={statusWise.verified ?? verified}
            />

            <SystemMetric
              label="Rejected"
              value={statusWise.rejected ?? rejected}
            />
          </View>
        </View>

        <Text style={styles.footer}>
          Anvexa Manthan • Land Intelligence Platform
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SidebarItem({
  icon,
  label,
  active,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.sidebarItem,
        active && styles.sidebarItemActive,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={20}
        color={active ? "#2347C6" : "#667085"}
      />

      <Text
        style={[
          styles.sidebarLabel,
          active && styles.sidebarLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#2347C6"
        />
      </View>

      <Text style={styles.statTitle}>{title}</Text>

      <Text style={styles.statValue}>{value}</Text>

      <Text style={styles.statSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={22}
          color="#2347C6"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#98A2B3"
      />
    </TouchableOpacity>
  );
}

function StatusRow({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.min((value / total) * 100, 100)
      : 0;

  return (
    <View style={styles.statusRow}>
      <View style={styles.statusTop}>
        <Text style={styles.statusLabel}>
          {label}
        </Text>

        <Text style={styles.statusValue}>
          {value}
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

function SystemMetric({
  label,
  value,
}) {
  return (
    <View style={styles.systemMetric}>
      <Text style={styles.systemMetricValue}>
        {value}
      </Text>

      <Text style={styles.systemMetricLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F7F9FC",
  },

  sidebar: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E6EAF0",
    paddingHorizontal: 18,
    paddingVertical: 24,
    justifyContent: "space-between",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    marginBottom: 36,
  },

  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#2347C6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  brandTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },

  brandSubtitle: {
    fontSize: 10,
    color: "#98A2B3",
    marginTop: 3,
  },

  navigation: {
    gap: 7,
  },

  sidebarItem: {
    height: 46,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  sidebarItemActive: {
    backgroundColor: "#EEF3FF",
  },

  sidebarLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: "500",
  },

  sidebarLabelActive: {
    color: "#2347C6",
    fontWeight: "700",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 13,
    height: 44,
  },

  logoutText: {
    color: "#667085",
    fontSize: 14,
  },

  main: {
    flex: 1,
  },

  mainContent: {
    padding: 32,
    maxWidth: 1500,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  eyebrow: {
    color: "#2347C6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#172033",
  },

  pageDescription: {
    marginTop: 7,
    color: "#697386",
    fontSize: 14,
  },

  uploadButton: {
    height: 46,
    paddingHorizontal: 17,
    borderRadius: 10,
    backgroundColor: "#2347C6",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    minWidth: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E7EAF0",
  },

  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  statTitle: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
  },

  statValue: {
    color: "#172033",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 5,
  },

  statSubtitle: {
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 5,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172033",
  },

  sectionDescription: {
    fontSize: 12,
    color: "#98A2B3",
    marginTop: 4,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 30,
  },

  actionCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EAF0",
    borderRadius: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionTitle: {
    color: "#172033",
    fontWeight: "700",
    fontSize: 14,
  },

  actionDescription: {
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 3,
  },

  twoColumn: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 18,
  },

  panel: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    padding: 20,
    marginBottom: 18,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  panelTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "700",
  },

  panelSubtitle: {
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 4,
  },

  statusRow: {
    marginBottom: 17,
  },

  statusTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  statusLabel: {
    color: "#667085",
    fontSize: 12,
  },

  statusValue: {
    color: "#172033",
    fontSize: 12,
    fontWeight: "700",
  },

  progressBackground: {
    height: 7,
    backgroundColor: "#EEF1F5",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2347C6",
    borderRadius: 10,
  },

  districtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },

  districtName: {
    color: "#475467",
    fontSize: 13,
  },

  districtCount: {
    color: "#172033",
    fontWeight: "700",
    fontSize: 13,
  },

  emptyText: {
    color: "#98A2B3",
    fontSize: 13,
  },

  operationalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  operationalDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#12B76A",
  },

  operationalText: {
    color: "#027A48",
    fontSize: 11,
    fontWeight: "700",
  },

  systemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  systemMetric: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 15,
  },

  systemMetricValue: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "700",
  },

  systemMetricLabel: {
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 4,
  },

  footer: {
    textAlign: "center",
    color: "#98A2B3",
    fontSize: 11,
    paddingVertical: 18,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loadingTitle: {
    marginTop: 16,
    color: "#172033",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  loadingText: {
    marginTop: 7,
    color: "#667085",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 400,
  },

  errorIcon: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: "#FEF3F2",
    justifyContent: "center",
    alignItems: "center",
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#2347C6",
    borderRadius: 10,
    paddingHorizontal: 18,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});