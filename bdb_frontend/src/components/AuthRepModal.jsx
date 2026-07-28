import { useState } from "react";
import Modal from "./Modal";
import { changeAuthRep } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

export default function AuthRepModal({ open, onClose, entity, onChanged }) {
  const { showToast } = useToast();
  const [newName, setNewName] = useState(entity?.representative_name || "");
  const [newCard, setNewCard] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Please enter the new Authorized Representative's name.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await changeAuthRep({
        customerCode: entity.customer_code,
        newRepresentativeName: newName.trim(),
        newAccessCardNumber: newCard.trim() || undefined,
        attachment,
      });
      showToast("success", "Authorized Rep updated", `Updated representative for ${entity.customer_code}.`);
      onChanged?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "This change could not be saved. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Super Admin — Change Authorized Rep"
      icon={
        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</div>}

        <div>
          <label className="mb-1 block font-bold text-slate-700">Customer Code</label>
          <input
            type="text" readOnly value={entity?.customer_code || ""}
            className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-mono font-bold text-slate-700"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Current Representative</label>
          <input
            type="text" readOnly value={entity?.representative_name || "—"}
            className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-semibold text-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">New Authorized Representative Name</label>
          <input
            type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">New Access Card No. (optional)</label>
          <input
            type="text" value={newCard} onChange={(e) => setNewCard(e.target.value)}
            placeholder="Leave blank to keep the current card"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Upload Board Resolution / Authorization Proof</label>
          <input
            type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-1.5 text-slate-600"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white shadow-sm hover:bg-purple-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save & Log Change"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
