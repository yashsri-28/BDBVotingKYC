// import { useState } from "react";
// import { searchAccessCard, allotCustomerCodes } from "../api/ballots";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";
// import { useAuth } from "../context/AuthContext";
// import AuthRepModal from "../components/AuthRepModal";
// import { mediaUrl } from "../api/client";

// function initials(name = "") {
//   return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
// }

// export default function CounterSearch() {
//   const { showToast } = useToast();
//   const { user } = useAuth();
//   const [cardNumber, setCardNumber] = useState("");
//   const [result, setResult] = useState(null);
//   const [selected, setSelected] = useState(new Set());
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [layoutMode, setLayoutMode] = useState("vertical");
//   const [verifiedCheck, setVerifiedCheck] = useState(false);
//   const [repModalEntity, setRepModalEntity] = useState(null);

//   const isArchiveYear = false;
//   const canEditAuthRep = user?.role === "admin";

//   async function runSearch(card) {
//     setError("");
//     if (!card.trim()) {
//       setError("Please enter an access card number to search.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const data = await searchAccessCard(card.trim());
//       setResult(data);
//       setVerifiedCheck(false);
//       showToast("success", "Member record found", `Loaded ${data.customer_codes.length} customer code(s) for ${data.access_card_number}.`);
//     } catch (err) {
//       setResult(null);
//       const msg = getErrorMessage(err, "That access card could not be found.");
//       setError(msg);
//       showToast("danger", "Record not found", msg);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleSearchSubmit(e) {
//     e.preventDefault();
//     runSearch(cardNumber);
//   }

//   function toggleVerifiedCheck() {
//     const next = !verifiedCheck;
//     setVerifiedCheck(next);
//     if (!result) return;
//     if (next) {
//       setSelected(new Set(result.customer_codes.filter((c) => c.selectable).map((c) => c.customer_code)));
//       showToast("info", "Verified User selected", "All open customer codes under this card have been auto-selected.");
//     } else {
//       setSelected(new Set());
//     }
//   }

//   function toggleCode(code) {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(code) ? next.delete(code) : next.add(code);
//       return next;
//     });
//   }

//   function clearSelection() {
//     setSelected(new Set());
//     setVerifiedCheck(false);
//   }

//   async function handleIssue() {
//     if (selected.size === 0 || isArchiveYear) return;
//     setSaving(true);
//     try {
//       await allotCustomerCodes(result.access_card_number, [...selected]);
//       showToast("success", "Ballots allotted successfully", `${selected.size} ballot code(s) issued to ${result.access_card_number}.`);
//       const refreshed = await searchAccessCard(result.access_card_number);
//       setResult(refreshed);
//       setSelected(new Set());
//       setVerifiedCheck(false);
//     } catch (err) {
//       showToast("danger", "Could not issue ballots", getErrorMessage(err, "Please review and try again."));
//     } finally {
//       setSaving(false);
//     }
//   }

//   const pendingCount = result?.customer_codes.filter((c) => c.selectable).length || 0;

//   return (
//     <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
//       {/* Search bar */}
//       <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
//           <div className="w-full max-w-xl flex-1 sm:w-auto">
//             <label className="mb-1.5 flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-slate-700">
//               <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h1a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 4h1v16H9zm3 0h2v16h-2zm4 0h1a1 1 0 011 1v14a1 1 0 01-1 1h-1z" />
//               </svg>
//               <span>Access Card Quick Search</span>
//             </label>
//             <form onSubmit={handleSearchSubmit} className="relative flex items-center">
//               <input
//                 type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
//                 placeholder="Enter Access Card No (e.g. GEM209202)"
//                 className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-24 font-mono text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <svg className="absolute left-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//               <button type="submit" disabled={loading} className="absolute right-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60">
//                 {loading ? "Searching…" : "Search DB"}
//               </button>
//             </form>
//           </div>
//         </div>
//         {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
//       </div>

