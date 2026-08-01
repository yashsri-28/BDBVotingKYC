// import { api } from "./client";

// // --- Access-card search & allotment (Counter Search screen) ---
// export async function searchAccessCard(accessCardNumber) {
//   const { data } = await api.post("/ballots/allotment/search/", { access_card_number: accessCardNumber });
//   return data;
// }

// export async function allotCustomerCodes(accessCardNumber, customerCodes) {
//   const { data } = await api.post("/ballots/allotment/allot/", {
//     access_card_number: accessCardNumber, customer_codes: customerCodes,
//   });
//   return data;
// }

// // --- Pools & allocation (Super Admin) ---
// export async function fetchPools() {
//   const { data } = await api.get("/ballots/pools/");
//   return data.results || data;
// }

// export async function setPoolTotal(rollType, totalBallots) {
//   const { data } = await api.post("/ballots/pools/set-total/", { roll_type: rollType, total_ballots: totalBallots });
//   return data;
// }

// export async function fetchAllocations() {
//   const { data } = await api.get("/ballots/allocations/");
//   return data.results || data;
// }

// export async function assignAllocation(rollType, counterId, assignedCount) {
//   const { data } = await api.post("/ballots/allocations/assign/", {
//     roll_type: rollType, counter: counterId, assigned_count: assignedCount,
//   });
//   return data;
// }

// // --- Reports ---
// export async function fetchDashboard() {
//   const { data } = await api.get("/ballots/dashboard/");
//   return data;
// }

// export async function fetchMySummary() {
//   const { data } = await api.get("/ballots/my-summary/");
//   return data;
// }

// export async function fetchAllotments(filters = {}) {
//   const { data } = await api.get("/ballots/allotments/", { params: filters });
//   return data.results || data;
// }

// // --- Authorized Representative change ---
// export async function changeAuthRep({ customerCode, newRepresentativeName, newAccessCardNumber, newPhoto, attachment }) {
//   const form = new FormData();
//   form.append("customer_code", customerCode);
//   form.append("new_representative_name", newRepresentativeName);
//   if (newAccessCardNumber) form.append("new_access_card_number", newAccessCardNumber);
//   if (newPhoto) form.append("new_photo", newPhoto);
//   if (attachment) form.append("attachment", attachment);
//   const { data } = await api.post("/ballots/auth-rep-change/", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return data;
// }

// export async function fetchAuthRepHistory(customerCode) {
//   const { data } = await api.get("/ballots/auth-rep-change/history/", { params: { customer_code: customerCode } });
//   return data.results || data;
// }


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

// export async function fetchAllotments(filters = {}) {
//   const { data } = await api.get("/ballots/allotments/", { params: filters });
//   return data.results || data;
// }
export async function fetchAllotments(filters = {}) {
  const { data } = await api.get("/ballots/allotments/", { params: filters });
  if (data.results) {
    return { rows: data.results, count: data.count, next: data.next, previous: data.previous };
  }
  return { rows: Array.isArray(data) ? data : [], count: data.length || 0, next: null, previous: null };
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

// --- Voting Eligibility (Super Admin only, ManageEligibility.jsx) ---

// Looks up ONE entity by customer code, membership no., name, or GEM
// card number -- reuses the same manual-search endpoint as KYC lookup
// (project docs §5: GET /kyc/manual-search/?q= now also matches
// access_code). Returns the first matching result, since this screen
// shows one entity's eligibility card at a time.
export async function searchEntityByCustomerCode(query) {
  const { data } = await api.get("/kyc/manual-search/", { params: { q: query } });
  const results = data.results || data;
  return Array.isArray(results) ? results[0] : results;
}

// Sets/overrides voting eligibility for a customer code -- the "On the
// Spot Payment" mechanism (project docs §3.6). Remark is mandatory on
// the backend for both eligible=true and eligible=false.
export async function setVotingEligibility(customerCode, isEligible, remark) {
  const { data } = await api.post("/ballots/voting-eligibility/set/", {
    customer_code: customerCode,
    is_eligible: isEligible,
    remark: remark,
  });
  return data;
}


// --- Add / Subtract ballots (Super Admin, PoolAllotment.jsx) ---

// Adjusts a base pool's total by a signed delta -- positive to add,
// negative to subtract. Backend blocks subtracting below what's
// already assigned to counters (apps/ballots/services.py: adjust_pool_total).
export async function adjustPoolTotal(rollType, delta) {
  const { data } = await api.post("/ballots/pools/adjust/", { roll_type: rollType, delta });
  return data;
}

// Adjusts a specific Counter's allocation by a signed delta -- positive
// to add, negative to subtract. Backend blocks subtracting below what
// that Counter has already distributed to members
// (apps/ballots/services.py: adjust_counter_allocation).
export async function adjustAllocation(rollType, counterId, delta) {
  const { data } = await api.post("/ballots/allocations/adjust/", {
    roll_type: rollType, counter: counterId, delta,
  });
  return data;
}