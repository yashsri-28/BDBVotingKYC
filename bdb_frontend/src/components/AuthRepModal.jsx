// import { useState } from "react";
// import Modal from "./Modal";
// import { changeAuthRep } from "../api/ballots";
// import { getErrorMessage } from "../api/client";
// import { useToast } from "../context/ToastContext";

// export default function AuthRepModal({ open, onClose, entity, onChanged }) {
//   const { showToast } = useToast();
//   const [newName, setNewName] = useState(entity?.representative_name || "");
//   const [newCard, setNewCard] = useState("");
//   const [attachment, setAttachment] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!newName.trim()) {
//       setError("Please enter the new Authorized Representative's name.");
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       await changeAuthRep({
//         customerCode: entity.customer_code,
//         newRepresentativeName: newName.trim(),
//         newAccessCardNumber: newCard.trim() || undefined,
//         attachment,
//       });
//       showToast("success", "Authorized Rep updated", `Updated representative for ${entity.customer_code}.`);
//       onChanged?.();
//       onClose();
//     } catch (err) {
//       setError(getErrorMessage(err, "This change could not be saved. Please try again."));
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       title="Super Admin — Change Authorized Rep"
//       icon={
//         <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//           <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//         </svg>
//       }
//     >
//       <form onSubmit={handleSubmit} className="space-y-4 text-xs">
//         {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700">{error}</div>}

//         <div>
//           <label className="mb-1 block font-bold text-slate-700">Customer Code</label>
//           <input
//             type="text" readOnly value={entity?.customer_code || ""}
//             className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-mono font-bold text-slate-700"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block font-bold text-slate-700">Current Representative</label>
//           <input
//             type="text" readOnly value={entity?.representative_name || "—"}
//             className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-semibold text-slate-500"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block font-bold text-slate-700">New Authorized Representative Name</label>
//           <input
//             type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
//             className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block font-bold text-slate-700">New Access Card No. (optional)</label>
//           <input
//             type="text" value={newCard} onChange={(e) => setNewCard(e.target.value)}
//             placeholder="Leave blank to keep the current card"
//             className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block font-bold text-slate-700">Upload Board Resolution / Authorization Proof</label>
//           <input
//             type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)}
//             className="w-full rounded-lg border border-slate-300 bg-slate-50 p-1.5 text-slate-600"
//           />
//         </div>

//         <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-3">
//           <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 font-bold text-slate-700 hover:bg-slate-200">
//             Cancel
//           </button>
//           <button
//             type="submit" disabled={saving}
//             className="rounded-lg bg-purple-700 px-4 py-2 font-bold text-white shadow-sm hover:bg-purple-800 disabled:opacity-60"
//           >
//             {saving ? "Saving…" : "Save & Log Change"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// }



import { useState, useEffect } from "react";
import Modal from "./Modal";
import { changeAuthRep } from "../api/ballots";
import { getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";

/**
 * `entities` = every customer_code under the same access card (so the
 * Super Admin can pick which one this change applies to, instead of the
 * modal always being scoped to whichever card happened to be clicked).
 */
export default function AuthRepModal({ open, onClose, entities = [], onChanged }) {
  const { showToast } = useToast();
  const [selectedCode, setSelectedCode] = useState(entities[0]?.customer_code || "");
  const [newName, setNewName] = useState("");
  const [newCard, setNewCard] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCredentialNo, setNewCredentialNo] = useState("");

  const entity = entities.find((e) => e.customer_code === selectedCode) || entities[0];

  // Reset the form whenever the modal opens fresh, or the selected entity changes.
  useEffect(() => {
    if (open) {
      setSelectedCode(entities[0]?.customer_code || "");
      setNewName("");
      setNewCard("");
      setNewPhoto(null);
      setAttachment(null);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCode) {
      setError("Please select which customer code this change applies to.");
      return;
    }
    if (!newName.trim()) {
      setError("Please enter the Nominee Voter name.");
      return;
    }
    if (!newCard.trim()) {
      setError("Please enter the New Access Card No.");
      return;
    }
    if (!newCredentialNo.trim()) {
      setError("Please enter the new card's credential number.");
      return;
    }
    if (!newPhoto) {
      setError("Please upload the Nominee Profile Photo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await changeAuthRep({
        customerCode: selectedCode,
        newRepresentativeName: newName.trim(),
        newAccessCardNumber: newCard.trim() || undefined,
        newPhoto,
        attachment,
      });
      showToast("success", "Authorized Rep updated", `Updated representative for ${selectedCode}.`);
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
          {entities.length > 1 ? (
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {entities.map((e) => (
                <option key={e.customer_code} value={e.customer_code}>
                  {e.customer_code} — {e.entity_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text" readOnly value={entity?.customer_code || ""}
              className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-mono font-bold text-slate-700"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Current Representative</label>
          <input
            type="text" readOnly value={entity?.representative_name || "—"}
            className="w-full rounded-lg border border-slate-300 bg-slate-100 p-2 font-semibold text-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Nominee Voter Name *</label>
          <input
            type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

       <div>
          <label className="mb-1 block font-bold text-slate-700">New Access Card No. *</label>
          <input
            type="text" value={newCard} onChange={(e) => setNewCard(e.target.value)}
            placeholder="e.g. GEM00001"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="mb-1 block font-bold text-slate-700">New Credential No. *</label>
          <input
            type="text"
            value={newCredentialNo}
            onChange={(e) => setNewCredentialNo(e.target.value)}
            placeholder="Raw number from card reader (e.g. 167065)"
            className="w-full rounded-lg border border-slate-300 bg-white p-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Enter the credential number shown when the new card is scanned on the reader.
          </p>
        </div>

        <div>
          <label className="mb-1 block font-bold text-slate-700">Nominee Profile Photo. *</label>
          <input
            type="file" accept="image/*" onChange={(e) => setNewPhoto(e.target.files?.[0] || null)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-1.5 text-slate-600"
          />
          <p className="mt-1 text-[10px] text-rose-500 font-semibold">
            Required. This photo will replace the representative's photo shown to Counters.
          </p>
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