//       {result && (
//         <div className="space-y-6">
//           {/* KYC + Voting split cards */}
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
//               <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white">
//                 <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-400">
//                   <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
//                   </svg>
//                   <span>From KYC DB</span>
//                 </span>
//                 <span className="rounded border border-blue-700/50 bg-blue-900/80 px-2.5 py-0.5 font-mono text-[11px] text-blue-200">
//                   Access Card: {result.access_card_number}
//                 </span>
//               </div>
//               <div className="flex flex-col items-start space-y-4 p-5 sm:flex-row sm:space-x-5 sm:space-y-0">
//                 <RepPhoto name={result.representative_name} />
//                 {result.customer_codes[0] && (
//                   <div className="grid flex-1 grid-cols-2 gap-4 text-xs">
//                     <Field label="Access Card No"><span className="font-mono text-sm font-bold text-slate-900">{result.access_card_number}</span></Field>
//                     <Field label="Representative"><span className="text-sm font-bold text-slate-900">{result.representative_name || "—"}</span></Field>
//                     <Field label="Payment Status"><StatusPill ok={result.customer_codes[0].annual_fee_status === "paid"} okText="Paid" badText="Unpaid" /></Field>
//                     <Field label="Membership Status"><StatusPill ok={result.customer_codes[0].membership_status === "active"} okText="Active" badText="Inactive" /></Field>
//                     <Field label="KYC Status"><StatusPill ok={result.customer_codes[0].kyc_status === "yes"} okText="Verified" badText="Pending" /></Field>
//                     <Field label="Voting Eligibility"><StatusPill ok={result.customer_codes[0].voting_eligibility === "eligible"} okText="Eligible" badText="Not Eligible" /></Field>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//               <div>
//                 <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-3 text-white">
//                   <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400">
//                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span>From Voting DB</span>
//                   </span>
//                   <span className="rounded border border-purple-700/50 bg-purple-900/60 px-2 py-0.5 text-[10px] text-purple-200">
//                     Voting Eligibility
//                   </span>
//                 </div>
//                 <div className="space-y-3.5 p-5 text-xs">
//                   <div className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50/70 p-2.5">
//                     <div>
//                       <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-600">Customer Codes Linked</span>
//                       <span className="text-sm font-bold text-purple-950">{result.customer_codes.length}</span>
//                     </div>
//                     <span className="rounded bg-purple-200/80 px-2 py-0.5 text-[11px] font-bold text-purple-900">Voting DB</span>
//                   </div>
//                   <div className="flex items-center space-x-3 pt-1">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-300 bg-blue-100 font-bold text-blue-800">
//                       <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                       </svg>
//                     </div>
//                     <div>
//                       <span className="block text-[11px] font-medium text-slate-400">Authorized Representative</span>
//                       <span className="text-sm font-bold text-slate-900">{result.representative_name || "—"}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               {canEditAuthRep && (
//                 <div className="border-t border-slate-200 bg-slate-50 p-3 text-right">
//                   <button
//                     onClick={() => setRepModalEntity({ customer_code: result.customer_codes[0]?.customer_code, representative_name: result.representative_name })}
//                     className="ml-auto flex items-center justify-end space-x-1 text-xs font-semibold text-purple-700 hover:text-purple-900"
//                   >
//                     <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     <span>Change Authorized Rep</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Ballot allotment box */}
//           <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-800 bg-slate-900 p-4 text-white sm:p-5">
//               <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
//                 <div>
//                   <h3 className="flex items-center space-x-2 text-sm font-bold">
//                     <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                     </svg>
//                     <span>Customer Codes Ballot Allotment</span>
//                   </h3>
//                   <p className="mt-0.5 text-xs text-slate-300">
//                     Customer codes linked to Access Card <strong className="font-mono text-blue-300">{result.access_card_number}</strong>
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap items-center gap-3">
//                   <div className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 p-1">
//                     <button onClick={() => setLayoutMode("vertical")} className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs transition-all ${layoutMode === "vertical" ? "bg-blue-600 font-bold text-white" : "text-slate-400 hover:text-white"}`}>
//                       <span className="hidden sm:inline">Vertical Stack</span>
//                     </button>
//                     <button onClick={() => setLayoutMode("grid")} className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs transition-all ${layoutMode === "grid" ? "bg-blue-600 font-bold text-white" : "text-slate-400 hover:text-white"}`}>
//                       <span className="hidden sm:inline">Grid Cards</span>
//                     </button>
//                   </div>

