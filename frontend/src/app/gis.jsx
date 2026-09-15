import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import ConfidenceBar from "../components/ConfidenceBar";

export default function GIS() {
  const { theme } = useTheme();
  const [selectedParcel, setSelectedParcel] = useState("A");
  const [mapMode, setMapMode] = useState("satellite");

  const parcels = {
    A: {
      id: "K-458",
      survey: "124/2",
      owner: "Ramesh Chandra",
      area: "2.45 Ha",
      status: "Needs Review",
      confidence: 91,
      risk: "Medium",
      village: "Rampur",
    },
    B: {
      id: "K-459",
      survey: "125/1",
      owner: "Sunita Devi",
      area: "1.82 Ha",
      status: "Verified",
      confidence: 97,
      risk: "Low",
      village: "Rampur",
    },
    C: {
      id: "K-460",
      survey: "126/3",
      owner: "Mohan Singh",
      area: "3.10 Ha",
      status: "Verified",
      confidence: 94,
      risk: "Low",
      village: "Rampur",
    },
  };

  const parcel = parcels[selectedParcel];

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
            GIS Land Intelligence
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Explore parcels, boundaries and land intelligence
          </Text>
        </View>

        <View
          style={[
            styles.aiBadge,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="location-outline"
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
            GIS
          </Text>
        </View>
      </View>

      {/* LOCATION */}
      <View
        style={[
          styles.locationCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.locationIcon,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="navigate-outline"
            size={20}
            color={theme.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
            }}
          >
            Rampur, Dehradun
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 10,
              marginTop: 3,
            }}
          >
            Vikas Nagar Tehsil • Uttarakhand
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.layersButton,
            {
              backgroundColor: theme.primaryLight,
            },
          ]}
        >
          <Ionicons
            name="layers-outline"
            size={18}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <View
        style={[
          styles.mapCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* MAP TOOLBAR */}
        <View style={styles.mapToolbar}>
          <View
            style={[
              styles.mapMode,
              { backgroundColor: theme.surface },
            ]}
          >
            <TouchableOpacity
              onPress={() => setMapMode("map")}
              style={[
                styles.mapModeButton,
                mapMode === "map" && {
                  backgroundColor: theme.primaryLight,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    mapMode === "map"
                      ? theme.primary
                      : theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                MAP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMapMode("satellite")}
              style={[
                styles.mapModeButton,
                mapMode === "satellite" && {
                  backgroundColor: theme.primaryLight,
                },
              ]}
            >
              <Text
                style={{
                  color:
                    mapMode === "satellite"
                      ? theme.primary
                      : theme.textSecondary,
                  fontSize: 10,
                  fontWeight: "800",
                }}
              >
                SATELLITE
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapActions}>
            <MapButton
              icon="add"
              theme={theme}
            />

            <MapButton
              icon="remove"
              theme={theme}
            />

            <MapButton
              icon="locate-outline"
              theme={theme}
            />
          </View>
        </View>

        {/* MAP VISUAL */}
        <View
          style={[
            styles.map,
            {
              backgroundColor:
                mapMode === "satellite"
                  ? "#CBD6C2"
                  : "#E8EDF2",
            },
          ]}
        >
          {/* roads */}
          <View
            style={[
              styles.road,
              styles.roadOne,
            ]}
          />

          <View
            style={[
              styles.road,
              styles.roadTwo,
            ]}
          />

          <View
            style={[
              styles.road,
              styles.roadThree,
            ]}
          />

          {/* water */}
          <View style={styles.water} />

          {/* parcels */}
          <Parcel
            label="A"
            selected={selectedParcel === "A"}
            onPress={() => setSelectedParcel("A")}
            style={styles.parcelA}
            theme={theme}
          />

          <Parcel
            label="B"
            selected={selectedParcel === "B"}
            onPress={() => setSelectedParcel("B")}
            style={styles.parcelB}
            theme={theme}
          />

          <Parcel
            label="C"
            selected={selectedParcel === "C"}
            onPress={() => setSelectedParcel("C")}
            style={styles.parcelC}
            theme={theme}
          />

          <View style={styles.mapLabel}>
            <Ionicons
              name="location"
              size={14}
              color={theme.danger}
            />

            <Text
              style={{
                color: theme.text,
                fontSize: 9,
                fontWeight: "800",
              }}
            >
              RAMPUR
            </Text>
          </View>

          <View style={styles.compass}>
            <Text
              style={{
                color: theme.text,
                fontWeight: "900",
              }}
            >
              N
            </Text>

            <Ionicons
              name="arrow-up"
              size={14}
              color={theme.primary}
            />
          </View>

          <View style={styles.scale}>
            <View
              style={[
                styles.scaleLine,
                { backgroundColor: theme.text },
              ]}
            />

            <Text
              style={{
                color: theme.text,
                fontSize: 8,
              }}
            >
              200 m
            </Text>
          </View>
        </View>

        {/* MAP LEGEND */}
        <View
          style={[
            styles.legend,
            { borderTopColor: theme.border },
          ]}
        >
          <Legend
            color={theme.primary}
            label="Selected Parcel"
            theme={theme}
          />

          <Legend
            color={theme.success}
            label="Verified"
            theme={theme}
          />

          <Legend
            color={theme.warning}
            label="Needs Review"
            theme={theme}
          />
        </View>
      </View>

      {/* SELECTED PARCEL */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Selected Parcel
      </Text>

      <View
        style={[
          styles.parcelCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.parcelHeader}>
          <View
            style={[
              styles.parcelIcon,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Ionicons
              name="grid-outline"
              size={21}
              color={theme.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                fontWeight: "900",
              }}
            >
              {parcel.id}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 10,
                marginTop: 3,
              }}
            >
              Survey {parcel.survey} • {parcel.village}
            </Text>
          </View>

          <View
            style={[
              styles.riskPill,
              {
                backgroundColor:
                  parcel.risk === "Low"
                    ? theme.successLight
                    : theme.warningLight,
              },
            ]}
          >
            <Text
              style={{
                color:
                  parcel.risk === "Low"
                    ? theme.success
                    : theme.warning,
                fontSize: 10,
                fontWeight: "800",
              }}
            >
              {parcel.risk} Risk
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.detailsGrid,
            { borderTopColor: theme.border },
          ]}
        >
          <Detail
            label="OWNER"
            value={parcel.owner}
            theme={theme}
          />

          <Detail
            label="AREA"
            value={parcel.area}
            theme={theme}
          />

          <Detail
            label="STATUS"
            value={parcel.status}
            theme={theme}
          />

          <Detail
            label="CONFIDENCE SCORE"
            value={`${parcel.confidence}%`}
            theme={theme}
          />
        </View>

        <ConfidenceBar value={parcel.confidence} />
      </View>

      {/* PARCEL SWITCHER */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Nearby Parcels
      </Text>

      <View style={styles.parcelSwitcher}>
        {Object.entries(parcels).map(
          ([key, item]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedParcel(key)}
              style={[
                styles.nearbyCard,
                {
                  backgroundColor: theme.surface,
                  borderColor:
                    selectedParcel === key
                      ? theme.primary
                      : theme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.nearbyIcon,
                  {
                    backgroundColor:
                      selectedParcel === key
                        ? theme.primaryLight
                        : theme.background,
                  },
                ]}
              >
                <Ionicons
                  name="grid-outline"
                  size={17}
                  color={
                    selectedParcel === key
                      ? theme.primary
                      : theme.textSecondary
                  }
                />
              </View>

              <Text
                style={{
                  color: theme.text,
                  fontWeight: "800",
                  fontSize: 11,
                  marginTop: 7,
                }}
              >
                {item.id}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 9,
                  marginTop: 2,
                }}
              >
                {item.area}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* INTELLIGENCE */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Parcel Intelligence
      </Text>

      <View
        style={[
          styles.intelligenceCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Insight
          icon="shield-checkmark-outline"
          title="Boundary Match"
          value="98%"
          description="Detected parcel boundary aligns with indexed geometry."
          color={theme.success}
          theme={theme}
        />

        <Insight
          icon="resize-outline"
          title="Area Validation"
          value="92%"
          description="Small difference detected against reference area."
          color={theme.warning}
          theme={theme}
        />

        <Insight
          icon="people-outline"
          title="Ownership Link"
          value="91%"
          description="Current owner linked to historical ownership chain."
          color={theme.primary}
          theme={theme}
        />
      </View>

      {/* SYNC ACTIONS */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text },
        ]}
      >
        Synchronized Investigation
      </Text>

      <View style={styles.actionGrid}>
        <ActionCard
          icon="document-text-outline"
          title="View Document"
          subtitle="Open source record"
          theme={theme}
          onPress={() => router.push("/extraction")}
        />

        <ActionCard
          icon="time-outline"
          title="Ownership History"
          subtitle="Trace mutations"
          theme={theme}
          onPress={() => router.push("/timeline")}
        />

        <ActionCard
          icon="search-outline"
          title="Investigate"
          subtitle="Open conflict analysis"
          theme={theme}
          onPress={() => router.push("/investigation")}
        />

        <ActionCard
          icon="person-check-outline"
          title="Verify Record"
          subtitle="Officer review"
          theme={theme}
          onPress={() => router.push("/verification")}
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push("/verification")}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={19}
          color="#fff"
        />

        <Text style={styles.primaryText}>
          Continue to Human Verification
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 10,
          textAlign: "center",
          marginTop: 13,
        }}
      >
        Prototype GIS visualization • Demo parcel data
      </Text>
    </ScrollView>
  );
}

