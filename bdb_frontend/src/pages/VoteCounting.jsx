// import { useState, useEffect, useCallback, useRef } from "react";
// import {
//   fetchCategories, fetchCandidates, recordBallot, fetchRecentBallots,
//   deleteBallot, fetchLiveTotals, startCounting, completeCounting,
// } from "../api/counting";
// import { useAuth } from "../context/AuthContext";
// import { getErrorMessage } from "../api/client";
// import Alert from "../components/Alert";

// export default function VoteCounting() {
//   const [categories, setCategories] = useState([]);
//   const { user } = useAuth();
//   const isAdmin = user?.role === "admin";
//   const [starting, setStarting] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [recentBallots, setRecentBallots] = useState([]);
//   const [totals, setTotals] = useState(null);

//   const [ballotNo, setBallotNo] = useState("");
//   const [picked, setPicked] = useState([]);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const ballotInputRef = useRef(null);

//   const loadCategories = useCallback(async () => {
//     try {
//       const data = await fetchCategories();
//       setCategories(data);
//       const inProgress = data.find((c) => c.status === "in_progress");
//       setActiveCategory(inProgress || null);
//     } catch (err) {
//       setError(getErrorMessage(err, "The election categories could not be loaded."));
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   async function handleStart(categoryId) {
//     setStarting(true);
//     setError("");
//     try {
//       await startCounting(categoryId);
//       setNotice("Category opened for counting.");
//       await loadCategories();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not start this category."));
//     } finally {
//       setStarting(false);
//     }
//   }

//   async function handleComplete(categoryId) {
//     setStarting(true);
//     setError("");
//     try {
//       await completeCounting(categoryId);
//       setNotice("Category marked as completed.");
//       await loadCategories();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not complete this category."));
//     } finally {
//       setStarting(false);
//     }
//   }

//   useEffect(() => { loadCategories(); }, [loadCategories]);

//   const refreshCategoryData = useCallback(async (categoryId) => {
//     try {
//       const [cands, ballots, live] = await Promise.all([
//         fetchCandidates(categoryId),
//         fetchRecentBallots(categoryId),
//         fetchLiveTotals(categoryId),
//       ]);
//       setCandidates(cands);
//       setRecentBallots(ballots);
//       setTotals(live);
//     } catch (err) {
//       setError(getErrorMessage(err, "This category's counting data could not be loaded."));
//     }
//   }, []);

//   useEffect(() => {
//     if (activeCategory) refreshCategoryData(activeCategory.id);
//   }, [activeCategory, refreshCategoryData]);

//   const votesRequired = activeCategory?.votes_per_ballot ?? 0;
//   const canSave = ballotNo.trim() !== "" && picked.length === votesRequired;

//   function togglePick(serial) {
//     setPicked((prev) => {
//       if (prev.includes(serial)) return prev.filter((s) => s !== serial);
//       if (prev.length >= votesRequired) return prev;  // never exceed what the ballot allows
//       return [...prev, serial];
//     });
//   }

//   function clearEntry() {
//     setBallotNo("");
//     setPicked([]);
//     ballotInputRef.current?.focus();
//   }

//   async function handleSave() {
//     if (!canSave) return;
//     setSaving(true);
//     setError("");
//     try {
//       await recordBallot(activeCategory.id, Number(ballotNo), picked);
//       setNotice(`Ballot ${ballotNo} saved.`);
//       clearEntry();
//       await refreshCategoryData(activeCategory.id);
//     } catch (err) {
//       setError(getErrorMessage(err, "This ballot could not be saved. Please check the entry and try again."));
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(ballot) {
//     setError("");
//     try {
//       await deleteBallot(ballot.id, "Corrected during counting");
//       setNotice(`Ballot ${ballot.ballot_no} removed.`);
//       await refreshCategoryData(activeCategory.id);
//     } catch (err) {
//       setError(getErrorMessage(err, "That ballot could not be removed."));
//     }
//   }

//   if (loading) {
//     return <div className="mx-auto max-w-5xl px-6 py-8 text-steel-400">Loading counting screen…</div>;
//   }

//   return (
//     <div className="mx-auto max-w-5xl px-6 py-8">
//       <header className="mb-6">
//         <h1 className="brand-serif text-3xl font-semibold text-navy-950">Vote Counting</h1>
//         <p className="mt-1 text-sm text-steel-400">
//           Enter each ballot number and mark the candidates it voted for.
//         </p>
//       </header>

//       {notice && <div className="mb-4"><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
//       {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

//       {/* Category strip — only the in-progress one is usable, the rest stay disabled */}

//       <div className="mb-6 flex flex-wrap gap-2">
//         {categories.map((cat) => {
//           const isActive = activeCategory?.id === cat.id;
//           const done = cat.status === "completed";
//           const locked = !isActive && !done;
//           return (
//             <div
//               key={cat.id}
//               className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${
//                 isActive
//                   ? "border-navy-900 bg-navy-900 text-white"
//                   : done
//                   ? "border-verified-600/30 bg-verified-100 text-verified-600"
//                   : "border-steel-200 bg-white text-steel-400"
//               }`}
//             >
//               <div>
//                 <span className="font-medium">{cat.name}</span>
//                 <span className="ml-2 text-xs opacity-80">
//                   {done ? "Completed" : cat.status === "in_progress" ? "In progress" : "Locked"}
//                 </span>
//               </div>

//               {isAdmin && locked && !activeCategory && (
//                 <button
//                   onClick={() => handleStart(cat.id)}
//                   disabled={starting}
//                   className="ml-2 rounded bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
//                 >
//                   Start
//                 </button>
//               )}

//               {isAdmin && isActive && (
//                 <button
//                   onClick={() => handleComplete(cat.id)}
//                   disabled={starting}
//                   className="ml-2 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
//                 >
//                   Complete
//                 </button>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {!activeCategory ? (
//         <Alert type="info">
//           No category is currently open for counting. A Super Admin needs to start one before ballots can be entered.
//         </Alert>
//       ) : (
//         <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
//           {/* Entry panel */}
//           <section className="rounded-xl border border-steel-200 bg-white p-6">
//             <div className="mb-4 flex items-baseline justify-between">
//               <h2 className="text-lg font-semibold text-navy-950">{activeCategory.name}</h2>
//               <span className="text-sm text-steel-400">
//                 {votesRequired} vote{votesRequired === 1 ? "" : "s"} per ballot
//               </span>
//             </div>

//             <label htmlFor="ballotNo" className="mb-1 block text-sm font-medium text-navy-800">
//               Ballot number
//             </label>
//             <input
//               id="ballotNo"
//               ref={ballotInputRef}
//               type="number"
//               min="1"
//               value={ballotNo}
//               onChange={(e) => setBallotNo(e.target.value)}
//               placeholder="e.g. 101"
//               className="mb-5 w-full rounded-lg border border-steel-200 px-4 py-3 font-mono text-navy-950 placeholder:text-steel-300 outline-none transition focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
//             />

//             <div className="mb-2 flex items-center justify-between">
//               <span className="text-sm font-medium text-navy-800">Candidates voted for</span>
//               <span className={`text-sm font-medium ${picked.length === votesRequired ? "text-verified-600" : "text-pending-600"}`}>
//                 {picked.length} of {votesRequired} selected
//               </span>
//             </div>

//             <ul className="mb-5 space-y-2">
//               {candidates.map((c) => {
//                 const isPicked = picked.includes(c.serial_no);
//                 const atLimit = !isPicked && picked.length >= votesRequired;
//                 return (
//                   <li key={c.id}>
//                     <button
//                       type="button"
//                       onClick={() => togglePick(c.serial_no)}
//                       disabled={atLimit}
//                       className={`tap-target flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition ${
//                         isPicked
//                           ? "border-navy-900 bg-ice-100"
//                           : atLimit
//                           ? "cursor-not-allowed border-steel-200 bg-white opacity-50"
//                           : "border-steel-200 bg-white hover:bg-ice-50"
//                       }`}
//                     >
//                       <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold ${
//                         isPicked ? "bg-navy-900 text-white" : "bg-steel-200 text-navy-800"
//                       }`}>
//                         {c.serial_no}
//                       </span>
//                       <span className="min-w-0 flex-1">
//                         <span className="block truncate font-medium text-navy-950">{c.candidate_name}</span>
//                         {c.member_name && (
//                           <span className="block truncate text-sm text-steel-400">{c.member_name}</span>
//                         )}
//                       </span>
//                       {isPicked && <span className="text-verified-600" aria-hidden="true">✓</span>}
//                     </button>
//                   </li>
//                 );
//               })}
//             </ul>

//             <div className="flex gap-3">
//               <button
//                 onClick={handleSave}
//                 disabled={!canSave || saving}
//                 className="tap-target rounded-lg bg-verified-600 px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {saving ? "Saving…" : "Save Ballot"}
//               </button>
//               <button
//                 onClick={clearEntry}
//                 className="tap-target rounded-lg px-6 py-2.5 font-medium text-steel-400 transition hover:text-navy-800"
//               >
//                 Ignore
//               </button>
//             </div>

//             {!canSave && ballotNo && picked.length !== votesRequired && (
//               <p className="mt-3 text-sm text-pending-600">
//                 Select exactly {votesRequired} candidate{votesRequired === 1 ? "" : "s"} before saving this ballot.
//               </p>
//             )}
//           </section>

//           {/* Running totals + recent entries */}
//           <aside className="space-y-4">
//             {totals && (
//               <div className="rounded-xl border border-steel-200 bg-white p-5">
//                 <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-steel-400">
//                   Running total
//                 </h3>
//                 <dl className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <dt className="text-navy-800">Total ballots entered</dt>
//                     <dd className="font-mono font-semibold text-navy-950">{totals.total_ballots}</dd>
//                   </div>
//                   <div className="flex justify-between">
//                     <dt className="text-navy-800">Total votes entered</dt>
//                     <dd className="font-mono font-semibold text-navy-950">{totals.total_votes}</dd>
//                   </div>
//                 </dl>
//               </div>
//             )}

//             <div className="rounded-xl border border-steel-200 bg-white p-5">
//               <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-steel-400">
//                 Recent ballots
//               </h3>
//               {recentBallots.length === 0 ? (
//                 <p className="text-sm text-steel-400">No ballots entered yet.</p>
//               ) : (
//                 <ul className="space-y-1.5">
//                   {recentBallots.slice(0, 10).map((b) => (
//                     <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
//                       <span className="font-mono text-navy-950">#{b.ballot_no}</span>
//                       <span className="text-steel-400">{b.candidate_serials.join(", ")}</span>
//                       <button
//                         onClick={() => handleDelete(b)}
//                         className="text-xs text-blocked-600 hover:underline"
//                         aria-label={`Remove ballot ${b.ballot_no}`}
//                       >
//                         Remove
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </aside>
//         </div>
//       )}
//     </div>
//   );
// }




// import { useState, useEffect, useCallback, useRef } from "react";
// import {
//   fetchCategories, fetchCandidates, recordBallot, fetchRecentBallots,
//   deleteBallot, fetchLiveTotals, startCounting, completeCounting,
// } from "../api/counting";
// import { useAuth } from "../context/AuthContext";
// import { getErrorMessage } from "../api/client";
// import Alert from "../components/Alert";

// export default function VoteCounting() {
//   const [categories, setCategories] = useState([]);
//   const { user } = useAuth();
//   const isAdmin = user?.role === "admin";
//   const [starting, setStarting] = useState(false);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [recentBallots, setRecentBallots] = useState([]);
//   const [totals, setTotals] = useState(null);

//   const [ballotNo, setBallotNo] = useState("");
//   const [picked, setPicked] = useState([]);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [ballotSearch, setBallotSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const BALLOTS_PER_PAGE = 4;

//   const ballotInputRef = useRef(null);

//   const loadCategories = useCallback(async () => {
//     try {
//       const data = await fetchCategories();
//       setCategories(data);
//       const inProgress = data.find((c) => c.status === "in_progress");
//       setActiveCategory(inProgress || null);
//     } catch (err) {
//       setError(getErrorMessage(err, "The election categories could not be loaded."));
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   async function handleStart(categoryId) {
//     setStarting(true);
//     setError("");
//     try {
//       await startCounting(categoryId);
//       setNotice("Category opened for counting.");
//       await loadCategories();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not start this category."));
//     } finally {
//       setStarting(false);
//     }
//   }

//   async function handleComplete(categoryId) {
//     setStarting(true);
//     setError("");
//     try {
//       await completeCounting(categoryId);
//       setNotice("Category marked as completed.");
//       await loadCategories();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not complete this category."));
//     } finally {
//       setStarting(false);
//     }
//   }

//   useEffect(() => { loadCategories(); }, [loadCategories]);

//   const refreshCategoryData = useCallback(async (categoryId) => {
//     try {
//       const [cands, ballots, live] = await Promise.all([
//         fetchCandidates(categoryId),
//         fetchRecentBallots(categoryId),
//         fetchLiveTotals(categoryId),
//       ]);
//       setCandidates(cands);
//       setRecentBallots(ballots);
//       setTotals(live);
//     } catch (err) {
//       setError(getErrorMessage(err, "This category's counting data could not be loaded."));
//     }
//   }, []);

//   useEffect(() => {
//     if (activeCategory) refreshCategoryData(activeCategory.id);
//   }, [activeCategory, refreshCategoryData]);
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [ballotSearch, recentBallots]);

//   const votesRequired = activeCategory?.votes_per_ballot ?? 0;
//   const canSave = ballotNo.trim() !== "" && picked.length === votesRequired;

//   function togglePick(serial) {
//     setPicked((prev) => {
//       if (prev.includes(serial)) return prev.filter((s) => s !== serial);
//       if (prev.length >= votesRequired) return prev;
//       return [...prev, serial];
//     });
//   }

//   function clearEntry() {
//     setBallotNo("");
//     setPicked([]);
//     ballotInputRef.current?.focus();
//   }

//   async function handleSave() {
//     if (!canSave) return;
//     setSaving(true);
//     setError("");
//     try {
//       await recordBallot(activeCategory.id, Number(ballotNo), picked);
//       setNotice(`Ballot ${ballotNo} saved.`);
//       clearEntry();
//       await refreshCategoryData(activeCategory.id);
//     } catch (err) {
//       setError(getErrorMessage(err, "This ballot could not be saved. Please check the entry and try again."));
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(ballot) {
//     setError("");
//     try {
//       await deleteBallot(ballot.id, "Corrected during counting");
//       setNotice(`Ballot ${ballot.ballot_no} removed.`);
//       await refreshCategoryData(activeCategory.id);
//     } catch (err) {
//       setError(getErrorMessage(err, "That ballot could not be removed."));
//     }
//   }

//   if (loading) {
//     return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-400">Loading counting screen…</div>;
//   }
//   const filteredBallots = recentBallots.filter((b) => {
//     const term = ballotSearch.trim().toLowerCase();
//     if (!term) return true;
//     const ballotMatch = String(b.ballot_no).toLowerCase().includes(term);
//     const candidateMatch = b.candidate_serials.some((s) =>
//       String(s).toLowerCase().includes(term)
//     );
//     return ballotMatch || candidateMatch;
//   });

//   const totalPages = Math.max(1, Math.ceil(filteredBallots.length / BALLOTS_PER_PAGE));
//   const paginatedBallots = filteredBallots.slice(
//     (currentPage - 1) * BALLOTS_PER_PAGE,
//     currentPage * BALLOTS_PER_PAGE
//   );

//   return (
//     <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//         <h1 className="text-xl font-bold text-slate-900">Vote Counting</h1>
//         <p className="mt-1 text-xs text-slate-500">
//           Enter each ballot number and mark the candidates it voted for.
//         </p>
//       </div>

//       {notice && <div><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
//       {error && <div><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

//       {/* Category strip */}
//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
//           <h3 className="text-xs font-bold uppercase tracking-wider text-white">Election Categories</h3>
//         </div>
//         <div className="flex flex-wrap gap-3 p-5">
//           {categories.map((cat) => {
//             const isActive = activeCategory?.id === cat.id;
//             const done = cat.status === "completed";
//             const locked = !isActive && !done;
//             return (
//               <div
//                 key={cat.id}
//                 className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${isActive
//                     ? "border-blue-300 bg-blue-50 shadow-sm"
//                     : done
//                       ? "border-emerald-200 bg-emerald-50"
//                       : "border-slate-200 bg-slate-50"
//                   }`}
//               >
//                 <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "animate-pulse bg-blue-600" : done ? "bg-emerald-500" : "bg-slate-400"
//                   }`} />
//                 <div>
//                   <div className="text-sm font-bold text-slate-900">{cat.name}</div>
//                   <div className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? "text-blue-700" : done ? "text-emerald-700" : "text-slate-400"
//                     }`}>
//                     {done ? "Completed" : isActive ? "In Progress" : "Locked"}
//                   </div>
//                 </div>

//                 {isAdmin && locked && !activeCategory && (
//                   <button
//                     onClick={() => handleStart(cat.id)}
//                     disabled={starting}
//                     className="ml-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60"
//                   >
//                     Start
//                   </button>
//                 )}

//                 {isAdmin && isActive && (
//                   <button
//                     onClick={() => handleComplete(cat.id)}
//                     disabled={starting}
//                     className="ml-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
//                   >
//                     Complete
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//           {categories.length === 0 && (
//             <p className="text-xs text-slate-400">No election categories have been set up yet.</p>
//           )}
//         </div>
//       </div>

//       {!activeCategory ? (
//         <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm font-medium text-blue-800">
//           No category is currently open for counting. A Super Admin needs to start one before ballots can be entered.
//         </div>
//       ) : (
//         <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
//           {/* Entry panel */}
//           <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-800 bg-blue-900 p-4 text-white sm:p-5">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-sm font-bold">{activeCategory.name}</h2>
//                 <span className="rounded-lg border border-blue-700/50 bg-blue-900/80 px-3 py-1 text-xs font-bold text-blue-300">
//                   {votesRequired} vote{votesRequired === 1 ? "" : "s"} per ballot
//                 </span>
//               </div>
//             </div>

//             <div className="p-5">
//               <label htmlFor="ballotNo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
//                 Ballot Number
//               </label>
//               <input
//                 id="ballotNo"
//                 ref={ballotInputRef}
//                 type="number"
//                 min="1"
//                 value={ballotNo}
//                 onChange={(e) => setBallotNo(e.target.value)}
//                 placeholder="e.g. 101"
//                 className="mb-5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-lg font-bold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />

//               <div className="mb-3 flex items-center justify-between">
//                 <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Candidates Voted For</span>
//                 <span className={`rounded px-2 py-0.5 text-xs font-bold ${picked.length === votesRequired ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
//                   }`}>
//                   {picked.length} of {votesRequired} selected
//                 </span>
//               </div>

//               <ul className="mb-5 space-y-2">
//                 {candidates.map((c) => {
//                   const isPicked = picked.includes(c.serial_no);
//                   const atLimit = !isPicked && picked.length >= votesRequired;
//                   return (
//                     <li key={c.id}>
//                       <button
//                         type="button"
//                         onClick={() => togglePick(c.serial_no)}
//                         disabled={atLimit}
//                         className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${isPicked
//                             ? "border-blue-500 bg-blue-50 shadow-sm"
//                             : atLimit
//                               ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
//                               : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
//                           }`}
//                       >
//                         <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${isPicked ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
//                           }`}>
//                           {c.serial_no}
//                         </span>
//                         <span className="min-w-0 flex-1">
//                           <span className="block truncate text-sm font-bold text-slate-900">{c.candidate_name}</span>
//                           <span className="flex items-center gap-2 text-xs text-slate-500">
//                             {c.membership_no && (
//                               <span className="font-mono font-semibold text-slate-600">{c.membership_no}</span>
//                             )}
//                             {c.member_name && <span className="truncate">{c.member_name}</span>}
//                           </span>
//                         </span>
//                         {isPicked && (
//                           <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
//                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                           </svg>
//                         )}
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>

//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={handleSave}
//                   disabled={!canSave || saving}
//                   className={`flex items-center space-x-2 rounded-lg px-6 py-2.5 text-xs font-bold shadow-md transition-all ${canSave && !saving ? "bg-emerald-600 text-white hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300 text-slate-500"
//                     }`}
//                 >
//                   <span>{saving ? "Saving…" : "Save Ballot"}</span>
//                 </button>
//                 <button
//                   onClick={clearEntry}
//                   className="rounded-lg bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300"
//                 >
//                   Ignore
//                 </button>
//               </div>

//               {!canSave && ballotNo && picked.length !== votesRequired && (
//                 <p className="mt-3 text-xs font-medium text-amber-700">
//                   Select exactly {votesRequired} candidate{votesRequired === 1 ? "" : "s"} before saving this ballot.
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Right sidebar */}
//           <div className="space-y-4">
//             {totals && (
//               <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//                 <div className="border-b border-slate-800 bg-blue-900 px-4 py-3">
//                   <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Running Total</h3>
//                 </div>
//                 <div className="space-y-3 p-4">
//                   <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
//                     <span className="text-xs font-bold text-slate-600">Total ballots entered</span>
//                     <span className="font-mono text-lg font-black text-blue-800">{totals.total_ballots}</span>
//                   </div>
//                   <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50/60 p-3">
//                     <span className="text-xs font-bold text-slate-600">Total votes entered</span>
//                     <span className="font-mono text-lg font-black text-purple-800">{totals.total_votes}</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//               <div className="border-b border-slate-800 bg-blue-900 px-4 py-3">
//                 <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Recent Ballots</h3>
//               </div>
//               <div className="p-4">
//                 {recentBallots.length === 0 ? (
//                   <p className="text-xs text-slate-400">No ballots entered yet.</p>
//                 ) : (
//                   <ul className="space-y-1.5">
//                     {recentBallots.slice(0, 10).map((b) => (
//                       <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
//                         <span className="rounded bg-slate-800 px-2 py-0.5 font-mono font-bold text-white">#{b.ballot_no}</span>
//                         <span className="font-mono text-slate-600">{b.candidate_serials.join(", ")}</span>
//                         <button
//                           onClick={() => handleDelete(b)}
//                           className="font-bold text-rose-600 hover:underline"
//                           aria-label={`Remove ballot ${b.ballot_no}`}
//                         >
//                           Remove
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>
//             </div> */}
//             <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//               <div className="border-b border-slate-800 bg-blue-900 px-4 py-3">
//                 <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Recent Ballots</h3>
//               </div>
//               <div className="p-4">
//                 <div className="mb-3">
//                   <input
//                     type="text"
//                     value={ballotSearch}
//                     onChange={(e) => setBallotSearch(e.target.value)}
//                     placeholder="Search by ballot no. or candidate serial"
//                     className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>

//                 {filteredBallots.length === 0 ? (
//                   <p className="text-xs text-slate-400">
//                     {recentBallots.length === 0
//                       ? "No ballots entered yet."
//                       : "No ballots match your search."}
//                   </p>
//                 ) : (
//                   <>
//                     <ul className="space-y-1.5">
//                       {paginatedBallots.map((b) => (
//                         <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
//                           <span className="rounded bg-slate-800 px-2 py-0.5 font-mono font-bold text-white">#{b.ballot_no}</span>
//                           <span className="font-mono text-slate-600">{b.candidate_serials.join(", ")}</span>
//                           <button
//                             onClick={() => handleDelete(b)}
//                             className="font-bold text-rose-600 hover:underline"
//                             aria-label={`Remove ballot ${b.ballot_no}`}
//                           >
//                             Remove
//                           </button>
//                         </li>
//                       ))}
//                     </ul>

//                     {totalPages > 1 && (
//                       <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
//                         <button
//                           type="button"
//                           onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                           disabled={currentPage === 1}
//                           className="rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                           Prev
//                         </button>
//                         <span className="text-[11px] font-bold text-slate-500">
//                           Page {currentPage} of {totalPages}
//                         </span>
//                         <button
//                           type="button"
//                           onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                           disabled={currentPage === totalPages}
//                           className="rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCategories, fetchCandidates, recordBallot, fetchRecentBallots,
  deleteBallot, fetchLiveTotals, startCounting, completeCounting,
} from "../api/counting";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

export default function VoteCounting() {
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [starting, setStarting] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [recentBallots, setRecentBallots] = useState([]);
  const [totals, setTotals] = useState(null);

  const [ballotNo, setBallotNo] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ballotSearch, setBallotSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const BALLOTS_PER_PAGE = 4;

  const ballotInputRef = useRef(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      const inProgress = data.find((c) => c.status === "in_progress");
      setActiveCategory(inProgress || null);
    } catch (err) {
      setError(getErrorMessage(err, "The election categories could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleStart(categoryId) {
    setStarting(true);
    setError("");
    try {
      await startCounting(categoryId);
      setNotice("Category opened for counting.");
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Could not start this category."));
    } finally {
      setStarting(false);
    }
  }

  async function handleComplete(categoryId) {
    setStarting(true);
    setError("");
    try {
      await completeCounting(categoryId);
      setNotice("Category marked as completed.");
      await loadCategories();
    } catch (err) {
      setError(getErrorMessage(err, "Could not complete this category."));
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const refreshCategoryData = useCallback(async (categoryId) => {
    try {
      const [cands, ballots, live] = await Promise.all([
        fetchCandidates(categoryId),
        fetchRecentBallots(categoryId),
        fetchLiveTotals(categoryId),
      ]);
      setCandidates(cands);
      setRecentBallots(ballots);
      setTotals(live);
    } catch (err) {
      setError(getErrorMessage(err, "This category's counting data could not be loaded."));
    }
  }, []);

  useEffect(() => {
    if (activeCategory) refreshCategoryData(activeCategory.id);
  }, [activeCategory, refreshCategoryData]);
  useEffect(() => {
    setCurrentPage(1);
  }, [ballotSearch, recentBallots]);

  const votesRequired = activeCategory?.votes_per_ballot ?? 0;

  // register check: ye ballot number already list mein hai kya?
  const isDuplicateBallot =
    ballotNo.trim() !== "" &&
    recentBallots.some((b) => String(b.ballot_no) === ballotNo.trim());

  const canSave =
    ballotNo.trim() !== "" &&
    picked.length === votesRequired &&
    !isDuplicateBallot;

  function togglePick(serial) {
    if (isDuplicateBallot) return; // voucher already register mein hai — entry lock
    setPicked((prev) => {
      if (prev.includes(serial)) return prev.filter((s) => s !== serial);
      if (prev.length >= votesRequired) return prev;
      return [...prev, serial];
    });
  }

  function clearEntry() {
    setBallotNo("");
    setPicked([]);
    ballotInputRef.current?.focus();
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await recordBallot(activeCategory.id, Number(ballotNo), picked);
      setNotice(`Ballot ${ballotNo} saved.`);
      clearEntry();
      await refreshCategoryData(activeCategory.id);
    } catch (err) {
      setError(getErrorMessage(err, "This ballot could not be saved. Please check the entry and try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ballot) {
    setError("");
    try {
      await deleteBallot(ballot.id, "Corrected during counting");
      setNotice(`Ballot ${ballot.ballot_no} removed.`);
      await refreshCategoryData(activeCategory.id);
    } catch (err) {
      setError(getErrorMessage(err, "That ballot could not be removed."));
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-400">Loading counting screen…</div>;
  }
  const filteredBallots = recentBallots.filter((b) => {
    const term = ballotSearch.trim().toLowerCase();
    if (!term) return true;
    const ballotMatch = String(b.ballot_no).toLowerCase().includes(term);
    const candidateMatch = b.candidate_serials.some((s) =>
      String(s).toLowerCase().includes(term)
    );
    return ballotMatch || candidateMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBallots.length / BALLOTS_PER_PAGE));
  const paginatedBallots = filteredBallots.slice(
    (currentPage - 1) * BALLOTS_PER_PAGE,
    currentPage * BALLOTS_PER_PAGE
  );

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Vote Counting</h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter each ballot number and mark the candidates it voted for.
        </p>
      </div>

      {notice && <div><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
      {error && <div><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      {/* Category strip */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Election Categories</h3>
        </div>
        <div className="flex flex-wrap gap-3 p-5">
          {categories.map((cat) => {
            const isActive = activeCategory?.id === cat.id;
            const done = cat.status === "completed";
            const locked = !isActive && !done;
            return (
              <div
                key={cat.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${isActive
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "animate-pulse bg-blue-600" : done ? "bg-emerald-500" : "bg-slate-400"
                  }`} />
                <div>
                  <div className="text-sm font-bold text-slate-900">{cat.name}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? "text-blue-700" : done ? "text-emerald-700" : "text-slate-400"
                    }`}>
                    {done ? "Completed" : isActive ? "In Progress" : "Locked"}
                  </div>
                </div>

                {isAdmin && locked && !activeCategory && (
                  <button
                    onClick={() => handleStart(cat.id)}
                    disabled={starting}
                    className="ml-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60"
                  >
                    Start
                  </button>
                )}

                {isAdmin && isActive && (
                  <button
                    onClick={() => handleComplete(cat.id)}
                    disabled={starting}
                    className="ml-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Complete
                  </button>
                )}
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="text-xs text-slate-400">No election categories have been set up yet.</p>
          )}
        </div>
      </div>

      {!activeCategory ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm font-medium text-blue-800">
          No category is currently open for counting. A Super Admin needs to start one before ballots can be entered.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Entry panel */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-800 bg-blue-900 p-4 text-white sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">{activeCategory.name}</h2>
                <span className="rounded-lg border border-blue-700/50 bg-blue-900/80 px-3 py-1 text-xs font-bold text-blue-300">
                  {votesRequired} vote{votesRequired === 1 ? "" : "s"} per ballot
                </span>
              </div>
            </div>

            <div className="p-5">
              <label htmlFor="ballotNo" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Ballot Number
              </label>
              <input
                id="ballotNo"
                ref={ballotInputRef}
                type="number"
                min="1"
                value={ballotNo}
                onChange={(e) => setBallotNo(e.target.value)}
                placeholder="e.g. 101"
                className={`w-full rounded-xl border px-4 py-3 font-mono text-lg font-bold text-slate-900 transition-all focus:outline-none focus:ring-2 ${
                  isDuplicateBallot
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-400"
                    : "border-slate-300 bg-slate-50 focus:bg-white focus:ring-blue-500"
                }`}
              />

              {isDuplicateBallot ? (
                <p className="mb-5 mt-1.5 text-xs font-bold text-rose-600">
                  Ballot #{ballotNo.trim()} already entered.
                </p>
              ) : (
                <div className="mb-5" />
              )}

              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Candidates Voted For</span>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${picked.length === votesRequired ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                  {picked.length} of {votesRequired} selected
                </span>
              </div>

              <ul className="mb-5 space-y-2">
                {candidates.map((c) => {
                  const isPicked = picked.includes(c.serial_no);
                  const atLimit = !isPicked && picked.length >= votesRequired;
                  const blocked = isDuplicateBallot || atLimit;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => togglePick(c.serial_no)}
                        disabled={blocked}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${isPicked
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : blocked
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                          }`}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${isPicked ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}>
                          {c.serial_no}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900">{c.candidate_name}</span>
                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            {c.membership_no && (
                              <span className="font-mono font-semibold text-slate-600">{c.membership_no}</span>
                            )}
                            {c.member_name && <span className="truncate">{c.member_name}</span>}
                          </span>
                        </span>
                        {isPicked && (
                          <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!canSave || saving}
                  className={`flex items-center space-x-2 rounded-lg px-6 py-2.5 text-xs font-bold shadow-md transition-all ${canSave && !saving ? "bg-emerald-600 text-white hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300 text-slate-500"
                    }`}
                >
                  <span>{saving ? "Saving…" : "Save Ballot"}</span>
                </button>
                <button
                  onClick={clearEntry}
                  className="rounded-lg bg-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300"
                >
                  Ignore
                </button>
              </div>

              {!canSave && ballotNo && !isDuplicateBallot && picked.length !== votesRequired && (
                <p className="mt-3 text-xs font-medium text-amber-700">
                  Select exactly {votesRequired} candidate{votesRequired === 1 ? "" : "s"} before saving this ballot.
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {totals && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-800 bg-blue-900 px-4 py-3">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Running Total</h3>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                    <span className="text-xs font-bold text-slate-600">Total ballots entered</span>
                    <span className="font-mono text-lg font-black text-blue-800">{totals.total_ballots}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50/60 p-3">
                    <span className="text-xs font-bold text-slate-600">Total votes entered</span>
                    <span className="font-mono text-lg font-black text-purple-800">{totals.total_votes}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-800 bg-blue-900 px-4 py-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-white">Recent Ballots</h3>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <input
                    type="text"
                    value={ballotSearch}
                    onChange={(e) => setBallotSearch(e.target.value)}
                    placeholder="Search by ballot no. or candidate serial"
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {filteredBallots.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    {recentBallots.length === 0
                      ? "No ballots entered yet."
                      : "No ballots match your search."}
                  </p>
                ) : (
                  <>
                    <ul className="space-y-1.5">
                      {paginatedBallots.map((b) => (
                        <li key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
                          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono font-bold text-white">#{b.ballot_no}</span>
                          <span className="font-mono text-slate-600">{b.candidate_serials.join(", ")}</span>
                          <button
                            onClick={() => handleDelete(b)}
                            className="font-bold text-rose-600 hover:underline"
                            aria-label={`Remove ballot ${b.ballot_no}`}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>

                    {totalPages > 1 && (
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-[11px] font-bold text-slate-500">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
