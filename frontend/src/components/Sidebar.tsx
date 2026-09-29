"use client";

import React, { useState } from "react";
import { ConversationHistoryItem } from "@/lib/api";
import { Plus, MessageSquare, Clock, ChevronRight, Search, FileText } from "lucide-react";

interface SidebarProps {
  conversations: ConversationHistoryItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  isLoading,
}: SidebarProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!filterQuery.trim()) return true;
    const title = c.title || "";
    return title.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-slate-50/70 flex flex-col h-full">
      {/* New Consultation Action */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 active:scale-[0.99] transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Clinical Query</span>
        </button>
      </div>

      {/* Case Search if many conversations */}
      {conversations.length > 4 && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search previous cases..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>
      )}

      {/* History Header */}
      <div className="px-4 py-3 flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-500 uppercase">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-sky-600" /> Recent Cases
        </span>
        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] text-slate-600 font-semibold">
          {filteredConversations.length}
        </span>
      </div>

      {/* History Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
        {isLoading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 text-center px-4">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-semibold">
              {filterQuery ? "No matching cases" : "No previous consultations"}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {filterQuery
                ? "Try a different search keyword."
                : "Inquire about diagnosis, drug interactions, or hospital protocols."}
            </p>
          </div>
        ) : (
          filteredConversations.map((item) => {
            const isActive = item.id === activeConversationId;
            const title =
              item.title && item.title !== "New conversation"
                ? item.title
                : "Clinical Case Consultation";

            return (
              <button
                key={item.id}
                onClick={() => onSelectConversation(item.id)}
                className={`w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition border ${
                  isActive
                    ? "bg-white text-slate-900 border-sky-300 shadow-xs font-bold border-l-4 border-l-sky-600"
                    : "text-slate-700 bg-transparent border-transparent hover:bg-slate-200/60 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="truncate">{title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400">
                    {formatDate(item.updated_at || item.created_at)}
                  </span>
                  <ChevronRight
                    className={`h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition ${
                      isActive ? "opacity-100 text-sky-600" : ""
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
