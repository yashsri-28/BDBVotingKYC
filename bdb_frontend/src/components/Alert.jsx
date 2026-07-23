const STYLES = {
  error: "bg-blocked-100 text-blocked-600 border-blocked-600/20",
  success: "bg-verified-100 text-verified-600 border-verified-600/20",
  info: "bg-ice-100 text-navy-800 border-navy-800/10",
  warning: "bg-pending-100 text-pending-600 border-pending-600/20",
};

export default function Alert({ type = "info", children, onDismiss }) {
  if (!children) return null;
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`} role="alert">
      <span>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
