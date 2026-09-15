import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// API BASE URL
// ============================================================

// Android Emulator
const API_BASE_URL = "http://10.0.2.2:8000";

// If you are running Expo Web on the SAME computer:
// const API_BASE_URL = "http://127.0.0.1:8000";

// If using a PHYSICAL PHONE on the same Wi-Fi:
// const API_BASE_URL = "http://YOUR_PC_IP:8000";

const TOKEN_KEY = "anvexa_auth_token";


// ============================================================
// GET TOKEN
// ============================================================

const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};


// ============================================================
// GENERIC API REQUEST
// ============================================================

export const apiRequest = async (
  endpoint,
  options = {}
) => {
  try {
    const token = await getToken();

    const headers = {
      ...(options.headers || {}),
    };

    // Don't force JSON Content-Type for FormData uploads
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] =
        headers["Content-Type"] ||
        "application/json";
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `API ${options.method || "GET"}:`,
      `${API_BASE_URL}${endpoint}`
    );

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      let message =
        `Request failed with status ${response.status}`;

      if (typeof data === "string" && data) {
        message = data;
      }

      if (
        data &&
        typeof data === "object" &&
        data.detail
      ) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }

      throw new Error(message);
    }

    return data;

  } catch (error) {

    console.error(
      "API Error:",
      endpoint,
      error
    );

    throw error;
  }
};


// ============================================================
// GET
// ============================================================

export const apiGet = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "GET",
  });
};


// ============================================================
// POST JSON
// ============================================================

export const apiPost = async (
  endpoint,
  body = {}
) => {
  return apiRequest(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};


// ============================================================
// PUT JSON
// ============================================================

export const apiPut = async (
  endpoint,
  body = {}
) => {
  return apiRequest(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};


// ============================================================
// DELETE
// ============================================================

export const apiDelete = async (endpoint) => {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
};


// ============================================================
// UPLOAD DOCUMENT
// ============================================================

export const apiUpload = async (
  endpoint,
  file,
  extraFields = {}
) => {

  try {

    const token = await getToken();

    const formData = new FormData();

    // --------------------------------------------------------
    // File
    // --------------------------------------------------------

    if (typeof window !== "undefined") {

      const response = await fetch(file.uri);

      if (!response.ok) {
        throw new Error(
          "Unable to read selected file."
        );
      }

      const blob = await response.blob();

      formData.append(
        "file",
        blob,
        file.name || "land-record-file"
      );

    } else {

      formData.append(
        "file",
        {
          uri: file.uri,
          name:
            file.name ||
            "land-record-file",
          type:
            file.mimeType ||
            file.type ||
            "application/octet-stream",
        }
      );
    }

    // --------------------------------------------------------
    // Additional form fields
    // --------------------------------------------------------

    Object.entries(extraFields).forEach(
      ([key, value]) => {

        if (
          value !== undefined &&
          value !== null
        ) {
          formData.append(
            key,
            String(value)
          );
        }

      }
    );

    const headers = {};

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {

      let message =
        `Upload failed: ${response.status}`;

      if (
        data &&
        typeof data === "object" &&
        data.detail
      ) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }

      throw new Error(message);
    }

    return data;

  } catch (error) {

    console.error(
      "Upload API Error:",
      error
    );

    throw error;
  }
};


// ============================================================
// DASHBOARD
// ============================================================

export const getDashboardStats = async () => {
  return apiGet("/dashboard/stats");
};


// ============================================================
// HEALTH
// ============================================================

export const getHealth = async () => {
  return apiGet("/health");
};


// ============================================================
// DOCUMENTS
// ============================================================

export const getDocuments = async (
  statusFilter = null,
  search = null
) => {

  const params = new URLSearchParams();

  if (statusFilter) {
    params.append(
      "status_filter",
      statusFilter
    );
  }

  if (search) {
    params.append(
      "search",
      search
    );
  }

  const query =
    params.toString();

  return apiGet(
    `/documents/${query ? `?${query}` : ""}`
  );
};


export const getDocument = async (
  documentId
) => {

  return apiGet(
    `/documents/${documentId}`
  );
};


// ============================================================
// REVIEW QUEUE
// ============================================================

export const getReviewQueue = async () => {

  return apiGet(
    "/documents/queue/review"
  );
};


// ============================================================
// DOCUMENT VALIDATION
// ============================================================

export const validateDocument = async (
  documentId
) => {

  return apiPost(
    `/documents/${documentId}/validate`,
    {}
  );
};


// ============================================================
// VERIFY DOCUMENT
// ============================================================

export const verifyDocument = async ({
  documentId,
  corrections = [],
  approve = true,
  rejectionReason = null,
}) => {

  return apiPost(
    "/documents/verify",
    {
      document_id: Number(documentId),

      corrections: corrections.map(
        (item) => ({
          field_id: Number(
            item.field_id
          ),

          corrected_value:
            item.corrected_value ?? "",
        })
      ),

      approve,

      rejection_reason:
        rejectionReason,
    }
  );
};


// ============================================================
// DELETE DOCUMENT
// ============================================================

export const deleteDocument = async (
  documentId
) => {

  return apiDelete(
    `/documents/${documentId}`
  );
};


// ============================================================
// AUDIT LOG
// ============================================================

export const getDocumentAudit = async (
  documentId
) => {

  return apiGet(
    `/documents/${documentId}/audit`
  );
};


// ============================================================
// RAW DOCUMENT
// ============================================================

export const getRawDocumentUrl = (
  documentId
) => {

  return `${API_BASE_URL}/documents/${documentId}/raw`;
};


// ============================================================
// EXPORT
// ============================================================

export {
  API_BASE_URL,
};