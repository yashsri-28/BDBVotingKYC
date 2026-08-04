// // // // import { useState, useEffect, useCallback } from "react";
// // // // import { fetchPools, setPoolTotal, fetchAllocations, assignAllocation } from "../api/ballots";
// // // // import { fetchLogins } from "../api/users";
// // // // import { getErrorMessage } from "../api/client";
// // // // import { useToast } from "../context/ToastContext";

// // // // export default function PoolAllotment() {
// // // //   const { showToast } = useToast();
// // // //   const [pools, setPools] = useState([]);
// // // //   const [counters, setCounters] = useState([]);
// // // //   const [allocations, setAllocations] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState("");

// // // //   const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
// // // //   const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
// // // //   const [saving, setSaving] = useState(false);

// // // //   const load = useCallback(async () => {
// // // //     setLoading(true);
// // // //     try {
// // // //       const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
// // // //       setPools(p);
// // // //       setCounters(c.filter((u) => u.role === "supervisor"));
// // // //       setAllocations(a);
// // // //       const byType = Object.fromEntries(p.map((x) => [x.roll_type, x.total_ballots]));
// // // //       setPoolForm({ category: byType.category ?? "", exclusive: byType.exclusive ?? "" });
// // // //     } catch (err) {
// // // //       setError(getErrorMessage(err, "Pool data could not be loaded."));
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, []);

// // // //   useEffect(() => { load(); }, [load]);

// // // //   async function handleSetTotals(e) {
// // // //     e.preventDefault();
// // // //     setSaving(true);
// // // //     try {
// // // //       if (poolForm.category !== "") await setPoolTotal("category", Number(poolForm.category));
// // // //       if (poolForm.exclusive !== "") await setPoolTotal("exclusive", Number(poolForm.exclusive));
// // // //       showToast("success", "Base pools updated", "Category and Exclusive pool totals saved.");
// // // //       load();
// // // //     } catch (err) {
// // // //       showToast("danger", "Could not update pools", getErrorMessage(err));
// // // //     } finally {
// // // //       setSaving(false);
// // // //     }
// // // //   }

// // // //   async function handleAssign(e) {
// // // //     e.preventDefault();
// // // //     if (!assignForm.counter) { showToast("warning", "Select a counter", "Please choose which Counter to assign ballots to."); return; }
// // // //     setSaving(true);
// // // //     try {
// // // //       if (assignForm.category !== "") await assignAllocation("category", Number(assignForm.counter), Number(assignForm.category));
// // // //       if (assignForm.exclusive !== "") await assignAllocation("exclusive", Number(assignForm.counter), Number(assignForm.exclusive));
// // // //       showToast("success", "Allocation saved", "Ballots have been assigned to the selected Counter.");
// // // //       setAssignForm({ counter: "", category: "", exclusive: "" });
// // // //       load();
// // // //     } catch (err) {
// // // //       showToast("danger", "Could not assign ballots", getErrorMessage(err));
// // // //     } finally {
// // // //       setSaving(false);
// // // //     }
// // // //   }

// // // //   if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>;

// // // //   return (
// // // //     <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
// // // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Base Ballot Pools</h2>
// // // //         <p className="mb-4 text-xs text-slate-500">Set the total number of ballots available for this election, per pool type.</p>
// // // //         {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
// // // //         <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// // // //           <div>
// // // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool Total</label>
// // // //             <input type="number" min="0" value={poolForm.category}
// // // //               onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
// // // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// // // //           </div>
// // // //           <div>
// // // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool Total</label>
// // // //             <input type="number" min="0" value={poolForm.exclusive}
// // // //               onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
// // // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// // // //           </div>
// // // //           <div className="sm:col-span-2">
// // // //             <button type="submit" disabled={saving} className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
// // // //               {saving ? "Saving…" : "Save Pool Totals"}
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>

// // // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Assign to Counter</h2>
// // // //         <p className="mb-4 text-xs text-slate-500">Allot a portion of each base pool to a specific Counter login.</p>
// // // //         <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
// // // //           <div>
// // // //             <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
// // // //             <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
// // // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
// // // //               <option value="">Select a Counter…</option>
// // // //               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// // // //             </select>
// // // //           </div>
// // // //           <div>
// // // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
// // // //             <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
// // // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// // // //           </div>
// // // //           <div>
// // // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
// // // //             <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
// // // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// // // //           </div>
// // // //           <div className="sm:col-span-3">
// // // //             <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
// // // //               {saving ? "Assigning…" : "Assign Ballots"}
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>

// // // //       <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
// // // //         <table className="w-full border-collapse text-left text-xs">
// // // //           <thead>
// // // //             <tr className="bg-slate-900 font-semibold text-white">
// // // //               <th className="p-3">Counter</th>
// // // //               <th className="p-3">Pool</th>
// // // //               <th className="p-3 text-center">Assigned</th>
// // // //               <th className="p-3 text-center">Used</th>
// // // //               <th className="p-3 text-center">Remaining</th>
// // // //             </tr>
// // // //           </thead>
// // // //           <tbody className="divide-y divide-slate-200">
// // // //             {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
// // // //             {allocations.map((a) => (
// // // //               <tr key={a.id} className="hover:bg-slate-50">
// // // //                 <td className="p-3 font-bold text-slate-900">{a.counter_name}</td>
// // // //                 <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
// // // //                 <td className="p-3 text-center font-mono">{a.assigned_count}</td>
// // // //                 <td className="p-3 text-center font-mono text-emerald-700">{a.used_count}</td>
// // // //                 <td className="p-3 text-center font-mono text-amber-700">{a.remaining_count}</td>
// // // //               </tr>
// // // //             ))}
// // // //           </tbody>
// // // //         </table>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // import { useState, useEffect, useCallback } from "react";
// // // import * as XLSX from "xlsx";
// // // import {
// // //   fetchPools, setPoolTotal, fetchAllocations, assignAllocation,
// // //   adjustPoolTotal, adjustAllocation,
// // // } from "../api/ballots";
// // // import { fetchLogins } from "../api/users";
// // // import { getErrorMessage } from "../api/client";
// // // import { useToast } from "../context/ToastContext";

// // // export default function PoolAllotment() {
// // //   const { showToast } = useToast();
// // //   const [pools, setPools] = useState([]);
// // //   const [counters, setCounters] = useState([]);
// // //   const [allocations, setAllocations] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");

// // //   const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
// // //   const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
// // //   const [saving, setSaving] = useState(false);

// // //   // NEW: delta-based adjust forms
// // //   const [poolAdjustForm, setPoolAdjustForm] = useState({ category: "", exclusive: "" });
// // //   const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });
// // //   const [adjusting, setAdjusting] = useState(false);

// // //   const load = useCallback(async () => {
// // //     setLoading(true);
// // //     try {
// // //       const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
// // //       setPools(p);
// // //       setCounters(c.filter((u) => u.role === "supervisor"));
// // //       setAllocations(a);
// // //       const byType = Object.fromEntries(p.map((x) => [x.roll_type, x.total_ballots]));
// // //       setPoolForm({ category: byType.category ?? "", exclusive: byType.exclusive ?? "" });
// // //     } catch (err) {
// // //       setError(getErrorMessage(err, "Pool data could not be loaded."));
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, []);

