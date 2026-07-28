import { useState, useEffect, useCallback } from "react";
import { fetchPools, setPoolTotal, fetchAllocations, assignAllocation } from "../api/ballots";
import { fetchLogins } from "../api/users";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function PoolAllotment() {
  const { showToast } = useToast();
  const [pools, setPools] = useState([]);
  const [counters, setCounters] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
  const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
      setPools(p);
      setCounters(c.filter((u) => u.role === "supervisor"));
      setAllocations(a);
      const byType = Object.fromEntries(p.map((x) => [x.roll_type, x.total_ballots]));
      setPoolForm({ category: byType.category ?? "", exclusive: byType.exclusive ?? "" });
    } catch (err) {
      setError(getErrorMessage(err, "Pool data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSetTotals(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (poolForm.category !== "") await setPoolTotal("category", Number(poolForm.category));
      if (poolForm.exclusive !== "") await setPoolTotal("exclusive", Number(poolForm.exclusive));
      showToast("success", "Base pools updated", "Category and Exclusive pool totals saved.");
      load();
    } catch (err) {
      showToast("danger", "Could not update pools", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!assignForm.counter) { showToast("warning", "Select a counter", "Please choose which Counter to assign ballots to."); return; }
    setSaving(true);
    try {
      if (assignForm.category !== "") await assignAllocation("category", Number(assignForm.counter), Number(assignForm.category));
      if (assignForm.exclusive !== "") await assignAllocation("exclusive", Number(assignForm.counter), Number(assignForm.exclusive));
      showToast("success", "Allocation saved", "Ballots have been assigned to the selected Counter.");
      setAssignForm({ counter: "", category: "", exclusive: "" });
      load();
    } catch (err) {
      showToast("danger", "Could not assign ballots", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Base Ballot Pools</h2>
        <p className="mb-4 text-xs text-slate-500">Set the total number of ballots available for this election, per pool type.</p>
        {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
        <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool Total</label>
            <input type="number" min="0" value={poolForm.category}
              onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool Total</label>
            <input type="number" min="0" value={poolForm.exclusive}
              onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
              {saving ? "Saving…" : "Save Pool Totals"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold text-slate-900">Assign to Counter</h2>
        <p className="mb-4 text-xs text-slate-500">Allot a portion of each base pool to a specific Counter login.</p>
        <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
            <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a Counter…</option>
              {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
            <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
            <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Assigning…" : "Assign Ballots"}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-900 font-semibold text-white">
              <th className="p-3">Counter</th>
              <th className="p-3">Pool</th>
              <th className="p-3 text-center">Assigned</th>
              <th className="p-3 text-center">Used</th>
              <th className="p-3 text-center">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
            {allocations.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">{a.counter_name}</td>
                <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
                <td className="p-3 text-center font-mono">{a.assigned_count}</td>
                <td className="p-3 text-center font-mono text-emerald-700">{a.used_count}</td>
                <td className="p-3 text-center font-mono text-amber-700">{a.remaining_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