//                   <label className="flex cursor-pointer items-center space-x-3 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 shadow-sm hover:border-blue-400">
//                     <input type="checkbox" checked={verifiedCheck} onChange={toggleVerifiedCheck} disabled={isArchiveYear} className="h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500" />
//                     <span className="text-xs font-bold text-slate-100 select-none">
//                       "Verified User" Manual Check
//                       <span className="block text-[10px] font-normal text-slate-400">Auto-selects open codes</span>
//                     </span>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="p-5">
//               <div className={layoutMode === "vertical" ? "mx-auto max-w-4xl space-y-4" : "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"}>
//                 {result.customer_codes.map((code) => (
//                   <BallotCodeCard
//                     key={code.customer_code}
//                     code={code}
//                     selected={selected.has(code.customer_code)}
//                     onToggle={() => toggleCode(code.customer_code)}
//                     disabled={isArchiveYear}
//                   />
//                 ))}
//               </div>
//             </div>

//             <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
//               <div className="text-xs font-medium text-slate-600">
//                 Selected for Issue: <span className="font-mono text-sm font-bold text-blue-700">{selected.size} / {pendingCount} available codes</span>
//               </div>
//               <div className="flex w-full items-center space-x-3 sm:w-auto">
//                 <button onClick={clearSelection} className="rounded-lg bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300">
//                   Clear Selection
//                 </button>
//                 <button
//                   onClick={handleIssue}
//                   disabled={selected.size === 0 || isArchiveYear || saving}
//                   className={`flex items-center space-x-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${selected.size > 0 && !isArchiveYear ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300 text-slate-500"
//                     }`}
//                 >
//                   <span>{saving ? "Issuing…" : `Issue Selected Ballots (${selected.size})`}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <AuthRepModal
//         open={!!repModalEntity}
//         onClose={() => setRepModalEntity(null)}
//         entity={repModalEntity}
//         onChanged={() => runSearch(result.access_card_number)}
//       />
//     </div>
//   );
// }

// function RepPhoto({ name }) {
//   return (
//     <div className="shrink-0 text-center">
//       <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-100 text-2xl font-bold text-slate-500">
//         {initials(name) || "—"}
//       </div>
//       <span className="mt-1 block text-[10px] font-medium text-slate-400">Access Card Photo</span>
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <span className="block font-medium text-slate-400">{label}</span>
//       <div className="mt-0.5">{children}</div>
//     </div>
//   );
// }

// function StatusPill({ ok, okText, badText }) {
//   return (
//     <span className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 font-bold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
//       <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//         {ok ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
//       </svg>
//       <span>{ok ? okText : badText}</span>
//     </span>
//   );
// }

// function BallotCodeCard({ code, selected, onToggle, disabled }) {
//   const locked = code.already_allotted;
//   const blocked = !locked && !code.selectable;

//   return (
//     <div
//       className={`relative flex flex-col justify-between space-y-3.5 rounded-xl border p-4 transition-all ${locked
//           ? "stripe-bg border-slate-300 bg-slate-100/90 opacity-80"
//           : blocked
//             ? "border-rose-200 bg-rose-50/60"
//             : "border-blue-200 bg-white shadow-sm hover:border-blue-500 hover:shadow-md"
//         }`}
//     >
//       <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
//         <div className="flex items-center space-x-2.5">
//           <span className={`h-2.5 w-2.5 rounded-full ${locked ? "bg-rose-500" : blocked ? "bg-slate-400" : "bg-emerald-500"}`} />
//           <span className="font-mono text-xl font-black tracking-tight text-slate-900">{code.customer_code}</span>
//           <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${locked ? "bg-rose-100 text-rose-800" : blocked ? "bg-slate-200 text-slate-500" : "bg-emerald-100 text-emerald-800"}`}>
//             {locked ? "ALLOTTED" : blocked ? "BLOCKED" : "OPEN"}
//           </span>
//         </div>
//         {code.roll_type && (
//           <span className={`rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-2xs ${code.roll_type === "category" ? "border-purple-200 bg-purple-100 text-purple-800" : "border-amber-200 bg-amber-100 text-amber-800"
//             }`}>
//             {code.roll_type} Pool
//           </span>
//         )}
//       </div>