// // //   useEffect(() => { load(); }, [load]);

// // //   async function handleSetTotals(e) {
// // //     e.preventDefault();
// // //     setSaving(true);
// // //     try {
// // //       if (poolForm.category !== "") await setPoolTotal("category", Number(poolForm.category));
// // //       if (poolForm.exclusive !== "") await setPoolTotal("exclusive", Number(poolForm.exclusive));
// // //       showToast("success", "Base pools updated", "Category and Exclusive pool totals saved.");
// // //       load();
// // //     } catch (err) {
// // //       showToast("danger", "Could not update pools", getErrorMessage(err));
// // //     } finally {
// // //       setSaving(false);
// // //     }
// // //   }

// // //   async function handleAssign(e) {
// // //     e.preventDefault();
// // //     if (!assignForm.counter) { showToast("warning", "Select a counter", "Please choose which Counter to assign ballots to."); return; }
// // //     setSaving(true);
// // //     try {
// // //       if (assignForm.category !== "") await assignAllocation("category", Number(assignForm.counter), Number(assignForm.category));
// // //       if (assignForm.exclusive !== "") await assignAllocation("exclusive", Number(assignForm.counter), Number(assignForm.exclusive));
// // //       showToast("success", "Allocation saved", "Ballots have been assigned to the selected Counter.");
// // //       setAssignForm({ counter: "", category: "", exclusive: "" });
// // //       load();
// // //     } catch (err) {
// // //       showToast("danger", "Could not assign ballots", getErrorMessage(err));
// // //     } finally {
// // //       setSaving(false);
// // //     }
// // //   }

// // //   // NEW: adjust base pool by a signed delta (positive = add, negative = subtract)
// // //   async function handleAdjustPool(rollType, sign) {
// // //     const raw = poolAdjustForm[rollType];
// // //     if (raw === "" || Number(raw) === 0) {
// // //       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
// // //       return;
// // //     }
// // //     const delta = sign * Math.abs(Number(raw));
// // //     setAdjusting(true);
// // //     try {
// // //       await adjustPoolTotal(rollType, delta);
// // //       showToast(
// // //         "success",
// // //         sign > 0 ? "Ballots added" : "Ballots subtracted",
// // //         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} the base pool.`
// // //       );
// // //       setPoolAdjustForm((f) => ({ ...f, [rollType]: "" }));
// // //       load();
// // //     } catch (err) {
// // //       showToast("danger", "Could not adjust pool", getErrorMessage(err));
// // //     } finally {
// // //       setAdjusting(false);
// // //     }
// // //   }

// // //   // NEW: adjust a specific counter's allocation by a signed delta
// // //   async function handleAdjustAllocation(rollType, sign) {
// // //     if (!allocationAdjustForm.counter) {
// // //       showToast("warning", "Select a counter", "Please choose which Counter's allocation to adjust.");
// // //       return;
// // //     }
// // //     const raw = allocationAdjustForm[rollType];
// // //     if (raw === "" || Number(raw) === 0) {
// // //       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
// // //       return;
// // //     }
// // //     const delta = sign * Math.abs(Number(raw));
// // //     setAdjusting(true);
// // //     try {
// // //       await adjustAllocation(rollType, Number(allocationAdjustForm.counter), delta);
// // //       showToast(
// // //         "success",
// // //         sign > 0 ? "Ballots added" : "Ballots subtracted",
// // //         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`
// // //       );
// // //       setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
// // //       load();
// // //     } catch (err) {
// // //       showToast("danger", "Could not adjust allocation", getErrorMessage(err));
// // //     } finally {
// // //       setAdjusting(false);
// // //     }
// // //   }
// // //   // NEW: exports the Counter Allocation table below to a downloadable .xlsx file
// // //   function handleExportAllocationsExcel() {
// // //     if (allocations.length === 0) {
// // //       showToast("warning", "Nothing to export", "There are no allocations yet.");
// // //       return;
// // //     }
// // //     const rows = allocations.map((a) => ({
// // //       "Counter Name": a.counter_name,
// // //       "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
// // //       "Assigned": a.assigned_count,
// // //       "Used": a.used_count,
// // //       "Remaining": a.remaining_count,
// // //     }));
// // //     const worksheet = XLSX.utils.json_to_sheet(rows);
// // //     const workbook = XLSX.utils.book_new();
// // //     XLSX.utils.book_append_sheet(workbook, worksheet, "Counter Allocations");
// // //     const today = new Date().toISOString().slice(0, 10); // e.g. 2026-07-30
// // //     XLSX.writeFile(workbook, `counter-allocations-${today}.xlsx`);
// // //   }
  
// // //   if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>;

// // //   return (
// // //     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
// // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Base Ballot Pools</h2>
// // //         <p className="mb-4 text-xs text-slate-500">Set the total number of ballots available for this election, per pool type.</p>
// // //         {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}
// // //         <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// // //           <div>
// // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool Total</label>
// // //             <input type="number" min="0" value={poolForm.category}
// // //               onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
// // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// // //           </div>
// // //           <div>
// // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool Total</label>
// // //             <input type="number" min="0" value={poolForm.exclusive}
// // //               onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
// // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// // //           </div>
// // //           <div className="sm:col-span-2">
// // //             <button type="submit" disabled={saving} className="rounded-lg bg-navy-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60">
// // //               {saving ? "Saving…" : "Save Pool Totals"}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>

// // //       {/* NEW: Add / Subtract from Base Pool */}
// // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Add / Subtract Base Pool Ballots</h2>
// // //         <p className="mb-4 text-xs text-slate-500">
// // //           Adjust the base pool total by a specific amount instead of setting a new absolute total.
// // //           Subtracting is blocked if it would go below what's already assigned to counters.
// // //         </p>
// // //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// // //           <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
// // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Pool</label>
// // //             <div className="flex items-center gap-2">
// // //               <input
// // //                 type="number" min="0" placeholder="Amount"
// // //                 value={poolAdjustForm.category}
// // //                 onChange={(e) => setPoolAdjustForm((f) => ({ ...f, category: e.target.value }))}
// // //                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // //               />
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustPool("category", 1)}
// // //                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
// // //               >
// // //                 + Add
// // //               </button>
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustPool("category", -1)}
// // //                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
// // //               >
// // //                 − Subtract
// // //               </button>
// // //             </div>
// // //           </div>
// // //           <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
// // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Pool</label>
// // //             <div className="flex items-center gap-2">
// // //               <input
// // //                 type="number" min="0" placeholder="Amount"
// // //                 value={poolAdjustForm.exclusive}
// // //                 onChange={(e) => setPoolAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
// // //                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
// // //               />
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustPool("exclusive", 1)}
// // //                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
// // //               >
// // //                 + Add
// // //               </button>
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustPool("exclusive", -1)}
// // //                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
// // //               >
// // //                 − Subtract
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Assign to Counter</h2>
// // //         <p className="mb-4 text-xs text-slate-500">Allot a portion of each base pool to a specific Counter login.</p>
// // //         <form onSubmit={handleAssign} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
// // //           <div>
// // //             <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
// // //             <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
// // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
// // //               <option value="">Select a Counter…</option>
// // //               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// // //             </select>
// // //           </div>
// // //           <div>
// // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
// // //             <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
// // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// // //           </div>
// // //           <div>
// // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
// // //             <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
// // //               className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// // //           </div>
// // //           <div className="sm:col-span-3">
// // //             <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
// // //               {saving ? "Assigning…" : "Assign Ballots"}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>

