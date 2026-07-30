import { api } from "./client";

// --- Access-card search & allotment (Counter Search screen) ---
export async function searchAccessCard(accessCardNumber) {
  const { data } = await api.post("/ballots/allotment/search/", { access_card_number: accessCardNumber });
  return data;
}

export async function allotCustomerCodes(accessCardNumber, customerCodes) {
  const { data } = await api.post("/ballots/allotment/allot/", {
    access_card_number: accessCardNumber, customer_codes: customerCodes,
  });
  return data;
}

// --- Pools & allocation (Super Admin) ---
export async function fetchPools() {
  const { data } = await api.get("/ballots/pools/");
  return data.results || data;
}

export async function setPoolTotal(rollType, totalBallots) {
  const { data } = await api.post("/ballots/pools/set-total/", { roll_type: rollType, total_ballots: totalBallots });
  return data;
}

export async function fetchAllocations() {
  const { data } = await api.get("/ballots/allocations/");
  return data.results || data;
}

export async function assignAllocation(rollType, counterId, assignedCount) {
  const { data } = await api.post("/ballots/allocations/assign/", {
    roll_type: rollType, counter: counterId, assigned_count: assignedCount,
  });
  return data;
}

// --- Reports ---
export async function fetchDashboard() {
  const { data } = await api.get("/ballots/dashboard/");
  return data;
}

export async function fetchMySummary() {
  const { data } = await api.get("/ballots/my-summary/");
  return data;
}

export async function fetchAllotments(filters = {}) {
  const { data } = await api.get("/ballots/allotments/", { params: filters });
  return data.results || data;
}

// --- Authorized Representative change ---
export async function changeAuthRep({ customerCode, newRepresentativeName, newAccessCardNumber, newPhoto, attachment }) {
  const form = new FormData();
  form.append("customer_code", customerCode);
  form.append("new_representative_name", newRepresentativeName);
  if (newAccessCardNumber) form.append("new_access_card_number", newAccessCardNumber);
  if (newPhoto) form.append("new_photo", newPhoto);
  if (attachment) form.append("attachment", attachment);
  const { data } = await api.post("/ballots/auth-rep-change/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function fetchAuthRepHistory(customerCode) {
  const { data } = await api.get("/ballots/auth-rep-change/history/", { params: { customer_code: customerCode } });
  return data.results || data;
}