//       <div className="flex items-start space-x-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
//         <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300 text-2xl font-black text-slate-600">
//           {code.photograph_path ? (
//             <img
//               src={mediaUrl(code.photograph_path)}
//               alt={code.entity_name}
//               className="h-full w-full object-cover"
//               onError={(e) => {
//                 e.target.style.display = "none";
//                 e.target.parentNode.innerHTML = `<span class="text-2xl font-black text-slate-600">${(code.entity_name || "?").charAt(0)}</span>`;
//               }}
//             />
//           ) : (
//             <span>{(code.entity_name || "?").charAt(0)}</span>
//           )}
//         </div>
//         <div className="min-w-0 flex-1">
//           <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Card</div>
//           <div className="mt-0.5 inline-block rounded bg-slate-200/70 px-2 py-0.5 font-mono text-sm font-bold text-slate-900">
//             {code.access_card_number}
//           </div>
//           <div className="mt-1 text-base font-bold text-slate-800">{code.entity_name}</div>
//         </div>
//       </div>

//       <div className="space-y-1 rounded-lg border border-purple-100 bg-purple-50/60 p-2.5">
//         <div className="flex items-center justify-between text-[11px]">
//           <span className="flex items-center gap-1 font-bold text-purple-700">
//             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//             </svg>
//             Auth Rep Proxy (Updated):
//           </span>
//           <span
//             className="font-bold text-purple-950"
//             title={
//               code.is_rep_changed
//                 ? `Changed by ${code.rep_changed_by || "Unknown"} on ${new Date(code.rep_changed_at).toLocaleDateString()}`
//                 : undefined
//             }
//           >
//             {code.representative_name || "—"}
//           </span>
//         </div>

//         {code.is_rep_changed && (
//           <div className="flex items-center justify-end">
//             <span className="inline-flex items-center gap-1 rounded bg-purple-200/80 px-1.5 py-0.5 text-[10px] font-bold text-purple-900">
//               ⚠ Rep Changed
//               {code.rep_changed_at && ` · ${new Date(code.rep_changed_at).toLocaleDateString()}`}
//             </span>
//           </div>
//         )}

//         <div className="flex items-center justify-between text-[11px]">
//           <span className="flex items-center gap-1 font-bold text-purple-700">
//             <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//               <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
//             </svg>
//             Voting Category:
//           </span>
//           <span className="font-bold text-purple-900">{code.category || "—"}</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-2.5 text-[11px]">
//         <div>
//           <span className="block text-[10px] font-bold uppercase text-slate-500">Payment Status</span>
//           <span className={`font-bold ${code.annual_fee_status === "paid" ? "text-emerald-700" : "text-rose-700"}`}>
//             {code.annual_fee_status === "paid" ? "Paid" : "Unpaid"}
//           </span>
//           <span className="block font-mono text-[9px] text-slate-500">Membership: {code.membership_status}</span>
//         </div>
//         <div>
//           <span className="block text-[10px] font-bold uppercase text-slate-500">KYC Status</span>
//           <span className={`font-bold ${code.kyc_status === "yes" ? "text-emerald-700" : "text-amber-700"}`}>
//             {code.kyc_status === "yes" ? "Verified" : "Pending"}
//           </span>
//           <span className="block font-mono text-[9px] text-slate-500">Ballots: {code.ballot_entitlement}</span>
//         </div>
//       </div>

