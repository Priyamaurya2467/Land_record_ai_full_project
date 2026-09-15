import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "anvexa_auth_token";
const USER_KEY = "anvexa_user";

// =====================================================
// JWT DECODER
// =====================================================

function decodeJwtPayload(token) {
  try {
    if (!token) return null;

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      base64 +
      "=".repeat(
        (4 - (base64.length % 4)) % 4
      );

    if (typeof atob !== "function") {
      return null;
    }

    const decoded = atob(padded);

    return JSON.parse(decoded);
  } catch (error) {
    console.log("JWT decode error:", error);
    return null;
  }
}

// =====================================================
// NORMALIZE USER
// =====================================================

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,

    role: user.role
      ? String(user.role)
          .trim()
          .toLowerCase()
      : null,
  };
}

// =====================================================
// AUTH PROVIDER
// =====================================================

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTORE LOGIN
  // =====================================================

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken =
          await AsyncStorage.getItem(TOKEN_KEY);

        const savedUser =
          await AsyncStorage.getItem(USER_KEY);

        console.log(
          "========== RESTORING SESSION =========="
        );

        console.log(
          "Saved token exists:",
          Boolean(savedToken)
        );

        console.log(
          "Saved user:",
          savedUser
        );

        if (!savedToken) {
          setToken(null);
          setUser(null);
          return;
        }

        setToken(savedToken);

        // ---------------------------------------------
        // IMPORTANT:
        // JWT is the source we prefer for role.
        // ---------------------------------------------

        const jwtUser =
          decodeJwtPayload(savedToken);

        console.log(
          "JWT USER:",
          jwtUser
        );

        let restoredUser = null;

        if (jwtUser) {
          restoredUser = jwtUser;
        } else if (savedUser) {
          try {
            restoredUser =
              JSON.parse(savedUser);
          } catch {
            restoredUser = null;
          }
        }

        restoredUser =
          normalizeUser(restoredUser);

        console.log(
          "RESTORED USER:",
          restoredUser
        );

        console.log(
          "RESTORED ROLE:",
          restoredUser?.role
        );

        setUser(restoredUser);
      } catch (error) {
        console.log(
          "Session restore error:",
          error
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (
  username,
  password
) => {
  const body =
    "username=" +
    encodeURIComponent(username) +
    "&password=" +
    encodeURIComponent(password);

  console.log(
    "LOGIN API:",
    `${API_BASE_URL}/auth/login`
  );

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body,
    }
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = {
      detail: text,
    };
  }

  console.log(
    "LOGIN STATUS:",
    response.status
  );

  console.log(
    "LOGIN RESPONSE:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `Login failed (${response.status})`
    );
  }

  if (!data?.access_token) {
    throw new Error(
      "Login succeeded but no access token was returned."
    );
  }

  const accessToken =
    data.access_token;

  // =================================================
  // SAVE TOKEN FIRST
  // =================================================

  await AsyncStorage.setItem(
    TOKEN_KEY,
    accessToken
  );

  setToken(accessToken);

  // =================================================
  // GET ACTUAL USER FROM BACKEND
  // =================================================

  const meResponse =
    await fetch(
      `${API_BASE_URL}/auth/me`,
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

  const meText =
    await meResponse.text();

  let actualUser;

  try {
    actualUser =
      JSON.parse(meText);
  } catch {
    actualUser = null;
  }

  console.log(
    "AUTH/ME STATUS:",
    meResponse.status
  );

  console.log(
    "AUTH/ME USER:",
    actualUser
  );

  if (!meResponse.ok) {
    // Token is not usable, so remove it.
    await AsyncStorage.removeItem(
      TOKEN_KEY
    );

    setToken(null);

    throw new Error(
      actualUser?.detail ||
        "Unable to retrieve authenticated user."
    );
  }

  // =================================================
  // NORMALIZE ACTUAL DATABASE USER
  // =================================================

  const loggedInUser =
    normalizeUser(actualUser);

  console.log(
    "================================"
  );

  console.log(
    "ACTUAL DATABASE USER:"
  );

  console.log(
    loggedInUser
  );

  console.log(
    "ACTUAL DATABASE ROLE:",
    loggedInUser?.role
  );

  console.log(
    "================================"
  );

  // =================================================
  // SAVE ACTUAL USER
  // =================================================

  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify(
      loggedInUser
    )
  );

  setUser(loggedInUser);

  return {
    ...data,
    user: loggedInUser,
  };
};

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(
        TOKEN_KEY
      );

      await AsyncStorage.removeItem(
        USER_KEY
      );

      setToken(null);
      setUser(null);

      console.log(
        "User logged out successfully."
      );
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );
    }
  };

  // =====================================================
  // ROLE
  // =====================================================

  const role =
    String(user?.role || "")
      .trim()
      .toLowerCase();

  const isAdmin =
    role === "admin";

  const isVerifier =
    role === "verifier";

  const isViewer =
    role === "viewer";

  const canVerify =
    isAdmin || isVerifier;

  const canDelete =
    isAdmin || isVerifier;

  // IMPORTANT:
  // Records.jsx uses this name.

  const canDeleteRecords =
    isAdmin || isVerifier;

  // =====================================================
  // ROLE DEBUG
  // =====================================================

  console.log(
    "AUTH ROLE:",
    role
  );

  console.log(
    "IS ADMIN:",
    isAdmin
  );

  console.log(
    "IS VERIFIER:",
    isVerifier
  );

  console.log(
    "CAN VERIFY:",
    canVerify
  );

  console.log(
    "CAN DELETE:",
    canDeleteRecords
  );

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,

        loading,

        isAuthenticated:
          Boolean(token),

        isAdmin,
        isVerifier,
        isViewer,

        canVerify,

        canDelete,

        // REQUIRED BY Records.jsx
        canDeleteRecords,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  return useContext(
    AuthContext
  );
}