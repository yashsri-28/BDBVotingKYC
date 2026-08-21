// import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
// import { fetchAllotments } from "../api/ballots";
// import { getErrorMessage } from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";

// export default function MasterReport() {
//   const { user } = useAuth();
//   const { showToast } = useToast();
//   const [rows, setRows] = useState([]);
//   const [rollType, setRollType] = useState("ALL");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const filters = {};
//       if (rollType !== "ALL") filters.roll_type = rollType;
//       if (search.trim()) filters.search = search.trim();
//       const data = await fetchAllotments(filters);
//       setRows(data);
//     } catch (err) {
//       setError(getErrorMessage(err, "The transaction report could not be loaded."));
//     } finally {
//       setLoading(false);
//     }
//   }, [rollType, search]);

//   useEffect(() => {
//     const timer = setTimeout(load, 300); // debounce search typing
//     return () => clearTimeout(timer);
//   }, [load]);

//   function handleExport() {
//     if (rows.length === 0) {
//       showToast("warning", "Nothing to export", "There are no allotment records to export yet.");
//       return;
//     }
//     const exportRows = rows.map((row) => ({
//       "Access Card": row.access_card_number,
//       "Customer Code": row.customer_code,
//       "Entity Name": row.entity_name,
//       "Pool": row.roll_type,
//       "Ballots": row.ballots_allotted,
//       "Membership Status": row.membership_status_at_allotment || "—",
//       "Payment Status": row.fee_status_at_allotment || "—",
//       "Eligibility Source": row.voting_eligibility_source || "—",
//       "Eligibility Remark": row.eligibility_remark_at_allotment || "—",
//       "Allotted By": row.allotted_by_username || "—",
//       "Timestamp": new Date(row.allotted_at).toLocaleString(),
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Master Allotment Report");
//     XLSX.writeFile(workbook, `master_allotment_report_${Date.now()}.xlsx`);
//     showToast("success", "Export generated", "Master Transaction dataset exported to Excel successfully.");
//   }

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
//           <div>
//             <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
//               <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Master Allotment Transaction Report</span>
//             </h2>
//             <p className="mt-0.5 text-xs text-slate-500">Every ballot allotment, mapped to KYC and Voting DB attributes.</p>
//           </div>
//           {(user?.role === "admin" || user?.role === "counting") && (
//             <button onClick={handleExport} className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800">
//               <span>Export Full Transaction Excel</span>
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-4">
//           <div>
//             <label className="mb-1 block font-bold text-slate-700">Pool Type</label>
//             <select value={rollType} onChange={(e) => setRollType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold">
//               <option value="ALL">All Types</option>
//               <option value="category">Category Pool</option>
//               <option value="exclusive">Exclusive Pool</option>
//             </select>
//           </div>
//           <div className="sm:col-span-1">
//             <label className="mb-1 block font-bold text-slate-700">Search</label>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by Customer Code, Entity Name, or Access Card"
//               className="w-full rounded-lg border border-slate-300 bg-white p-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {error && <p className="text-xs text-rose-600">{error}</p>}

//         <div className="overflow-x-auto rounded-xl border border-slate-200">
//           <table className="w-full border-collapse text-left text-xs">
//             <thead>
//               <tr className="bg-blue-900 font-semibold text-white">
//                 <th className="p-3">Access Card</th>
//                 <th className="p-3">Customer Code</th>
//                 <th className="p-3">Entity Name</th>
//                 <th className="p-3">Pool</th>
//                 <th className="p-3">Ballots</th>
//                 <th className="p-3">Membership</th>
//                 <th className="p-3">Payment</th>
//                 <th className="p-3">Eligibility Source</th>
//                 <th className="p-3">Remark</th>
//                 <th className="p-3">Allotted By</th>
//                 <th className="p-3">Timestamp</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200 bg-white">
//               {loading && <tr><td colSpan={11} className="p-6 text-center text-slate-400">Loading…</td></tr>}
//               {!loading && rows.length === 0 && <tr><td colSpan={11} className="p-6 text-center text-slate-400">No allotments recorded yet.</td></tr>}
//               {!loading && rows.map((row) => (
//                 <tr key={row.id} className="transition-colors hover:bg-slate-50">
//                   <td className="p-3 font-mono font-bold text-slate-900">{row.access_card_number}</td>
//                   <td className="p-3 font-mono text-slate-800">{row.customer_code}</td>
//                   <td className="p-3 font-semibold text-slate-800">{row.entity_name}</td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
//                       {row.roll_type}
//                     </span>
//                   </td>
//                   <td className="p-3 font-mono font-bold text-slate-900">{row.ballots_allotted}</td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.membership_status_at_allotment === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
//                       {row.membership_status_at_allotment || "—"}
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.fee_status_at_allotment === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
//                       {row.fee_status_at_allotment || "—"}
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.voting_eligibility_source === "admin_override" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
//                       {row.voting_eligibility_source === "admin_override" ? "On-the-Spot" : "Payment + KYC"}
//                     </span>
//                   </td>
//                   <td className="p-3 max-w-[180px] truncate text-slate-600" title={row.eligibility_remark_at_allotment || ""}>
//                     {row.eligibility_remark_at_allotment || "—"}
//                   </td>
//                   <td className="p-3 text-slate-700">{row.allotted_by_username || "—"}</td>
//                   <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(row.allotted_at).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, useCallback } from "react";
// // import * as XLSX from "xlsx";
// import { exportToPDF } from "../utils/pdfExport";
// import { fetchAllotments } from "../api/ballots";
// import { api } from "../api/client";
// import { getErrorMessage } from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";