// // //       {/* NEW: Add / Subtract from a specific Counter's allocation */}
// // //       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
// // //         <h2 className="mb-1 text-lg font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
// // //         <p className="mb-4 text-xs text-slate-500">
// // //           Adjust a specific Counter's assigned ballots by an amount. Subtracting is blocked if it would
// // //           go below what that Counter has already distributed to members.
// // //         </p>
// // //         <div className="mb-4">
// // //           <label className="mb-1 block text-xs font-bold text-slate-700">Counter</label>
// // //           <select
// // //             value={allocationAdjustForm.counter}
// // //             onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
// // //             className="w-full max-w-sm rounded-lg border border-slate-300 p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
// // //           >
// // //             <option value="">Select a Counter…</option>
// // //             {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// // //           </select>
// // //         </div>
// // //         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
// // //           <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
// // //             <label className="mb-1 block text-xs font-bold text-purple-700">Category Ballots</label>
// // //             <div className="flex items-center gap-2">
// // //               <input
// // //                 type="number" min="0" placeholder="Amount"
// // //                 value={allocationAdjustForm.category}
// // //                 onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
// // //                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
// // //               />
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustAllocation("category", 1)}
// // //                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
// // //               >
// // //                 + Add
// // //               </button>
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustAllocation("category", -1)}
// // //                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
// // //               >
// // //                 − Subtract
// // //               </button>
// // //             </div>
// // //           </div>
// // //           <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
// // //             <label className="mb-1 block text-xs font-bold text-amber-700">Exclusive Ballots</label>
// // //             <div className="flex items-center gap-2">
// // //               <input
// // //                 type="number" min="0" placeholder="Amount"
// // //                 value={allocationAdjustForm.exclusive}
// // //                 onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
// // //                 className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
// // //               />
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustAllocation("exclusive", 1)}
// // //                 className="shrink-0 rounded-lg bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
// // //               >
// // //                 + Add
// // //               </button>
// // //               <button
// // //                 type="button" disabled={adjusting}
// // //                 onClick={() => handleAdjustAllocation("exclusive", -1)}
// // //                 className="shrink-0 rounded-lg bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
// // //               >
// // //                 − Subtract
// // //               </button>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //     <div className="rounded-xl border border-slate-200 bg-white">
// // //         <div className="flex items-center justify-between border-b border-slate-200 p-4">
// // //           <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
// // //           <button
// // //             type="button"
// // //             onClick={handleExportAllocationsExcel}
// // //             className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
// // //           >
// // //             ⬇ Export Excel
// // //           </button>
// // //         </div>
// // //         <div className="overflow-x-auto">
// // //           <table className="w-full border-collapse text-left text-xs">
// // //             <thead>
// // //               <tr className="bg-blue-900 font-semibold text-white">
// // //                 <th className="p-3">Counter</th>
// // //                 <th className="p-3">Pool</th>
// // //                 <th className="p-3 text-center">Assigned</th>
// // //                 <th className="p-3 text-center">Used</th>
// // //                 <th className="p-3 text-center">Remaining</th>
// // //               </tr>
// // //             </thead>
// // //             <tbody className="divide-y divide-slate-200">
// // //               {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
// // //               {allocations.map((a) => (
// // //                 <tr key={a.id} className="hover:bg-slate-50">
// // //                   <td className="p-3 font-bold text-slate-900">{a.counter_name}</td>
// // //                   <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
// // //                   <td className="p-3 text-center font-mono">{a.assigned_count}</td>
// // //                   <td className="p-3 text-center font-mono text-emerald-700">{a.used_count}</td>
// // //                   <td className="p-3 text-center font-mono text-amber-700">{a.remaining_count}</td>
// // //                 </tr>
// // //               ))}
// // //             </tbody>
// // //           </table>
// // //         </div>
// // //       </div>

// // //     </div>
// // //   );
// // // }
// // import { useState, useEffect, useCallback } from "react";
// // // import * as XLSX from "xlsx";
// // import { exportToPDF } from "../utils/pdfExport";
// // import {
// //   fetchPools, setPoolTotal, fetchAllocations, assignAllocation,
// //   adjustPoolTotal, adjustAllocation,
// // } from "../api/ballots";
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

// //   const [poolAdjustForm, setPoolAdjustForm] = useState({ category: "", exclusive: "" });
// //   const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });
// //   const [adjusting, setAdjusting] = useState(false);

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

// //   async function handleAdjustPool(rollType, sign) {
// //     const raw = poolAdjustForm[rollType];
// //     if (raw === "" || Number(raw) === 0) {
// //       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
// //       return;
// //     }
// //     const delta = sign * Math.abs(Number(raw));
// //     setAdjusting(true);
// //     try {
// //       await adjustPoolTotal(rollType, delta);
// //       showToast(
// //         "success",
// //         sign > 0 ? "Ballots added" : "Ballots subtracted",
// //         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} the base pool.`
// //       );
// //       setPoolAdjustForm((f) => ({ ...f, [rollType]: "" }));
// //       load();
// //     } catch (err) {
// //       showToast("danger", "Could not adjust pool", getErrorMessage(err));
// //     } finally {
// //       setAdjusting(false);
// //     }
// //   }

// //   async function handleAdjustAllocation(rollType, sign) {
// //     if (!allocationAdjustForm.counter) {
// //       showToast("warning", "Select a counter", "Please choose which Counter's allocation to adjust.");
// //       return;
// //     }
// //     const raw = allocationAdjustForm[rollType];
// //     if (raw === "" || Number(raw) === 0) {
// //       showToast("warning", "Enter an amount", "Please enter how many ballots to add or subtract.");
// //       return;
// //     }
// //     const delta = sign * Math.abs(Number(raw));
// //     setAdjusting(true);
// //     try {
// //       await adjustAllocation(rollType, Number(allocationAdjustForm.counter), delta);
// //       showToast(
// //         "success",
// //         sign > 0 ? "Ballots added" : "Ballots subtracted",
// //         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`
// //       );
// //       setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
// //       load();
// //     } catch (err) {
// //       showToast("danger", "Could not adjust allocation", getErrorMessage(err));
// //     } finally {
// //       setAdjusting(false);
// //     }
// //   }

// //   // function handleExportAllocationsExcel() {
// //   //   if (allocations.length === 0) {
// //   //     showToast("warning", "Nothing to export", "There are no allocations yet.");
// //   //     return;
// //   //   }
// //   //   const rows = allocations.map((a) => ({
// //   //     "Counter Name": a.counter_name,
// //   //     "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
// //   //     "Assigned": a.assigned_count,
// //   //     "Used": a.used_count,
// //   //     "Remaining": a.remaining_count,
// //   //   }));
// //   //   const worksheet = XLSX.utils.json_to_sheet(rows);
// //   //   const workbook = XLSX.utils.book_new();
// //   //   XLSX.utils.book_append_sheet(workbook, worksheet, "Counter Allocations");
// //   //   const today = new Date().toISOString().slice(0, 10);
// //   //   XLSX.writeFile(workbook, `counter-allocations-${today}.xlsx`);
// //   // }

