export default function Modal({ open, onClose, title, icon, children, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}>
        <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white">
          <h3 className="flex items-center space-x-2 text-sm font-bold">
            {icon}
            <span>{title}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
