// import { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
// // import { fetchAuditLogs } from "../api/audit";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";
// import { fetchAuditLogs } from "../api/auth";

// const RELEVANT_ACTIONS = ["auth_rep_changed", "voting_eligibility_set"];

// export default function SuperAdminActionsReport() {
//   const { showToast } = useToast();
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterCode, setFilterCode] = useState("");

//   useEffect(() => {
//     loadLogs();
//   }, []);

//   async function loadLogs() {
//     setLoading(true);
//     try {
//       const data = await fetchAuditLogs();
//       const relevant = data.filter((log) => RELEVANT_ACTIONS.includes(log.action));
//       setLogs(relevant);
//     } catch (err) {
//       showToast("danger", "Could not load report", getErrorMessage(err, "Please try again."));
//     } finally {
//       setLoading(false);
//     }
//   }

//   const filteredLogs = filterCode.trim()
//     ? logs.filter((log) => log.entity_customer_code?.toLowerCase().includes(filterCode.trim().toLowerCase()))
//     : logs;

//   function exportToExcel() {
//     const rows = filteredLogs.map((log) => ({
//       "Action Type": log.action === "auth_rep_changed" ? "Authorized Rep Change" : "On the Spot Payment / Eligibility",
//       "Customer Code": log.entity_customer_code || "",
//       "Performed By": log.actor_username || "",
//       "Timestamp": new Date(log.timestamp).toLocaleString(),
//       "Details": JSON.stringify(log.details),
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "SuperAdmin Actions");
//     XLSX.writeFile(workbook, `superadmin_actions_${Date.now()}.xlsx`);
//   }

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <h2 className="text-sm font-bold text-slate-800">SuperAdmin Actions Report</h2>
//           <button
//             onClick={exportToExcel}
//             disabled={filteredLogs.length === 0}
//             className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
//           >
//             Download Excel
//           </button>
//         </div>
//         <input
//           type="text"
//           value={filterCode}
//           onChange={(e) => setFilterCode(e.target.value)}
//           placeholder="Filter by Customer Code"
//           className="mt-3 w-full max-w-sm rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
//         {loading ? (
//           <p className="p-5 text-xs text-slate-500">Loading…</p>
//         ) : filteredLogs.length === 0 ? (
//           <p className="p-5 text-xs text-slate-500">No SuperAdmin actions found.</p>
//         ) : (
//           <table className="w-full text-left text-xs">
//             <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
//               <tr>
//                 <th className="px-4 py-2.5">Action</th>
//                 <th className="px-4 py-2.5">Customer Code</th>
//                 <th className="px-4 py-2.5">Performed By</th>
//                 <th className="px-4 py-2.5">Timestamp</th>
//                 <th className="px-4 py-2.5">Details</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id}>
//                   <td className="px-4 py-2.5 font-semibold text-slate-800">
//                     {log.action === "auth_rep_changed" ? "Auth Rep Change" : "On the Spot Payment"}
//                   </td>
//                   <td className="px-4 py-2.5 font-mono text-slate-700">{log.entity_customer_code || "—"}</td>
//                   <td className="px-4 py-2.5 text-slate-700">{log.actor_username || "—"}</td>
//                   <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">
//                     {new Date(log.timestamp).toLocaleString()}
//                   </td>
//                   <td className="px-4 py-2.5 text-[10px] text-slate-500">
//                     {JSON.stringify(log.details)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
import { exportToPDF } from "../utils/pdfExport";
import { fetchAuditLogs } from "../api/auth";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

const RELEVANT_ACTIONS = ["auth_rep_changed", "voting_eligibility_set"];

