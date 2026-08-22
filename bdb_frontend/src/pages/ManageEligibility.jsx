import { useState } from "react";
import { searchEntityByCustomerCode, setVotingEligibility } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function ManageEligibility() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    if (!query.trim()) {
      setError("Please enter a customer code, membership no., or entity name.");
      return;
    }
    setLoading(true);
    try {
      // const data = await searchEntityByCustomerCode(query.trim());
      // if (!data) {
      //   setResults([]);
      //   setError("No matching member found.");
      // } else {
      //   setResults([data]);
      // }

      const data = await searchEntityByCustomerCode(query.trim());
      if (!data || data.length === 0) {
        setResults([]);
        setError("No matching member found.");
      } else {
        setResults(data);
      }
    } catch (err) {
      setResults([]);
      setError(getErrorMessage(err, "Search failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Manage Voting Eligibility</h2>
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Customer Code / Membership No. / Entity Name"
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-4 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
      </div>

      <div className="space-y-4">
        {results.map((entity) => (
          <EligibilityRow key={entity.customer_code} entity={entity} showToast={showToast} />
        ))}
      </div>
    </div>
  );
}

function EligibilityRow({ entity, showToast }) {
  const [isEligible, setIsEligible] = useState(entity.voting_eligibility === "eligible");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedRemark, setSavedRemark] = useState(entity.eligibility_remark || "");

  async function handleSave() {
    if (!remark.trim()) {
      showToast("danger", "Remark required", "Please enter a remark before saving.");
      return;
    }
    setSaving(true);
    try {
      const result = await setVotingEligibility(entity.customer_code, isEligible, remark.trim());
      setSavedRemark(result.remarks);
      setRemark("");
      showToast("success", "Eligibility updated", `${entity.customer_code} is now ${isEligible ? "Eligible" : "Not Eligible"}.`);
    } catch (err) {
      showToast("danger", "Could not update eligibility", err?.response?.data?.detail || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <p className="font-mono text-sm font-bold text-slate-900">{entity.customer_code}</p>
          <p className="text-sm text-slate-700">{entity.entity_name}</p>
        </div>
        <span className={`rounded px-2.5 py-1 text-xs font-bold ${isEligible ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
          Current: {isEligible ? "Eligible" : "Not Eligible"}
        </span>
      </div>

      {savedRemark && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-semibold">Last remark:</span> {savedRemark}
        </p>
      )}

    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="block font-bold uppercase text-slate-500">KYC Status</span>
            <span className={`font-bold ${entity.kyc_status === "yes" ? "text-emerald-700" : "text-amber-700"}`}>
              {entity.kyc_status === "yes" ? "Approved" : "Pending"}
            </span>
          </div>
          <div>
            <span className="block font-bold uppercase text-slate-500">Online Payment (KYC DB)</span>
            <span className={`font-bold ${entity.annual_fee_status === "paid" ? "text-emerald-700" : "text-rose-700"}`}>
              {entity.annual_fee_status === "paid" ? "Paid" : "Not Paid"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-700">On the Spot Payment:</span>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="radio"
            checked={isEligible === true}
            onChange={() => setIsEligible(true)}
          />
          Yes
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <input
            type="radio"
            checked={isEligible === false}
            onChange={() => setIsEligible(false)}
          />
          No
        </label>
      </div>

      <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2 text-xs">
        <span className="font-bold text-blue-800">Final Status (calculated): </span>
        <span className={`font-bold ${isEligible ? "text-emerald-700" : "text-rose-700"}`}>
          {isEligible ? "Eligible" : "Not Eligible"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Remark (mandatory) — reason for this change"
          className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}