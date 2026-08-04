// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";

// const ROLE_LABELS = { admin: "Super Admin", supervisor: "Counter", counting: "Counting Login" };
// const ROLE_INITIALS = { admin: "SA", supervisor: "CT", counting: "CO" };

// const FY_OPTIONS = [
//   { value: "2026-27", label: "2026–27 (Active)" },
//   { value: "2027-28", label: "2027–28 (Upcoming)" },
// ];

// const NAV_ITEMS = [
//   { path: "/search", label: "Counter Search & Issue", roles: ["supervisor", "admin"] },
//   { path: "/matrix", label: "Super Admin All-Counter Matrix", roles: ["admin", "counting"] },
//   { path: "/master-report", label: "Master Allotment Transaction Report", roles: ["supervisor", "admin", "counting"] },
//   { path: "/my-report", label: "My Counter Distribution Report", roles: ["supervisor"] },
//   { path: "/counting", label: "Vote Counting", roles: ["counting", "admin"] },
//   { path: "/results", label: "Live Results", roles: ["supervisor", "admin", "counting"] },
//   { path: "/users", label: "User Management", roles: ["admin"] },
//   { path: "/pool-allotment", label: "Pool Allotment", roles: ["admin"] },
//   { path: "/eligibility", label: "Manage Eligibility", roles: ["admin"] },
//   { path: "/audit", label: "Audit Trail Log", roles: ["admin"] },
//   { path: "/superadmin-actions", label: "SuperAdmin Actions Report", roles: ["admin"] },
//   { path: "/candidate-master", label: "Candidate Master", roles: ["admin"] },
//   { path: "/counting-detailed-report", label: "Detailed Voting Report", roles: ["counting", "admin"] },
// ];

// export default function TopBar() {
//   const { user, signOut } = useAuth();
//   const { showToast } = useToast();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [year, setYear] = useState(localStorage.getItem("bdb_year") || "2026-27");

//   const isArchiveYear = false; // reserved: year-wise DB isn't wired up on the backend yet

//   async function handleSignOut() {
//     await signOut();
//     navigate("/login");
//   }

//   function handleYearChange(e) {
//     const newYear = e.target.value;
//     setYear(newYear);
//     localStorage.setItem("bdb_year", newYear);
//     showToast("info", "Year context switch", `Switched active year to FY ${newYear}.`);
//   }

//   const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

//   return (
//     <>
//       <header className="sticky top-0 z-40 border-b border-slate-50 bg-slate-100 text-white shadow-md">
//         <div className="mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex h-18 items-center justify-between">
//             <div className="flex items-center space-x-3">
//     <div className="mx-auto flex h-14 items-center justify-center mr-3">
//   <img src="./images/bdb-mainlogo.svg" alt="BDB" className="h-full w-full object-contain" />
// </div>
//               <div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-base font-bold tracking-tight text-slate-700">BDB Voting &amp; KYC Portal</span>
//                   <span className="rounded border border-blue-700/50 bg-blue-900/80 px-2 py-0.5 text-[10px] font-bold text-blue-300">v2.5</span>
//                 </div>
//                 <p className="text-[11px] text-slate-400">Elections Management, KYC Verification &amp; Ballot Allotment</p>
//               </div>
//             </div>

//             <div className="hidden items-center space-x-4 lg:flex">
//               <div className="flex items-center rounded-lg border border-blue-600 bg-blue-700 p-1">
//                 <span className="flex items-center space-x-1 px-2 text-xs font-medium text-blue-50">
//                   <svg className="h-3.5 w-3.5 text-blue-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                   </svg>
//                   <span>FY:</span>
//                 </span>
//                 <select
//                   value={year}
//                   onChange={handleYearChange}
//                   className="rounded border border-blue-700 bg-blue-800 px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 >
//                   {FY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//                 </select>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3">
//               <div className="hidden text-right sm:block">
//                 <div className="text-xs font-bold text-slate-700">{user?.full_name || user?.username}</div>
//                 <div className="flex items-center justify-end space-x-1 text-[10px] font-semibold text-blue-800">
//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-900" />
//                   <span>{ROLE_LABELS[user?.role] || user?.role}</span>
//                 </div>
//               </div>
//               <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-700 text-sm font-bold text-blue-50">
//                 {ROLE_INITIALS[user?.role] || "U"}
//               </div>
//               <button
//                 onClick={handleSignOut}
//                 className="ml-2 flex items-center space-x-1.5 rounded-lg border border-blue-600 bg-blue-700 px-3 py-1.5 text-xs font-bold text-blue-50 transition-all hover:bg-rose-900/80 hover:text-rose-200"
//               >
//                 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//                 <span className="hidden md:inline">Logout</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {isArchiveYear && (
//           <div className="flex items-center justify-center space-x-2 border-t border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-center text-xs font-semibold text-amber-300">
//             <span>READ-ONLY ARCHIVE MODE — Viewing historical records for FY {year}. Modifications are disabled.</span>
//           </div>
//         )}
//       </header>

//       <nav className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
//         {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}

// <div className="mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="custom-scrollbar flex space-x-1 overflow-x-auto py-2 sm:space-x-3">
//             {visibleItems.map((item) => (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`whitespace-nowrap rounded-lg border-b-2 px-3 py-2 text-xs font-medium transition-all ${
//                   location.pathname === item.path
//                     ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
//                     : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }


import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ROLE_LABELS = { admin: "Super Admin", supervisor: "Counter", counting: "Counting Login" };
const ROLE_INITIALS = { admin: "SA", supervisor: "CT", counting: "CO" };

const FY_OPTIONS = [
  { value: "2026-27", label: "2026–27 (Active)" },
  { value: "2027-28", label: "2027–28 (Upcoming)" },
];

