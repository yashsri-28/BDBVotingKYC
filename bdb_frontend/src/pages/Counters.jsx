import { useState, useEffect } from "react";
import { fetchCounterMappings } from "../api/counters";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";

export default function Counters() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCounterMappings()
      .then((data) => setMappings(data.results || data))
      .catch((err) => setError(getErrorMessage(err, "Counter mappings could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-900">Counter Mappings</h1>
        <p className="text-sm text-steel-400 mt-1">Which HID reader each Counter Staff login is bound to.</p>
      </div>

      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      <div className="rounded-xl border border-steel-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ice-100 text-left text-[11px] uppercase tracking-wide text-steel-400">
              <th className="px-4 py-3 font-medium">Counter Staff</th>
              <th className="px-4 py-3 font-medium">HID Reader</th>
              <th className="px-4 py-3 font-medium">Counter No.</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-200">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-steel-400">Loading…</td></tr>
            )}
            {!loading && mappings.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-steel-400">No counter mappings configured yet.</td></tr>
            )}
            {!loading && mappings.map((m) => (
              <tr key={m.id} className="hover:bg-ice-50">
                <td className="px-4 py-3 font-medium text-navy-900">{m.staff_username}</td>
                <td className="px-4 py-3 font-mono text-navy-800">{m.hid_reader_name}</td>
                <td className="px-4 py-3 text-navy-800">{m.counter_number}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${m.is_active ? "bg-verified-100 text-verified-600" : "bg-steel-200 text-steel-400"}`}>
                    {m.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
