"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageItem, SourceCitation } from "@/lib/api";
import {
  Send,
  User,
  Copy,
  Check,
  BookOpen,
  SlidersHorizontal,
  FileQuestion,
  Search,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Pill,
  HeartPulse,
  FileSpreadsheet,
} from "lucide-react";

interface ChatAreaProps {
  messages: MessageItem[];
  isLoading: boolean;
  onSendMessage: (text: string, topK: number) => void;
  onSelectSource: (source: SourceCitation) => void;
  conversationTitle?: string;
  hasDocuments: boolean;
  onNavigateToDocs: () => void;
}

const CLINICAL_CATEGORIES = [
  {
    icon: Pill,
    title: "Pharmacotherapy & Renal Titration",
    desc: "Renal dose adjustments, drug-drug contraindications, and clearance cutoffs",
    prompt: "What are the renal dosage adjustments, eGFR thresholds, and contraindications for Metformin in patients with Chronic Kidney Disease?",
  },
  {
    icon: HeartPulse,
    title: "Diagnostic Criteria & Biomarkers",
    desc: "Symptom constellations, diagnostic algorithm steps, and lab biomarker cutoffs",
    prompt: "What are the clinical diagnostic criteria and biomarker thresholds for Acute Coronary Syndrome?",
  },
  {
    icon: FileSpreadsheet,
    title: "Institutional Care Pathways",
    desc: "Recommendations from indexed hospital guidelines and clinical trial literature",
    prompt: "Summarize the primary clinical management recommendations and care pathways from the uploaded hospital guidelines.",
  },
  {
    icon: Stethoscope,
    title: "Safety Alerts & Adverse Events",
    desc: "Monitoring parameters, black-box warnings, and toxicity management",
    prompt: "Detail the primary adverse event profile, required baseline lab checks, and monitoring parameters for long-term systemic corticosteroid therapy.",
  },
];

