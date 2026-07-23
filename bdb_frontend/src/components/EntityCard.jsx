import { useState } from "react";
import EligibilityBadge from "./EligibilityBadge";
import { MEDIA_BASE_URL } from "../api/client";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Photo({ path, name }) {
  const [failed, setFailed] = useState(false);
  const src = path ? `${MEDIA_BASE_URL}/${path}` : null;

  if (!src || failed) {
    return (
      <div className="h-32 w-32 rounded-lg bg-ice-100 border border-steel-200 flex items-center justify-center shrink-0">
        <span className="brand-serif text-3xl text-navy-800">{initials(name) || "—"}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className="h-32 w-32 rounded-lg object-cover border border-steel-200 shrink-0"
    />
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-steel-400 mb-0.5">{label}</div>
      <div className="text-sm text-navy-900 font-medium">{children ?? "—"}</div>
    </div>
  );
}

export default function EntityCard({ entity, compact = false, onClick, selected = false }) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left flex items-center gap-4 rounded-lg border p-4 transition-colors ${
          selected ? "border-royal-500 bg-ice-100" : "border-steel-200 bg-white hover:bg-ice-50"
        }`}
      >
        <Photo path={entity.photograph_path} name={entity.entity_name} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-navy-900 truncate">{entity.entity_name}</div>
          <div className="text-sm text-steel-400">
            {entity.membership_number} · {entity.customer_code}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <EligibilityBadge value={entity.membership_status} />
            <EligibilityBadge value={entity.voting_eligibility} />
            <EligibilityBadge value={entity.annual_fee_status} />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-steel-200 bg-white p-6">
      <div className="flex gap-5">
        <Photo path={entity.photograph_path} name={entity.entity_name} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="brand-serif text-2xl font-semibold text-navy-900">{entity.entity_name}</h2>
              <p className="text-sm text-steel-400 mt-0.5">
                Represented by <span className="font-medium text-navy-800">{entity.representative_name}</span>
              </p>
            </div>
            <EligibilityBadge value={entity.membership_status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mt-5">
            <Field label="Membership No.">{entity.membership_number}</Field>
            <Field label="Customer Code">{entity.customer_code}</Field>
            <Field label="Category">{entity.category}</Field>
            <Field label="Member Group">{entity.member_group}</Field>
            <Field label="Access Card No.">{entity.access_card_number}</Field>
            <Field label="KYC Status"><EligibilityBadge value={entity.kyc_status} /></Field>
            <Field label="Annual Fee Status"><EligibilityBadge value={entity.annual_fee_status} /></Field>
            <Field label="Voting Eligibility"><EligibilityBadge value={entity.voting_eligibility} /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}
