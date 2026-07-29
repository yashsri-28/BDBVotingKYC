import { api } from "./client";


export async function login(username, password) {
  const { data } = await api.post("/auth/login/", { username, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me/");
  return data;
}

export async function fetchAuditLogs(filters = {}) {
  const { data } = await api.get("/audit/logs/", { params: filters });
  return data.results || data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } catch {
    // Even if the server call fails, we still clear the local session.
  }
}
