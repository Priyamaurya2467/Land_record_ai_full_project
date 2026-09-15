import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../context/ThemeContext";

export default function FeedbackScreen() {
  const { theme } = useTheme();

  const [fields, setFields] = useState([
    {
      id: "owner",
      label: "Land Owner",
      aiValue: "Ramesh Chandra",
      correctedValue: "Ramesh Chandra",
      confidence: 98,
      status: "Approved",
    },
    {
      id: "survey",
      label: "Survey Number",
      aiValue: "124/2",
      correctedValue: "124/2",
      confidence: 96,
      status: "Approved",
    },
    {
      id: "khasra",
      label: "Khasra Number",
      aiValue: "K-458",
      correctedValue: "K-458",
      confidence: 94,
      status: "Approved",
    },
    {
      id: "area",
      label: "Plot Area",
      aiValue: "2.45 Ha",
      correctedValue: "2.41 Ha",
      confidence: 78,
      status: "Corrected",
    },
    {
      id: "ownership",
      label: "Ownership Type",
      aiValue: "Individual",
      correctedValue: "Joint",
      confidence: 73,
      status: "Corrected",
    },
  ]);

  const updateField = (id, value) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id
          ? {
              ...field,
              correctedValue: value,
              status:
                value !== field.aiValue ? "Corrected" : "Approved",
            }
          : field
      )
    );
  };

  const correctedCount = fields.filter(
    (field) => field.status === "Corrected"
  ).length;

  const submitFeedback = () => {
    Alert.alert(
      "Feedback Recorded",
      "Officer corrections have been recorded in the prototype feedback loop. In production, this feedback can be sent to the AI/OCR service for model evaluation and retraining.",
      [
        {
          text: "Continue",
          onPress: () => router.push("/audit"),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: theme.ai }]}>
             LEARNING LOOP
          </Text>

          <Text style={[styles.title, { color: theme.text }]}>
            Correction Feedback
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: theme.textSecondary },
            ]}
          >
            Human corrections improve trust, accuracy and future
            processing.
          </Text>
        </View>

        <View
          style={[
            styles.aiIcon,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={23}
            color={theme.primary}
          />
        </View>
      </View>

      {/* Record Identity */}
      <View
        style={[
          styles.identity,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.identityLabel,
              { color: theme.textSecondary },
            ]}
          >
            RECORD UNDER REVIEW
          </Text>

          <Text
            style={[
              styles.identityId,
              { color: theme.primary },
            ]}
          >
            LR-2026-001284
          </Text>

          <Text
            style={[
              styles.identityOwner,
              { color: theme.text },
            ]}
          >
            Ramesh Chandra · Rampur · Dehradun
          </Text>
        </View>

        <View
          style={[
            styles.correctionBadge,
            { backgroundColor: theme.warningLight },
          ]}
        >
          <Text
            style={[
              styles.correctionBadgeText,
              { color: theme.warning },
            ]}
          >
            {correctedCount} Corrections
          </Text>
        </View>
      </View>

      {/* Learning Loop */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Human-in-the-Loop
        </Text>

        <View
          style={[
            styles.loopCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <LoopStep
            icon="document-text-outline"
            title="Extraction"
            subtitle="Reads the historical record"
            theme={theme}
          />

          <View
            style={[
              styles.connector,
              { backgroundColor: theme.border },
            ]}
          />

          <LoopStep
            icon="person-outline"
            title="Officer Review"
            subtitle="Human confirms or corrects fields"
            theme={theme}
          />

          <View
            style={[
              styles.connector,
              { backgroundColor: theme.border },
            ]}
          />

          <LoopStep
            icon="analytics-outline"
            title="Feedback"
            subtitle="Corrections become evaluation signals"
            theme={theme}
          />

          <View
            style={[
              styles.connector,
              { backgroundColor: theme.border },
            ]}
          />

          <LoopStep
            icon="sparkles-outline"
            title="Improved AI"
            subtitle="Future extraction can become more accurate"
            theme={theme}
          />
        </View>
      </View>

      {/* Field Corrections */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            Field Corrections
          </Text>

          <Text
            style={[
              styles.sectionHint,
              { color: theme.textSecondary },
            ]}
          >
            Review output
          </Text>
        </View>

        <View style={styles.fields}>
          {fields.map((field) => {
            const changed =
              field.correctedValue !== field.aiValue;

            return (
              <View
                key={field.id}
                style={[
                  styles.fieldCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: changed
                      ? theme.warning
                      : theme.border,
                  },
                ]}
              >
                <View style={styles.fieldHeader}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      { color: theme.text },
                    ]}
                  >
                    {field.label}
                  </Text>

                  <View
                    style={[
                      styles.fieldStatus,
                      {
                        backgroundColor: changed
                          ? theme.warningLight
                          : theme.successLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        changed
                          ? "create-outline"
                          : "checkmark-circle-outline"
                      }
                      size={13}
                      color={
                        changed
                          ? theme.warning
                          : theme.success
                      }
                    />

                    <Text
                      style={[
                        styles.fieldStatusText,
                        {
                          color: changed
                            ? theme.warning
                            : theme.success,
                        },
                      ]}
                    >
                      {field.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.comparison}>
                  <View style={styles.valueBlock}>
                    <Text
                      style={[
                        styles.valueLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                     EXTRACTED
                    </Text>

                    <Text
                      style={[
                        styles.aiValue,
                        { color: theme.text },
                      ]}
                    >
                      {field.aiValue}
                    </Text>
                  </View>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={theme.textSecondary}
                  />

                  <View style={styles.valueBlock}>
                    <Text
                      style={[
                        styles.valueLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      VERIFIED VALUE
                    </Text>

                    <TextInput
                      value={field.correctedValue}
                      onChangeText={(value) =>
                        updateField(field.id, value)
                      }
                      style={[
                        styles.input,
                        {
                          color: theme.text,
                          borderColor: changed
                            ? theme.warning
                            : theme.border,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.confidenceRow}>
                  <Text
                    style={[
                      styles.confidenceLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Confidence Score
                  </Text>

                  <Text
                    style={[
                      styles.confidence,
                      {
                        color:
                          field.confidence >= 90
                            ? theme.success
                            : theme.warning,
                      },
                    ]}
                  >
                    {field.confidence}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Feedback Reason */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Correction Reason
        </Text>

        <View
          style={[
            styles.reasonCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.reasonIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={19}
              color={theme.primary}
            />
          </View>

          <Text
            style={[
              styles.reasonText,
              { color: theme.textSecondary },
            ]}
          >
            Officer correction indicates that the historical document
            contains a joint ownership entry and the validated parcel
            area is 2.41 Ha.
          </Text>
        </View>
      </View>

      {/* AI Insight */}
      <View
        style={[
          styles.insight,
          {
            backgroundColor: theme.primaryLight,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.insightIcon,
            { backgroundColor: theme.surface },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={theme.ai}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.insightTitle,
              { color: theme.text },
            ]}
          >
            AI Feedback Insight
          </Text>

          <Text
            style={[
              styles.insightText,
              { color: theme.textSecondary },
            ]}
          >
            Two fields required human correction. This is exactly the
            type of low-confidence information that should be routed
            through human verification instead of being automatically
            accepted.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace("/"); } }}
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={18}
            color={theme.text}
          />

          <Text
            style={[
              styles.secondaryText,
              { color: theme.text },
            ]}
          >
            Back
          </Text>
        </Pressable>

        <Pressable
          onPress={submitFeedback}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.primaryText}>
            Submit Feedback
          </Text>
        </Pressable>
      </View>

      {/* Prototype Notice */}
      <View
        style={[
          styles.notice,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Ionicons
          name="flask-outline"
          size={16}
          color={theme.textSecondary}
        />

        <Text
          style={[
            styles.noticeText,
            { color: theme.textSecondary },
          ]}
        >
          Prototype feedback loop. In production, verified corrections
          can be stored as labelled evaluation data for OCR/AI model
          monitoring and improvement.
        </Text>
      </View>
    </ScrollView>
  );
}

function LoopStep({ icon, title, subtitle, theme }) {
  return (
    <View style={styles.loopStep}>
      <View
        style={[
          styles.loopIcon,
          { backgroundColor: theme.primaryLight },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={theme.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.loopTitle,
            { color: theme.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.loopSubtitle,
            { color: theme.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 330,
  },

  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  identity: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  identityLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  identityId: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 5,
  },

  identityOwner: {
    fontSize: 12,
    marginTop: 4,
  },

  correctionBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 10,
  },

  correctionBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  section: {
    marginTop: 26,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "750",
  },

  sectionHint: {
    fontSize: 11,
  },

  loopCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },

  loopStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  loopIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  loopTitle: {
    fontSize: 13,
    fontWeight: "750",
  },

  loopSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  connector: {
    width: 1,
    height: 18,
    marginLeft: 19,
    marginVertical: 5,
  },

  fields: {
    gap: 11,
  },

  fieldCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
  },

  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "750",
  },

  fieldStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  fieldStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  comparison: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },

  valueBlock: {
    flex: 1,
  },

  valueLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  aiValue: {
    fontSize: 13,
    fontWeight: "650",
  },

  input: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    fontSize: 13,
  },

  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  confidenceLabel: {
    fontSize: 10,
  },

  confidence: {
    fontSize: 11,
    fontWeight: "800",
  },

  reasonCard: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 11,
  },

  reasonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },

  reasonText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },

  insight: {
    marginTop: 20,
    borderRadius: 17,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    gap: 11,
  },

  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  insightTitle: {
    fontSize: 13,
    fontWeight: "750",
  },

  insightText: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  secondaryButton: {
    flex: 0.8,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  primaryButton: {
    flex: 1.4,
    minHeight: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  secondaryText: {
    fontSize: 13,
    fontWeight: "700",
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "750",
  },

  notice: {
    marginTop: 14,
    borderRadius: 13,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 8,
  },

  noticeText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
  },
});
