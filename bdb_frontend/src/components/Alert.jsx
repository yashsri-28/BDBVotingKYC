const STYLES = {
  error: "bg-rose-50 text-rose-700 border-rose-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-slate-50 text-slate-700 border-slate-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Alert({ type = "info", children, onDismiss }) {
  if (!children) return null;
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`} role="alert">
      <span>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">✕</button>
      )}
    </div>
  );
}
