import { useState, useEffect } from "react";
import { fetchAuditLogs } from "../api/verification";
import { getErrorMessage } from "../api/client";

const ACTION_LABELS = {
  card_lookup: "Card Lookup", lock_acquired: "Lock Acquired", lock_released: "Lock Released",
  verified_sent_for_vote: "Verified & Sent for Vote", marked_not_eligible: "Marked Not Eligible",
  manual_search: "Manual Search", allotment_card_search: "Allotment Search",
  ballots_allotted: "Ballots Allotted", auth_rep_changed: "Auth Rep Changed",
  login_created: "Login Created", login_activated: "Login Activated",
  login_deactivated: "Login Deactivated", password_reset: "Password Reset",
};

export default function AuditTrail() {
  const [filter, setFilter] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(customerCode) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAuditLogs(customerCode || undefined);
      setLogs(data.results || data);
    } catch (err) {
      setError(getErrorMessage(err, "The audit log could not be loaded."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="flex items-center space-x-2 text-base font-bold text-slate-900">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Super Admin Audit Trail &amp; Auth Rep Logs</span>
          </h2>
          <p className="text-xs text-slate-500">Immutable record of every action, timestamped.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); load(filter.trim()); }} className="flex gap-3">
          <input
            type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by customer code (optional)"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">Filter</button>
        </form>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-blue-900 font-semibold text-white">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Customer Code</th>
                <th className="p-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Loading…</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">No audit entries found.</td></tr>}
              {!loading && logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-slate-50">
                  <td className="whitespace-nowrap p-3 font-mono text-[11px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-800">{log.actor_username || "—"}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${log.action === "auth_rep_changed" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">{log.entity_customer_code || "—"}</td>
                  <td className="max-w-xs truncate p-3 font-mono text-slate-700">
                    {log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
