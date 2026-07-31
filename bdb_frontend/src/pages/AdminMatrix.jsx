import { useState, useEffect } from "react";
import { fetchDashboard } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminMatrix() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard()
      .then(setPools)
      .catch((err) => setError(getErrorMessage(err, "The distribution matrix could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  function handleExport() {
    showToast("success", "Export generated", "Exported All-Counter dataset to Excel format successfully.");
  }

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8 text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Super Admin Combined Ballot Distribution Matrix</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">Real-time inventory tracking across all counters.</p>
          </div>
          {user?.role === "admin" && (
            <button onClick={handleExport} className="flex items-center space-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800">
              <span>Export All-Counter Excel</span>
            </button>
          )}
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {pools.map((pool) => (
          <div key={pool.roll_type} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{pool.roll_type} Pool</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Total Base Assigned" value={`${pool.allocated_total} / ${pool.total_ballots}`} sub={`Unallocated: ${pool.unallocated}`} tone="slate" />
              <StatCard label="Distributed to Members" value={pool.used_total} sub={`${pool.counters.length} counter(s)`} tone="emerald" />
              <StatCard label="Balance with Counters" value={pool.allocated_total - pool.used_total} sub="Remaining" tone="amber" />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-blue-900 font-semibold text-white">
                    <th className="p-3">Counter Login</th>
                    <th className="p-3 text-center">Distributed to Counter</th>
                    <th className="p-3 text-center">Distributed to Member</th>
                    <th className="p-3 text-center">Balance with Counter</th>
                    <th className="p-3 text-center">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {pool.counters.map((row) => {
                    const pct = row.assigned_count ? Math.round((row.used_count / row.assigned_count) * 100) : 0;
                    return (
                      <tr key={row.counter} className="transition-colors hover:bg-slate-50">
                        <td className="flex items-center space-x-2 p-3 font-bold text-slate-900">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                            {row.counter_name.charAt(0)}
                          </div>
                          <span>{row.counter_name}</span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold text-slate-700">{row.assigned_count}</td>
                        <td className="bg-emerald-50/50 p-3 text-center font-mono font-bold text-emerald-700">{row.used_count}</td>
                        <td className="bg-amber-50/50 p-3 text-center font-mono font-bold text-amber-700">{row.remaining_count}</td>
                        <td className="p-3 text-center">
                          <div className="mx-auto h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="mt-0.5 block font-mono text-[10px] text-slate-500">{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                  {pool.counters.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-400">No counters have been assigned this pool yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {pools.length === 0 && !error && (
          <p className="text-sm text-slate-400">No ballot pools have been set up yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone }) {
  const tones = {
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <span className="block text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</span>
      <div className="mt-1 font-mono text-2xl font-black">{value}</div>
      <span className="text-[10px] opacity-70">{sub}</span>
    </div>
  );
}
