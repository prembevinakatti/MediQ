"use client";

import React from "react";
import { SourceCitation } from "@/lib/api";
import { BookOpen, FileText, X, Percent, Hash, ShieldCheck } from "lucide-react";

interface SourceModalProps {
  source: SourceCitation | null;
  onClose: () => void;
}

export function SourceModal({ source, onClose }: SourceModalProps) {
  if (!source) return null;

  const percentage = Math.round((source.score || 0) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Verified Evidence Citation
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                Source #{source.id}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Retrieved ground-truth passage from Pinecone Vector DB
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <FileText className="h-3 w-3 text-sky-600" /> Document
            </span>
            <p className="mt-1 text-xs font-bold text-slate-900 truncate" title={source.document}>
              {source.document}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Hash className="h-3 w-3 text-indigo-600" /> Page & Section
            </span>
            <p className="mt-1 text-xs font-bold text-slate-900 truncate">
              p. {source.page} • {source.section || "General"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Percent className="h-3 w-3 text-emerald-600" /> Match Score
            </span>
            <p className="mt-1 text-xs font-bold text-emerald-700">
              {percentage}% ({source.score})
            </p>
          </div>
        </div>

        {/* Passage Text if available */}
        {source.text && (
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Extracted Clinical Passage
            </label>
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800">
              {source.text}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
}
