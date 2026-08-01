import { api } from "./client";


export async function login(username, password) {
  const { data } = await api.post("/auth/login/", { username, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me/");
  return data;
}

// export async function fetchAuditLogs(filters = {}) {
//   const { data } = await api.get("/audit/logs/", { params: filters });
//   return data.results || data;
// }

export async function fetchAuditLogs(filters = {}) {
  const { data } = await api.get("/audit/logs/", { params: filters });
  if (data.results) {
    return { rows: data.results, count: data.count, next: data.next, previous: data.previous };
  }
  return { rows: Array.isArray(data) ? data : [], count: data.length || 0, next: null, previous: null };
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } catch {
    // Even if the server call fails, we still clear the local session.
  }
}
