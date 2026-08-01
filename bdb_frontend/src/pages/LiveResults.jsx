// import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
// import { fetchCategories, fetchLiveTotals } from "../api/counting";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";
// import Alert from "../components/Alert";

// const REFRESH_MS = 5000;

// export default function LiveResults() {
//   const { showToast } = useToast();
//   const [categories, setCategories] = useState([]);
//   const [selectedId, setSelectedId] = useState(null);
//   const [totals, setTotals] = useState(null);
//   const [error, setError] = useState("");
//   const [lastUpdated, setLastUpdated] = useState(null);

//   useEffect(() => {
//     fetchCategories()
//       .then((data) => {
//         setCategories(data);
//         const current = data.find((c) => c.status === "in_progress") || data[0];
//         if (current) setSelectedId(current.id);
//       })
//       .catch((err) => setError(getErrorMessage(err, "The election categories could not be loaded.")));
//   }, []);

//   const refresh = useCallback(async (categoryId) => {
//     try {
//       const data = await fetchLiveTotals(categoryId);
//       setTotals(data);
//       setLastUpdated(new Date());
//       setError("");
//     } catch (err) {
//       setError(getErrorMessage(err, "The live results could not be refreshed."));
//     }
//   }, []);

//   useEffect(() => {
//     if (!selectedId) return;
//     refresh(selectedId);
//     const timer = setInterval(() => refresh(selectedId), REFRESH_MS);
//     return () => clearInterval(timer);
//   }, [selectedId, refresh]);

//   const selected = categories.find((c) => c.id === selectedId);

//   function handleExport() {
//     if (!totals || totals.by_serial.length === 0) {
//       showToast("warning", "Nothing to export", "There are no results to export yet.");
//       return;
//     }
//     const exportRows = totals.by_leading.map((r, i) => ({
//       "Rank": i + 1,
//       "Sr. No.": r.serial_no,
//       "Candidate": r.candidate_name,
//       "Member/Firm": r.member_name || "",
//       "Votes": r.votes,
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, totals.category.substring(0, 30));
//     XLSX.writeFile(workbook, `live_results_${totals.category.replace(/\s+/g, "_")}_${Date.now()}.xlsx`);
//     showToast("success", "Export generated", "Live results exported to Excel successfully.");
//   }

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
//           <div className="flex flex-1 flex-col items-center sm:flex-row sm:items-center sm:gap-4">
//             <img src="/images/bdb-logo.png" alt="Bharat Diamond Bourse" className="h-14 w-auto" />
//             <div>
//               <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">Election of Managing Committee</h1>
//               {totals && (
//                 <p className="mt-1 text-sm font-semibold text-slate-500">{totals.category} · {totals.election_year}</p>
//               )}
//             </div>
//           </div>
//           <button
//             onClick={handleExport}
//             className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800"
//           >
//             <span>Export Results Excel</span>
//           </button>
//         </div>
//       </div>

//       {error && <Alert type="error">{error}</Alert>}

//       {/* Category chips */}
//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-white">Election Categories</h3>
//         </div>
//         <div className="flex flex-wrap justify-center gap-2 p-5">
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => setSelectedId(cat.id)}
//               className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
//                 selectedId === cat.id
//                   ? "border-blue-600 bg-blue-600 text-white shadow-sm"
//                   : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {totals && (
//         <>
//           <div className="grid gap-6 md:grid-cols-2">
//             <ResultsTable
//               title="Candidates — Sr. No. Wise"
//               rows={totals.by_serial}
//               totalVotes={totals.total_votes}
//               totalBallots={totals.total_ballots}
//             />
//             <ResultsTable
//               title="Candidates — Leading Vote Wise"
//               rows={totals.by_leading}
//               totalVotes={totals.total_votes}
//               highlightTop
//             />
//           </div>

//           <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-500 shadow-sm" aria-live="polite">
//             {selected?.status === "in_progress" && (
//               <span className="flex items-center gap-1.5 text-blue-700">
//                 <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
//                 Counting in progress
//               </span>
//             )}
//             <span>· Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}</span>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// function ResultsTable({ title, rows, totalVotes, totalBallots, highlightTop = false }) {
//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
//         <h3 className="text-center text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
//       </div>
//       <table className="w-full border-collapse text-left text-xs">
//         <thead>
//           <tr className="bg-slate-100 font-bold text-slate-700">
//             <th className="p-3">Sr. No.</th>
//             <th className="p-3">Candidate</th>
//             <th className="p-3 text-right">Votes</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-200">
//           {rows.map((r, i) => (
//             <tr
//               key={r.serial_no}
//               className={highlightTop && i < 2 ? "bg-emerald-50" : "hover:bg-slate-50"}
//             >
//               <td className="p-3 font-mono text-slate-500">{r.serial_no}</td>
//               <td className="p-3 font-bold text-slate-900">{r.candidate_name}</td>
//               <td className={`p-3 text-right font-mono text-base font-black ${highlightTop && i < 2 ? "text-emerald-700" : "text-slate-800"}`}>
//                 {r.votes}
//               </td>
//             </tr>
//           ))}
//           {rows.length === 0 && (
//             <tr><td colSpan={3} className="p-4 text-center text-slate-400">No candidates in this category.</td></tr>
//           )}
//         </tbody>
//         <tfoot>
//           <tr className="border-t-2 border-slate-900 bg-blue-50/60">
//             <td colSpan={2} className="p-3 text-xs font-bold text-blue-800">Total Votes</td>
//             <td className="p-3 text-right font-mono text-base font-black text-blue-800">{totalVotes}</td>
//           </tr>
//           {totalBallots !== undefined && (
//             <tr className="bg-purple-50/60">
//               <td colSpan={2} className="p-3 text-xs font-bold text-purple-800">Total Ballots</td>
//               <td className="p-3 text-right font-mono text-base font-black text-purple-800">{totalBallots}</td>
//             </tr>
//           )}
//         </tfoot>
//       </table>
//     </div>
//   );
// }






