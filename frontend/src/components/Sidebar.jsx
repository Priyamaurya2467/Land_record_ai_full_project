import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const MENU = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    activeIcon: "grid",
    route: "/",
  },
  {
    label: "Upload",
    icon: "cloud-upload-outline",
    activeIcon: "cloud-upload",
    route: "/upload",
  },
  {
    label: "Records",
    icon: "document-text-outline",
    activeIcon: "document-text",
    route: "/records",
  },
  {
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
    route: "/profile",
  },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const pathname = usePathname();

  const navigate = (route) => {
    router.push(route);
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.surface,
          borderRightColor: theme.border,
        },
      ]}
    >
      {/* BRAND */}
      <View style={styles.brandContainer}>
        <View
          style={[
            styles.logo,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Ionicons
            name="scan-outline"
            size={24}
            color={theme.primary}
          />
        </View>

        <View>
          <Text style={[styles.brand, { color: theme.text }]}>
            ANVEXA
          </Text>

          <Text
            style={[
              styles.brandSub,
              { color: theme.textSecondary },
            ]}
          >
            MANTHAN
          </Text>
        </View>
      </View>

      {/* NAVIGATION */}
      <View style={styles.navigation}>
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.textSecondary },
          ]}
        >
          MAIN
        </Text>

        {MENU.map((item) => {
          const active =
            item.route === "/"
              ? pathname === "/"
              : pathname.startsWith(item.route);

          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigate(item.route)}
              style={[
                styles.navItem,
                active && {
                  backgroundColor: theme.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={20}
                color={
                  active
                    ? theme.primary
                    : theme.textSecondary
                }
              />

              <Text
                style={[
                  styles.navText,
                  {
                    color: active
                      ? theme.primary
                      : theme.textSecondary,
                  },
                  active && styles.activeText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* BOTTOM */}
      <View style={styles.bottom}>
        <TouchableOpacity
          onPress={logout}
          style={styles.navItem}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.textSecondary}
          />

          <Text
            style={[
              styles.navText,
              { color: theme.textSecondary },
            ]}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    minHeight: "100%",
    borderRightWidth: 1,
    padding: 18,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 35,
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  brand: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  brandSub: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 2,
  },

  navigation: {
    flex: 1,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 10,
  },

  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 5,
  },

  navText: {
    fontSize: 14,
    fontWeight: "600",
  },

  activeText: {
    fontWeight: "800",
  },

  bottom: {
    borderTopWidth: 1,
    borderTopColor: "#E4E8F0",
    paddingTop: 12,
  },
});