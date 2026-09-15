import React from "react";
import { Stack } from "expo-router";

import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
