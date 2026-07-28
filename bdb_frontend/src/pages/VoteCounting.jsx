import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCategories, fetchCandidates, recordBallot, fetchRecentBallots,
  deleteBallot, fetchLiveTotals,
} from "../api/counting";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

export default function VoteCounting() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [recentBallots, setRecentBallots] = useState([]);
  const [totals, setTotals] = useState(null);

  const [ballotNo, setBallotNo] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const ballotInputRef = useRef(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      const inProgress = data.find((c) => c.status === "in_progress");
      setActiveCategory(inProgress || null);
    } catch (err) {
      setError(getErrorMessage(err, "The election categories could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const refreshCategoryData = useCallback(async (categoryId) => {
    try {
      const [cands, ballots, live] = await Promise.all([
        fetchCandidates(categoryId),
        fetchRecentBallots(categoryId),
        fetchLiveTotals(categoryId),
      ]);
      setCandidates(cands);
      setRecentBallots(ballots);
      setTotals(live);
    } catch (err) {
      setError(getErrorMessage(err, "This category's counting data could not be loaded."));
    }
  }, []);

  useEffect(() => {
    if (activeCategory) refreshCategoryData(activeCategory.id);
  }, [activeCategory, refreshCategoryData]);

  const votesRequired = activeCategory?.votes_per_ballot ?? 0;
  const canSave = ballotNo.trim() !== "" && picked.length === votesRequired;

  function togglePick(serial) {
    setPicked((prev) => {
      if (prev.includes(serial)) return prev.filter((s) => s !== serial);
      if (prev.length >= votesRequired) return prev;  // never exceed what the ballot allows
      return [...prev, serial];
    });
  }

  function clearEntry() {
    setBallotNo("");
    setPicked([]);
    ballotInputRef.current?.focus();
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError("");
    try {
      await recordBallot(activeCategory.id, Number(ballotNo), picked);
      setNotice(`Ballot ${ballotNo} saved.`);
      clearEntry();
      await refreshCategoryData(activeCategory.id);
    } catch (err) {
      setError(getErrorMessage(err, "This ballot could not be saved. Please check the entry and try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ballot) {
    setError("");
    try {
      await deleteBallot(ballot.id, "Corrected during counting");
      setNotice(`Ballot ${ballot.ballot_no} removed.`);
      await refreshCategoryData(activeCategory.id);
    } catch (err) {
      setError(getErrorMessage(err, "That ballot could not be removed."));
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-8 text-steel-400">Loading counting screen…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-950">Vote Counting</h1>
        <p className="mt-1 text-sm text-steel-400">
          Enter each ballot number and mark the candidates it voted for.
        </p>
      </header>

      {notice && <div className="mb-4"><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      {/* Category strip — only the in-progress one is usable, the rest stay disabled */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          const done = cat.status === "completed";
          return (
            <div
              key={cat.id}
              className={`rounded-lg border px-4 py-2 text-sm ${
                isActive
                  ? "border-navy-900 bg-navy-900 text-white"
                  : done
                  ? "border-verified-600/30 bg-verified-100 text-verified-600"
                  : "border-steel-200 bg-white text-steel-400"
              }`}
            >
              <span className="font-medium">{cat.name}</span>
              <span className="ml-2 text-xs opacity-80">
                {done ? "Completed" : cat.status === "in_progress" ? "In progress" : "Locked"}
              </span>
            </div>
          );
        })}
      </div>

      {!activeCategory ? (
        <Alert type="info">
          No category is currently open for counting. A Super Admin needs to start one before ballots can be entered.
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Entry panel */}
          <section className="rounded-xl border border-steel-200 bg-white p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-navy-950">{activeCategory.name}</h2>
              <span className="text-sm text-steel-400">
                {votesRequired} vote{votesRequired === 1 ? "" : "s"} per ballot
              </span>
            </div>

            <label htmlFor="ballotNo" className="mb-1 block text-sm font-medium text-navy-800">
              Ballot number
            </label>
            <input
              id="ballotNo"
              ref={ballotInputRef}
              type="number"
              min="1"
              value={ballotNo}
              onChange={(e) => setBallotNo(e.target.value)}
              placeholder="e.g. 101"
              className="mb-5 w-full rounded-lg border border-steel-200 px-4 py-3 font-mono text-navy-950 placeholder:text-steel-300 outline-none transition focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
            />

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-navy-800">Candidates voted for</span>
              <span className={`text-sm font-medium ${picked.length === votesRequired ? "text-verified-600" : "text-pending-600"}`}>
                {picked.length} of {votesRequired} selected
              </span>
            </div>

            <ul className="mb-5 space-y-2">
              {candidates.map((c) => {
                const isPicked = picked.includes(c.serial_no);
                const atLimit = !isPicked && picked.length >= votesRequired;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => togglePick(c.serial_no)}
                      disabled={atLimit}
                      className={`tap-target flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition ${
                        isPicked
                          ? "border-navy-900 bg-ice-100"
                          : atLimit
                          ? "cursor-not-allowed border-steel-200 bg-white opacity-50"
                          : "border-steel-200 bg-white hover:bg-ice-50"
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-mono text-sm font-semibold ${
                        isPicked ? "bg-navy-900 text-white" : "bg-steel-200 text-navy-800"
                      }`}>
                        {c.serial_no}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-navy-950">{c.candidate_name}</span>
                        {c.member_name && (
                          <span className="block truncate text-sm text-steel-400">{c.member_name}</span>
                        )}
                      </span>
                      {isPicked && <span className="text-verified-600" aria-hidden="true">✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="tap-target rounded-lg bg-verified-600 px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Ballot"}
              </button>
              <button
                onClick={clearEntry}
                className="tap-target rounded-lg px-6 py-2.5 font-medium text-steel-400 transition hover:text-navy-800"
              >
                Ignore
              </button>
            </div>

            {!canSave && ballotNo && picked.length !== votesRequired && (
              <p className="mt-3 text-sm text-pending-600">
                Select exactly {votesRequired} candidate{votesRequired === 1 ? "" : "s"} before saving this ballot.
              </p>
            )}
          </section>

          {/* Running totals + recent entries */}
          <aside className="space-y-4">
            {totals && (
              <div className="rounded-xl border border-steel-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-steel-400">
                  Running total
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-navy-800">Total ballots entered</dt>
                    <dd className="font-mono font-semibold text-navy-950">{totals.total_ballots}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-navy-800">Total votes entered</dt>
                    <dd className="font-mono font-semibold text-navy-950">{totals.total_votes}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="rounded-xl border border-steel-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-steel-400">
                Recent ballots
              </h3>
              {recentBallots.length === 0 ? (
                <p className="text-sm text-steel-400">No ballots entered yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {recentBallots.slice(0, 10).map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-mono text-navy-950">#{b.ballot_no}</span>
                      <span className="text-steel-400">{b.candidate_serials.join(", ")}</span>
                      <button
                        onClick={() => handleDelete(b)}
                        className="text-xs text-blocked-600 hover:underline"
                        aria-label={`Remove ballot ${b.ballot_no}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
