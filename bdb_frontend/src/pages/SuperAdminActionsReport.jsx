import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
// import { fetchAuditLogs } from "../api/audit";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { fetchAuditLogs } from "../api/auth";

const RELEVANT_ACTIONS = ["auth_rep_changed", "voting_eligibility_set"];

export default function SuperAdminActionsReport() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCode, setFilterCode] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      const relevant = data.filter((log) => RELEVANT_ACTIONS.includes(log.action));
      setLogs(relevant);
    } catch (err) {
      showToast("danger", "Could not load report", getErrorMessage(err, "Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = filterCode.trim()
    ? logs.filter((log) => log.entity_customer_code?.toLowerCase().includes(filterCode.trim().toLowerCase()))
    : logs;

  function exportToExcel() {
    const rows = filteredLogs.map((log) => ({
      "Action Type": log.action === "auth_rep_changed" ? "Authorized Rep Change" : "On the Spot Payment / Eligibility",
      "Customer Code": log.entity_customer_code || "",
      "Performed By": log.actor_username || "",
      "Timestamp": new Date(log.timestamp).toLocaleString(),
      "Details": JSON.stringify(log.details),
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SuperAdmin Actions");
    XLSX.writeFile(workbook, `superadmin_actions_${Date.now()}.xlsx`);
  }

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800">SuperAdmin Actions Report</h2>
          <button
            onClick={exportToExcel}
            disabled={filteredLogs.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            Download Excel
          </button>
        </div>
        <input
          type="text"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          placeholder="Filter by Customer Code"
          className="mt-3 w-full max-w-sm rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-5 text-xs text-slate-500">Loading…</p>
        ) : filteredLogs.length === 0 ? (
          <p className="p-5 text-xs text-slate-500">No SuperAdmin actions found.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Customer Code</th>
                <th className="px-4 py-2.5">Performed By</th>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">
                    {log.action === "auth_rep_changed" ? "Auth Rep Change" : "On the Spot Payment"}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">{log.entity_customer_code || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-700">{log.actor_username || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-[10px] text-slate-500">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}