import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { fetchCategories, fetchLiveTotals } from "../api/counting";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Alert from "../components/Alert";

const REFRESH_MS = 5000;

function formatDateTime(date) {
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function LiveResults() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        const current = data.find((c) => c.status === "in_progress") || data[0];
        if (current) setSelectedId(current.id);
      })
      .catch((err) => setError(getErrorMessage(err, "The election categories could not be loaded.")))
      .finally(() => setCatLoading(false));
  }, []);

  const refresh = useCallback(async (categoryId) => {
    try {
      const data = await fetchLiveTotals(categoryId);
      setTotals(data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "The live results could not be refreshed."));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    refresh(selectedId);
    const timer = setInterval(() => refresh(selectedId), REFRESH_MS);
    return () => clearInterval(timer);
  }, [selectedId, refresh]);

  const selected = categories.find((c) => c.id === selectedId);
  const notStarted = selected && selected.status !== "in_progress" && selected.status !== "completed";

  function handleExport() {
    if (!totals || totals.by_serial.length === 0) {
      showToast("warning", "Nothing to export", "There are no results to export yet.");
      return;
    }
    const exportRows = totals.by_leading.map((r, i) => ({
      "Rank": i + 1,
      "Sr. No.": r.serial_no,
      "Candidate": r.candidate_name,
      "Member/Firm": r.member_name || "",
      "Votes": r.votes,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, totals.category.substring(0, 30));
    XLSX.writeFile(workbook, `live_results_${totals.category.replace(/\s+/g, "_")}_${Date.now()}.xlsx`);
    showToast("success", "Export generated", "Live results exported to Excel successfully.");
  }

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex flex-1 flex-col items-center sm:flex-row sm:items-center sm:gap-4">
            <img src="/images/bdb-logo.png" alt="Bharat Diamond Bourse" className="h-14 w-auto" />
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">Election of Managing Committee</h1>
              {totals && (
                <p className="mt-1 text-sm font-semibold text-slate-500">{totals.category} · {totals.election_year}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={notStarted || categories.length === 0}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Export Results Excel</span>
          </button>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {/* Category chips */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Election Categories</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-2 p-5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                selectedId === cat.id
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {!catLoading && categories.length === 0 && (
            <p className="text-xs text-slate-400">No election categories have been set up yet.</p>
          )}
        </div>
      </div>

      {/* No categories exist at all */}
      {!catLoading && categories.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-bold text-slate-600">No election categories have been set up yet.</p>
          <p className="text-xs text-slate-500">A Super Admin needs to create categories in Candidate Master first.</p>
        </div>
      )}

      {/* Category exists but counting hasn't started */}
      {notStarted && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
          <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold text-amber-800">
            Counting has not started yet for {selected?.name || "this category"}.
          </p>
          <p className="text-xs text-amber-700">
            Results will appear here automatically once a Super Admin opens this category for counting.
          </p>
        </div>
      )}

      {totals && !notStarted && categories.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <ResultsTable
              title="Candidates — Sr. No. Wise"
              rows={totals.by_serial}
              totalVotes={totals.total_votes}
              totalBallots={totals.total_ballots}
            />
            <ResultsTable
              title="Candidates — Leading Vote Wise"
              rows={totals.by_leading}
              totalVotes={totals.total_votes}
              highlightTop
            />
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-500 shadow-sm" aria-live="polite">
            {selected?.status === "in_progress" ? (
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                Counting in progress · Updated {formatDateTime(lastUpdated)}
              </span>
            ) : selected?.status === "completed" ? (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Final Results — Updated {formatDateTime(lastUpdated)}
              </span>
            ) : (
              <span>Updated {formatDateTime(lastUpdated)}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ResultsTable({ title, rows, totalVotes, totalBallots, highlightTop = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
        <h3 className="text-center text-xs font-bold uppercase tracking-wider text-white">{title}</h3>
      </div>
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-slate-100 font-bold text-slate-700">
            <th className="p-3">Sr. No.</th>
            <th className="p-3">Candidate</th>
            <th className="p-3 text-right">Votes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((r, i) => (
            <tr
              key={r.serial_no}
              className={highlightTop && i < 2 ? "bg-emerald-50" : "hover:bg-slate-50"}
            >
              <td className="p-3 font-mono text-slate-500">{r.serial_no}</td>
              <td className="p-3 font-bold text-slate-900">{r.candidate_name}</td>
              <td className={`p-3 text-right font-mono text-base font-black ${highlightTop && i < 2 ? "text-emerald-700" : "text-slate-800"}`}>
                {r.votes}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={3} className="p-4 text-center text-slate-400">No candidates in this category.</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 bg-blue-50/60">
            <td colSpan={2} className="p-3 text-xs font-bold text-blue-800">Total Votes</td>
            <td className="p-3 text-right font-mono text-base font-black text-blue-800">{totalVotes}</td>
          </tr>
          {totalBallots !== undefined && (
            <tr className="bg-purple-50/60">
              <td colSpan={2} className="p-3 text-xs font-bold text-purple-800">Total Ballots</td>
              <td className="p-3 text-right font-mono text-base font-black text-purple-800">{totalBallots}</td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
}