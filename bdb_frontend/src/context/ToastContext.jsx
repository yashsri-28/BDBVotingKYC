import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

const ICONS = { success: "check-circle", warning: "alert-triangle", danger: "x-circle", info: "info" };
const STYLES = {
  success: "bg-emerald-900 border-emerald-700 text-emerald-100",
  warning: "bg-amber-900 border-amber-700 text-amber-100",
  danger: "bg-rose-900 border-rose-700 text-rose-100",
  info: "bg-slate-900 border-slate-700 text-slate-100",
};
const ICON_COLORS = { success: "text-emerald-400", warning: "text-amber-400", danger: "text-rose-400", info: "text-blue-400" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start space-x-3 rounded-xl border p-4 shadow-lg transition-all ${STYLES[toast.type]}`}
        >
          <ToastIcon type={toast.type} />
          <div className="flex-1 text-xs">
            <h4 className="text-sm font-bold">{toast.title}</h4>
            <p className="mt-0.5 text-slate-300 opacity-90">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ToastIcon({ type }) {
  const cls = `mt-0.5 shrink-0 ${ICON_COLORS[type]}`;
  const paths = {
    success: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    warning: <path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />,
    danger: <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    info: <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };
  return (
    <svg className={`h-5 w-5 ${cls}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {paths[type]}
    </svg>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
