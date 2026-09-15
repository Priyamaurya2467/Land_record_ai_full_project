import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const API_URL = "http://10.120.119.78:8000";

export default function Registration() {
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });

  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }

    if (!form.username.trim()) {
      setErrorMessage("Please enter a username.");
      return false;
    }

    if (form.password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }

    if (!acceptedTerms) {
      setErrorMessage("Please accept the Terms & Conditions.");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    console.log("CREATE ACCOUNT BUTTON PRESSED");

    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log("Sending registration request to:", API_URL);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          role: form.role,
        }),
      });

      console.log("Response status:", response.status);

      let data = {};

      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch {
        console.log("Response did not contain JSON.");
      }

      if (!response.ok) {
        let message = "Unable to create your account.";

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map((item) => item?.msg || "Invalid data")
            .join("\n");
        }

        throw new Error(message);
      }

      console.log("REGISTRATION SUCCESSFUL");

      // Show success screen instead of Alert
      setSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);

      setErrorMessage(
        error?.message ||
          "Could not connect to the server. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SUCCESS SCREEN ----------------

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.successTitle}>
            Registered Successfully!
          </Text>

          <Text style={styles.successSubtitle}>
            Welcome to Anvexa Manthan,{" "}
            <Text style={styles.successName}>
              {form.full_name.trim()}
            </Text>
            .
          </Text>

          <Text style={styles.successDescription}>
            Your account has been created successfully. You can now
            access the Land Intelligence Center.
          </Text>

          <Pressable
            style={styles.dashboardButton}
            onPress={() => router.replace("/dashboard")}
          >
            <Ionicons
              name="grid-outline"
              size={20}
              color="#FFFFFF"
            />


            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Continue to Login 
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------------- REGISTRATION SCREEN ----------------

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#172554"
            />
          </Pressable>

          <View style={styles.logoCircle}>
            <Ionicons
              name="layers-outline"
              size={26}
              color="#FFFFFF"
            />
          </View>

          <View>
            <Text style={styles.brand}>ANVEXA MANTHAN</Text>
            <Text style={styles.brandSubtitle}>
              Land Intelligence Center
            </Text>
          </View>
        </View>

        {/* Title */}

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create your account</Text>

          <Text style={styles.subtitle}>
            Join Anvexa Manthan and transform land records
            with intelligent digital processing.
          </Text>
        </View>

        {/* Error Message */}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#B91C1C"
            />

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Form Card */}

        <View style={styles.formCard}>
          {/* Full Name */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={form.full_name}
                onChangeText={(value) =>
                  updateForm("full_name", value)
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Username */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="at-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="#94A3B8"
                value={form.username}
                onChangeText={(value) =>
                  updateForm("username", value)
                }
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                value={form.password}
                onChangeText={(value) =>
                  updateForm("password", value)
                }
                secureTextEntry
              />
            </View>
          </View>

          {/* Confirm Password */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#94A3B8"
                value={form.confirmPassword}
                onChangeText={(value) =>
                  updateForm("confirmPassword", value)
                }
                secureTextEntry
              />
            </View>
          </View>

          {/* Role */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Role</Text>

            <View style={styles.roleContainer}>
              {["viewer", "verifier", "admin"].map((role) => {
                const selected = form.role === role;

                return (
                  <Pressable
                    key={role}
                    onPress={() => updateForm("role", role)}
                    style={[
                      styles.roleButton,
                      selected && styles.roleButtonSelected,
                    ]}
                  >
                    <Ionicons
                      name={
                        role === "viewer"
                          ? "eye-outline"
                          : role === "verifier"
                          ? "checkmark-circle-outline"
                          : "shield-outline"
                      }
                      size={19}
                      color={
                        selected ? "#FFFFFF" : "#334155"
                      }
                    />

                    <Text
                      style={[
                        styles.roleText,
                        selected && styles.roleTextSelected,
                      ]}
                    >
                      {role.charAt(0).toUpperCase() +
                        role.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Terms */}

          <Pressable
            style={styles.termsRow}
            onPress={() =>
              setAcceptedTerms(!acceptedTerms)
            }
          >
            <View
              style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxSelected,
              ]}
            >
              {acceptedTerms && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color="#FFFFFF"
                />
              )}
            </View>

            <Text style={styles.termsText}>
              I agree to the Terms & Conditions and Privacy
              Policy of Anvexa Manthan.
            </Text>
          </Pressable>

          {/* Create Account */}

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            style={[
              styles.registerButton,
              loading && styles.registerButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Text style={styles.registerButtonText}>
                  Create Account
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          {/* Login */}

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginButton}>
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Security Note */}

        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#166534"
          />

          <Text style={styles.securityText}>
            Your information is securely stored and protected
            with role-based access control.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  brand: {
    fontSize: 16,
    fontWeight: "800",
    color: "#172554",
    letterSpacing: 1,
  },

  brandSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },

  titleSection: {
    marginBottom: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#64748B",
    maxWidth: 650,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },

  errorText: {
    flex: 1,
    marginLeft: 10,
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  inputGroup: {
    marginBottom: 19,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  inputWrapper: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#0F172A",
    outlineStyle: "none",
  },

  roleContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },

  roleButtonSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },

  roleText: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  roleTextSelected: {
    color: "#FFFFFF",
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
    marginBottom: 22,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },

  checkboxSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  registerButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  registerButtonDisabled: {
    opacity: 0.65,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  loginText: {
    color: "#64748B",
    fontSize: 14,
  },

  loginButton: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
  },

  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },

  securityText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: "#166534",
  },

  // SUCCESS SCREEN

  successContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  successCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 35,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 5,
  },

  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
  },

  successSubtitle: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
  },

  successName: {
    fontWeight: "800",
    color: "#1D4ED8",
  },

  successDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 14,
    marginBottom: 28,
  },

  dashboardButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  loginLink: {
    marginTop: 18,
    padding: 8,
  },

  loginLinkText: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700",
  },
});