// export default function MasterReport() {
//   const { user } = useAuth();
//   const { showToast } = useToast();
//   const [rows, setRows] = useState([]);
//   const [count, setCount] = useState(0);
//   const [page, setPage] = useState(1);
//   const [rollType, setRollType] = useState("ALL");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [exporting, setExporting] = useState(false);
//   const [error, setError] = useState("");

//   const PAGE_SIZE = 25;
//   const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const filters = { page };
//       if (rollType !== "ALL") filters.roll_type = rollType;
//       if (search.trim()) filters.search = search.trim();
//       const result = await fetchAllotments(filters);
//       setRows(result.rows);
//       setCount(result.count);
//     } catch (err) {
//       setError(getErrorMessage(err, "The transaction report could not be loaded."));
//     } finally {
//       setLoading(false);
//     }
//   }, [rollType, search, page]);

//   useEffect(() => {
//     const timer = setTimeout(load, 300); // debounce search typing
//     return () => clearTimeout(timer);
//   }, [load]);

//   // Search/filter changes should always jump back to page 1
//   useEffect(() => { setPage(1); }, [rollType, search]);

//   // async function handleExport() {
//   //   setExporting(true);
//   //   try {
//   //     // Pull every page from the backend (not just what's on screen),
//   //     // so the export is complete even with 5000+ records.
//   //     const filters = {};
//   //     if (rollType !== "ALL") filters.roll_type = rollType;
//   //     if (search.trim()) filters.search = search.trim();

//   //     let allRows = [];
//   //     let nextUrl = null;
//   //     let firstPage = await fetchAllotments({ ...filters, page: 1 });
//   //     allRows = allRows.concat(firstPage.rows);
//   //     nextUrl = firstPage.next;

//   //     while (nextUrl) {
//   //       const { data } = await api.get(nextUrl);
//   //       allRows = allRows.concat(data.results || []);
//   //       nextUrl = data.next;
//   //     }

//   //     if (allRows.length === 0) {
//   //       showToast("warning", "Nothing to export", "There are no allotment records to export yet.");
//   //       return;
//   //     }

//   //     const exportRows = allRows.map((row) => ({
//   //       "Access Card": row.access_card_number,
//   //       "Customer Code": row.customer_code,
//   //       "Entity Name": row.entity_name,
//   //       "Pool": row.roll_type,
//   //       "Ballots": row.ballots_allotted,
//   //       "Membership Status": row.membership_status_at_allotment || "—",
//   //       "Payment Status": row.fee_status_at_allotment || "—",
//   //       "Eligibility Source": row.voting_eligibility_source || "—",
//   //       "Eligibility Remark": row.eligibility_remark_at_allotment || "—",
//   //       "Allotted By": row.allotted_by_username || "—",
//   //       "Timestamp": new Date(row.allotted_at).toLocaleString(),
//   //     }));
//   //     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//   //     const workbook = XLSX.utils.book_new();
//   //     XLSX.utils.book_append_sheet(workbook, worksheet, "Master Allotment Report");
//   //     XLSX.writeFile(workbook, `master_allotment_report_${Date.now()}.xlsx`);
//   //     showToast("success", "Export generated", `Exported ${allRows.length} records to Excel successfully.`);
//   //   } catch (err) {
//   //     showToast("danger", "Export failed", getErrorMessage(err));
//   //   } finally {
//   //     setExporting(false);
//   //   }
//   // }

