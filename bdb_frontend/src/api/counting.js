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
