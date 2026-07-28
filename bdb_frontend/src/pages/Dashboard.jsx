import { useState } from "react";
import { lookupByCard, acquireLock, releaseLock, submitVerification } from "../api/verification";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import EntityCard from "../components/EntityCard";

const REJECTION_REASONS = [
  "Membership Status is not Active",
  "Voting Eligibility is Not Eligible",
  "Annual Membership Fee is Unpaid",
  "KYC Not Completed",
  "Photograph mismatch — Supervisor approval required",
  "Other",
];

export default function Dashboard() {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [result, setResult] = useState(null); // full lookup response
  const [activeEntity, setActiveEntity] = useState(null); // entity currently locked / being decided
  const [locked, setLocked] = useState(false);

  const [remark, setRemark] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function resetAll() {
    setResult(null);
    setActiveEntity(null);
    setLocked(false);
    setRemark("");
    setRejectionReason("");
    setShowRejectForm(false);
    setCardNumber("");
  }

  async function handleLookup(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!cardNumber.trim()) {
      setError("Please enter an access card number.");
      return;
    }
    setLoading(true);
    try {
      const data = await lookupByCard(cardNumber.trim());
      setResult(data);
      if (data.scenario === "single_entity") {
        // Lock immediately so no other counter can process this entity
        // while this counter is deciding.
        await acquireLock(data.entity.customer_code);
        setActiveEntity(data.entity);
        setLocked(true);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not look up this card. Please try again."));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectEntity(entity) {
    setError("");
    try {
      await acquireLock(entity.customer_code);
      setActiveEntity(entity);
      setLocked(true);
    } catch (err) {
      setError(getErrorMessage(err, "This entity could not be locked for verification."));
    }
  }

  async function handleCancel() {
    if (activeEntity && locked) {
      try {
        await releaseLock(activeEntity.customer_code);
      } catch {
        // Releasing is best-effort — the lock will also expire server-side.
      }
    }
    resetAll();
  }

  async function handleVerify() {
    if (!activeEntity) return;
    setSubmitting(true);
    setError("");
    try {
      await submitVerification(activeEntity.customer_code, { action: "verified", remark });
      setNotice(`${activeEntity.entity_name} has been verified and sent for vote.`);
      resetAll();
    } catch (err) {
      setError(getErrorMessage(err, "This entity could not be verified. Please review and try again."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!activeEntity) return;
    if (!rejectionReason) {
      setError("Please select a reason before marking this entity as not eligible.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await submitVerification(activeEntity.customer_code, { action: "not_eligible", rejection_reason: rejectionReason });
      setNotice(`${activeEntity.entity_name} has been marked as not eligible to vote.`);
      resetAll();
    } catch (err) {
      setError(getErrorMessage(err, "This action could not be completed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  const singleEntityResult = result?.scenario === "single_entity" ? result : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-900">Verify a Member</h1>
        <p className="text-sm text-steel-400 mt-1">Enter or scan the access card presented at the counter.</p>
      </div>

      {notice && <div className="mb-4"><Alert type="success" onDismiss={() => setNotice("")}>{notice}</Alert></div>}
      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      {!activeEntity && !(result?.scenario === "multiple_entities") && (
        <form onSubmit={handleLookup} className="flex gap-3 mb-8">
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Access card number, e.g. GEM209202"
            className="flex-1 rounded-lg border border-steel-200 px-4 py-3 text-navy-900 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-navy-900 text-white font-medium px-6 py-3 hover:bg-navy-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Looking up…" : "Look Up"}
          </button>
        </form>
      )}

      {/* Scenario B: representative maps to multiple entities — choose one */}
      {result?.scenario === "multiple_entities" && !activeEntity && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-navy-800">
              <span className="font-semibold">{result.representative_name}</span> is the Authorized Representative for{" "}
              {result.entities.length} entities. Select the one voting now.
            </p>
            <button onClick={resetAll} className="text-sm text-steel-400 hover:text-navy-800">
              Cancel
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.entities.map((entity) => (
              <EntityCard key={entity.customer_code} entity={entity} compact onClick={() => handleSelectEntity(entity)} />
            ))}
          </div>
        </div>
      )}

      {/* Active entity: locked, awaiting a decision */}
      {activeEntity && (
        <div className="space-y-5">
          {locked && (
            <Alert type="info">
              This record is locked to your counter while you complete verification.
            </Alert>
          )}

          <EntityCard entity={activeEntity} />

          {singleEntityResult && !singleEntityResult.can_verify && (
            <Alert type="warning">
              Cannot verify: {singleEntityResult.block_reason}
            </Alert>
          )}

          {singleEntityResult?.show_remark_checkbox && (
            <div className="rounded-lg border border-pending-600/30 bg-pending-100 p-4">
              <label className="flex items-start gap-2 text-sm text-navy-900">
                <input
                  type="checkbox"
                  checked={remark.length > 0}
                  onChange={(e) => setRemark(e.target.checked ? " " : "")}
                  className="mt-1"
                />
                <span>
                  Voting Eligibility Remark required (KYC incomplete or fee unpaid). Provide a remark of at least 11 characters below.
                </span>
              </label>
              <textarea
                value={remark.trim() === "" ? remark : remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={2}
                placeholder="Enter remark…"
                className="mt-2 w-full rounded-md border border-steel-200 px-3 py-2 text-sm outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
              />
            </div>
          )}

          {!showRejectForm ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleVerify}
                disabled={submitting}
                className="tap-target rounded-lg bg-verified-600 text-white font-medium px-6 py-2.5 hover:opacity-90 disabled:opacity-60 transition"
              >
                {submitting ? "Submitting…" : "Verified — Send for Vote"}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={submitting}
                className="tap-target rounded-lg border border-blocked-600 text-blocked-600 font-medium px-6 py-2.5 hover:bg-blocked-100 transition"
              >
                Mark Not Eligible
              </button>
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="rounded-lg text-steel-400 font-medium px-6 py-2.5 hover:text-navy-800 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-steel-200 bg-white p-4 space-y-3">
              <label className="block text-sm font-medium text-navy-800">Reason for rejection</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-md border border-steel-200 px-3 py-2 text-sm outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500"
              >
                <option value="">Select a reason…</option>
                {REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="rounded-lg bg-blocked-600 text-white font-medium px-6 py-2.5 hover:opacity-90 disabled:opacity-60 transition"
                >
                  {submitting ? "Submitting…" : "Confirm Not Eligible"}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="rounded-lg text-steel-400 font-medium px-6 py-2.5 hover:text-navy-800 transition"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