//   async function handleExport() {
//     setExporting(true);
//     try {
//       const filters = {};
//       if (rollType !== "ALL") filters.roll_type = rollType;
//       if (search.trim()) filters.search = search.trim();

//       let allRows = [];
//       let nextUrl = null;
//       let firstPage = await fetchAllotments({ ...filters, page: 1 });
//       allRows = allRows.concat(firstPage.rows);
//       nextUrl = firstPage.next;

//       while (nextUrl) {
//         const { data } = await api.get(nextUrl);
//         allRows = allRows.concat(data.results || []);
//         nextUrl = data.next;
//       }

//       if (allRows.length === 0) {
//         showToast("warning", "Nothing to export", "There are no allotment records to export yet.");
//         return;
//       }

//       const exportRows = allRows.map((row) => ({
//         "Access Card": row.access_card_number,
//         "Customer Code": row.customer_code,
//         "Entity Name": row.entity_name,
//         "Pool": row.roll_type,
//         "Ballots": row.ballots_allotted,
//         "Membership Status": row.membership_status_at_allotment || "—",
//         "Payment Status": row.fee_status_at_allotment || "—",
//         "Eligibility Source": row.voting_eligibility_source || "—",
//         "Eligibility Remark": row.eligibility_remark_at_allotment || "—",
//         "Allotted By": row.allotted_by_username || "—",
//         "Timestamp": new Date(row.allotted_at).toLocaleString(),
//       }));

//       exportToPDF({
//         title: "Master Allotment Transaction Report",
//         rows: exportRows,
//         filename: `master_allotment_report_${Date.now()}`,
//       });
//       showToast("success", "Export generated", `Exported ${allRows.length} records to PDF successfully.`);
//     } catch (err) {
//       showToast("danger", "Export failed", getErrorMessage(err));
//     } finally {
//       setExporting(false);
//     }
//   }

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
//           <div>
//             <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
//               <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Master Allotment Transaction Report</span>
//             </h2>
//             <p className="mt-0.5 text-xs text-slate-500">
//               Every ballot allotment, mapped to KYC and Voting DB attributes. {count > 0 && `(${count} total)`}
//             </p>
//           </div>
//           {(user?.role === "admin" || user?.role === "counting") && (
//             <button
//               onClick={handleExport}
//               disabled={exporting}
//               className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
//             >
//               {/* <span>{exporting ? "Exporting…" : "Export Full Transaction Excel"}</span> */}
//               <span>{exporting ? "Exporting…" : "Export Full Transaction PDF"}</span>
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-4">
//           <div>
//             <label className="mb-1 block font-bold text-slate-700">Pool Type</label>
//             <select value={rollType} onChange={(e) => setRollType(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold">
//               <option value="ALL">All Types</option>
//               <option value="category">Category Pool</option>
//               <option value="exclusive">Exclusive Pool</option>
//             </select>
//           </div>
//           <div className="sm:col-span-1">
//             <label className="mb-1 block font-bold text-slate-700">Search</label>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by Customer Code, Entity Name, or Access Card"
//               className="w-full rounded-lg border border-slate-300 bg-white p-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {error && <p className="text-xs text-rose-600">{error}</p>}

