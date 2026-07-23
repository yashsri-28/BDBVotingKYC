import { useState, useEffect } from "react";
import { fetchAuditLogs } from "../api/verification";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

const ACTION_LABELS = {
  card_lookup: "Card Lookup",
  lock_acquired: "Lock Acquired",
  lock_released: "Lock Released",
  verified_sent_for_vote: "Verified & Sent for Vote",
  marked_not_eligible: "Marked Not Eligible",
  manual_search: "Manual Search",
};

export default function AuditLog() {
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

  useEffect(() => {
    load();
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    load(filter.trim());
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-900">Audit Log</h1>
        <p className="text-sm text-steel-400 mt-1">Every verification action, timestamped and attributed.</p>
      </div>

      <form onSubmit={handleFilter} className="flex gap-3 mb-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by customer code (optional)"
          className="flex-1 rounded-lg border border-steel-200 px-4 py-2.5 text-navy-900 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition"
        />
        <button
          type="submit"
          className="rounded-lg bg-navy-900 text-white font-medium px-5 py-2.5 hover:bg-navy-800 transition-colors"
        >
          Filter
        </button>
      </form>

      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      <div className="rounded-xl border border-steel-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ice-100 text-left text-[11px] uppercase tracking-wide text-steel-400">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Customer Code</th>
              <th className="px-4 py-3 font-medium">Performed By</th>
              <th className="px-4 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-200">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-steel-400">Loading…</td></tr>
            )}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-steel-400">No audit entries found.</td></tr>
            )}
            {!loading && logs.map((log) => (
              <tr key={log.id} className="hover:bg-ice-50">
                <td className="px-4 py-3 text-steel-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-medium text-navy-900">
                  {ACTION_LABELS[log.action] || log.action}
                </td>
                <td className="px-4 py-3 font-mono text-navy-800">{log.entity_customer_code || "—"}</td>
                <td className="px-4 py-3 text-navy-800">{log.actor_username || "—"}</td>
                <td className="px-4 py-3 text-steel-400 max-w-xs truncate">
                  {log.details && Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
