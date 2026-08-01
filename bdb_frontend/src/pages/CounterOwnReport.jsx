// import { useState, useEffect } from "react";
// import { fetchMySummary } from "../api/ballots";
// import { getErrorMessage } from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { useToast } from "../context/ToastContext";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { fetchMySummary } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function CounterOwnReport() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMySummary()
      .then(setRows)
      .catch((err) => setError(getErrorMessage(err, "Your summary could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  // function handleExport() {
  //   showToast("success", "Export generated", "Exported your ballot distribution data to Excel.");
  // }

  function handleExport() {
    if (rows.length === 0) {
      showToast("warning", "Nothing to export", "There's no distribution data to export yet.");
      return;
    }
    const exportRows = rows.map((r) => ({
      "Pool Type": r.roll_type,
      "Received": r.received,
      "Distributed": r.distributed,
      "Balance": r.balance,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Distribution");
    XLSX.writeFile(workbook, `my_ballot_distribution_${Date.now()}.xlsx`);
    showToast("success", "Export generated", "Your ballot distribution data has been exported to Excel.");
  }

  const category = rows.find((r) => r.roll_type === "category") || { received: 0, distributed: 0, balance: 0 };
  const exclusive = rows.find((r) => r.roll_type === "exclusive") || { received: 0, distributed: 0, balance: 0 };

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8 text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Counter Performance &amp; Balance Summary</h2>
            <p className="text-xs text-slate-500">Individual ledger for <strong className="text-slate-800">{user?.full_name || user?.username}</strong></p>
          </div>
          <button onClick={handleExport} className="flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
            <span>Export My Data (Excel)</span>
          </button>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex items-center justify-between rounded-2xl bg-blue-900 p-5 text-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Progress (Distributed / Received)</span>
            <div className="mt-1 font-mono text-2xl font-black sm:text-3xl">
              {category.distributed} / {category.received} (Category) &bull; {exclusive.distributed} / {exclusive.received} (Exclusive)
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 font-bold text-slate-700">
                <th className="p-3">Metric</th>
                <th className="border-l border-slate-200 bg-purple-50 p-3 text-center text-purple-900">Category</th>
                <th className="border-l border-slate-200 bg-amber-50 p-3 text-center text-amber-900">Exclusive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
              <tr>
                <td className="p-3 font-bold">Ballot Received</td>
                <td className="border-l border-slate-200 bg-purple-50/30 p-3 text-center font-mono text-sm">{category.received}</td>
                <td className="border-l border-slate-200 bg-amber-50/30 p-3 text-center font-mono text-sm">{exclusive.received}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-emerald-700">Ballot Distributed</td>
                <td className="border-l border-slate-200 bg-emerald-50 p-3 text-center font-mono text-sm font-black text-emerald-800">{category.distributed}</td>
                <td className="border-l border-slate-200 bg-emerald-50 p-3 text-center font-mono text-sm font-black text-emerald-800">{exclusive.distributed}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-amber-700">Balance Ballot</td>
                <td className="border-l border-slate-200 bg-amber-50 p-3 text-center font-mono text-sm font-black text-amber-800">{category.balance}</td>
                <td className="border-l border-slate-200 bg-amber-50 p-3 text-center font-mono text-sm font-black text-amber-800">{exclusive.balance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
