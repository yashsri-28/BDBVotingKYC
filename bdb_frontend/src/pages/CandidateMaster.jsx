import { useState, useEffect, useCallback } from "react";
import {
  fetchCategories, createCategory, deleteCategory,
  fetchAllCandidates, createCandidate, updateCandidate, deleteCandidate,
} from "../api/counting";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

const KIND_OPTIONS = [
  { value: "category", label: "Category Member" },
  { value: "exclusive", label: "Exclusive Member" },
  { value: "women", label: "Women" },
];

export default function CandidateMaster() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ name: "", kind: "category", electionYear: "2026-27", sequence: 1 });
  // const [candidateForm, setCandidateForm] = useState({ serialNo: "", candidateName: "", memberName: "" });
  const [candidateForm, setCandidateForm] = useState({ serialNo: "", candidateName: "", memberName: "", membershipNo: "" });

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) setSelectedCategoryId(data[0].id);
    } catch (err) {
      showToast("danger", "Could not load categories", getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCandidates = useCallback(async (categoryId) => {
    if (!categoryId) return;
    try {
      const data = await fetchAllCandidates(categoryId);
      setCandidates(data);
    } catch (err) {
      showToast("danger", "Could not load candidates", getErrorMessage(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadCandidates(selectedCategoryId); }, [selectedCategoryId, loadCandidates]);

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast("warning", "Name required", "Please enter a category name.");
      return;
    }
    setSaving(true);
    try {
      const created = await createCategory(categoryForm);
      showToast("success", "Category created", `"${created.name}" has been added.`);
      setCategoryForm({ name: "", kind: "category", electionYear: categoryForm.electionYear, sequence: categoryForm.sequence + 1 });
      await loadCategories();
      setSelectedCategoryId(created.id);
    } catch (err) {
      showToast("danger", "Could not create category", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(cat) {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory(cat.id);
      showToast("success", "Category deleted", `"${cat.name}" has been removed.`);
      if (selectedCategoryId === cat.id) setSelectedCategoryId(null);
      await loadCategories();
    } catch (err) {
      showToast("danger", "Could not delete category", getErrorMessage(err, "It may already have ballots counted against it."));
    }
  }

  async function handleCreateCandidate(e) {
    e.preventDefault();
    if (!selectedCategoryId) {
      showToast("warning", "Select a category", "Please choose a category first.");
      return;
    }
    if (!candidateForm.serialNo || !candidateForm.candidateName.trim()) {
      showToast("warning", "Missing details", "Serial number and candidate name are required.");
      return;
    }
    setSaving(true);
    try {
      await createCandidate({
        category: selectedCategoryId,
        serialNo: Number(candidateForm.serialNo),
        candidateName: candidateForm.candidateName.trim(),
        memberName: candidateForm.memberName.trim(),
        membershipNo: candidateForm.membershipNo.trim(),
      });
      showToast("success", "Candidate added", `${candidateForm.candidateName} has been added.`);
      setCandidateForm({ serialNo: "", candidateName: "", memberName: "", membershipNo: "" });
      await loadCandidates(selectedCategoryId);
    } catch (err) {
      showToast("danger", "Could not add candidate", getErrorMessage(err, "That serial number may already be used in this category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(candidate) {
    try {
      await updateCandidate(candidate.id, {
        serialNo: candidate.serial_no,
        candidateName: candidate.candidate_name,
        memberName: candidate.member_name,
        membershipNo: candidate.membership_no,
        isActive: !candidate.is_active,
      });
      await loadCandidates(selectedCategoryId);
    } catch (err) {
      showToast("danger", "Could not update candidate", getErrorMessage(err));
    }
  }

  async function handleDeleteCandidate(candidate) {
    if (!window.confirm(`Remove candidate "${candidate.candidate_name}"?`)) return;
    try {
      await deleteCandidate(candidate.id);
      showToast("success", "Candidate removed", `${candidate.candidate_name} has been removed.`);
      await loadCandidates(selectedCategoryId);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 500 || err?.response?.data?.detail?.includes?.("Protected")) {
        showToast(
          "danger",
          "Cannot delete this candidate",
          `${candidate.candidate_name} already has votes counted against them. Mark them Inactive instead of deleting.`
        );
      } else {
        showToast("danger", "Could not remove candidate", getErrorMessage(err));
      }
    }
  }

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8 text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Election Categories</h2>
        <p className="mb-4 text-xs text-slate-500">Create the categories to be counted, before setting up their candidates.</p>

        <form onSubmit={handleCreateCategory} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
          <input
            type="text" placeholder="Name (e.g. Category 1)"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
          />
          <select
            value={categoryForm.kind}
            onChange={(e) => setCategoryForm((f) => ({ ...f, kind: e.target.value }))}
            className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text" placeholder="Election Year"
            value={categoryForm.electionYear}
            onChange={(e) => setCategoryForm((f) => ({ ...f, electionYear: e.target.value }))}
            className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number" min="1" placeholder="Order"
            value={categoryForm.sequence}
            onChange={(e) => setCategoryForm((f) => ({ ...f, sequence: Number(e.target.value) }))}
            className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* <button
            type="submit" disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:col-span-5"
          >
            {saving ? "Adding…" : "Add Category"}
          </button> */}
          <button
  type="submit" disabled={saving}
  className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:col-span-1"
>
  {saving ? "Adding…" : "Add Category"}
</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
                selectedCategoryId === cat.id ? "border-blue-600 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600"
              }`}
            >
              <button onClick={() => setSelectedCategoryId(cat.id)}>
                {cat.name} <span className="font-normal opacity-70">({cat.candidate_count} candidates)</span>
              </button>
              <button onClick={() => handleDeleteCategory(cat)} className="text-rose-500 hover:text-rose-700">✕</button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-xs text-slate-400">No categories yet — add one above.</p>}
        </div>
      </div>

      {selectedCategory && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-slate-900">Candidates — {selectedCategory.name}</h2>
          <p className="mb-4 text-xs text-slate-500">
            {selectedCategory.votes_per_ballot} vote(s) per ballot for this category. Serial numbers must be unique within it.
          </p>

         <form onSubmit={handleCreateCandidate} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-5">
            <input
              type="number" min="1" placeholder="Serial No."
              value={candidateForm.serialNo}
              onChange={(e) => setCandidateForm((f) => ({ ...f, serialNo: e.target.value }))}
              className="rounded-lg border border-slate-300 p-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text" placeholder="Candidate Name"
              value={candidateForm.candidateName}
              onChange={(e) => setCandidateForm((f) => ({ ...f, candidateName: e.target.value }))}
              className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text" placeholder="Membership No. (e.g. M002)"
              value={candidateForm.membershipNo}
              onChange={(e) => setCandidateForm((f) => ({ ...f, membershipNo: e.target.value }))}
              className="rounded-lg border border-slate-300 p-2.5 font-mono text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text" placeholder="Member / Firm Name (optional)"
              value={candidateForm.memberName}
              onChange={(e) => setCandidateForm((f) => ({ ...f, memberName: e.target.value }))}
              className="rounded-lg border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit" disabled={saving}
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add Candidate"}
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-blue-900 font-semibold text-white">
                  <th className="p-3">Serial</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Membership No.</th>
                  <th className="p-3">Member/Firm</th>
                  <th className="p-3 text-center">Active</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {candidates.length === 0 && (
                  <tr><td colSpan={6} className="p-4 text-center text-slate-400">No candidates yet.</td></tr>
                )}
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold">{c.serial_no}</td>
                    <td className="p-3 font-semibold text-slate-900">{c.candidate_name}</td>
                    <td className="p-3 font-mono text-slate-600">{c.membership_no || "—"}</td>
                    <td className="p-3 text-slate-600">{c.member_name || "—"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}
                      >
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteCandidate(c)} className="text-rose-500 hover:text-rose-700 hover:underline">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}