import { useState, useEffect, useCallback } from "react";
import { fetchLogins, createLogin, activateLogin, deactivateLogin, resetPassword } from "../api/users";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import Modal from "../components/Modal";

const ROLE_LABELS = { supervisor: "Counter", counting: "Counting" };

export default function UserManagement() {
  const { showToast } = useToast();
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [credsModal, setCredsModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogins(await fetchLogins());
    } catch (err) {
      setError(getErrorMessage(err, "Logins could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(user) {
    try {
      user.is_active ? await deactivateLogin(user.id) : await activateLogin(user.id);
      showToast("success", user.is_active ? "Login deactivated" : "Login activated", `${user.username} has been ${user.is_active ? "deactivated" : "activated"}.`);
      load();
    } catch (err) {
      showToast("danger", "Action failed", getErrorMessage(err));
    }
  }

  async function handleReset(user) {
    try {
      const result = await resetPassword(user.id);
      setCredsModal({ username: result.username, password: result.new_password, isNew: false });
    } catch (err) {
      showToast("danger", "Reset failed", getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
            <p className="mt-0.5 text-xs text-slate-500">Create and manage Counter and Counting logins. No self-signup exists.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
            + Create Login
          </button>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900 font-semibold text-white">
                <th className="p-3">Username</th>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading…</td></tr>}
              {!loading && logins.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">No logins created yet.</td></tr>}
              {!loading && logins.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{u.username}</td>
                  <td className="p-3 text-slate-700">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${u.role === "supervisor" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${u.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="space-x-2 p-3">
                    <button onClick={() => handleToggle(u)} className={`font-semibold hover:underline ${u.is_active ? "text-rose-600" : "text-emerald-600"}`}>
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => handleReset(u)} className="font-semibold text-blue-600 hover:underline">Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateLoginModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(creds) => { setShowCreate(false); setCredsModal(creds); load(); }}
      />

      <Modal open={!!credsModal} onClose={() => setCredsModal(null)} title="Login credentials">
        {credsModal && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">Share these credentials with the user directly — they won't be shown again.</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <div>Username: <span className="font-bold">{credsModal.username}</span></div>
              <div>Password: <span className="font-bold">{credsModal.password}</span></div>
            </div>
            <button onClick={() => setCredsModal(null)} className="w-full rounded-lg bg-navy-900 py-2 font-bold text-white hover:bg-slate-800">Done</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

function CreateLoginModal({ open, onClose, onCreated }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("supervisor");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) { setError("Please enter a username."); return; }
    setSaving(true);
    setError("");
    try {
      const result = await createLogin({ username: username.trim(), firstName, lastName, role });
      onCreated({ username: result.username, password: result.temp_password });
      setUsername(""); setFirstName(""); setLastName("");
    } catch (err) {
      setError(getErrorMessage(err, "This login could not be created."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Login">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</div>}
        <div>
          <label className="mb-1 block font-bold text-slate-700">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-bold text-slate-700">First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="mb-1 block font-bold text-slate-700">Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-bold text-slate-700">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="supervisor">Counter</option>
            <option value="counting">Counting</option>
          </select>
        </div>
        <div className="flex justify-end space-x-3 border-t border-slate-200 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-60">
            {saving ? "Creating…" : "Create Login"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
