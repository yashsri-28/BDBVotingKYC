import { useState } from "react";
import { manualSearch } from "../api/verification";
import { getErrorMessage } from "../api/client";
import Alert from "../components/Alert";
import EntityCard from "../components/EntityCard";


export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    if (!query.trim()) {
      setError("Please enter a name, membership number, or customer code to search.");
      return;
    }
    setLoading(true);
    try {
      const data = await manualSearch(query.trim());
      setResults(data);
    } catch (err) {
      setResults(null);
      setError(getErrorMessage(err, "The search could not be completed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="brand-serif text-3xl font-semibold text-navy-900">Manual Search</h1>
        <p className="text-sm text-steel-400 mt-1">
          Search by entity name, membership number, customer code, or representative name.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Mohanlal, M043, C00030"
          className="flex-1 rounded-lg border border-steel-200 px-4 py-3 text-navy-900 placeholder:text-steel-300 focus:border-royal-500 focus:ring-1 focus:ring-royal-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-navy-900 text-white font-medium px-6 py-3 hover:bg-navy-800 disabled:opacity-60 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <div className="mb-4"><Alert type="error" onDismiss={() => setError("")}>{error}</Alert></div>}

      {results && results.length === 0 && (
        <Alert type="info">No matching members were found.</Alert>
      )}

      {results && results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((entity) => (
            <EntityCard key={entity.customer_code} entity={entity} compact />
          ))}
        </div>
      )}
    </div>
  );
}
