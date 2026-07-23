import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requireSupervisor = false }) {
  const { user, isSupervisorOrAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireSupervisor && !isSupervisorOrAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