// //   function handleExportAllocationsPdf() {
// //     if (allocations.length === 0) {
// //       showToast("warning", "Nothing to export", "There are no allocations yet.");
// //       return;
// //     }
// //     const rows = allocations.map((a) => ({
// //       "Counter Name": a.counter_name,
// //       "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
// //       "Assigned": a.assigned_count,
// //       "Used": a.used_count,
// //       "Remaining": a.remaining_count,
// //     }));
// //     const today = new Date().toISOString().slice(0, 10);

// //     exportToPDF({
// //       title: "Counter Allocations Report",
// //       rows,
// //       filename: `counter-allocations-${today}`,
// //     });
// //     showToast("success", "Export generated", "Counter allocations exported to PDF successfully.");
// //   }

// //   if (loading) return <div className="w-full px-3 py-6 text-slate-400">Loading…</div>;

// //   return (
// //     <div className="w-full space-y-4 px-3 py-4 sm:px-4">
// //       {error && <p className="text-xs text-rose-600">{error}</p>}

// //       {/* Row 1: Set Totals + Add/Subtract Base Pool, side by side */}
// //       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
// //         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
// //           <h2 className="mb-0.5 text-sm font-bold text-slate-900">Base Ballot Pools</h2>
// //           <p className="mb-3 text-[11px] text-slate-500">Set the total ballots available, per pool type.</p>
// //           <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// //             <div>
// //               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category Pool Total</label>
// //               <input type="number" min="0" value={poolForm.category}
// //                 onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
// //                 className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// //             </div>
// //             <div>
// //               <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive Pool Total</label>
// //               <input type="number" min="0" value={poolForm.exclusive}
// //                 onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
// //                 className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// //             </div>
// //             <div className="sm:col-span-2">
// //               <button type="submit" disabled={saving} className="w-full rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto">
// //                 {saving ? "Saving…" : "Save Pool Totals"}
// //               </button>
// //             </div>
// //           </form>
// //         </div>

// //         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
// //           <h2 className="mb-0.5 text-sm font-bold text-slate-900">Add / Subtract Base Pool</h2>
// //           <p className="mb-3 text-[11px] text-slate-500">Adjust by an amount instead of setting a new total.</p>
// //           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// //             <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
// //               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
// //               <div className="flex items-center gap-1.5">
// //                 <input
// //                   type="number" min="0" placeholder="Amount"
// //                   value={poolAdjustForm.category}
// //                   onChange={(e) => setPoolAdjustForm((f) => ({ ...f, category: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
// //                 />
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", 1)}
// //                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", -1)}
// //                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
// //               </div>
// //             </div>
// //             <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
// //               <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
// //               <div className="flex items-center gap-1.5">
// //                 <input
// //                   type="number" min="0" placeholder="Amount"
// //                   value={poolAdjustForm.exclusive}
// //                   onChange={(e) => setPoolAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
// //                 />
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", 1)}
// //                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", -1)}
// //                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Row 2: Assign to Counter + Add/Subtract Allocation, side by side */}
// //       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
// //         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
// //           <h2 className="mb-0.5 text-sm font-bold text-slate-900">Assign to Counter</h2>
// //           <p className="mb-3 text-[11px] text-slate-500">Allot a portion of each pool to a Counter login.</p>
// //           <form onSubmit={handleAssign} className="space-y-3">
// //             <div>
// //               <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
// //               <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
// //                 className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
// //                 <option value="">Select a Counter…</option>
// //                 {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// //               </select>
// //             </div>
// //             <div className="grid grid-cols-2 gap-3">
// //               <div>
// //                 <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
// //                 <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500" />
// //               </div>
// //               <div>
// //                 <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
// //                 <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500" />
// //               </div>
// //             </div>
// //             <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto">
// //               {saving ? "Assigning…" : "Assign Ballots"}
// //             </button>
// //           </form>
// //         </div>

// //         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
// //           <h2 className="mb-0.5 text-sm font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
// //           <p className="mb-3 text-[11px] text-slate-500">Adjust a Counter's assigned ballots by an amount.</p>
// //           <div className="mb-3">
// //             <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
// //             <select
// //               value={allocationAdjustForm.counter}
// //               onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
// //               className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //             >
// //               <option value="">Select a Counter…</option>
// //               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
// //             </select>
// //           </div>
// //           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// //             <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
// //               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
// //               <div className="flex items-center gap-1.5">
// //                 <input
// //                   type="number" min="0" placeholder="Amount"
// //                   value={allocationAdjustForm.category}
// //                   onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
// //                 />
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", 1)}
// //                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", -1)}
// //                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
// //               </div>
// //             </div>
// //             <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
// //               <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
// //               <div className="flex items-center gap-1.5">
// //                 <input
// //                   type="number" min="0" placeholder="Amount"
// //                   value={allocationAdjustForm.exclusive}
// //                   onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
// //                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
// //                 />
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", 1)}
// //                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60">+</button>
// //                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", -1)}
// //                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">−</button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Counter Allocations table */}
// //       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
// //         <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
// //           <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
// //      <button
// //             type="button"
// //             onClick={handleExportAllocationsPdf}
// //             className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
// //           >
// //             ⬇ Export PDF
// //           </button>
// //         </div>
// //         <div className="overflow-x-auto">
// //           <table className="w-full border-collapse text-left text-xs">
// //             <thead>
// //               <tr className="bg-blue-900 font-semibold text-white">
// //                 <th className="p-2.5">Counter</th>
// //                 <th className="p-2.5">Pool</th>
// //                 <th className="p-2.5 text-center">Assigned</th>
// //                 <th className="p-2.5 text-center">Used</th>
// //                 <th className="p-2.5 text-center">Remaining</th>
// //               </tr>
// //             </thead>
// //             <tbody className="divide-y divide-slate-200">
// //               {allocations.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No allocations yet.</td></tr>}
// //               {allocations.map((a) => (
// //                 <tr key={a.id} className="hover:bg-slate-50">
// //                   <td className="p-2.5 font-bold text-slate-900">{a.counter_name}</td>
// //                   <td className="p-2.5"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>{a.roll_type}</span></td>
// //                   <td className="p-2.5 text-center font-mono">{a.assigned_count}</td>
// //                   <td className="p-2.5 text-center font-mono text-emerald-700">{a.used_count}</td>
// //                   <td className="p-2.5 text-center font-mono text-amber-700">{a.remaining_count}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { exportToPDF } from "../utils/pdfExport";
// import {
//   fetchPools, setPoolTotal, fetchAllocations, assignAllocation,
//   adjustPoolTotal, adjustAllocation,
// } from "../api/ballots";
// import { fetchLogins } from "../api/users";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";