function Parcel({
  label,
  selected,
  onPress,
  style,
  theme,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.parcelShape,
        style,
        {
          backgroundColor: selected
            ? "rgba(35,71,198,0.28)"
            : "rgba(22,131,75,0.18)",
          borderColor: selected
            ? theme.primary
            : theme.success,
        },
      ]}
    >
      <Text
        style={{
          color: selected
            ? theme.primary
            : theme.success,
          fontSize: 10,
          fontWeight: "900",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function MapButton({ icon, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.mapButton,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={theme.text}
      />
    </TouchableOpacity>
  );
}

function Legend({ color, label, theme }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
        ]}
      />

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: 9,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function Detail({ label, value, theme }) {
  return (
    <View style={styles.detail}>
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
          fontSize: 11,
          fontWeight: "800",
          marginTop: 4,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Insight({
  icon,
  title,
  value,
  description,
  color,
  theme,
}) {
  return (
    <View
      style={[
        styles.insight,
        { borderBottomColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.insightIcon,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={color}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.insightTitle}>
          <Text
            style={{
              color: theme.text,
              fontWeight: "800",
              fontSize: 12,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color,
              fontWeight: "900",
              fontSize: 12,
            }}
          >
            {value}
          </Text>
        </View>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 10,
            lineHeight: 16,
            marginTop: 3,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  theme,
  onPress,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={theme.primary}
        />
      </View>

      <Text
        style={{
          color: theme.text,
          fontSize: 11,
          fontWeight: "800",
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
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
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

  locationCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  layersButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  mapCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 19,
    overflow: "hidden",
  },

  mapToolbar: {
    position: "absolute",
    zIndex: 10,
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  mapMode: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
  },

  mapModeButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 7,
  },

  mapActions: {
    gap: 6,
  },

  mapButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  map: {
    height: 310,
    position: "relative",
    overflow: "hidden",
  },

  road: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.8)",
    height: 7,
  },

  roadOne: {
    width: "120%",
    top: 150,
    left: -20,
    transform: [{ rotate: "-17deg" }],
  },

  roadTwo: {
    width: "110%",
    top: 70,
    left: 20,
    transform: [{ rotate: "28deg" }],
  },

  roadThree: {
    width: "100%",
    top: 230,
    left: -20,
    transform: [{ rotate: "12deg" }],
  },

  water: {
    position: "absolute",
    width: 180,
    height: 65,
    backgroundColor: "rgba(100,160,200,0.35)",
    right: -30,
    top: 95,
    borderRadius: 50,
    transform: [{ rotate: "-15deg" }],
  },

  parcelShape: {
    position: "absolute",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  parcelA: {
    width: 100,
    height: 120,
    left: 45,
    top: 105,
    transform: [{ rotate: "-8deg" }],
  },

  parcelB: {
    width: 85,
    height: 100,
    left: 145,
    top: 76,
    transform: [{ rotate: "13deg" }],
  },

  parcelC: {
    width: 110,
    height: 92,
    right: 28,
    top: 165,
    transform: [{ rotate: "-10deg" }],
  },

  mapLabel: {
    position: "absolute",
    left: 30,
    bottom: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  compass: {
    position: "absolute",
    right: 15,
    bottom: 22,
    alignItems: "center",
  },

  scale: {
    position: "absolute",
    left: 15,
    top: 15,
    alignItems: "center",
  },

  scaleLine: {
    width: 45,
    height: 2,
    marginBottom: 3,
  },

  legend: {
    borderTopWidth: 1,
    padding: 11,
    flexDirection: "row",
    justifyContent: "space-around",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 23,
    marginBottom: 10,
  },

  parcelCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
  },

  parcelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  parcelIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  riskPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  detailsGrid: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  detail: {
    width: "50%",
    marginBottom: 13,
  },

  parcelSwitcher: {
    flexDirection: "row",
    gap: 8,
  },

  nearbyCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },

  nearbyIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  intelligenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
  },

  insight: {
    paddingVertical: 13,
    flexDirection: "row",
    gap: 10,
    borderBottomWidth: 1,
  },

  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  insightTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  actionCard: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    marginTop: 18,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },
});
