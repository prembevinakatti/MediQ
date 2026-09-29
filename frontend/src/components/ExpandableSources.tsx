"use client";

import React, { useState } from "react";
import { SourceCitation } from "@/lib/api";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  ExternalLink,
  Quote,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ExpandableSourcesProps {
  sources: SourceCitation[];
  onSelectSource: (source: SourceCitation) => void;
  defaultExpanded?: boolean;
}

export function ExpandableSources({
  sources,
  onSelectSource,
  defaultExpanded = true,
}: ExpandableSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (!sources || sources.length === 0) return null;

  const toggleSourceExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allExpanded =
    sources.length > 0 && sources.every((s) => expandedIds.has(s.id));

  const toggleAllExpanded = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(sources.map((s) => s.id)));
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
      {/* Section Accordion Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center gap-1.5 py-1 px-1.5 -mx-1.5 rounded-lg hover:bg-slate-100/70 transition-colors text-left cursor-pointer select-none"
          aria-expanded={isExpanded}
          title={isExpanded ? "Collapse literature sources" : "Expand literature sources"}
        >
          <BookOpen className="h-3 w-3 text-sky-700 shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
            Corroborated Literature Sources
          </span>
          <span className="rounded-full bg-sky-50 px-1.5 py-0.2 text-[9px] font-bold text-sky-700 border border-sky-200">
            {sources.length}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Quick controls when section is open */}
        {isExpanded && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAllExpanded}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition cursor-pointer"
              title={allExpanded ? "Collapse all source excerpts" : "Expand all source excerpts"}
            >
              {allExpanded ? (
                <>
                  <Minimize2 className="h-2.5 w-2.5" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-2.5 w-2.5" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="space-y-2 pt-1 transition-all">
          {/* Top pills row for unexpanded sources */}
          <div className="flex flex-wrap gap-2">
            {sources.map((src) => {
              const isItemExpanded = expandedIds.has(src.id);
              const percent = Math.round((src.score || 0) * 100);

              if (isItemExpanded) return null;

              return (
                <div
                  key={src.id}
                  className="group inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50 transition shadow-2xs overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleSourceExpand(src.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 text-left cursor-pointer"
                    title="Click to expand excerpt inline"
                  >
                    <span className="font-bold text-sky-800">
                      Ref #{src.id}
                    </span>
                    <span className="max-w-[150px] truncate text-slate-700">
                      {src.document}
                    </span>
                    <span className="rounded bg-white px-1 py-0.2 text-[9px] text-slate-600 border border-slate-200 font-medium">
                      p.{src.page}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {percent}%
                    </span>
                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-sky-700 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSource(src);
                    }}
                    className="border-l border-slate-200/80 px-1.5 py-1 text-slate-400 hover:text-sky-700 hover:bg-sky-100/60 transition cursor-pointer"
                    title="Open citation details in modal"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded Cards View */}
          {sources.map((src) => {
            const isItemExpanded = expandedIds.has(src.id);
            if (!isItemExpanded) return null;

            const percent = Math.round((src.score || 0) * 100);

            return (
              <div
                key={`expanded-${src.id}`}
                className="w-full rounded-xl border border-sky-200/90 bg-sky-50/30 p-3 shadow-xs transition-all"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-sky-100">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="rounded-md bg-sky-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                      Ref #{src.id}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs font-semibold text-slate-800 truncate"
                      title={src.document}
                    >
                      <FileText className="h-3.5 w-3.5 text-sky-700 shrink-0" />
                      <span className="truncate">{src.document}</span>
                    </span>
                    <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                      Page {src.page} {src.section ? `• ${src.section}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {percent}% Match
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSource(src)}
                      className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-1 text-[10px] font-semibold text-sky-700 hover:bg-sky-50 hover:border-sky-300 transition shadow-2xs cursor-pointer"
                      title="Open full citation modal"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Full Modal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSourceExpand(src.id)}
                      className="rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
                      title="Collapse excerpt"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Excerpt body */}
                <div className="mt-2.5">
                  <div className="flex items-start gap-2 rounded-lg bg-white p-3 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal shadow-2xs">
                    <Quote className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="flex-1 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {src.text ? (
                        src.text
                      ) : (
                        <span className="text-slate-500 italic">
                          Clinical excerpt corroborated from page {src.page} of {src.document}. Click &quot;Full Modal&quot; to inspect full citation metadata.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
