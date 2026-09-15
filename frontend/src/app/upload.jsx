import React, { useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../context/ThemeContext";
import { apiUpload } from "../api/client";

export default function UploadScreen() {
  const { theme } = useTheme();

  const [document, setDocument] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setDocument(result.assets[0]);
      }
    } catch (error) {
      console.log("Document picker error:", error);

      Alert.alert(
        "Error",
        "Unable to select document."
      );
    }
  };

  const removeDocument = () => {
    setDocument(null);
  };

  const startExtraction = async () => {
    if (!document) {
      Alert.alert(
        "Document Required",
        "Please upload a land record first."
      );
      return;
    }

    console.log("🔥 START EXTRACTION CLICKED");
    console.log("Selected document:", document);

    try {
      setUploading(true);

      console.log("Uploading:", document.name);

      const result = await apiUpload(
        "/documents/upload",
        document
      );

      console.log("Upload response:", result);

      setUploading(false);

      const documentId =
        result?.id ||
        result?.document_id ||
        "";

      console.log("Created document ID:", documentId);
      console.log("Backend processing status:", result?.status);

      router.push({
        pathname: "/processing",
        params: {
          fileName: document.name,
          documentId: String(documentId),
        },
      });
    } catch (error) {
      console.log("Upload error:", error);

      setUploading(false);

      Alert.alert(
        "Upload Failed",
        error?.message ||
          "Unable to upload the document."
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
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
              Upload Record
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Add a land record for AI processing
            </Text>
          </View>
        </View>

        {/* UPLOAD CARD */}

        <View
          style={[
            styles.uploadCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.uploadIcon,
              {
                backgroundColor:
                  theme.primaryLight,
              },
            ]}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={38}
              color={theme.primary}
            />
          </View>

          <Text
            style={[
              styles.uploadTitle,
              {
                color: theme.text,
              },
            ]}
          >
            Upload Land Record
          </Text>

          <Text
            style={[
              styles.uploadDescription,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            Upload a scanned document, PDF or
            land record image.
          </Text>

          <TouchableOpacity
            style={[
              styles.uploadButton,
              {
                backgroundColor: theme.primary,
              },
            ]}
            onPress={pickDocument}
            activeOpacity={0.8}
            disabled={uploading}
          >
            <Ionicons
              name="add"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.uploadButtonText}>
              Choose Document
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.supportedText,
              {
                color: theme.textSecondary,
              },
            ]}
          >
            Supported: PDF, JPG, JPEG, PNG
          </Text>
        </View>

        {/* SELECTED DOCUMENT */}

        {document && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Selected Document
            </Text>

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
                  styles.fileIcon,
                  {
                    backgroundColor:
                      theme.primaryLight,
                  },
                ]}
              >
                <Ionicons
                  name={
                    document.mimeType ===
                    "application/pdf"
                      ? "document-text"
                      : "image"
                  }
                  size={24}
                  color={theme.primary}
                />
              </View>

              <View style={styles.fileInfo}>
                <Text
                  style={[
                    styles.fileName,
                    {
                      color: theme.text,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {document.name}
                </Text>

                <Text
                  style={[
                    styles.fileSize,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  {document.size
                    ? `${(
                        document.size / 1024
                      ).toFixed(1)} KB`
                    : "Size unavailable"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={removeDocument}
                style={styles.deleteButton}
                disabled={uploading}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.danger}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* START EXTRACTION */}

        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: theme.primary,
              opacity:
                document && !uploading
                  ? 1
                  : 0.5,
            },
          ]}
          onPress={startExtraction}
          activeOpacity={0.8}
          disabled={!document || uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.continueText}>
                Uploading...
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.continueText}>
                Start Extraction
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#FFFFFF"
              />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
    borderWidth: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  uploadCard: {
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },

  uploadIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  uploadTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  uploadDescription: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    maxWidth: 270,
  },

  uploadButton: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 20,
  },

  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  supportedText: {
    fontSize: 10,
    marginTop: 12,
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },

  documentCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },

  fileIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 13,
    fontWeight: "700",
  },

  fileSize: {
    fontSize: 11,
    marginTop: 4,
  },

  deleteButton: {
    padding: 8,
  },

  continueButton: {
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