// const Icons = {
//   Layers: (props) => (
//     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//     </svg>
//   ),
//   Users: (props) => (
//     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//     </svg>
//   ),
//   Refresh: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
//     </svg>
//   ),
//   Search: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
//     </svg>
//   ),
//   CheckCircle: (props) => (
//     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//     </svg>
//   ),
//   Sliders: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
//     </svg>
//   ),
//   Plus: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
//     </svg>
//   ),
//   Download: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
//     </svg>
//   ),
//   Table: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zm0 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M9 3.75v16.5m6-16.5v16.5" />
//     </svg>
//   ),
//   LayoutGrid: (props) => (
//     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
//     </svg>
//   ),
// };

// export default function PoolAllotment() {
//   const { showToast } = useToast();
//   const [pools, setPools] = useState([]);
//   const [counters, setCounters] = useState([]);
//   const [allocations, setAllocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [viewMode, setViewMode] = useState("table");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [poolFilter, setPoolFilter] = useState("all");

//   const [poolForm, setPoolForm] = useState({ category: "", exclusive: "" });
//   const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
//   const [poolAdjustForm, setPoolAdjustForm] = useState({ category: "", exclusive: "" });
//   const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });

//   const [saving, setSaving] = useState(false);
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

//   const analytics = useMemo(() => {
//     const categoryPool = pools.find((p) => p.roll_type === "category")?.total_ballots || 0;
//     const exclusivePool = pools.find((p) => p.roll_type === "exclusive")?.total_ballots || 0;
//     const categoryAllocated = allocations.filter((a) => a.roll_type === "category").reduce((s, a) => s + a.assigned_count, 0);
//     const categoryUsed = allocations.filter((a) => a.roll_type === "category").reduce((s, a) => s + a.used_count, 0);
//     const exclusiveAllocated = allocations.filter((a) => a.roll_type === "exclusive").reduce((s, a) => s + a.assigned_count, 0);
//     const exclusiveUsed = allocations.filter((a) => a.roll_type === "exclusive").reduce((s, a) => s + a.used_count, 0);

//     return {
//       category: {
//         total: categoryPool, allocated: categoryAllocated,
//         unallocated: Math.max(0, categoryPool - categoryAllocated), used: categoryUsed,
//         utilization: categoryPool > 0 ? Math.round((categoryAllocated / categoryPool) * 100) : 0,
//       },
//       exclusive: {
//         total: exclusivePool, allocated: exclusiveAllocated,
//         unallocated: Math.max(0, exclusivePool - exclusiveAllocated), used: exclusiveUsed,
//         utilization: exclusivePool > 0 ? Math.round((exclusiveAllocated / exclusivePool) * 100) : 0,
//       },
//       totalBallots: categoryPool + exclusivePool,
//       totalAllocated: categoryAllocated + exclusiveAllocated,
//       totalRemainingUnassigned: Math.max(0, categoryPool + exclusivePool - (categoryAllocated + exclusiveAllocated)),
//       activeCounters: new Set(allocations.map((a) => a.counter)).size,
//     };
//   }, [pools, allocations]);

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
//       showToast("success", sign > 0 ? "Ballots added" : "Ballots subtracted",
//         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} the base pool.`);
//       setPoolAdjustForm((f) => ({ ...f, [rollType]: "" }));
//       load();
//     } catch (err) {
//       showToast("danger", "Could not adjust pool", getErrorMessage(err));
//     } finally {
//       setAdjusting(false);
//     }
//   }

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
//       showToast("success", sign > 0 ? "Ballots added" : "Ballots subtracted",
//         `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`);
//       setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
//       load();
//     } catch (err) {
//       showToast("danger", "Could not adjust allocation", getErrorMessage(err));
//     } finally {
//       setAdjusting(false);
//     }
//   }

//   const filteredAllocations = useMemo(() => {
//     return allocations.filter((item) => {
//       const matchesSearch = item.counter_name.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesPool = poolFilter === "all" || item.roll_type === poolFilter;
//       return matchesSearch && matchesPool;
//     });
//   }, [allocations, searchTerm, poolFilter]);

//   function handleExportPdf() {
//     if (filteredAllocations.length === 0) {
//       showToast("warning", "Nothing to export", "There are no allocations yet.");
//       return;
//     }
//     const rows = filteredAllocations.map((a) => ({
//       "Counter Name": a.counter_name,
//       "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
//       "Assigned": a.assigned_count,
//       "Used": a.used_count,
//       "Remaining": a.remaining_count,
//     }));
//     exportToPDF({
//       title: "Counter Allocations Report",
//       rows,
//       filename: `counter-allocations-${new Date().toISOString().slice(0, 10)}`,
//     });
//     showToast("success", "Export generated", "Counter allocations exported to PDF successfully.");
//   }

//   if (loading) {
//     return <div className="w-full px-3 py-12 text-center text-slate-500 font-medium">Loading ballot pool data…</div>;
//   }

//   return (
//     <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans p-3 sm:p-5 md:p-6 space-y-4">
//       <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
//         <div className="flex items-center gap-3">
//           <div className="rounded-lg bg-slate-900 p-2.5 text-white shadow-sm">
//             <Icons.Layers className="h-6 w-6" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold text-slate-900 leading-tight">Pool Allotment &amp; Distribution</h1>
//             <p className="text-xs text-slate-500">Manage base ballot supplies and Counter allocations</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2 shrink-0">
//           <button
//             onClick={() => { load(); showToast("info", "Data Synced", "Base pools and allocations refreshed."); }}
//             className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
//           >
//             <Icons.Refresh className="h-3.5 w-3.5 text-slate-500" />
//             Refresh
//           </button>
//           <button
//             onClick={handleExportPdf}
//             className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
//           >
//             <Icons.Download className="h-4 w-4" />
//             Export PDF
//           </button>
//         </div>
//       </header>

//       {error && (
//         <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
//           {error}
//         </div>
//       )}

