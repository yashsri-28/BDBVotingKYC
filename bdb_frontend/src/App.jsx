import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import CandidateMaster from "./pages/CandidateMaster";


import SuperAdminActionsReport from "./pages/SuperAdminActionsReport";

import Login from "./pages/Login";
import CounterSearch from "./pages/CounterSearch";
import AdminMatrix from "./pages/AdminMatrix";
import MasterReport from "./pages/MasterReport";
import CounterOwnReport from "./pages/CounterOwnReport";
import AuditTrail from "./pages/AuditTrail";
import UserManagement from "./pages/UserManagement";
import PoolAllotment from "./pages/PoolAllotment";
import VoteCounting from "./pages/VoteCounting";
import LiveResults from "./pages/LiveResults";


import ManageEligibility from "./pages/ManageEligibility";

function protect(element, allow) {
  return <ProtectedRoute allow={allow}><Layout>{element}</Layout></ProtectedRoute>;
}

/** Sends each role to the screen they actually work on first. */
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "counting") return <Navigate to="/matrix" replace />;
  return <Navigate to="/search" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/search" element={protect(<CounterSearch />, ["supervisor", "admin"])} />
            <Route path="/matrix" element={protect(<AdminMatrix />, ["admin", "counting"])} />
            <Route path="/master-report" element={protect(<MasterReport />, ["supervisor", "admin", "counting"])} />
            <Route path="/my-report" element={protect(<CounterOwnReport />, ["supervisor"])} />
            <Route path="/users" element={protect(<UserManagement />, ["admin"])} />
            <Route path="/pool-allotment" element={protect(<PoolAllotment />, ["admin"])} />
            <Route path="/eligibility" element={protect(<ManageEligibility />, ["admin"])} />
            <Route path="/audit" element={protect(<AuditTrail />, ["admin"])} />
            <Route path="/counting" element={protect(<VoteCounting />, ["counting", "admin"])} />
            <Route path="/results" element={protect(<LiveResults />, undefined)} />
            <Route path="/superadmin-actions" element={protect(<SuperAdminActionsReport />, ["admin"])} />
            <Route path="/candidate-master" element={protect(<CandidateMaster />, ["admin"])} />

            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
