// // import TopBar from "./TopBar";

// // export default function Layout({ children }) {
// //   return (
// //     <div className="flex min-h-screen flex-col bg-slate-100">
// //       <TopBar />
// //       <main className="flex-1">{children}</main>
// //     </div>
// //   );
// // }
 






// // import Sidebar from "./Sidebar";
// import Sidebar from "./Sidebar";
// import TopBar from "./TopBar";

// export default function Layout({ children }) {
//   return (
//     // The main wrapper takes up the full screen height and prevents scrolling on the body
//     <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      
//       {/* 1. Left Sidebar */}
//       <TopBar />
      

//       {/* 2. Right Content Area (Stacks TopBar and Main Page Content) */}
//       <div className="flex flex-1 min-w-0">
        
//         <Sidebar/>
//         {/* Main scrollable view where your routes render */}
//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
//           {children}
//         </main>
//       </div>

//     </div>
//   );
// }







import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden">
      
      <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 min-w-0 overflow-hidden">
        
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:py-4 lg:px-5 !transition-all !duration-300">
          {children}
        </main>
      </div>

    </div>
  );
}