//       <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
//         <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm transition-all hover:shadow-md">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Category Pool</span>
//             <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
//               {analytics.category.utilization}% Allocated
//             </span>
//           </div>
//           <div className="mt-2 flex items-baseline gap-2">
//             <span className="text-2xl font-black text-slate-900 font-mono">{analytics.category.total.toLocaleString()}</span>
//             <span className="text-xs font-medium text-purple-700">Total Ballots</span>
//           </div>
//           <div className="mt-3 space-y-1 text-xs">
//             <div className="flex justify-between text-slate-600">
//               <span>Allocated to Counters:</span>
//               <span className="font-mono font-bold text-slate-900">{analytics.category.allocated}</span>
//             </div>
//             <div className="flex justify-between text-slate-600">
//               <span>Unallocated Reserve:</span>
//               <span className="font-mono font-bold text-emerald-700">{analytics.category.unallocated}</span>
//             </div>
//             <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-purple-200/60">
//               <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${Math.min(100, analytics.category.utilization)}%` }} />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm transition-all hover:shadow-md">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Exclusive Pool</span>
//             <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
//               {analytics.exclusive.utilization}% Allocated
//             </span>
//           </div>
//           <div className="mt-2 flex items-baseline gap-2">
//             <span className="text-2xl font-black text-slate-900 font-mono">{analytics.exclusive.total.toLocaleString()}</span>
//             <span className="text-xs font-medium text-amber-800">Total Ballots</span>
//           </div>
//           <div className="mt-3 space-y-1 text-xs">
//             <div className="flex justify-between text-slate-600">
//               <span>Allocated to Counters:</span>
//               <span className="font-mono font-bold text-slate-900">{analytics.exclusive.allocated}</span>
//             </div>
//             <div className="flex justify-between text-slate-600">
//               <span>Unallocated Reserve:</span>
//               <span className="font-mono font-bold text-amber-800">{analytics.exclusive.unallocated}</span>
//             </div>
//             <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/60">
//               <div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${Math.min(100, analytics.exclusive.utilization)}%` }} />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Supply</span>
//             <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">System Total</span>
//           </div>
//           <div className="mt-2 flex items-baseline gap-2">
//             <span className="text-2xl font-black text-slate-900 font-mono">{analytics.totalBallots.toLocaleString()}</span>
//             <span className="text-xs font-medium text-slate-500">Cumulative</span>
//           </div>
//           <div className="mt-3 space-y-1 text-xs">
//             <div className="flex justify-between text-slate-600">
//               <span>Total Distributed:</span>
//               <span className="font-mono font-bold text-blue-700">{analytics.totalAllocated}</span>
//             </div>
//             <div className="flex justify-between text-slate-600">
//               <span>Total Available:</span>
//               <span className="font-mono font-bold text-emerald-700">{analytics.totalRemainingUnassigned}</span>
//             </div>
//             <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
//               <div className="h-full bg-slate-800 transition-all duration-300" style={{ width: `${analytics.totalBallots > 0 ? Math.round((analytics.totalAllocated / analytics.totalBallots) * 100) : 0}%` }} />
//             </div>
//           </div>
//         </div>

//         <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm transition-all hover:shadow-md">
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Counters</span>
//             <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
//               {counters.length} Registered
//             </span>
//           </div>
//           <div className="mt-2 flex items-baseline gap-2">
//             <span className="text-2xl font-black text-slate-900 font-mono">{analytics.activeCounters}</span>
//             <span className="text-xs font-medium text-blue-700">Active Stations</span>
//           </div>
//           <div className="mt-3 space-y-1 text-xs">
//             <div className="flex justify-between text-slate-600">
//               <span>Total Used Ballots:</span>
//               <span className="font-mono font-bold text-emerald-700">{analytics.category.used + analytics.exclusive.used}</span>
//             </div>
//             <div className="flex justify-between text-slate-600">
//               <span>Available Counter Logins:</span>
//               <span className="font-mono font-bold text-slate-900">{counters.length}</span>
//             </div>
//             <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
//               <Icons.CheckCircle className="h-3.5 w-3.5" />
//               <span>All data synchronized</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//         {/* <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center gap-1.5 mb-1">
//             <Icons.Sliders className="h-4 w-4 text-purple-700" />
//             <h2 className="text-sm font-bold text-slate-900">Base Ballot Pools</h2>
//           </div>
//           <p className="mb-3 text-[11px] text-slate-500">Set the total ballots available, per pool type.</p>
//           <form onSubmit={handleSetTotals} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             <div>
//               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category Pool Total</label>
//               <input type="number" min="0" value={poolForm.category} onChange={(e) => setPoolForm((f) => ({ ...f, category: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="e.g. 5000" />
//             </div>
//             <div>
//               <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive Pool Total</label>
//               <input type="number" min="0" value={poolForm.exclusive} onChange={(e) => setPoolForm((f) => ({ ...f, exclusive: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" placeholder="e.g. 3500" />
//             </div>
//             <div className="sm:col-span-2">
//               <button type="submit" disabled={saving} className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 disabled:opacity-60 sm:w-auto shadow-sm transition-all">
//                 {saving ? "Saving…" : "Save Pool Totals"}
//               </button>
//             </div>
//           </form>
//         </div> */}

//         {/* <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"> */}
//           {/* <div className="flex items-center gap-1.5 mb-1">
//             <Icons.Plus className="h-4 w-4 text-emerald-700" />
//             <h2 className="text-sm font-bold text-slate-900">Add / Subtract Base Pool</h2>
//           </div>
//           <p className="mb-3 text-[11px] text-slate-500">Adjust by an amount instead of setting a new total.</p>
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
//               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
//               <div className="flex items-center gap-1.5">
//                 <input type="number" min="0" placeholder="Amount" value={poolAdjustForm.category}
//                   onChange={(e) => setPoolAdjustForm((f) => ({ ...f, category: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", 1)}
//                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("category", -1)}
//                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
//               </div>
//             </div>
//             <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
//               <label className="mb-1 block text-[11px] font-bold text-amber-800">Exclusive</label>
//               <div className="flex items-center gap-1.5">
//                 <input type="number" min="0" placeholder="Amount" value={poolAdjustForm.exclusive}
//                   onChange={(e) => setPoolAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", 1)}
//                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustPool("exclusive", -1)}
//                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
//               </div>
//             </div>
//           </div> */}
//         {/* </div> */}
//       </div>

//       {/* <div className="grid grid-cols-1 gap-4 xl:grid-cols-2"> */}
//       <div className="grid grid-cols-1 gap-4">
//         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center gap-1.5 mb-1">
//             <Icons.Users className="h-4 w-4 text-blue-700" />
//             <h2 className="text-sm font-bold text-slate-900">Assign to Counter</h2>
//           </div>
//           <p className="mb-3 text-[11px] text-slate-500">Allot a portion of each pool to a Counter login.</p>
//           <form onSubmit={handleAssign} className="space-y-3">
//             <div>
//               <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
//               <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
//                 className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
//                 <option value="">Select a Counter…</option>
//                 {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
//               </select>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
//                 <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="Quantity" />
//               </div>
//               <div>
//                 <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
//                 <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" placeholder="Quantity" />
//               </div>
//             </div>
//             <button type="submit" disabled={saving} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-60 sm:w-auto shadow-sm transition-all">
//               {saving ? "Assigning…" : "Assign Ballots"}
//             </button>
//           </form>
//         </div>

