import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://land-record-ai-full-project.onrender.com";

const TOKEN_KEY = "anvexa_auth_token";

async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const token = await getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail || `API Error: ${response.status}`
    );
  }

  return data;
}

export async function apiGet(endpoint) {
  return request(endpoint, {
    method: "GET",
  });
}

export async function apiPost(endpoint, body) {
  return request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function apiDelete(endpoint) {
  return request(endpoint, {
    method: "DELETE",
  });
}

export async function apiUpload(endpoint, file) {
  const token = await getToken();

  const formData = new FormData();

  // Expo Web
  if (typeof window !== "undefined") {
    console.log("Preparing web upload...");

    const fileResponse = await fetch(file.uri);

    if (!fileResponse.ok) {
      throw new Error("Unable to read selected file.");
    }

    const blob = await fileResponse.blob();

    formData.append(
      "file",
      blob,
      file.name || "land-record-file"
    );
  } else {
    // Android / iOS
    formData.append("file", {
      uri: file.uri,
      name: file.name || "land-record-file",
      type:
        file.mimeType ||
        "application/octet-stream",
    });
  }

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    "Sending upload request to:",
    `${API_BASE_URL}${endpoint}`
  );

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  const text = await response.text();

  console.log("Upload HTTP status:", response.status);
  console.log("Upload raw response:", text);

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    let errorMessage = `Upload failed: ${response.status}`;

    if (typeof data === "string") {
      errorMessage = data || errorMessage;
    } else if (data?.detail) {
      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else {
        errorMessage = JSON.stringify(data.detail);
      }
    }

    throw new Error(errorMessage);
  }

  return data;
}

export async function checkBackend() {
  return apiGet("/health");
}

export { API_BASE_URL };