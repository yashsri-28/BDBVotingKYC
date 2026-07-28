import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Gates a route by role. `allow` omitted means any signed-in user may view it. */
export default function ProtectedRoute({ children, allow }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