//         <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
//           <div className="flex items-center gap-1.5 mb-1">
//             <Icons.Sliders className="h-4 w-4 text-slate-700" />
//             <h2 className="text-sm font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
//           </div>
//           <p className="mb-3 text-[11px] text-slate-500">Adjust a Counter's assigned ballots by an amount.</p>
//           <div className="mb-3">
//             <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
//             <select value={allocationAdjustForm.counter} onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
//               className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
//               <option value="">Select a Counter…</option>
//               {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
//             </select>
//           </div>
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
//               <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
//               <div className="flex items-center gap-1.5">
//                 <input type="number" min="0" placeholder="Amount" value={allocationAdjustForm.category}
//                   onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", 1)}
//                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", -1)}
//                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
//               </div>
//             </div>
//             <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
//               <label className="mb-1 block text-[11px] font-bold text-amber-800">Exclusive</label>
//               <div className="flex items-center gap-1.5">
//                 <input type="number" min="0" placeholder="Amount" value={allocationAdjustForm.exclusive}
//                   onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
//                   className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", 1)}
//                   className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
//                 <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", -1)}
//                   className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
//           <div>
//             <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
//             <p className="text-[11px] text-slate-500">Live summary of assigned and consumed ballots per Counter</p>
//           </div>
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="relative min-w-[180px]">
//               <Icons.Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
//               <input
//                 type="text" placeholder="Search counter…" value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>
//             <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)}
//               className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none">
//               <option value="all">All Pools</option>
//               <option value="category">Category Only</option>
//               <option value="exclusive">Exclusive Only</option>
//             </select>
//             <div className="flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
//               <button onClick={() => setViewMode("table")}
//                 className={`rounded-md p-1 transition-all ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
//                 title="Table View">
//                 <Icons.Table className="h-4 w-4" />
//               </button>
//               <button onClick={() => setViewMode("grid")}
//                 className={`rounded-md p-1 transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
//                 title="Grid View">
//                 <Icons.LayoutGrid className="h-4 w-4" />
//               </button>
//             </div>
//             <button type="button" onClick={handleExportPdf}
//               className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all">
//               <Icons.Download className="h-3.5 w-3.5" />
//               Export PDF
//             </button>
//           </div>
//         </div>

//         {viewMode === "table" ? (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse text-left text-xs">
//               <thead>
//                 <tr className="bg-blue-900 font-semibold text-white">
//                   <th className="p-3">Counter</th>
//                   <th className="p-3">Pool</th>
//                   <th className="p-3 text-center">Assigned</th>
//                   <th className="p-3 text-center">Used</th>
//                   <th className="p-3 text-center">Remaining</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-200">
//                 {filteredAllocations.length === 0 ? (
//                   <tr><td colSpan={5} className="p-6 text-center text-slate-400">No matching counter allocations found.</td></tr>
//                 ) : (
//                   filteredAllocations.map((a) => (
//                     <tr key={a.id} className="transition-colors hover:bg-slate-50">
//                       <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
//                         <Icons.Users className="h-4 w-4 text-slate-400 shrink-0" />
//                         {a.counter_name}
//                       </td>
//                       <td className="p-3">
//                         <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.roll_type === "category" ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
//                           {a.roll_type}
//                         </span>
//                       </td>
//                       <td className="p-3 text-center font-mono font-medium text-slate-800">{a.assigned_count.toLocaleString()}</td>
//                       <td className="p-3 text-center font-mono font-bold text-emerald-700">{a.used_count.toLocaleString()}</td>
//                       <td className="p-3 text-center font-mono font-bold text-amber-700">{a.remaining_count.toLocaleString()}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
//             {filteredAllocations.length === 0 ? (
//               <p className="col-span-full text-center text-slate-400 py-6">No matching counter allocations found.</p>
//             ) : (
//               filteredAllocations.map((a) => (
//                 <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-slate-300 transition-all">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h4 className="font-bold text-slate-900 text-xs">{a.counter_name}</h4>
//                       <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
//                         {a.roll_type}
//                       </span>
//                     </div>
//                     <span className="font-mono text-[11px] font-bold text-slate-500">
//                       {a.assigned_count ? Math.round((a.remaining_count / a.assigned_count) * 100) : 0}% left
//                     </span>
//                   </div>
//                   <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px]">
//                     <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
//                       <div className="text-[10px] text-slate-400">Assigned</div>
//                       <div className="font-mono font-bold text-slate-800">{a.assigned_count}</div>
//                     </div>
//                     <div className="rounded-lg bg-emerald-50/60 p-1.5 border border-emerald-100">
//                       <div className="text-[10px] text-emerald-700">Used</div>
//                       <div className="font-mono font-bold text-emerald-700">{a.used_count}</div>
//                     </div>
//                     <div className="rounded-lg bg-amber-50/60 p-1.5 border border-amber-100">
//                       <div className="text-[10px] text-amber-700">Remaining</div>
//                       <div className="font-mono font-bold text-amber-800">{a.remaining_count}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// } 


import { useState, useEffect, useMemo, useCallback } from "react";
import { exportToPDF } from "../utils/pdfExport";
import {
  fetchPools, fetchAllocations, assignAllocation, adjustAllocation,
} from "../api/ballots";
import { fetchLogins } from "../api/users";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

const Icons = {
  Layers: (props) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Users: (props) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Refresh: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Search: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  CheckCircle: (props) => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sliders: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
  Download: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  Table: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zm0 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M9 3.75v16.5m6-16.5v16.5" />
    </svg>
  ),
  LayoutGrid: (props) => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
};