const NAV_ITEMS = [
  { path: "/search", label: "Counter Search & Issue", roles: ["supervisor", "admin"] },
  { path: "/matrix", label: "Super Admin All-Counter Matrix", roles: ["admin", "counting"] },
  { path: "/master-report", label: "Master Allotment Transaction Report", roles: ["supervisor", "admin", "counting"] },
  { path: "/my-report", label: "My Counter Distribution Report", roles: ["supervisor"] },
  { path: "/counting", label: "Vote Counting", roles: ["counting", "admin"] },
  { path: "/results", label: "Live Results", roles: ["supervisor", "admin", "counting"] },
  { path: "/users", label: "User Management", roles: ["admin"] },
  { path: "/pool-allotment", label: "Pool Allotment", roles: ["admin"] },
  { path: "/eligibility", label: "Manage Eligibility", roles: ["admin"] },
  { path: "/audit", label: "Audit Trail Log", roles: ["admin"] },
  { path: "/superadmin-actions", label: "SuperAdmin Actions Report", roles: ["admin"] },
  { path: "/candidate-master", label: "Candidate Master", roles: ["admin"] },
  { path: "/counting-detailed-report", label: "Detailed Voting Report", roles: ["counting", "admin"] },
];

export default function TopBar() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [year, setYear] = useState(localStorage.getItem("bdb_year") || "2026-27");
  const scrollRef = useRef(null); // tabs wali row ko "pakadne" ke liye

  const isArchiveYear = false; // reserved: year-wise DB isn't wired up on the backend yet

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  function handleYearChange(e) {
    const newYear = e.target.value;
    setYear(newYear);
    localStorage.setItem("bdb_year", newYear);
    showToast("info", "Year context switch", `Switched active year to FY ${newYear}.`);
  }

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  // arrow click hone par: agla/pichla tab select bhi hoga aur us page pe navigate bhi hoga
  function moveTab(direction) {
    const currentIndex = visibleItems.findIndex(
      (item) => item.path === location.pathname
    );

    // agar current page kisi tab se match nahi hua, to pehle tab se start karo
    const baseIndex = currentIndex === -1 ? 0 : currentIndex;

    let targetIndex;
    if (direction === "right") {
      targetIndex = Math.min(baseIndex + 1, visibleItems.length - 1);
    } else {
      targetIndex = Math.max(baseIndex - 1, 0);
    }

    const targetItem = visibleItems[targetIndex];
    if (!targetItem) return;

    // 👉 yahi wo line hai jo asli "tab switch" karti hai, jaise manual click
    navigate(targetItem.path);

    // us tab ko screen mein bhi visible kar do (scroll)
    const container = scrollRef.current;
    if (container) {
      const buttons = Array.from(container.querySelectorAll("button"));
      buttons[targetIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-50 bg-slate-100 text-white shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
            <div className="flex items-center space-x-3">
    <div className="mx-auto flex h-14 items-center justify-center mr-3">
  <img src="./images/bdb-mainlogo.svg" alt="BDB" className="h-full w-full object-contain" />
</div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold tracking-tight text-slate-700">BDB Voting</span>
                  <span className="rounded border border-blue-700/50 bg-blue-900/80 px-2 py-0.5 text-[10px] font-bold text-blue-300">v2.5</span>
                </div>
                <p className="text-[11px] text-slate-400">Elections Management, KYC Verification &amp; Ballot Allotment</p>
              </div>
            </div>

            <div className="hidden items-center space-x-4 lg:flex">
              <div className="flex items-center rounded-lg border border-blue-600 bg-blue-700 p-1">
                <span className="flex items-center space-x-1 px-2 text-xs font-medium text-blue-50">
                  <svg className="h-3.5 w-3.5 text-blue-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>FY:</span>
                </span>
                <select
                  value={year}
                  onChange={handleYearChange}
                  className="rounded border border-blue-700 bg-blue-800 px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {FY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden text-right sm:block">
                <div className="text-xs font-bold text-slate-700">{user?.full_name || user?.username}</div>
                <div className="flex items-center justify-end space-x-1 text-[10px] font-semibold text-blue-800">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-900" />
                  <span>{ROLE_LABELS[user?.role] || user?.role}</span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-600 bg-blue-700 text-sm font-bold text-blue-50">
                {ROLE_INITIALS[user?.role] || "U"}
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 flex items-center space-x-1.5 rounded-lg border border-blue-600 bg-blue-700 px-3 py-1.5 text-xs font-bold text-blue-50 transition-all hover:bg-rose-900/80 hover:text-rose-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {isArchiveYear && (
          <div className="flex items-center justify-center space-x-2 border-t border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-center text-xs font-semibold text-amber-300">
            <span>READ-ONLY ARCHIVE MODE — Viewing historical records for FY {year}. Modifications are disabled.</span>
          </div>
        )}
      </header>

      <nav className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex items-center px-2">

          {/* LEFT ARROW */}
          <button
            onClick={() => moveTab("left")}
            aria-label="Previous tab"
            className="flex-shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            ◀
          </button>

          {/* SCROLLABLE TABS */}
          <div
            ref={scrollRef}
            className="custom-scrollbar flex flex-1 space-x-1 overflow-x-auto py-1.5 sm:space-x-2 scroll-smooth"
          >
            {visibleItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`whitespace-nowrap rounded-lg border-b-2 px-3 py-2 text-xs font-medium transition-all ${
                  location.pathname === item.path
                    ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* RIGHT ARROW */}
          <button
            onClick={() => moveTab("right")}
            aria-label="Next tab"
            className="flex-shrink-0 rounded p-1 text-slate-500 hover:bg-slate-100"
          >
            ▶
          </button>

        </div>
      </nav>
    </>
  );
}