//       <div className="pt-2">
//         {locked ? (
//           <div className="w-full">
//             <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-bold text-rose-700">
//               <span className="flex items-center space-x-2">
//                 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
//                 </svg>
//                 <span>Already Allotted</span>
//               </span>
//               <svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//               </svg>
//             </div>
//             {code.allotted_at && (
//               <p className="mt-1.5 text-right font-mono text-[10px] text-slate-500">
//                 Issued: <span className="font-semibold text-slate-700">{new Date(code.allotted_at).toLocaleString()}</span>
//               </p>
//             )}
//           </div>
//         ) : blocked ? (
//           <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
//             {code.block_reason}
//           </div>
//         ) : (
//           <label className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 p-2.5 transition-all hover:bg-blue-100">
//             <span className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
//               <svg className={`h-4 w-4 ${selected ? "text-blue-600" : "text-slate-300"}`} fill="currentColor" viewBox="0 0 20 20">
//                 {selected ? <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293z" clipRule="evenodd" /> : <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />}
//               </svg>
//               <span>{selected ? "✓ Selected for Allotment" : "Select for Allotment"}</span>
//             </span>
//             <input type="checkbox" checked={selected} disabled={disabled} onChange={onToggle} className="h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500" />
//           </label>
//         )}
//       </div>
//     </div>
//   );
// }





// import { useState } from "react";
import { useState, useEffect } from "react";
import { searchAccessCard, allotCustomerCodes } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import AuthRepModal from "../components/AuthRepModal";
import { mediaUrl } from "../api/client";
import { fetchMySummary } from "../api/ballots";

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function CounterSearch() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [layoutMode, setLayoutMode] = useState("vertical");
  const [verifiedCheck, setVerifiedCheck] = useState(false);
  const [repModalEntity, setRepModalEntity] = useState(null);


  const [step, setStep] = useState("select"); // "select" | "confirm"

  const [mySummary, setMySummary] = useState([]);

  const isArchiveYear = false;
  const canEditAuthRep = user?.role === "admin";

  useEffect(() => {
    loadMySummary();
  }, []);

  async function loadMySummary() {
    try {
      const data = await fetchMySummary();
      setMySummary(data);
    } catch {
      // Silent fail — balance display is a convenience, not critical.
    }
  }
