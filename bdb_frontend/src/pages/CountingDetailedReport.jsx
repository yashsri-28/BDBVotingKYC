import { useState, useEffect, useCallback } from "react";
import { fetchCategories, fetchDetailedReport } from "../api/counting";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

export default function CountingDetailedReport() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        const current = data.find((c) => c.status === "in_progress") || data[0];
        if (current) setSelectedId(current.id);
      })
      .catch((err) => setError(getErrorMessage(err, "The election categories could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  const loadReport = useCallback(async (categoryId) => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const data = await fetchDetailedReport(categoryId);
      setReport(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "The detailed report could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReport(selectedId); }, [selectedId, loadReport]);

  const selectedCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Detailed Voting Report</h1>
        <p className="mt-1 text-xs text-slate-500">
          Ballot-by-ballot grid — each row is one physical ballot, each tick shows which candidate it voted for.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedId(cat.id)}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
              selectedId === cat.id
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-800 bg-blue-900 px-5 py-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            {selectedCategory?.name || "—"} — {report?.total_ballots ?? 0} ballots counted
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
            <tr className="bg-slate-100 font-bold text-slate-700">
                <th className="p-3">Sr. No.</th>
                <th className="p-3">Ballot No.</th>
               {report?.candidate_serials.map((s) => (
                  <th key={s} className="p-3 text-center">
                    <div className="font-mono text-slate-500">#{s}</div>
                    <div className="mx-auto mt-0.5 max-w-[100px] truncate text-center normal-case">
                      {report.candidate_labels?.[s] || `Candidate ${s}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && (
                <tr><td colSpan={(report?.candidate_serials.length || 0) + 2} className="p-6 text-center text-slate-400">Loading…</td></tr>
              )}
              {!loading && (!report || report.rows.length === 0) && (
                <tr><td colSpan={(report?.candidate_serials.length || 0) + 2} className="p-6 text-center text-slate-400">No ballots counted yet.</td></tr>
              )}
              {!loading && report?.rows.map((row) => (
                <tr key={row.ballot_no} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-600">{row.sr_no}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">{row.ballot_no}</td>
                  {report.candidate_serials.map((s) => (
                    <td key={s} className="p-3 text-center">
                      {row.marks[s] ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">✓</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}