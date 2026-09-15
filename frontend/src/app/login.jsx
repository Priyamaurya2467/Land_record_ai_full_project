import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!username.trim() || !password) {
    Alert.alert("Missing information", "Enter username and password.");
    return;
  }

  try {
    setLoading(true);

    console.log("1. LOGIN START");

    const result = await login(username.trim(), password);

    console.log("2. LOGIN SUCCESS");
    console.log("LOGIN RESPONSE:", result);

    console.log("3. GOING TO DASHBOARD");

    router.replace("/dashboard");

    console.log("4. ROUTER CALLED");
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    Alert.alert(
      "Login failed",
      error.message || "Unable to connect to the server."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Ionicons name="map-outline" size={34} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Land Intelligence Center</Text>
        <Text style={styles.subtitle}>
          Intelligent Land Record Digitization
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.description}>
          Sign in to access Anvexa Manthan
        </Text>

        <Text style={styles.label}>Username</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#9AA3B2"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#9AA3B2"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>Sign In</Text>
              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Anvexa Manthan • Secure Land Intelligence Platform
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: "#2347C6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#172033",
  },

  subtitle: {
    fontSize: 13,
    color: "#697386",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  heading: {
    fontSize: 21,
    fontWeight: "700",
    color: "#172033",
  },

  description: {
    marginTop: 6,
    marginBottom: 24,
    color: "#697386",
    fontSize: 14,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 7,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D8DEE9",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#172033",
    marginBottom: 18,
    backgroundColor: "#FCFDFE",
  },

  button: {
    height: 50,
    backgroundColor: "#2347C6",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: "#98A2B3",
    fontSize: 11,
    marginTop: 24,
  },
});
