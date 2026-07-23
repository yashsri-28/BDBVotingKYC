import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function TopBar() {
  const { user, counter, signOut, isSupervisorOrAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const navItem = (path, label) => (
    <button
      onClick={() => navigate(path)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        location.pathname === path
          ? "bg-navy-900 text-white"
          : "text-navy-800 hover:bg-ice-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="border-b border-steel-200 bg-white">
      <div className="h-1 brand-rule" />
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="hidden md:flex items-center gap-1">
          {navItem("/dashboard", "Verify")}
          {navItem("/search", "Search")}
          {isSupervisorOrAdmin && navItem("/audit", "Audit Log")}
          {isSupervisorOrAdmin && navItem("/counters", "Counters")}
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-navy-900">{user?.full_name || user?.username}</div>
            <div className="text-xs text-steel-400">
              {user?.role === "staff" && counter ? `Counter ${counter.counter_number}` : user?.role}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-blocked-600 hover:text-blocked-600/80 border border-blocked-100 bg-blocked-100 px-3 py-1.5 rounded-md transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-1 px-4 pb-2">
        {navItem("/dashboard", "Verify")}
        {navItem("/search", "Search")}
        {isSupervisorOrAdmin && navItem("/audit", "Audit")}
        {isSupervisorOrAdmin && navItem("/counters", "Counters")}
      </nav>
    </header>
  );
}
