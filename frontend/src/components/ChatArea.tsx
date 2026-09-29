"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageItem, SourceCitation } from "@/lib/api";
import {
  Send,
  Sparkles,
  Bot,
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
    title: "Pharmacology & Dosage",
    desc: "Renal adjustments, drug-drug interactions, contraindications",
    prompt: "What are the renal dosage adjustments and contraindications for Metformin in patients with CKD?",
  },
  {
    icon: HeartPulse,
    title: "Diagnostic Differential",
    desc: "Symptom presentation, diagnostic criteria, lab biomarkers",
    prompt: "What are the clinical diagnostic criteria and biomarker thresholds for Acute Coronary Syndrome?",
  },
  {
    icon: FileSpreadsheet,
    title: "Institutional Guidelines",
    desc: "Summaries from hospital protocols and indexed textbooks",
    prompt: "Summarize the primary clinical management recommendations from the uploaded hospital guidelines.",
  },
  {
    icon: Stethoscope,
    title: "Adverse Events & Safety",
    desc: "Monitoring parameters, toxicity profiles, tapering regimens",
    prompt: "Detail the primary adverse event profile and monitoring parameters for long-term systemic corticosteroid therapy.",
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
      : "Clinical Case Consultation";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Top Bar / Clinical Session Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-800">
            {displayTitle}
          </span>
          <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 border border-sky-200">
            Literature Grounded
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition border ${
              showSettings
                ? "bg-sky-50 text-sky-700 border-sky-200"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-sky-600" />
            <span>Retrieval Depth: {topK} Chunks</span>
          </button>
        </div>
      </div>

      {/* Top-K Selector Bar */}
      {showSettings && (
        <div className="border-b border-slate-200 bg-white px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Pinecone Context Chunks:</span>
            {[3, 5, 8].map((k) => (
              <button
                key={k}
                onClick={() => setTopK(k)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  topK === k
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {k} Sources
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-500">
            Higher values query more document segments from Pinecone.
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-8 flex flex-col items-center text-center">
            {/* Clinical Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-semibold text-sky-700 mb-4">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Evidence-Based Clinical Decision Support</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Medical Literature & Clinical Protocol Copilot
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Formulate clinical, pharmacological, or diagnostic questions. MediQ retrieves
              corroborating literature from your indexed documents and provides citation-backed guidance.
            </p>

            {/* Document Warning if empty */}
            {!hasDocuments && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left max-w-xl shadow-2xs">
                <FileQuestion className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">
                    No clinical reference documents found
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Upload medical textbooks, clinical study PDFs, or institutional guidelines in the Document Library to enable grounded retrieval.
                  </p>
                  <button
                    onClick={onNavigateToDocs}
                    className="mt-2 font-bold text-sky-700 flex items-center gap-1 hover:underline"
                  >
                    Open Document Library <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Clinical Inquiry Cards */}
            <div className="w-full mt-8 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-sky-600" />
                Sample Clinical Inquiries
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
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition">
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
                      <span className="mt-3 text-[10px] font-semibold text-sky-600 flex items-center gap-1">
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
                      : "bg-sky-600 text-white"
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 shadow-xs ${
                    isUser
                      ? "bg-sky-700 text-white rounded-tr-xs"
                      : "border border-slate-200 bg-white text-slate-800 rounded-tl-xs"
                  }`}
                >
                  {/* Assistant Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-700 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Clinical Evidence Note
                        </span>
                        {msg.sources && msg.sources.length > 0 && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            {msg.sources.length} Corroborated Citations
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
                            <span className="text-emerald-600">Copied</span>
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
                        <BookOpen className="h-3 w-3 text-sky-600" />
                        Verified Literature Sources ({msg.sources.length})
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
                              <span className="font-bold text-sky-700">
                                Ref #{src.id}
                              </span>
                              <span className="max-w-[150px] truncate text-slate-600">
                                {src.document}
                              </span>
                              <span className="rounded bg-white px-1 py-0.2 text-[9px] text-slate-600 border border-slate-200 font-medium">
                                p.{src.page}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Stethoscope className="h-4 w-4 animate-pulse" />
            </div>
            <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-center gap-3 shadow-xs">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-600 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="font-medium text-slate-600">
                Searching Pinecone index & synthesizing clinical evidence note...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition overflow-hidden">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter patient symptoms, pharmacology questions, or hospital protocol query — Press Enter to send"
              className="w-full resize-none bg-transparent px-4 pt-3 pb-10 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            <div className="absolute bottom-2.5 right-3 flex items-center gap-3">
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Shift + Enter for new line
              </span>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs hover:bg-sky-700 active:scale-95 transition disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
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
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="font-bold text-sky-800 text-sm sm:text-base mt-3 border-b border-slate-100 pb-1"
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

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600 mt-2 shrink-0" />
              <span>{renderInline(trimmed.slice(2), sources, onSelectSource)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-bold text-sky-700 shrink-0 text-xs">
                {numMatch[1]}.
              </span>
              <span>{renderInline(numMatch[2], sources, onSelectSource)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInline(trimmed, sources, onSelectSource)}</p>;
      })}
    </div>
  );
}

function renderInline(
  text: string,
  sources: SourceCitation[] = [],
  onSelectSource?: (src: SourceCitation) => void
): React.ReactNode[] {
  // Regex matches:
  // 1. **bold**
  // 2. `code`
  // 3. [Source 1, Source 2] or [Source 1] or [Ref 1]
  const pattern = /(\*\*.*?\*\*|`.*?`|\[(?:Source|Ref)\s*\d+(?:,\s*(?:Source|Ref)?\s*\d+)*\])/gi;
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-sky-800 border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Check if citation tag like [Source 1, Source 2]
    const citationMatch = part.match(/^\[(?:Source|Ref)\s*(\d+(?:,\s*(?:Source|Ref)?\s*\d+)*)\]$/i);
    if (citationMatch) {
      const nums = part.match(/\d+/g) || [];
      return (
        <span key={i} className="inline-flex items-center gap-1 mx-0.5 align-baseline">
          {nums.map((numStr, nIdx) => {
            const srcNum = parseInt(numStr, 10);
            const matchedSource = sources.find((s) => s.id === srcNum);
            return (
              <button
                key={nIdx}
                type="button"
                onClick={() => {
                  if (matchedSource && onSelectSource) {
                    onSelectSource(matchedSource);
                  }
                }}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-900 border border-sky-200 text-[10px] font-bold transition shadow-2xs cursor-pointer group"
                title={
                  matchedSource
                    ? `Click to view citation: ${matchedSource.document} (p. ${matchedSource.page})`
                    : `Citation #${srcNum}`
                }
              >
                <BookOpen className="h-2.5 w-2.5 text-sky-500 group-hover:text-sky-700" />
                <span>Ref {srcNum}</span>
              </button>
            );
          })}
        </span>
      );
    }

    return <span key={i}>{part}</span>;
  });
}
