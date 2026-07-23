const CONFIG = {
  eligible: { label: "Eligible", cls: "bg-verified-100 text-verified-600" },
  not_eligible: { label: "Not Eligible", cls: "bg-blocked-100 text-blocked-600" },
  active: { label: "Active", cls: "bg-verified-100 text-verified-600" },
  inactive: { label: "Inactive", cls: "bg-blocked-100 text-blocked-600" },
  paid: { label: "Paid", cls: "bg-verified-100 text-verified-600" },
  unpaid: { label: "Unpaid", cls: "bg-blocked-100 text-blocked-600" },
  yes: { label: "Completed", cls: "bg-verified-100 text-verified-600" },
  no: { label: "Not Completed", cls: "bg-pending-100 text-pending-600" },
  pending: { label: "Pending", cls: "bg-pending-100 text-pending-600" },
  verified_sent: { label: "Verified & Sent for Vote", cls: "bg-verified-100 text-verified-600" },
  not_eligible_status: { label: "Not Eligible to Vote", cls: "bg-blocked-100 text-blocked-600" },
};

export default function EligibilityBadge({ value, fallbackLabel }) {
  const cfg = CONFIG[value] || { label: fallbackLabel || value || "Unknown", cls: "bg-steel-200 text-steel-400" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
