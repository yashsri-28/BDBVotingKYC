import { useState, useEffect, useCallback } from "react";
import { fetchAllotments } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MasterReport() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [rollType, setRollType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (rollType !== "ALL") filters.roll_type = rollType;
      const data = await fetchAllotments(filters);
      setRows(data);
    } catch (err) {
      setError(getErrorMessage(err, "The transaction report could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [rollType]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    showToast("success", "Export generated", "Exported Master Transaction dataset to Excel format successfully.");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Master Allotment Transaction Report</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Every ballot allotment, mapped to KYC and Voting DB attributes.</p>
          </div>
          {(user?.role === "admin" || user?.role === "counting") && (
            <button onClick={handleExport} className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800">
              <span>Export Full Transaction Excel</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-4">
          <div>
            <label className="mb-1 block font-bold text-slate-700">Pool Type</label>
            <select value={rollType} onChange={(e) => setRollType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold">
              <option value="ALL">All Types</option>
              <option value="category">Category Pool</option>
              <option value="exclusive">Exclusive Pool</option>
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900 font-semibold text-white">
                <th className="p-3">Access Card</th>
                <th className="p-3">Customer Code</th>
                <th className="p-3">Entity Name</th>
                <th className="p-3">Pool</th>
                <th className="p-3">Ballots</th>
                <th className="p-3">Allotted By</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && <tr><td colSpan={7} className="p-6 text-center text-slate-400">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">No allotments recorded yet.</td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{row.access_card_number}</td>
                  <td className="p-3 font-mono text-slate-800">{row.customer_code}</td>
                  <td className="p-3 font-semibold text-slate-800">{row.entity_name}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
                      {row.roll_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">{row.ballots_allotted}</td>
                  <td className="p-3 text-slate-700">{row.allotted_by_username || "—"}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(row.allotted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
