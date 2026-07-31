import { api } from "./client";

export async function fetchCategories(electionYear) {
  const { data } = await api.get("/counting/categories/", {
    params: electionYear ? { election_year: electionYear } : {},
  });
  return data.results || data;
}

export async function fetchCandidates(categoryId) {
  const { data } = await api.get("/counting/candidates/", { params: { category: categoryId } });
  return data.results || data;
}

export async function startCounting(categoryId) {
  const { data } = await api.post(`/counting/categories/${categoryId}/start/`);
  return data;
}

export async function completeCounting(categoryId) {
  const { data } = await api.post(`/counting/categories/${categoryId}/complete/`);
  return data;
}

export async function recordBallot(categoryId, ballotNo, candidateSerials) {
  const { data } = await api.post(`/counting/categories/${categoryId}/ballots/`, {
    ballot_no: ballotNo,
    candidate_serials: candidateSerials,
  });
  return data;
}

export async function fetchRecentBallots(categoryId) {
  const { data } = await api.get(`/counting/categories/${categoryId}/ballots/list/`);
  return data;
}

export async function deleteBallot(ballotId, reason) {
  await api.delete(`/counting/ballots/${ballotId}/`, { data: { reason } });
}

export async function fetchLiveTotals(categoryId) {
  const { data } = await api.get(`/counting/categories/${categoryId}/live/`);
  return data;
}

export async function fetchDetailedReport(categoryId) {
  const { data } = await api.get(`/counting/categories/${categoryId}/report/detailed/`);
  return data;
}


// --- Candidate Master management (Super Admin, CandidateMaster.jsx) ---

export async function createCategory({ name, kind, electionYear, sequence }) {
  const { data } = await api.post("/counting/categories/", {
    name, kind, election_year: electionYear, sequence,
  });
  return data;
}

export async function updateCategory(categoryId, { name, kind, sequence }) {
  const { data } = await api.patch(`/counting/categories/${categoryId}/`, {
    name, kind, sequence,
  });
  return data;
}

export async function deleteCategory(categoryId) {
  await api.delete(`/counting/categories/${categoryId}/`);
}

export async function fetchAllCandidates(categoryId) {
  const { data } = await api.get("/counting/candidates/", { params: { category: categoryId } });
  return data.results || data;
}

export async function createCandidate({ category, serialNo, candidateName, memberName, membershipNo }) {
  const { data } = await api.post("/counting/candidates/", {
    category, serial_no: serialNo, candidate_name: candidateName,
    member_name: memberName, membership_no: membershipNo, is_active: true,
  });
  return data;
}

export async function updateCandidate(candidateId, { serialNo, candidateName, memberName, membershipNo, isActive }) {
  const { data } = await api.patch(`/counting/candidates/${candidateId}/`, {
    serial_no: serialNo, candidate_name: candidateName,
    member_name: memberName, membership_no: membershipNo, is_active: isActive,
  });
  return data;
}

export async function deleteCandidate(candidateId) {
  await api.delete(`/counting/candidates/${candidateId}/`);
}