//         <div className="overflow-x-auto rounded-xl border border-slate-200">
//           <table className="w-full border-collapse text-left text-xs">
//             <thead>
//               <tr className="bg-blue-900 font-semibold text-white">
//                 <th className="p-3">Access Card</th>
//                 <th className="p-3">Customer Code</th>
//                 <th className="p-3">Entity Name</th>
//                 <th className="p-3">Pool</th>
//                 <th className="p-3">Ballots</th>
//                 <th className="p-3">Membership Status</th>
//                 <th className="p-3">Payment</th>
//                 <th className="p-3">Eligibility Source</th>
//                 <th className="p-3">Remark</th>
//                 <th className="p-3">Allotted By</th>
//                 <th className="p-3">Timestamp</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200 bg-white">
//               {loading && <tr><td colSpan={11} className="p-6 text-center text-slate-400">Loading…</td></tr>}
//               {!loading && rows.length === 0 && <tr><td colSpan={11} className="p-6 text-center text-slate-400">No allotments recorded yet.</td></tr>}
//               {!loading && rows.map((row) => (
//                 <tr key={row.id} className="transition-colors hover:bg-slate-50">
//                   <td className="p-3 font-mono font-bold text-slate-900">{row.access_card_number}</td>
//                   <td className="p-3 font-mono text-slate-800">{row.customer_code}</td>
//                   <td className="p-3 font-semibold text-slate-800">{row.entity_name}</td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
//                       {row.roll_type}
//                     </span>
//                   </td>
//                   <td className="p-3 font-mono font-bold text-slate-900">{row.ballots_allotted}</td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.membership_status_at_allotment === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
//                       {row.membership_status_at_allotment || "—"}
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.fee_status_at_allotment === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
//                       {row.fee_status_at_allotment || "—"}
//                     </span>
//                   </td>
//                   <td className="p-3">
//                     <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.voting_eligibility_source === "admin_override" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
//                       {row.voting_eligibility_source === "admin_override" ? "On-the-Spot" : "Payment + KYC"}
//                     </span>
//                   </td>
//                   <td className="p-3 max-w-[180px] truncate text-slate-600" title={row.eligibility_remark_at_allotment || ""}>
//                     {row.eligibility_remark_at_allotment || "—"}
//                   </td>
//                   <td className="p-3 text-slate-700">{row.allotted_by_username || "—"}</td>
//                   <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(row.allotted_at).toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination controls */}
//         {count > 0 && (
//           <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
//             <p className="text-xs font-medium text-slate-500">
//               Showing page {page} of {totalPages} ({count} total records)
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page <= 1 || loading}
//                 className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 ← Previous
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page >= totalPages || loading}
//                 className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
import { exportToPDF } from "../utils/pdfExport";
import { fetchAllotments } from "../api/ballots";
import { api } from "../api/client";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MasterReport() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rollType, setRollType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const PAGE_SIZE = 25;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const filters = { page };
      if (rollType !== "ALL") filters.roll_type = rollType;
      if (search.trim()) filters.search = search.trim();
      const result = await fetchAllotments(filters);
      setRows(result.rows);
      setCount(result.count);
    } catch (err) {
      setError(getErrorMessage(err, "The transaction report could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [rollType, search, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [load]);

  // Search/filter changes should always jump back to page 1
  useEffect(() => { setPage(1); }, [rollType, search]);

  // async function handleExport() {
  //   setExporting(true);
  //   try {
  //     // Pull every page from the backend (not just what's on screen),
  //     // so the export is complete even with 5000+ records.
  //     const filters = {};
  //     if (rollType !== "ALL") filters.roll_type = rollType;
  //     if (search.trim()) filters.search = search.trim();

  //     let allRows = [];
  //     let nextUrl = null;
  //     let firstPage = await fetchAllotments({ ...filters, page: 1 });
  //     allRows = allRows.concat(firstPage.rows);
  //     nextUrl = firstPage.next;

  //     while (nextUrl) {
  //       const { data } = await api.get(nextUrl);
  //       allRows = allRows.concat(data.results || []);
  //       nextUrl = data.next;
  //     }

  //     if (allRows.length === 0) {
  //       showToast("warning", "Nothing to export", "There are no allotment records to export yet.");
  //       return;
  //     }

  //     const exportRows = allRows.map((row) => ({
  //       "Access Card": row.access_card_number,
  //       "Customer Code": row.customer_code,
  //       "Entity Name": row.entity_name,
  //       "Pool": row.roll_type,
  //       "Ballots": row.ballots_allotted,
  //       "Membership Status": row.membership_status_at_allotment || "—",
  //       "Payment Status": row.fee_status_at_allotment || "—",
  //       "Eligibility Source": row.voting_eligibility_source || "—",
  //       "Eligibility Remark": row.eligibility_remark_at_allotment || "—",
  //       "Allotted By": row.allotted_by_username || "—",
  //       "Timestamp": new Date(row.allotted_at).toLocaleString(),
  //     }));
  //     const worksheet = XLSX.utils.json_to_sheet(exportRows);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "Master Allotment Report");
  //     XLSX.writeFile(workbook, `master_allotment_report_${Date.now()}.xlsx`);
  //     showToast("success", "Export generated", `Exported ${allRows.length} records to Excel successfully.`);
  //   } catch (err) {
  //     showToast("danger", "Export failed", getErrorMessage(err));
  //   } finally {
  //     setExporting(false);
  //   }
  // }

  async function handleExport() {
    setExporting(true);
    try {
      const filters = {};
      if (rollType !== "ALL") filters.roll_type = rollType;
      if (search.trim()) filters.search = search.trim();

      let allRows = [];
      let nextUrl = null;
      let firstPage = await fetchAllotments({ ...filters, page: 1 });
      allRows = allRows.concat(firstPage.rows);
      nextUrl = firstPage.next;

      while (nextUrl) {
        const { data } = await api.get(nextUrl);
        allRows = allRows.concat(data.results || []);
        nextUrl = data.next;
      }

      if (allRows.length === 0) {
        showToast("warning", "Nothing to export", "There are no allotment records to export yet.");
        return;
      }

      const exportRows = allRows.map((row) => ({
        "Access Card": row.access_card_number,
        "Customer Code": row.customer_code,
        "Entity Name": row.entity_name,
        "Category Ballots": row.roll_type === "category" ? row.ballots_allotted : "—",
        "Exclusive Ballots": row.roll_type === "exclusive" ? row.ballots_allotted : "—",
        "Membership Status": row.membership_status_at_allotment || "—",
        "Payment Status": row.fee_status_at_allotment || "—",
        "Eligibility Source": row.voting_eligibility_source || "—",
        "Eligibility Remark": row.eligibility_remark_at_allotment || "—",
        "Allotted By": row.allotted_by_username || "—",
        "Timestamp": new Date(row.allotted_at).toLocaleString(),
      }));

      exportToPDF({
        title: "Master Allotment Transaction Report",
        rows: exportRows,
        filename: `master_allotment_report_${Date.now()}`,
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
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Master Allotment Transaction Report</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Every ballot allotment, mapped to KYC and Voting DB attributes. {count > 0 && `(${count} total)`}
            </p>
          </div>
          {(user?.role === "admin" || user?.role === "counting") && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
            >
              {/* <span>{exporting ? "Exporting…" : "Export Full Transaction Excel"}</span> */}
              <span>{exporting ? "Exporting…" : "Export Full Transaction PDF"}</span>
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
          <div className="sm:col-span-1">
            <label className="mb-1 block font-bold text-slate-700">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Customer Code, Entity Name, or Access Card"
              className="w-full rounded-lg border border-slate-300 bg-white p-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-blue-900 font-semibold text-white">
                <th className="p-3">Access Card</th>
                <th className="p-3">Customer Code</th>
                <th className="p-3">Entity Name</th>
                <th className="p-3">Membership No.</th>
                <th className="p-3">Category Ballots</th>
                <th className="p-3">Exclusive Ballots</th>
                <th className="p-3">Membership Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Eligibility Source</th>
                <th className="p-3">Remark</th>
                <th className="p-3">Allotted By</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
                            {loading && <tr><td colSpan={12} className="p-6 text-center text-slate-400">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={12} className="p-6 text-center text-slate-400">No allotments recorded yet.</td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{row.access_card_number}</td>
                  <td className="p-3 font-mono text-slate-800">{row.customer_code}</td>
                  <td className="p-3 font-mono text-slate-600">{row.membership_number || "—"}</td>
                  <td className="p-3 font-semibold text-slate-800">{row.entity_name}</td>
                  <td className="p-3 font-mono font-bold text-purple-800">
                    {row.roll_type === "category" ? row.ballots_allotted : "—"}
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-800">
                    {row.roll_type === "exclusive" ? row.ballots_allotted : "—"}
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.membership_status_at_allotment === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {row.membership_status_at_allotment || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.fee_status_at_allotment === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {row.fee_status_at_allotment || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.voting_eligibility_source === "admin_override" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                      {row.voting_eligibility_source === "admin_override" ? "On-the-Spot" : "Payment + KYC"}
                    </span>
                  </td>
                  <td className="p-3 max-w-[180px] truncate text-slate-600" title={row.eligibility_remark_at_allotment || ""}>
                    {row.eligibility_remark_at_allotment || "—"}
                  </td>
                  <td className="p-3 text-slate-700">{row.allotted_by_username || "—"}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(row.allotted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {count > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs font-medium text-slate-500">
              Showing page {page} of {totalPages} ({count} total records)
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
    </div>
  );
}