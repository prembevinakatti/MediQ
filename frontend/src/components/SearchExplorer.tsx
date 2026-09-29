"use client";

import React, { useState } from "react";
import { api, SearchMatch } from "@/lib/api";
import {
  Search,
  BookOpen,
  FileText,
  Percent,
  Hash,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface SearchExplorerProps {
  onAskQuestion: (q: string) => void;
}

const PRESET_QUERIES = [
  "Contraindications and adverse reactions",
  "Diagnostic biomarker thresholds",
  "Pediatric and renal dose titrations",
  "Clinical treatment protocol for diabetes",
];

export function SearchExplorer({ onAskQuestion }: SearchExplorerProps) {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    setError(null);
    setLoading(true);
    setSearchedQuery(query.trim());

    try {
      const data = await api.searchDocuments(query.trim(), topK);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to search vector database");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Institutional Semantic Formulary Search
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Direct cosine similarity retrieval against 768-dimensional medical embeddings in Pinecone.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="space-y-2.5">
          <div className="relative rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, adverse events, drug mechanisms, or clinical guidelines..."
              className="w-full bg-transparent pl-11 pr-24 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-2 top-2 flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 active:scale-95 transition disabled:opacity-40"
            >
              {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Quick Terms:
            </span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(preset)}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition shadow-2xs font-medium"
              >
                {preset}
              </button>
            ))}
          </div>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {searchedQuery && (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Found <strong className="text-slate-900">{results.length}</strong> matching passages for &ldquo;{searchedQuery}&rdquo;
              </span>
              <button
                onClick={() => onAskQuestion(searchedQuery)}
                className="font-bold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
              >
                <span>Synthesize with AI Copilot</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {results.length === 0 && !loading && searchedQuery ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
              <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                No matching passages found
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try refining your clinical search query or uploading additional reference literature.
              </p>
            </div>
          ) : (
            results.map((match, idx) => {
              const scorePercent = Math.round(match.score * 100);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-sky-600" />
                        {match.document_name}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-semibold border border-slate-200">
                        Page {match.page_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        {scorePercent}% Cosine Match
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({match.score.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
                    {match.text}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() =>
                        onAskQuestion(`Based on ${match.document_name} on page ${match.page_number}, please explain: ${query}`)
                      }
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition"
                    >
                      <span>Inquire in Clinical Chat</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