export default function SuperAdminActionsReport() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterCode, setFilterCode] = useState("");

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { page, action: RELEVANT_ACTIONS.join(",") };
      if (filterCode.trim()) filters.customer_code = filterCode.trim();
      const result = await fetchAuditLogs(filters);
      setLogs(result.rows);
      setCount(result.count);
    } catch (err) {
      showToast("danger", "Could not load report", getErrorMessage(err, "Please try again."));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterCode]);

  useEffect(() => {
    const timer = setTimeout(loadLogs, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [loadLogs]);

  useEffect(() => { setPage(1); }, [filterCode]);

  // async function exportToExcel() {
  //   setExporting(true);
  //   try {
  //     // Pull every page from the backend (not just the current page),
  //     // filtered server-side by customer_code if set, so a 5000-row
  //     // export doesn't require loading 5000 rows into the browser first.
  //     const filters = {};
  //     if (filterCode.trim()) filters.customer_code = filterCode.trim();

  //     let allRows = [];
  //     let currentPage = 1;
  //     let hasMore = true;
  //     while (hasMore) {
  //       const result = await fetchAuditLogs({ ...filters, action: RELEVANT_ACTIONS.join(","), page: currentPage });
  //       allRows = allRows.concat(result.rows);
  //       hasMore = !!result.next;
  //       currentPage += 1;
  //     }

  //     if (allRows.length === 0) {
  //       showToast("warning", "Nothing to export", "There are no SuperAdmin actions to export yet.");
  //       return;
  //     }

  //     const exportRows = allRows.map((log) => ({
  //       "Action Type": log.action === "auth_rep_changed" ? "Authorized Rep Change" : "On the Spot Payment / Eligibility",
  //       "Customer Code": log.entity_customer_code || "",
  //       "Performed By": log.actor_username || "",
  //       "Timestamp": new Date(log.timestamp).toLocaleString(),
  //       "Details": JSON.stringify(log.details),
  //     }));
  //     const worksheet = XLSX.utils.json_to_sheet(exportRows);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "SuperAdmin Actions");
  //     XLSX.writeFile(workbook, `superadmin_actions_${Date.now()}.xlsx`);
  //     showToast("success", "Export generated", `Exported ${allRows.length} records to Excel successfully.`);
  //   } catch (err) {
  //     showToast("danger", "Export failed", getErrorMessage(err));
  //   } finally {
  //     setExporting(false);
  //   }
  // }

  async function exportToPdf() {
    setExporting(true);
    try {
      const filters = {};
      if (filterCode.trim()) filters.customer_code = filterCode.trim();

      let allRows = [];
      let currentPage = 1;
      let hasMore = true;
      while (hasMore) {
        const result = await fetchAuditLogs({ ...filters, action: RELEVANT_ACTIONS.join(","), page: currentPage });
        allRows = allRows.concat(result.rows);
        hasMore = !!result.next;
        currentPage += 1;
      }

      if (allRows.length === 0) {
        showToast("warning", "Nothing to export", "There are no SuperAdmin actions to export yet.");
        return;
      }

      const exportRows = allRows.map((log) => ({
        "Action Type": log.action === "auth_rep_changed" ? "Authorized Rep Change" : "On the Spot Payment / Eligibility",
        "Customer Code": log.entity_customer_code || "",
        "Performed By": log.actor_username || "",
        "Timestamp": new Date(log.timestamp).toLocaleString(),
        "Details": JSON.stringify(log.details),
      }));

      exportToPDF({
        title: "SuperAdmin Actions Report",
        rows: exportRows,
        filename: `superadmin_actions_${Date.now()}`,
      });
      showToast("success", "Export generated", `Exported ${allRows.length} records to PDF successfully.`);
    } catch (err) {
      showToast("danger", "Export failed", getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800">SuperAdmin Actions Report</h2>
          {/* <button
            onClick={exportToExcel}
            disabled={exporting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Download Excel"}
          </button> */}
          <button
            onClick={exportToPdf}
            disabled={exporting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Download PDF"}
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
        ) : logs.length === 0 ? (
          <p className="p-5 text-xs text-slate-500">No SuperAdmin actions found on this page.</p>
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
              {logs.map((log) => (
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

      {count > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs font-medium text-slate-500">
            Showing page {page} of {totalPages} ({count} total audit entries)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}