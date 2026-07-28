import { api } from "./client";

export async function fetchLogins() {
  const { data } = await api.get("/admin/logins/");
  return data.results || data;
}

export async function createLogin({ username, firstName, lastName, role }) {
  const { data } = await api.post("/admin/logins/", {
    username, first_name: firstName, last_name: lastName, role,
  });
  return data;
}

export async function activateLogin(id) {
  const { data } = await api.post(`/admin/logins/${id}/activate/`);
  return data;
}

export async function deactivateLogin(id) {
  const { data } = await api.post(`/admin/logins/${id}/deactivate/`);
  return data;
}

export async function resetPassword(id) {
  const { data } = await api.post(`/admin/logins/${id}/reset-password/`);
  return data;
}
