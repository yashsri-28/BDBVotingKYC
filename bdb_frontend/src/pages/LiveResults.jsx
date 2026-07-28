import { useState, useEffect, useCallback } from "react";
import { fetchCategories, fetchLiveTotals } from "../api/counting";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

const REFRESH_MS = 5000;

/**
 * The member-facing results display. Polls the live totals so the board
 * updates itself as the counting user enters ballots.
 */
export default function LiveResults() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [totals, setTotals] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        setCategories(data);
        const current = data.find((c) => c.status === "in_progress") || data[0];
        if (current) setSelectedId(current.id);
      })
      .catch((err) => setError(getErrorMessage(err, "The election categories could not be loaded.")));
  }, []);

  const refresh = useCallback(async (categoryId) => {
    try {
      const data = await fetchLiveTotals(categoryId);
      setTotals(data);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "The live results could not be refreshed."));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    refresh(selectedId);
    const timer = setInterval(() => refresh(selectedId), REFRESH_MS);
    return () => clearInterval(timer);
  }, [selectedId, refresh]);

  const selected = categories.find((c) => c.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 text-center">
        <img src="/images/bdb-logo.png" alt="Bharat Diamond Bourse" className="mx-auto mb-3 h-14 w-auto" />
        <h1 className="brand-serif text-2xl font-semibold uppercase tracking-wide text-navy-950">
          Election of Managing Committee
        </h1>
        {totals && <p className="mt-1 text-lg text-navy-800">{totals.category} · {totals.election_year}</p>}
      </header>

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedId(cat.id)}
            className={`tap-target rounded-lg border px-4 py-2 text-sm font-medium transition ${
              selectedId === cat.id
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-steel-200 bg-white text-navy-800 hover:bg-ice-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {totals && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <ResultsTable
              title="Candidates — Sr. No. Wise"
              rows={totals.by_serial}
              totalVotes={totals.total_votes}
              totalBallots={totals.total_ballots}
            />
            <ResultsTable
              title="Candidates — Leading Vote Wise"
              rows={totals.by_leading}
              totalVotes={totals.total_votes}
              highlightTop
            />
          </div>

          <p className="mt-6 text-center text-sm text-steel-400" aria-live="polite">
            {selected?.status === "in_progress" ? "Counting in progress · " : ""}
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </p>
        </>
      )}
    </div>
  );
}

function ResultsTable({ title, rows, totalVotes, totalBallots, highlightTop = false }) {
  return (
    <section className="overflow-hidden rounded-xl border border-steel-200 bg-white">
      <h2 className="border-b border-steel-200 bg-ice-100 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-navy-900">
        {title}
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-steel-200 text-left text-xs uppercase tracking-wide text-steel-400">
            <th className="px-4 py-2 font-medium">Sr. No.</th>
            <th className="px-4 py-2 font-medium">Candidate</th>
            <th className="px-4 py-2 text-right font-medium">Votes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-steel-200">
          {rows.map((r, i) => (
            <tr key={r.serial_no} className={highlightTop && i < 2 ? "bg-ice-100" : ""}>
              <td className="px-4 py-2 font-mono text-navy-800">{r.serial_no}</td>
              <td className="px-4 py-2 font-medium text-navy-950">{r.candidate_name}</td>
              <td className="px-4 py-2 text-right font-mono font-semibold text-navy-950">{r.votes}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-navy-900">
          <tr className="bg-ice-50">
            <td colSpan={2} className="px-4 py-2 font-semibold text-navy-900">Total Votes</td>
            <td className="px-4 py-2 text-right font-mono font-semibold text-navy-950">{totalVotes}</td>
          </tr>
          {totalBallots !== undefined && (
            <tr className="bg-verified-100">
              <td colSpan={2} className="px-4 py-2 font-semibold text-verified-600">Total Ballots</td>
              <td className="px-4 py-2 text-right font-mono font-semibold text-verified-600">{totalBallots}</td>
            </tr>
          )}
        </tfoot>
      </table>
    </section>
  );
}
