import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 relative overflow-hidden px-4">
      {/* Ambient gradient echoing the bourse mark's globe, kept subtle and static */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-royal-500), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-gold-500), transparent 70%)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1.5 brand-rule" />
          <div className="px-8 pt-8 pb-6 text-center border-b border-steel-200">
            <img src="/images/bdb-logo.png" alt="Bharat Diamond Bourse" className="h-16 w-auto mx-auto mb-3" />
            <h1 className="brand-serif text-2xl font-semibold text-navy-900">Election Verification Portal</h1>
            <p className="text-xs tracking-[0.2em] uppercase text-steel-400 mt-1">Counter Staff Sign In</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-navy-800 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-steel-200 px-3.5 py-2.5 text-navy-900 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition"
                placeholder="e.g. counter1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy-800 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-steel-200 px-3.5 py-2.5 text-navy-900 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy-900 text-white font-medium py-2.5 hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="px-8 pb-6 text-center text-xs text-steel-400">
            For authorized Election Counter Staff use only.
          </div>
        </div>
      </div>
    </div>
  );
}