export default function PoolAllotment() {
  const { showToast } = useToast();
  const [pools, setPools] = useState([]);
  const [counters, setCounters] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const [searchTerm, setSearchTerm] = useState("");
  const [poolFilter, setPoolFilter] = useState("all");

  const [assignForm, setAssignForm] = useState({ counter: "", category: "", exclusive: "" });
  const [allocationAdjustForm, setAllocationAdjustForm] = useState({ counter: "", category: "", exclusive: "" });

  const [saving, setSaving] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, a] = await Promise.all([fetchPools(), fetchLogins(), fetchAllocations()]);
      setPools(p);
      setCounters(c.filter((u) => u.role === "supervisor"));
      setAllocations(a);
    } catch (err) {
      setError(getErrorMessage(err, "Pool data could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const analytics = useMemo(() => {
    const categoryAllocated = allocations.filter((a) => a.roll_type === "category").reduce((s, a) => s + a.assigned_count, 0);
    const categoryUsed = allocations.filter((a) => a.roll_type === "category").reduce((s, a) => s + a.used_count, 0);
    const exclusiveAllocated = allocations.filter((a) => a.roll_type === "exclusive").reduce((s, a) => s + a.assigned_count, 0);
    const exclusiveUsed = allocations.filter((a) => a.roll_type === "exclusive").reduce((s, a) => s + a.used_count, 0);

    return {
      category: { allocated: categoryAllocated, used: categoryUsed, remaining: categoryAllocated - categoryUsed },
      exclusive: { allocated: exclusiveAllocated, used: exclusiveUsed, remaining: exclusiveAllocated - exclusiveUsed },
      totalAllocated: categoryAllocated + exclusiveAllocated,
      totalUsed: categoryUsed + exclusiveUsed,
      activeCounters: new Set(allocations.map((a) => a.counter)).size,
    };
  }, [allocations]);

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
      showToast("success", sign > 0 ? "Ballots added" : "Ballots subtracted",
        `${Math.abs(delta)} ${rollType} ballot(s) ${sign > 0 ? "added to" : "removed from"} that Counter's allocation.`);
      setAllocationAdjustForm((f) => ({ ...f, [rollType]: "" }));
      load();
    } catch (err) {
      showToast("danger", "Could not adjust allocation", getErrorMessage(err));
    } finally {
      setAdjusting(false);
    }
  }

  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const matchesSearch = item.counter_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPool = poolFilter === "all" || item.roll_type === poolFilter;
      return matchesSearch && matchesPool;
    });
  }, [allocations, searchTerm, poolFilter]);

  function handleExportPdf() {
    if (filteredAllocations.length === 0) {
      showToast("warning", "Nothing to export", "There are no allocations yet.");
      return;
    }
    const rows = filteredAllocations.map((a) => ({
      "Counter Name": a.counter_name,
      "Pool": a.roll_type === "category" ? "Category" : "Exclusive",
      "Assigned": a.assigned_count,
      "Used": a.used_count,
      "Remaining": a.remaining_count,
    }));
    exportToPDF({
      title: "Counter Allocations Report",
      rows,
      filename: `counter-allocations-${new Date().toISOString().slice(0, 10)}`,
    });
    showToast("success", "Export generated", "Counter allocations exported to PDF successfully.");
  }

  if (loading) {
    return <div className="w-full px-3 py-12 text-center text-slate-500 font-medium">Loading ballot allocation data…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans p-3 sm:p-5 md:p-6 space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-slate-900 p-2.5 text-white shadow-sm">
            <Icons.Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Counter Ballot Allocation</h1>
            <p className="text-xs text-slate-500">Assign and adjust ballot supply for each Counter</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { load(); showToast("info", "Data Synced", "Allocations refreshed."); }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 shadow-sm"
          >
            <Icons.Refresh className="h-3.5 w-3.5 text-slate-500" />
            Refresh
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
          >
            <Icons.Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Category Pool</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{analytics.category.allocated.toLocaleString()}</span>
            <span className="text-xs font-medium text-purple-700">Assigned</span>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Used:</span>
              <span className="font-mono font-bold text-slate-900">{analytics.category.used}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining:</span>
              <span className="font-mono font-bold text-emerald-700">{analytics.category.remaining}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Exclusive Pool</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{analytics.exclusive.allocated.toLocaleString()}</span>
            <span className="text-xs font-medium text-amber-800">Assigned</span>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Used:</span>
              <span className="font-mono font-bold text-slate-900">{analytics.exclusive.used}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining:</span>
              <span className="font-mono font-bold text-amber-800">{analytics.exclusive.remaining}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Total Assigned</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{analytics.totalAllocated.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">Ballots</span>
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Distributed to Members:</span>
              <span className="font-mono font-bold text-blue-700">{analytics.totalUsed}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Counters</span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
              {counters.length} Registered
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{analytics.activeCounters}</span>
            <span className="text-xs font-medium text-blue-700">Active Stations</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <Icons.CheckCircle className="h-3.5 w-3.5" />
            <span>All data synchronized</span>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Icons.Users className="h-4 w-4 text-blue-700" />
          <h2 className="text-sm font-bold text-slate-900">Assign to Counter</h2>
        </div>
        <p className="mb-3 text-[11px] text-slate-500">Allot ballots to a Counter login.</p>
        <form onSubmit={handleAssign} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
            <select value={assignForm.counter} onChange={(e) => setAssignForm((f) => ({ ...f, counter: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Select a Counter…</option>
              {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
            <input type="number" min="0" value={assignForm.category} onChange={(e) => setAssignForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" placeholder="Quantity" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-amber-700">Exclusive</label>
            <input type="number" min="0" value={assignForm.exclusive} onChange={(e) => setAssignForm((f) => ({ ...f, exclusive: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" placeholder="Quantity" />
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 disabled:opacity-60 shadow-sm transition-all">
            {saving ? "Assigning…" : "Assign Ballots"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Icons.Sliders className="h-4 w-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">Add / Subtract Counter Allocation</h2>
        </div>
        <p className="mb-3 text-[11px] text-slate-500">Adjust a Counter's assigned ballots by an amount.</p>
        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-bold text-slate-700">Counter</label>
          <select value={allocationAdjustForm.counter} onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, counter: e.target.value }))}
            className="w-full max-w-sm rounded-lg border border-slate-300 p-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Select a Counter…</option>
            {counters.map((c) => <option key={c.id} value={c.id}>{[c.first_name, c.last_name].filter(Boolean).join(" ") || c.username}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3">
            <label className="mb-1 block text-[11px] font-bold text-purple-700">Category</label>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" placeholder="Amount" value={allocationAdjustForm.category}
                onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
              <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", 1)}
                className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
              <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("category", -1)}
                className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
            <label className="mb-1 block text-[11px] font-bold text-amber-800">Exclusive</label>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" placeholder="Amount" value={allocationAdjustForm.exclusive}
                onChange={(e) => setAllocationAdjustForm((f) => ({ ...f, exclusive: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
              <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", 1)}
                className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-60 shadow-sm">+</button>
              <button type="button" disabled={adjusting} onClick={() => handleAdjustAllocation("exclusive", -1)}
                className="shrink-0 rounded-lg bg-rose-600 px-2.5 py-2 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-60 shadow-sm">−</button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Counter Allocations</h3>
            <p className="text-[11px] text-slate-500">Live summary of assigned and consumed ballots per Counter</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Icons.Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text" placeholder="Search counter…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select value={poolFilter} onChange={(e) => setPoolFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none">
              <option value="all">All Pools</option>
              <option value="category">Category Only</option>
              <option value="exclusive">Exclusive Only</option>
            </select>
            <div className="flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
              <button onClick={() => setViewMode("table")}
                className={`rounded-md p-1 transition-all ${viewMode === "table" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`} title="Table View">
                <Icons.Table className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("grid")}
                className={`rounded-md p-1 transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`} title="Grid View">
                <Icons.LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-blue-900 font-semibold text-white">
                  <th className="p-3">Counter</th>
                  <th className="p-3">Pool</th>
                  <th className="p-3 text-center">Assigned</th>
                  <th className="p-3 text-center">Used</th>
                  <th className="p-3 text-center">Remaining</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAllocations.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">No matching counter allocations found.</td></tr>
                ) : (
                  filteredAllocations.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <Icons.Users className="h-4 w-4 text-slate-400 shrink-0" />
                        {a.counter_name}
                      </td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${a.roll_type === "category" ? "bg-purple-100 text-purple-800 border border-purple-200" : "bg-amber-100 text-amber-800 border border-amber-200"}`}>
                          {a.roll_type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-medium text-slate-800">{a.assigned_count.toLocaleString()}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">{a.used_count.toLocaleString()}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-700">{a.remaining_count.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAllocations.length === 0 ? (
              <p className="col-span-full text-center text-slate-400 py-6">No matching counter allocations found.</p>
            ) : (
              filteredAllocations.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{a.counter_name}</h4>
                      <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${a.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
                        {a.roll_type}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {a.assigned_count ? Math.round((a.remaining_count / a.assigned_count) * 100) : 0}% left
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-1.5 border border-slate-100">
                      <div className="text-[10px] text-slate-400">Assigned</div>
                      <div className="font-mono font-bold text-slate-800">{a.assigned_count}</div>
                    </div>
                    <div className="rounded-lg bg-emerald-50/60 p-1.5 border border-emerald-100">
                      <div className="text-[10px] text-emerald-700">Used</div>
                      <div className="font-mono font-bold text-emerald-700">{a.used_count}</div>
                    </div>
                    <div className="rounded-lg bg-amber-50/60 p-1.5 border border-amber-100">
                      <div className="text-[10px] text-amber-700">Remaining</div>
                      <div className="font-mono font-bold text-amber-800">{a.remaining_count}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}