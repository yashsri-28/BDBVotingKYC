// // import { useState, useEffect, useCallback } from "react";
// // import { fetchPools, setPoolTotal, fetchAllocations, assignAllocation } from "../api/ballots";
// // import { fetchLogins } from "../api/users";
// // import { getErrorMessage } from "../api/client";
// // import { useToast } from "../context/ToastContext";

// // export default function PoolAllotment() {
// //   const { showToast } = useToast();
// //   const [pools, setPools] = useState([]);
// //   const [counters, setCounters] = useState([]);
// //   const [allocations, setAllocations] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");

// //   const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
// //   const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
// //   const [saving, setSaving] = useState(false);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
// //       setPools(p);
// //       setCounters(c.filter((u) => u.role === "supervisor"));
// //       setAllocations(a);
// //       const byType = Object.fromEntries(p.map((x) => [x.roll_type, x.total_ballots]));
// //       setPoolForm({ category: byType.category ?? "", exclusive: byType.exclusive ?? "" });
// //     } catch (err) {
// //       setError(getErrorMessage(err, "Pool data could not be loaded."));
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => { load(); }, [load]);

// //   async function handleSetTotals(e) {
// //     e.preventDefault();
// //     setSaving(true);
// //     try {
// //       if (poolForm.category !== "") await setPoolTotal("category", Number(poolForm.category));
// //       if (poolForm.exclusive !== "") await setPoolTotal("exclusive", Number(poolForm.exclusive));
// //       showToast("success", "Base pools updated", "Category and Exclusive pool totals saved.");
// //       load();
// //     } catch (err) {
// //       showToast("danger", "Could not update pools", getErrorMessage(err));
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   async function handleAssign(e) {
// //     e.preventDefault();
// //     if (!assignForm.counter) { showToast("warning", "Select a counter", "Please choose which Counter to assign ballots to."); return; }
// //     setSaving(true);
// //     try {
// //       if (assignForm.category !== "") await assignAllocation("category", Number(assignForm.counter), Number(assignForm.category));
// //       if (assignForm.exclusive !== "") await assignAllocation("exclusive", Number(assignForm.counter), Number(assignForm.exclusive));
// //       showToast("success", "Allocation saved", "Ballots have been assigned to the selected Counter.");
// //       setAssignForm({ counter: "", category: "", exclusive: "" });
// //       load();
// //     } catch (err) {
// //       showToast("danger", "Could not assign ballots", getErrorMessage(err));
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>;

// //   return (
// //     <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
// //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// //         <h2 className="mb-1 text-lg font-bold text-slate-900">Base Ballot Pools</h2>
// //         <p className="mb-4 text-xs text-slate-500">Set the total number of ballots available for this election, per pool type.</p>
// //         {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
// //         <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// //           <div>
// //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool Total</label>
// //             <input type="number" min="0" value={poolForm.category}
// //               onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// //           </div>
// //           <div>
// //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool Total</label>
// //             <input type="number" min="0" value={poolForm.exclusive}
// //               onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// //           </div>
// //           <div className="sm:col-span-2">
// //             <button type="submit" disabled={saving} className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
// //               {saving ? "Saving…" : "Save Pool Totals"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>

// //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// //         <h2 className="mb-1 text-lg font-bold text-slate-900">Assign to Counter</h2>
// //         <p className="mb-4 text-xs text-slate-500">Allot a portion of each base pool to a specific Counter login.</p>
// //         <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
// //           <div>
// //             <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
// //             <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
// //               <option value="">Select a Counter…</option>
// //               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// //             </select>
// //           </div>
// //           <div>
// //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
// //             <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// //           </div>
// //           <div>
// //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
// //             <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// //           </div>
// //           <div className="sm:col-span-3">
// //             <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
// //               {saving ? "Assigning…" : "Assign Ballots"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>

// //       <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
// //         <table className="w-full border-collapse text-left text-xs">
// //           <thead>
// //             <tr className="bg-slate-900 font-semibold text-white">
// //               <th className="p-3">Counter</th>
// //               <th className="p-3">Pool</th>
// //               <th className="p-3 text-center">Assigned</th>
// //               <th className="p-3 text-center">Used</th>
// //               <th className="p-3 text-center">Remaining</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y divide-slate-200">
// //             {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
// //             {allocations.map((a) => (
// //               <tr key={a.id} className="hover:bg-slate-50">
// //                 <td className="p-3 font-bold text-slate-900">{a.counter_name}</td>
// //                 <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
// //                 <td className="p-3 text-center font-mono">{a.assigned_count}</td>
// //                 <td className="p-3 text-center font-mono text-emerald-700">{a.used_count}</td>
// //                 <td className="p-3 text-center font-mono text-amber-700">{a.remaining_count}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
// import {
//   fetchPools, setPoolTotal, fetchAllocations, assignAllocation,
//   adjustPoolTotal, adjustAllocation,
// } from "../api/ballots";
// import { fetchLogins } from "../api/users";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";

// export default function PoolAllotment() {
//   const { showToast } = useToast();
//   const [pools, setPools] = useState([]);
//   const [counters, setCounters] = useState([]);
//   const [allocations, setAllocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
//   const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
//   const [saving, setSaving] = useState(false);

//   // NEW: delta-based adjust forms
//   const [poolAdjustForm, setPoolAdjustForm] = useState({ category: "", exclusive: "" });
//   const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });
//   const [adjusting, setAdjusting] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
//       setPools(p);
//       setCounters(c.filter((u) => u.role === "supervisor"));
//       setAllocations(a);
//       const byType = Object.fromEntries(p.map((x) => [x.roll_type, x.total_ballots]));
//       setPoolForm({ category: byType.category ?? "", exclusive: byType.exclusive ?? "" });
//     } catch (err) {
//       setError(getErrorMessage(err, "Pool data could not be loaded."));
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   async function handleSetTotals(e) {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       if (poolForm.category !== "") await setPoolTotal("category", Number(poolForm.category));
//       if (poolForm.exclusive !== "") await setPoolTotal("exclusive", Number(poolForm.exclusive));
//       showToast("success", "Base pools updated", "Category and Exclusive pool totals saved.");
//       load();
//     } catch (err) {
//       showToast("danger", "Could not update pools", getErrorMessage(err));
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleAssign(e) {
//     e.preventDefault();
//     if (!assignForm.counter) { showToast("warning", "Select a counter", "Please choose which Counter to assign ballots to."); return; }
//     setSaving(true);
//     try {
//       if (assignForm.category !== "") await assignAllocation("category", Number(assignForm.counter), Number(assignForm.category));
//       if (assignForm.exclusive !== "") await assignAllocation("exclusive", Number(assignForm.counter), Number(assignForm.exclusive));
//       showToast("success", "Allocation saved", "Ballots have been assigned to the selected Counter.");
//       setAssignForm({ counter: "", category: "", exclusive: "" });
//       load();
//     } catch (err) {
//       showToast("danger", "Could not assign ballots", getErrorMessage(err));
//     } finally {
//       setSaving(false);
//     }
//   }

//   // NEW: adjust base pool by a signed delta (positive = add, negative = subtract)
//   async function handleAdjustPool(rollType, sign) {
//     const raw = poolAdjustForm[rollType];
//     if (raw === "" || Number(raw) === 0) {
//       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
//       return;
//     }
//     const delta = sign * Math.abs(Number(raw));
//     setAdjusting(true);
//     try {
//       await adjustPoolTotal(rollType, delta);
//       showToast(
//         "success",
//         sign > 0 ? "Ballots added" : "Ballots subtracted",
//         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} the base pool.`
//       );
//       setPoolAdjustForm((f) => ({ ...f, [rollType]: "" }));
//       load();
//     } catch (err) {
//       showToast("danger", "Could not adjust pool", getErrorMessage(err));
//     } finally {
//       setAdjusting(false);
//     }
//   }

//   // NEW: adjust a specific counter's allocation by a signed delta
//   async function handleAdjustAllocation(rollType, sign) {
//     if (!allocationAdjustForm.counter) {
//       showToast("warning", "Select a counter", "Please choose which Counter's allocation to adjust.");
//       return;
//     }
//     const raw = allocationAdjustForm[rollType];
//     if (raw === "" || Number(raw) === 0) {
//       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
//       return;
//     }
//     const delta = sign * Math.abs(Number(raw));
//     setAdjusting(true);
//     try {
//       await adjustAllocation(rollType, Number(allocationAdjustForm.counter), delta);
//       showToast(
//         "success",
//         sign > 0 ? "Ballots added" : "Ballots subtracted",
//         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`
//       );
//       setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
//       load();
//     } catch (err) {
//       showToast("danger", "Could not adjust allocation", getErrorMessage(err));
//     } finally {
//       setAdjusting(false);
//     }
//   }
//   // NEW: exports the Counter Allocation table below to a downloadable .xlsx file
//   function handleExportAllocationsExcel() {
//     if (allocations.length === 0) {
//       showToast("warning", "Nothing to export", "There are no allocations yet.");
//       return;
//     }
//     const rows = allocations.map((a) => ({
//       "Counter Name": a.counter_name,
//       "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
//       "Assigned": a.assigned_count,
//       "Used": a.used_count,
//       "Remaining": a.remaining_count,
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Counter Allocations");
//     const today = new Date().toISOString().slice(0, 10); // e.g. 2026-07-30
//     XLSX.writeFile(workbook, `counter-allocations-${today}.xlsx`);
//   }
  
//   if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>;

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <h2 className="mb-1 text-lg font-bold text-slate-900">Base Ballot Pools</h2>
//         <p className="mb-4 text-xs text-slate-500">Set the total number of ballots available for this election, per pool type.</p>
//         {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
//         <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool Total</label>
//             <input type="number" min="0" value={poolForm.category}
//               onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
//           </div>
//           <div>
//             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool Total</label>
//             <input type="number" min="0" value={poolForm.exclusive}
//               onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
//           </div>
//           <div className="sm:col-span-2">
//             <button type="submit" disabled={saving} className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
//               {saving ? "Saving…" : "Save Pool Totals"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* NEW: Add / Subtract from Base Pool */}
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <h2 className="mb-1 text-lg font-bold text-slate-900">Add / Subtract Base Pool Ballots</h2>
//         <p className="mb-4 text-xs text-slate-500">
//           Adjust the base pool total by a specific amount instead of setting a new absolute total.
//           Subtracting is blocked if it would go below what's already assigned to counters.
//         </p>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
//             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool</label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number" min="0" placeholder="Amount"
//                 value={poolAdjustForm.category}
//                 onChange={(e) => setPoolAdjustForm((f) => ({ ...f, category: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustPool("category", 1)}
//                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
//               >
//                 + Add
//               </button>
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustPool("category", -1)}
//                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
//               >
//                 − Subtract
//               </button>
//             </div>
//           </div>
//           <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
//             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool</label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number" min="0" placeholder="Amount"
//                 value={poolAdjustForm.exclusive}
//                 onChange={(e) => setPoolAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
//               />
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustPool("exclusive", 1)}
//                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
//               >
//                 + Add
//               </button>
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustPool("exclusive", -1)}
//                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
//               >
//                 − Subtract
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <h2 className="mb-1 text-lg font-bold text-slate-900">Assign to Counter</h2>
//         <p className="mb-4 text-xs text-slate-500">Allot a portion of each base pool to a specific Counter login.</p>
//         <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <div>
//             <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
//             <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
//               <option value="">Select a Counter…</option>
//               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
//             <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
//           </div>
//           <div>
//             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
//             <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
//           </div>
//           <div className="sm:col-span-3">
//             <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
//               {saving ? "Assigning…" : "Assign Ballots"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* NEW: Add / Subtract from a specific Counter's allocation */}
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <h2 className="mb-1 text-lg font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
//         <p className="mb-4 text-xs text-slate-500">
//           Adjust a specific Counter's assigned ballots by an amount. Subtracting is blocked if it would
//           go below what that Counter has already distributed to members.
//         </p>
//         <div className="mb-4">
//           <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
//           <select
//             value={allocationAdjustForm.counter}
//             onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
//             className="w-full max-w-sm rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a Counter…</option>
//             {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
//           </select>
//         </div>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
//             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number" min="0" placeholder="Amount"
//                 value={allocationAdjustForm.category}
//                 onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
//               />
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustAllocation("category", 1)}
//                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
//               >
//                 + Add
//               </button>
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustAllocation("category", -1)}
//                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
//               >
//                 − Subtract
//               </button>
//             </div>
//           </div>
//           <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
//             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
//             <div className="flex items-center gap-2">
//               <input
//                 type="number" min="0" placeholder="Amount"
//                 value={allocationAdjustForm.exclusive}
//                 onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
//               />
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustAllocation("exclusive", 1)}
//                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
//               >
//                 + Add
//               </button>
//               <button
//                 type="button" disabled={adjusting}
//                 onClick={() => handleAdjustAllocation("exclusive", -1)}
//                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
//               >
//                 − Subtract
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//     <div className="rounded-xl border border-slate-200 bg-white">
//         <div className="flex items-center justify-between border-b border-slate-200 p-4">
//           <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
//           <button
//             type="button"
//             onClick={handleExportAllocationsExcel}
//             className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
//           >
//             ⬇ Export Excel
//           </button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse text-left text-xs">
//             <thead>
//               <tr className="bg-blue-900 font-semibold text-white">
//                 <th className="p-3">Counter</th>
//                 <th className="p-3">Pool</th>
//                 <th className="p-3 text-center">Assigned</th>
//                 <th className="p-3 text-center">Used</th>
//                 <th className="p-3 text-center">Remaining</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
//               {allocations.map((a) => (
//                 <tr key={a.id} className="hover:bg-slate-50">
//                   <td className="p-3 font-bold text-slate-900">{a.counter_name}</td>
//                   <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
//                   <td className="p-3 text-center font-mono">{a.assigned_count}</td>
//                   <td className="p-3 text-center font-mono text-emerald-700">{a.used_count}</td>
//                   <td className="p-3 text-center font-mono text-amber-700">{a.remaining_count}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// }
import { useState, useEffect, useCallback } from "react";
// import * as XLSX from "xlsx";
import { exportToPDF } from "../utils/pdfExport";
import {
  fetchPools, setPoolTotal, fetchAllocations, assignAllocation,
  adjustPoolTotal, adjustAllocation,
} from "../api/ballots";
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

  const [poolAdjustForm, setPoolAdjustForm] = useState({ category: "", exclusive: "" });
  const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });
  const [adjusting, setAdjusting] = useState(false);

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

  async function handleAdjustPool(rollType, sign) {
    const raw = poolAdjustForm[rollType];
    if (raw === "" || Number(raw) === 0) {
      showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
      return;
    }
    const delta = sign * Math.abs(Number(raw));
    setAdjusting(true);
    try {
      await adjustPoolTotal(rollType, delta);
      showToast(
        "success",
        sign > 0 ? "Ballots added" : "Ballots subtracted",
        `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} the base pool.`
      );
      setPoolAdjustForm((f) => ({ ...f, [rollType]: "" }));
      load();
    } catch (err) {
      showToast("danger", "Could not adjust pool", getErrorMessage(err));
    } finally {
      setAdjusting(false);
    }
  }

  async function handleAdjustAllocation(rollType, sign) {
    if (!allocationAdjustForm.counter) {
      showToast("warning", "Select a counter", "Please choose which Counter's allocation to adjust.");
      return;
    }
    const raw = allocationAdjustForm[rollType];
    if (raw === "" || Number(raw) === 0) {
      showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
      return;
    }
    const delta = sign * Math.abs(Number(raw));
    setAdjusting(true);
    try {
      await adjustAllocation(rollType, Number(allocationAdjustForm.counter), delta);
      showToast(
        "success",
        sign > 0 ? "Ballots added" : "Ballots subtracted",
        `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`
      );
      setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
      load();
    } catch (err) {
      showToast("danger", "Could not adjust allocation", getErrorMessage(err));
    } finally {
      setAdjusting(false);
    }
  }

  // function handleExportAllocationsExcel() {
  //   if (allocations.length === 0) {
  //     showToast("warning", "Nothing to export", "There are no allocations yet.");
  //     return;
  //   }
  //   const rows = allocations.map((a) => ({
  //     "Counter Name": a.counter_name,
  //     "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
  //     "Assigned": a.assigned_count,
  //     "Used": a.used_count,
  //     "Remaining": a.remaining_count,
  //   }));
  //   const worksheet = XLSX.utils.json_to_sheet(rows);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Counter Allocations");
  //   const today = new Date().toISOString().slice(0, 10);
  //   XLSX.writeFile(workbook, `counter-allocations-${today}.xlsx`);
  // }

  function handleExportAllocationsPdf() {
    if (allocations.length === 0) {
      showToast("warning", "Nothing to export", "There are no allocations yet.");
      return;
    }
    const rows = allocations.map((a) => ({
      "Counter Name": a.counter_name,
      "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
      "Assigned": a.assigned_count,
      "Used": a.used_count,
      "Remaining": a.remaining_count,
    }));
    const today = new Date().toISOString().slice(0, 10);

    exportToPDF({
      title: "Counter Allocations Report",
      rows,
      filename: `counter-allocations-${today}`,
    });
    showToast("success", "Export generated", "Counter allocations exported to PDF successfully.");
  }

  if (loading) return <div className="w-full px-3 py-6 text-slate-400">Loading…</div>;

  return (
    <div className="w-full space-y-4 px-3 py-4 sm:px-4">
      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Row 1: Set Totals + Add/Subtract Base Pool, side by side */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-0.5 text-sm font-bold text-slate-900">Base Ballot Pools</h2>
          <p className="mb-3 text-[11px] text-slate-500">Set the total ballots available, per pool type.</p>
          <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-purple-700">Category Pool Total</label>
              <input type="number" min="0" value={poolForm.category}
                onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive Pool Total</label>
              <input type="number" min="0" value={poolForm.exclusive}
                onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
                {saving ? "Saving…" : "Save Pool Totals"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-0.5 text-sm font-bold text-slate-900">Add / Subtract Base Pool</h2>
          <p className="mb-3 text-[11px] text-slate-500">Adjust by an amount instead of setting a new total.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
              <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min="0" placeholder="Amount"
                  value={poolAdjustForm.category}
                  onChange={(e) => setPoolAdjustForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", 1)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
                <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", -1)}
                  className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
              <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min="0" placeholder="Amount"
                  value={poolAdjustForm.exclusive}
                  onChange={(e) => setPoolAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", 1)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
                <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", -1)}
                  className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Assign to Counter + Add/Subtract Allocation, side by side */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-0.5 text-sm font-bold text-slate-900">Assign to Counter</h2>
          <p className="mb-3 text-[11px] text-slate-500">Allot a portion of each pool to a Counter login.</p>
          <form onSubmit={handleAssign} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
              <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a Counter…</option>
                {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
                <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
                <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
              {saving ? "Assigning…" : "Assign Ballots"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-0.5 text-sm font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
          <p className="mb-3 text-[11px] text-slate-500">Adjust a Counter's assigned ballots by an amount.</p>
          <div className="mb-3">
            <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
            <select
              value={allocationAdjustForm.counter}
              onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Counter…</option>
              {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
              <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min="0" placeholder="Amount"
                  value={allocationAdjustForm.category}
                  onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", 1)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
                <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", -1)}
                  className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
              <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min="0" placeholder="Amount"
                  value={allocationAdjustForm.exclusive}
                  onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", 1)}
                  className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
                <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", -1)}
                  className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Allocations table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
     <button
            type="button"
            onClick={handleExportAllocationsPdf}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            ⬇ Export PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-blue-900 font-semibold text-white">
                <th className="p-2.5">Counter</th>
                <th className="p-2.5">Pool</th>
                <th className="p-2.5 text-center">Assigned</th>
                <th className="p-2.5 text-center">Used</th>
                <th className="p-2.5 text-center">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">{a.counter_name}</td>
                  <td className="p-2.5"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
                  <td className="p-2.5 text-center font-mono">{a.assigned_count}</td>
                  <td className="p-2.5 text-center font-mono text-emerald-700">{a.used_count}</td>
                  <td className="p-2.5 text-center font-mono text-amber-700">{a.remaining_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}