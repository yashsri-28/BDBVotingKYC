export default function Pagination({ page, totalPages, count, onPageChange, loading, label = "records" }) {
  if (count === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs font-medium text-slate-500">
        Showing page {page} of {totalPages} ({count} total {label})
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}