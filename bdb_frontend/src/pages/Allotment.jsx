import { useState } from "react";
import { searchAccessCard, allotCustomerCodes } from "../api/allotment";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import EligibilityBadge from "../components/EligibilityBadge";

export default function Allotment() {
  const [cardNumber, setCardNumber] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!cardNumber.trim()) {
      setError("Please enter an access card number to search.");
      return;
    }
    setLoading(true);
    try {
      const data = await searchAccessCard(cardNumber.trim());
      setResult(data);
      // Everything that can be allotted starts selected, per the counter flow.
      setSelected(new Set(data.customer_codes.filter((c) => c.default_selected).map((c) => c.customer_code)));
    } catch (err) {
      setResult(null);
      setSelected(new Set());
      setError(getErrorMessage(err, "That access card could not be searched. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  function toggle(code) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  async function handleAllot() {
    if (selected.size === 0) {
      setError("Select at least one customer code before allotting ballots.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await allotCustomerCodes(result.access_card_number, [...selected]);
      const totalBallots = created.reduce((sum, a) => sum + a.ballots_allotted, 0);
      setNotice(
        `Ballots allotted for ${created.length} customer code${created.length === 1 ? "" : "s"} ` +
        `(${totalBallots} ballot${totalBallots === 1 ? "" : "s"} in total).`
      );
      // Re-run the search so newly allotted codes come back locked.
      const refreshed = await searchAccessCard(result.access_card_number);
      setResult(refreshed);
      setSelected(new Set(refreshed.customer_codes.filter((c) => c.default_selected).map((c) => c.customer_code)));
    } catch (err) {
      setError(getErrorMessage(err, "These ballots could not be allotted. Please review and try again."));
    } finally {
      setSaving(false);
    }
  }

  const selectedBallots = result
    ? result.customer_codes
        .filter((c) => selected.has(c.customer_code))
        .reduce((sum, c) => sum + c.ballot_entitlement, 0)
    : 0;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-950">Ballot Allotment</h1>
        <p className="text-sm text-steel-400 mt-1">
          Search an access card, confirm which member entities are voting, and allot their ballots.
        </p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="Access card number, e.g. GEM209202"
          aria-label="Access card number"
          className="flex-1 rounded-lg border border-steel-200 px-4 py-3 font-mono text-navy-950 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="tap-target rounded-lg bg-navy-900 px-6 py-3 font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {notice && <div className="mb-4"><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      {result && (
        <section>
          <div className="mb-4 rounded-lg border border-steel-200 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-steel-400">Authorised Representative</div>
            <div className="font-semibold text-navy-950">{result.representative_name || "—"}</div>
            <div className="mt-1 font-mono text-sm text-steel-400">{result.access_card_number}</div>
          </div>

          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-navy-800">
              {result.customer_codes.length} customer code{result.customer_codes.length === 1 ? "" : "s"} linked ·{" "}
              {result.already_allotted_count} already allotted · {result.pending_count} available
            </span>
            {selected.size > 0 && (
              <span className="font-medium text-navy-900">
                {selected.size} selected · {selectedBallots} ballot{selectedBallots === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <ul className="space-y-2">
            {result.customer_codes.map((code) => {
              const isSelected = selected.has(code.customer_code);
              const locked = code.already_allotted;
              const blocked = !locked && !code.selectable;

              return (
                <li
                  key={code.customer_code}
                  className={`rounded-lg border p-4 transition-colors ${
                    locked
                      ? "border-steel-200 bg-steel-200/30 opacity-70"
                      : blocked
                      ? "border-blocked-600/30 bg-blocked-100/40"
                      : isSelected
                      ? "border-royal-500 bg-ice-100"
                      : "border-steel-200 bg-white"
                  }`}
                >
                  <label className={`flex items-start gap-3 ${code.selectable ? "cursor-pointer" : "cursor-not-allowed"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!code.selectable}
                      onChange={() => toggle(code.customer_code)}
                      className="mt-1 h-5 w-5 accent-[color:var(--color-navy-900)]"
                      aria-label={`Select ${code.entity_name}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-navy-950">{code.entity_name}</span>
                        {locked && (
                          <span className="rounded-full bg-steel-200 px-2.5 py-0.5 text-xs font-semibold text-steel-400">
                            Already Allotted
                          </span>
                        )}
                        {blocked && (
                          <span className="rounded-full bg-blocked-100 px-2.5 py-0.5 text-xs font-semibold text-blocked-600">
                            Not Eligible
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 font-mono text-sm text-steel-400">
                        {code.customer_code} · {code.membership_number || "—"}
                      </div>

                      {blocked && code.block_reason && (
                        <p className="mt-1.5 text-sm text-blocked-600">{code.block_reason}</p>
                      )}
                      {locked && code.allotted_at && (
                        <p className="mt-1.5 text-sm text-steel-400">
                          Allotted on {new Date(code.allotted_at).toLocaleString()}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <EligibilityBadge value={code.membership_status} />
                        <EligibilityBadge value={code.annual_fee_status} />
                        <EligibilityBadge value={code.kyc_status} />
                        {code.on_electoral_roll ? (
                          <span className="rounded-full bg-ice-100 px-2.5 py-1 text-xs font-semibold text-navy-900">
                            {code.ballot_entitlement} ballot{code.ballot_entitlement === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-pending-100 px-2.5 py-1 text-xs font-semibold text-pending-600">
                            Not on electoral roll
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>

          {result.pending_count > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleAllot}
                disabled={saving || selected.size === 0}
                className="tap-target rounded-lg bg-verified-600 px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Allotting…" : `Allot ${selected.size} selected`}
              </button>
              <button
                onClick={() => { setResult(null); setSelected(new Set()); setCardNumber(""); }}
                className="tap-target rounded-lg px-6 py-2.5 font-medium text-steel-400 transition hover:text-navy-800"
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
