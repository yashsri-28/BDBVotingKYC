import { useState, useEffect, useCallback } from "react";
import { fetchAllMembers } from "../api/kyc";
import { getErrorMessage } from "../api/client";
import { mediaUrl } from "../api/client";
import { useToast } from "../context/ToastContext";
import AuthRepModal from "../components/AuthRepModal";
// import Pagination from "../components/Pagination";
import Pagination from "../pages/Pagination";

export default function AuthRepManagement() {
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repModalEntity, setRepModalEntity] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAllMembers({ page, search });
      setRows(result.results);
      setCount(result.count);
      setTotalPages(result.total_pages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Members could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(load, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [load]);

  // Search changes should always jump back to page 1
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center space-x-2 text-lg font-bold text-slate-900">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Auth Rep Management</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              View and change the Authorized Representative for any member. {count > 0 && `(${count} total)`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-1 block text-xs font-bold text-slate-700">Search by Customer Code or Membership No.</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. C00025 or M038"
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white p-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-blue-900 font-semibold text-white">
                <th className="p-3">Customer Code</th>
                <th className="p-3">Membership No.</th>
                <th className="p-3">Entity Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Auth Rep</th>
                <th className="p-3">Access Card</th>
                <th className="p-3">Payment</th>
                <th className="p-3">KYC</th>
                <th className="p-3">Membership</th>
                <th className="p-3">Eligibility</th>
                <th className="p-3">Rep Changed?</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && <tr><td colSpan={12} className="p-6 text-center text-slate-400">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={12} className="p-6 text-center text-slate-400">No members found.</td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.customer_code} className="transition-colors hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{row.customer_code}</td>
                  <td className="p-3 font-mono text-slate-700">{row.membership_number || "—"}</td>
                  <td className="p-3 font-semibold text-slate-800">{row.entity_name}</td>
                  <td className="p-3 text-slate-600">{row.category || "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {row.photograph_path && (
                        <img
                          src={mediaUrl(row.photograph_path)}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      )}
                      <span className="font-semibold text-slate-800">{row.representative_name || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{row.access_card_number || "—"}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.annual_fee_status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {row.annual_fee_status === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.kyc_status === "yes" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {row.kyc_status === "yes" ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.membership_status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                      {row.membership_status || "—"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${row.voting_eligibility === "eligible" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {row.voting_eligibility === "eligible" ? "Eligible" : "Not eligible"}
                    </span>
                  </td>
                  <td className="p-3">
                    {row.is_rep_changed ? (
                      <span
                        className="inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800"
                        title={row.rep_changed_by ? `By ${row.rep_changed_by} on ${new Date(row.rep_changed_at).toLocaleDateString()}` : undefined}
                      >
                        ⚠ Yes
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">No</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setRepModalEntity(row)}
                      className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100"
                    >
                      Change Rep
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          count={count}
          onPageChange={setPage}
          loading={loading}
          label="members"
        />
      </div>

      <AuthRepModal
        open={!!repModalEntity}
        onClose={() => setRepModalEntity(null)}
        entities={repModalEntity ? [repModalEntity] : []}
        onChanged={() => {
          setRepModalEntity(null);
          load();
          showToast("success", "Auth Rep updated", "The change has been logged and the list refreshed.");
        }}
      />
    </div>
  );
}