async function runSearch(card) {
    setError("");
    if (!card.trim()) {
      setError("Please enter an access card number to search.");
      return;
    }
    setLoading(true);
    try {
      const data = await searchAccessCard(card.trim());
      setResult(data);
      setSelected(new Set(data.customer_codes.filter((c) => c.default_selected).map((c) => c.customer_code)));
      setVerifiedCheck(false);
      showToast("success", "Member record found", `Loaded ${data.customer_codes.length} customer code(s) for ${data.access_card_number}.`);
    } catch (err) {
      setResult(null);
      const msg = getErrorMessage(err, "That access card could not be found.");
      setError(msg);
      showToast("danger", "Record not found", msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    runSearch(cardNumber);
  }

  function toggleVerifiedCheck() {
    const next = !verifiedCheck;
    setVerifiedCheck(next);
    if (!result) return;
    if (next) {
      setSelected(new Set(result.customer_codes.filter((c) => c.selectable).map((c) => c.customer_code)));
      showToast("info", "Verified User selected", "All open customer codes under this card have been auto-selected.");
    } else {
      setSelected(new Set());
    }
  }

  function toggleCode(code) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setVerifiedCheck(false);
  }

 async function handleIssue() {
    if (selected.size === 0 || isArchiveYear) return;
    setSaving(true);
    try {
      await allotCustomerCodes(result.access_card_number, [...selected]);
      showToast("success", "Ballots allotted successfully", `${selected.size} ballot code(s) issued to ${result.access_card_number}.`);
      const refreshed = await searchAccessCard(result.access_card_number);
      setResult(refreshed);
      setSelected(new Set());
      setVerifiedCheck(false);
      setStep("select");
      loadMySummary();
    } catch (err) {
      showToast("danger", "Could not issue ballots", getErrorMessage(err, "Please review and try again."));
    } finally {
      setSaving(false);
    }
  }

  const pendingCount = result?.customer_codes.filter((c) => c.selectable).length || 0;
  const selectedCodesList = result?.customer_codes.filter((c) => selected.has(c.customer_code)) || [];
  const categoryCount = selectedCodesList.filter((c) => c.roll_type === "category").length;
  const exclusiveCount = selectedCodesList.filter((c) => c.roll_type === "exclusive").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Search bar */}
   <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="w-full max-w-xl flex-1 sm:w-auto">
            <label className="mb-1.5 flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-slate-700">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h1a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM9 4h1v16H9zm3 0h2v16h-2zm4 0h1a1 1 0 011 1v14a1 1 0 01-1 1h-1z" />
              </svg>
              <span>Access Card Quick Search</span>
            </label>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Enter Access Card No (e.g. GEMXXXXX)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-24 font-mono text-sm font-semibold text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button type="submit" disabled={loading} className="absolute right-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60">
                {loading ? "Searching…" : "Search"}
              </button>
            </form>
          </div>
          {mySummary.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {mySummary.map((row) => (
                <div
                  key={row.roll_type}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${row.balance === 0 ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
                >
                  {row.roll_type === "category" ? "Category" : "Exclusive"}: {row.balance} / {row.received} left
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
      </div>

      {result && (
        <div className="space-y-6">
          {canEditAuthRep && (
            <div className="flex items-center justify-end">
              <button
                onClick={() => setRepModalEntity({ customer_code: result.customer_codes[0]?.customer_code, representative_name: result.representative_name })}
                className="flex items-center space-x-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-100"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Change Authorized Rep</span>
              </button>
            </div>
          )}

          {/* Ballot allotment box */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-800 bg-slate-900 p-4 text-white sm:p-5">
              <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h3 className="flex items-center space-x-2 text-sm font-bold">
                    <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Customer Codes Ballot Allotment</span>
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Customer codes linked to Access Card <strong className="font-mono text-blue-300">{result.access_card_number}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800 p-1">
                    <button onClick={() => setLayoutMode("vertical")} className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs transition-all ${layoutMode === "vertical" ? "bg-blue-600 font-bold text-white" : "text-slate-400 hover:text-white"}`}>
                      <span className="hidden sm:inline">Vertical Stack</span>
                    </button>
                    <button onClick={() => setLayoutMode("grid")} className={`flex items-center space-x-1.5 rounded px-2.5 py-1 text-xs transition-all ${layoutMode === "grid" ? "bg-blue-600 font-bold text-white" : "text-slate-400 hover:text-white"}`}>
                      <span className="hidden sm:inline">Grid Cards</span>
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-center space-x-3 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 shadow-sm hover:border-blue-400">
                    <input type="checkbox" checked={verifiedCheck} onChange={toggleVerifiedCheck} disabled={isArchiveYear} className="h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-100 select-none">
                      "Verified User" Manual Check
                      <span className="block text-[10px] font-normal text-slate-400">Auto-selects open codes</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {step === "select" && (
              <div className="p-5">
                {/* <div className={layoutMode === "vertical" ? "mx-auto max-w-4xl space-y-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}> */}
                <div className={layoutMode === "vertical" ? "mx-auto max-w-4xl space-y-4" : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
                  {result.customer_codes.map((code) => (
                    <BallotCodeCard
                      key={code.customer_code}
                      code={code}
                      selected={selected.has(code.customer_code)}
                      onToggle={() => toggleCode(code.customer_code)}
                      disabled={isArchiveYear}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="p-5">
                <div className="mx-auto max-w-2xl space-y-5">
                  <h4 className="text-sm font-bold text-slate-800">Confirm Ballot Allotment</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 text-center">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-purple-700">Category Ballots</div>
                      <div className="mt-1 text-3xl font-black text-purple-900">{categoryCount}</div>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Exclusive Ballots</div>
                      <div className="mt-1 text-3xl font-black text-amber-900">{exclusiveCount}</div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-xs font-bold text-slate-600">Customer codes to be allotted:</div>
                    <ul className="space-y-1">
                      {selectedCodesList.map((c) => (
                        <li key={c.customer_code} className="flex items-center justify-between font-mono text-xs text-slate-700">
                          <span>{c.customer_code} — {c.entity_name}</span>
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${c.roll_type === "category" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"}`}>
                            {c.roll_type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
              {/* <div className="text-xs font-medium text-slate-600">
                Selected for Issue: <span className="font-mono text-sm font-bold text-blue-700">{selected.size} / {pendingCount} available codes</span>
              </div> */}
              {/* <div className="flex w-full items-center space-x-3 sm:w-auto">
                <button onClick={clearSelection} className="rounded-lg bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300">
                  Clear Selection
                </button>
                <button
                  onClick={handleIssue}
                  disabled={selected.size === 0 || isArchiveYear || saving}
                  className={`flex items-center space-x-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${selected.size > 0 && !isArchiveYear ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700" : "cursor-not-allowed bg-slate-300 text-slate-500"
                    }`}
                >
                  <span>{saving ? "Issuing…" : `Issue Selected Ballots (${selected.size})`}</span>
                </button>
              </div> */}
            </div>

            {step === "select" && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs font-medium text-slate-600">
                  Selected for Issue: <span className="font-mono text-sm font-bold text-blue-700">{selected.size} / {pendingCount} available codes</span>
                </div>
                <div className="flex w-full items-center space-x-3 sm:w-auto">
                  <button onClick={clearSelection} className="rounded-lg bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300">
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    disabled={selected.size === 0 || isArchiveYear}
                    className={`flex items-center space-x-2 rounded-lg px-5 py-2 text-xs font-bold transition-all ${selected.size > 0 && !isArchiveYear ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "cursor-not-allowed bg-slate-300 text-slate-500"
                      }`}
                  >
                    <span>Next ({selected.size} selected)</span>
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="text-xs font-medium text-slate-600">
                  Total: <span className="font-mono text-sm font-bold text-blue-700">{categoryCount} Category + {exclusiveCount} Exclusive = {selected.size} ballots</span>
                </div>
                <div className="flex w-full items-center space-x-3 sm:w-auto">
                  <button onClick={() => setStep("select")} className="rounded-lg bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-300">
                    Back
                  </button>
                  <button
                    onClick={handleIssue}
                    disabled={saving || isArchiveYear}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    <span>{saving ? "Submitting…" : "Submit"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthRepModal
        open={!!repModalEntity}
        onClose={() => setRepModalEntity(null)}
        entity={repModalEntity}
        onChanged={() => runSearch(result.access_card_number)}
      />
    </div>
  );
}

function RepPhoto({ name }) {
  return (
    <div className="shrink-0 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-100 text-2xl font-bold text-slate-500">
        {initials(name) || "—"}
      </div>
      <span className="mt-1 block text-[10px] font-medium text-slate-400">Access Card Photo</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span className="block font-medium text-slate-400">{label}</span>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function StatusPill({ ok, okText, badText }) {
  return (
    <span className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 font-bold ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {ok ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
      </svg>
      <span>{ok ? okText : badText}</span>
    </span>
  );
}

function BallotCodeCard({ code, selected, onToggle, disabled }) {
  const locked = code.already_allotted;
  const blocked = !locked && !code.selectable;

  return (
    <div
      className={`relative flex flex-col justify-between space-y-2.5 rounded-xl border p-3.5 transition-all ${locked
          ? "stripe-bg border-slate-300 bg-slate-100/90 opacity-80"
          : blocked
            ? "border-rose-200 bg-rose-50/60"
            : "border-blue-200 bg-white shadow-sm hover:border-blue-500 hover:shadow-md"
        }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center space-x-2.5">
          <span className={`h-2.5 w-2.5 rounded-full ${locked ? "bg-rose-500" : blocked ? "bg-slate-400" : "bg-emerald-500"}`} />
          <span className="font-mono text-xl font-black tracking-tight text-slate-900">{code.customer_code}</span>
          <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${locked ? "bg-rose-100 text-rose-800" : blocked ? "bg-slate-200 text-slate-500" : "bg-emerald-100 text-emerald-800"}`}>
            {locked ? "ALLOTTED" : blocked ? "BLOCKED" : "OPEN"}
          </span>
        </div>
        {code.roll_type && (
          <span className={`rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-2xs ${code.roll_type === "category" ? "border-purple-200 bg-purple-100 text-purple-800" : "border-amber-200 bg-amber-100 text-amber-800"
            }`}>
            {code.roll_type} Pool
          </span>
        )}
      </div>

      <div className="flex items-start space-x-4 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300 text-xl font-black text-slate-600">
          {code.photograph_path ? (
            <img
              src={mediaUrl(code.photograph_path)}
              alt={code.entity_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<span class="text-xl font-black text-slate-600">${(code.entity_name || "?").charAt(0)}</span>`;
              }}
            />
          ) : (
            <span>{(code.entity_name || "?").charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Card</div>
          <div className="mt-0.5 inline-block rounded bg-slate-200/70 px-2 py-0.5 font-mono text-sm font-bold text-slate-900">
            {code.access_card_number}
          </div>
          <div className="mt-1 text-base font-bold text-slate-800">{code.entity_name}</div>
        </div>
      </div>

      <div className="space-y-0.5 rounded-lg border border-purple-100 bg-purple-50/60 p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-bold text-purple-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Final Auth Rep:
          </span>
          <span
            className="font-bold text-purple-950"
            title={
              code.is_rep_changed
                ? `Changed by ${code.rep_changed_by || "Unknown"} on ${new Date(code.rep_changed_at).toLocaleDateString()}`
                : undefined
            }
          >
            {code.representative_name || "—"}
          </span>
        </div>

        {code.is_rep_changed && (
          <div className="flex items-center justify-end">
            <span className="inline-flex items-center gap-1 rounded bg-purple-200/80 px-1.5 py-0.5 text-[10px] font-bold text-purple-900">
              ⚠ Rep Changed
              {code.rep_changed_at && ` · ${new Date(code.rep_changed_at).toLocaleDateString()}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-bold text-purple-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
            </svg>
            Voting Category:
          </span>
          <span className="font-bold text-purple-900">{code.category || "—"}</span>
        </div>
      </div>

      {code.eligibility_source === "admin_override" && (
  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>On the Spot Payment: {code.voting_eligibility === "eligible" ? "Yes" : "No"}</span>
    </div>
    {code.eligibility_remark && (
      <p className="mt-1 text-[11px] text-amber-900">
        <span className="font-semibold">Remark:</span> {code.eligibility_remark}
      </p>
    )}
    {code.eligibility_updated_by && (
      <p className="mt-0.5 text-[11px] text-amber-900">
        <span className="font-semibold">Given by:</span> {code.eligibility_updated_by}
      </p>
    )}
  </div>
)}

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-2 text-[11px]">
        <div>
          <span className="block text-[10px] font-bold uppercase text-slate-500">Payment Status</span>
          <span className={`font-bold ${code.annual_fee_status === "paid" ? "text-emerald-700" : "text-rose-700"}`}>
            {code.annual_fee_status === "paid" ? "Paid" : "Unpaid"}
          </span>
          <span className="block font-mono text-[9px] text-slate-500">Membership: {code.membership_status}</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold uppercase text-slate-500">KYC Status</span>
          <span className={`font-bold ${code.kyc_status === "yes" ? "text-emerald-700" : "text-amber-700"}`}>
            {code.kyc_status === "yes" ? "Verified" : "Pending"}
          </span>
          <span className="block font-mono text-[9px] text-slate-500">Ballots: {code.ballot_entitlement}</span>
        </div>
      </div>

      <div>
        {locked ? (
          <div className="w-full">
            <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-700">
              <span className="flex items-center space-x-2">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
                </svg>
                <span>Already Allotted</span>
              </span>
              <svg className="h-3.5 w-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            {code.allotted_at && (
              <p className="mt-1 text-right font-mono text-[10px] text-slate-500">
                Issued: <span className="font-semibold text-slate-700">{new Date(code.allotted_at).toLocaleString()}</span>
              </p>
            )}
          </div>
        ) : blocked ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs font-semibold text-rose-700">
            {code.block_reason}
          </div>
        ) : (
          <label className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 p-2 transition-all hover:bg-blue-100">
            <span className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
              <svg className={`h-4 w-4 ${selected ? "text-blue-600" : "text-slate-300"}`} fill="currentColor" viewBox="0 0 20 20">
                {selected ? <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3.707 5.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293z" clipRule="evenodd" /> : <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />}
              </svg>
              <span>{selected ? "✓ Selected for Allotment" : "Select for Allotment"}</span>
            </span>
            <input type="checkbox" checked={selected} disabled={disabled} onChange={onToggle} className="h-4 w-4 cursor-pointer rounded text-blue-600 focus:ring-blue-500" />
          </label>
        )}
      </div>
    </div>
  );
}