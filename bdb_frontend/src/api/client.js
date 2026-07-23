import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// WebSocket URL is derived from the same base — no separate env var needed.
export const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

// Member photographs are served from the same backend, under /media.
export const MEDIA_BASE_URL = `${BASE_URL}/media`;

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshWaiters = [];

function onRefreshed(token) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

// If a request fails with 401, try refreshing the token once, then retry.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshWaiters.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh: refreshToken });
        localStorage.setItem("access_token", data.access);
        isRefreshing = false;
        onRefreshed(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("bdb_user");
  window.location.href = "/login";
}

/**
 * Turns any API error into a single, plain-English message safe to show
 * a Counter Staff member. Never surfaces raw tracebacks or field-name
 * jargon — always a complete sentence they can act on.
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }

  const { status, data } = error.response;

  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const value = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
      if (typeof value === "string") return value;
    }
  }

  switch (status) {
    case 400:
      return "The information provided is not valid. Please check and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "No matching record was found.";
    case 409:
      return "This record is currently being handled elsewhere.";
    case 500:
    case 502:
    case 503:
      return "The server encountered a problem. Please try again in a moment.";
    default:
      return fallback;
  }
}
