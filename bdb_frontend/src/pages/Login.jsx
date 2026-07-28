import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const FY_OPTIONS = [
  { value: "2026-27", label: "FY 2026–27 (Active Election)" },
  { value: "2027-28", label: "FY 2027–28 (Upcoming Context)" },
];

export default function Login() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [year, setYear] = useState("2026-27");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }
    setLoading(true);
    const result = await signIn(username.trim(), password);
    setLoading(false);
    if (result.success) {
      localStorage.setItem("bdb_year", year);
      showToast("success", "Signed in", `Welcome back. Active year: ${year}.`);
      navigate("/");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-md">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">BDB Voting &amp; KYC Portal</h1>
          <p className="text-xs text-slate-500">Sign in to access elections management &amp; ballot allotments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 flex items-center justify-between font-bold text-slate-700">
              <span>Financial Year</span>
              <span className="text-[10px] font-semibold text-blue-600">Active: 2026–27</span>
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block font-bold text-slate-700">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-bold text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-60"
          >
            <span>{loading ? "Signing in…" : "Sign In"}</span>
            {!loading && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-2 text-center font-mono text-[10px] text-slate-400">
          BDB Voting &amp; KYC Portal v2.5
        </div>
      </div>
    </div>
  );
}