export function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onSelectSource,
  conversationTitle,
  hasDocuments,
  onNavigateToDocs,
}: ChatAreaProps) {
  const [inputText, setInputText] = useState("");
  const [topK, setTopK] = useState(3);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    onSendMessage(text, topK);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayTitle =
    conversationTitle &&
    conversationTitle !== "New conversation" &&
    conversationTitle !== "New consultation"
      ? conversationTitle
      : messages.length > 0 && messages[0].role === "user"
      ? messages[0].content.slice(0, 45)
      : "Clinical Consultation";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Top Bar / Clinical Session Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">
            {displayTitle}
          </span>
          <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-800 border border-sky-200">
            Evidence-Grounded
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition border ${
              showSettings
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-700" />
            <span>Evidence Breadth: {topK} References</span>
          </button>
        </div>
      </div>

      {/* Retrieval Depth Bar */}
      {showSettings && (
        <div className="border-b border-slate-200 bg-white px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Reference Breadth:</span>
            {[
              { val: 3, label: "3 (Focused)" },
              { val: 5, label: "5 (Standard)" },
              { val: 8, label: "8 (Comprehensive)" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setTopK(val)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  topK === val
                    ? "bg-sky-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500">
            Sets the number of verified literature passages incorporated into synthesis.
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-8 flex flex-col items-center text-center">
            {/* Clinical Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-semibold text-sky-800 mb-4">
              <ShieldCheck className="h-4 w-4 text-sky-700" />
              <span>Evidence-Based Clinical Decision Support</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Reference & Protocol Copilot
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Inquire regarding pharmacology, clinical pathways, dosing criteria, or differential diagnosis.
              MediQ corroborates answers against verified institutional literature with page-specific citations.
            </p>

            {/* Document Warning if empty */}
            {!hasDocuments && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left max-w-xl shadow-2xs">
                <FileQuestion className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">
                    No clinical literature indexed
                  </p>
                  <p className="text-amber-800 mt-0.5">
                    Upload medical practice guidelines, hospital formularies, or clinical study PDFs to enable evidence-grounded consultations.
                  </p>
                  <button
                    onClick={onNavigateToDocs}
                    className="mt-2 font-bold text-sky-800 flex items-center gap-1 hover:underline"
                  >
                    Open Document Library <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Clinical Inquiry Cards */}
            <div className="w-full mt-8 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-sky-700" />
                Select Clinical Inquiry Template
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLINICAL_CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setInputText(cat.prompt)}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xs hover:border-sky-300 hover:shadow-xs transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-100 group-hover:bg-sky-700 group-hover:text-white transition">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {cat.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {cat.desc}
                        </p>
                      </div>
                      <span className="mt-3 text-[10px] font-semibold text-sky-700 flex items-center gap-1">
                        Use inquiry template &rarr;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 max-w-3xl ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-2xs ${
                    isUser
                      ? "bg-slate-800 text-white"
                      : "bg-sky-700 text-white"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 shadow-xs ${
                    isUser
                      ? "bg-sky-800 text-white rounded-tr-xs"
                      : "border border-slate-200 bg-white text-slate-900 rounded-tl-xs"
                  }`}
                >
                  {/* Assistant Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-800 flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5 text-sky-700" />
                          Clinical Evidence Synthesis
                        </span>
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                            {msg.sources.length} Verified References
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(msg.id || `${index}`, msg.content)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition font-medium"
                        title="Copy Clinical Note"
                      >
                        {copiedId === (msg.id || `${index}`) ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Note</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Body Content with Interactive Citations */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <FormattedMessage
                      text={msg.content}
                      sources={msg.sources || []}
                      onSelectSource={onSelectSource}
                    />
                  )}

                  {/* Sources Bar */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                        <BookOpen className="h-3 w-3 text-sky-700" />
                        Corroborated Literature Sources ({msg.sources.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src) => {
                          const percent = Math.round((src.score || 0) * 100);
                          return (
                            <button
                              key={src.id}
                              onClick={() => onSelectSource(src)}
                              className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition shadow-2xs"
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
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 max-w-3xl mr-auto">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-700 text-white">
              <Stethoscope className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-4 text-xs text-slate-700 flex items-center gap-3 shadow-xs">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-700 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-sky-700 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-sky-700 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="font-medium text-slate-700">
                Cross-referencing clinical literature & synthesizing verified note...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-sky-600 focus-within:ring-1 focus-within:ring-sky-600 transition overflow-hidden">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Inquire regarding clinical guidelines, drug titration, contraindications, or treatment protocols..."
              className="w-full resize-none bg-transparent px-4 pt-3 pb-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-3">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Enter to send • Shift + Enter for new line
              </span>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700 text-white shadow-2xs hover:bg-sky-800 active:scale-95 transition disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="h-3 w-3 text-slate-400" />
            <span>
              Clinical decision support is an adjunct to, and does not replace, licensed medical judgment.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormattedMessage({
  text,
  sources = [],
  onSelectSource,
}: {
  text: string;
  sources?: SourceCitation[];
  onSelectSource?: (src: SourceCitation) => void;
}) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-900">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="font-bold text-sky-900 text-sm sm:text-base mt-3 border-b border-slate-100 pb-1"
            >
              {renderInline(trimmed.slice(4), sources, onSelectSource)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="font-extrabold text-slate-900 text-base mt-4 border-b border-slate-200 pb-1"
            >
              {renderInline(trimmed.slice(3), sources, onSelectSource)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2
              key={idx}
              className="font-extrabold text-slate-900 text-lg mt-4 border-b border-slate-200 pb-1"
            >
              {renderInline(trimmed.slice(2), sources, onSelectSource)}
            </h2>
          );
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-700 mt-2 shrink-0" />
              <div className="flex-1">
                {renderInline(trimmed.slice(2), sources, onSelectSource)}
              </div>
            </div>
          );
        }

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-sky-800 text-xs mt-0.5 shrink-0 min-w-[14px]">
                {numMatch[1]}.
              </span>
              <div className="flex-1">
                {renderInline(numMatch[2], sources, onSelectSource)}
              </div>
            </div>
          );
        }

        return (
          <p key={idx}>
            {renderInline(trimmed, sources, onSelectSource)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(
  str: string,
  sources: SourceCitation[],
  onSelectSource?: (src: SourceCitation) => void
): React.ReactNode {
  // Regex to match citation tags like [Ref 1], [Ref #1], [Source 1], [1]
  const pattern = /\[(?:Ref\s*#?|Source\s*#?|Citation\s*#?)?(\d+)\]/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }

    const citationNum = parseInt(match[1], 10);
    const matchedSource = sources.find((s) => s.id === citationNum);

    parts.push(
      <button
        key={`cite-${match.index}`}
        type="button"
        onClick={() => matchedSource && onSelectSource && onSelectSource(matchedSource)}
        className="inline-flex items-center gap-0.5 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-1.5 py-0.2 text-[10px] mx-1 border border-sky-300 transition cursor-pointer"
        title={matchedSource ? `${matchedSource.document} (p. ${matchedSource.page})` : `Reference #${citationNum}`}
      >
        <span>Ref #{citationNum}</span>
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return <>{parts}</>;
}
