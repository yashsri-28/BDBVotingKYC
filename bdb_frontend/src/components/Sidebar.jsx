// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const NAV_ITEMS = [
//   { path: "/search", label: "Counter Search & Issue", roles: ["supervisor", "admin"] },
//   // { path: "/matrix", label: "Super Admin All-Counter Matrix", roles: ["admin", "counting"] },
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
//   { path: "/auth-rep-management", label: "Auth Rep Management", roles: ["admin"] },
// ];

// export default function Sidebar() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Filter items based on user role just like before
//   const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

//   return (
//     <aside className="flex flex-col w-64 h-full bg-[#f1f1f1] transition-all duration-300">
      
//       <div className="flex-1 overflow-y-auto py-4 custom-scrollbar max-h-[calc(100vh-80px)]">
//         <nav className="flex flex-col space-y-1 px-3">
//           {visibleItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             return (
//               <button
//                 key={item.path}
//                 onClick={() => navigate(item.path)}
//                 className={`flex items-center text-left w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-[#083d77] text-white shadow-sm"
//                     : "text-[#083d77] hover:bg-[#083d77] hover:text-white"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             );
//           })}
//         </nav>
//       </div>
//     </aside>
//   );
// }






import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/search", label: "Counter Search & Issue", roles: ["supervisor", "admin"] },
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
  { path: "/auth-rep-management", label: "Auth Rep Management", roles: ["admin"] },
];

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <aside 
      className={`h-full bg-[#f1f1f1] flex-shrink-0 !transition-[width] !duration-300 !ease-in-out overflow-hidden ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      <div className="w-64 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar max-h-[calc(100vh-80px)]">
          <nav className="flex flex-col space-y-1 px-3">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center text-left w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-900 text-white shadow-sm"
                      : "text-blue-900 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}