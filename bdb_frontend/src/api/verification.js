import { api } from "./client";

export async function lookupByCard(accessCardNumber) {
  const { data } = await api.post("/verification/lookup-by-card/", {
    access_card_number: accessCardNumber,
  });
  return data;
}

export async function acquireLock(customerCode) {
  const { data } = await api.post(`/verification/${customerCode}/lock/`);
  return data;
}

export async function releaseLock(customerCode) {
  const { data } = await api.delete(`/verification/${customerCode}/lock/`);
  return data;
}

export async function submitVerification(customerCode, payload) {
  const { data } = await api.post(`/verification/${customerCode}/verify/`, payload);
  return data;
}

export async function manualSearch(query) {
  const { data } = await api.get("/kyc/manual-search/", { params: { q: query } });
  return data;
}

export async function fetchAuditLogs(customerCode) {
  const { data } = await api.get("/audit/logs/", {
    params: customerCode ? { customer_code: customerCode } : {},
  });
  return data;
}
