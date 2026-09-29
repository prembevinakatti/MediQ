"use client";

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  api,
  DocumentRecord,
  ConversationHistoryItem,
  MessageItem,
  SourceCitation,
} from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { DocumentManager } from "@/components/DocumentManager";
import { SearchExplorer } from "@/components/SearchExplorer";
import { AuthModal } from "@/components/AuthModal";
import { SourceModal } from "@/components/SourceModal";
import {
  Stethoscope,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";

function MediQApp() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"chat" | "documents" | "search">("chat");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Consultations & Messages
  const [conversations, setConversations] = useState<ConversationHistoryItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Source inspection
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadDocuments();
      loadConversations();
    } else {
      setConversations([]);
      setDocuments([]);
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [user]);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const loadConversations = async () => {
    setLoadingHistory(true);
    try {
      const history = await api.getChatHistory();
      setConversations(history || []);
    } catch (err) {
      console.error("Failed to load conversation history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setActiveTab("chat");
    setChatLoading(true);
    try {
      const msgs = await api.getConversationMessages(convId);
      setMessages(msgs || []);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setActiveTab("chat");
  };

  const handleSendMessage = async (text: string, topK: number = 3) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Add optimistic user message
    const tempUserMsg: MessageItem = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setChatLoading(true);

    try {
      const response = await api.chat(
        text,
        activeConversationId || undefined,
        topK
      );

      setActiveConversationId(response.conversation_id);

      if (response.title) {
        setConversations((prev) => {
          const exists = prev.some((c) => c.id === response.conversation_id);
          if (exists) {
            return prev.map((c) =>
              c.id === response.conversation_id
                ? { ...c, title: response.title! }
                : c
            );
          } else {
            return [
              {
                id: response.conversation_id,
                title: response.title!,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              ...prev,
            ];
          }
        });
      }

      const assistantMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadConversations();
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Failed to reach clinical AI service."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAskAboutDoc = (docName: string) => {
    setActiveTab("chat");
    handleSendMessage(`Provide a comprehensive clinical summary and key findings from the document: "${docName}"`);
  };

  const handleAskQuestionFromSearch = (question: string) => {
    setActiveTab("chat");
    handleSendMessage(question);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs animate-pulse">
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
            Loading MediQ Clinical Workspace...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated Landing Hero
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Medi<span className="text-sky-600">Q</span>
              </span>
              <span className="ml-2 text-xs font-semibold text-slate-500">
                Clinical Copilot
              </span>
            </div>
          </div>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition shadow-xs active:scale-95"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Practitioner Portal Sign In</span>
          </button>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-14 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 mb-6">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            <span>Institutional Clinical Decision Support & Formulary Search</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Evidence-Based Clinical Intelligence,{" "}
            <span className="text-sky-600">
              Corroborated by Verified Literature.
            </span>
          </h1>

          <p className="mt-4 text-xs sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            MediQ augments medical professionals with fast, vector-indexed clinical
            literature retrieval, smart question decomposition, and citations
            backed directly by Pinecone and Google Gemini.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-sky-700 active:scale-95 transition"
            >
              <span>Access Clinical Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Institutional Feature Highlights */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left w-full">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 mb-3 border border-sky-100">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pinecone Vector RAG</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                768-dimensional medical embeddings isolated per institutional user for fast, secure document retrieval.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 mb-3 border border-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Verified Citations</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Every synthesis provides verifiable document names, page numbers, and cosine match scores.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Adaptive Inquiries</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Decontextualizes follow-up clinical questions based on case history for accurate literature queries.
              </p>
            </div>
          </div>
        </main>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          canDismiss={true}
        />
      </div>
    );
  }

  // Active Main Application Shell
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar only on Chat Tab */}
        {activeTab === "chat" && (
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            isLoading={loadingHistory}
          />
        )}

        {/* Active Tab View */}
        {activeTab === "chat" && (
          <ChatArea
            messages={messages}
            isLoading={chatLoading}
            onSendMessage={handleSendMessage}
            onSelectSource={(source) => setSelectedSource(source)}
            hasDocuments={documents.length > 0}
            onNavigateToDocs={() => setActiveTab("documents")}
            conversationTitle={
              conversations.find((c) => c.id === activeConversationId)?.title
            }
          />
        )}

        {activeTab === "documents" && (
          <DocumentManager
            documents={documents}
            isLoading={loadingDocs}
            onRefreshDocs={loadDocuments}
            onAskAboutDoc={handleAskAboutDoc}
          />
        )}

        {activeTab === "search" && (
          <SearchExplorer onAskQuestion={handleAskQuestionFromSearch} />
        )}
      </div>

      {/* Verified Citation Modal */}
      <SourceModal
        source={selectedSource}
        onClose={() => setSelectedSource(null)}
      />

      {/* Auth Modal (if opened manually) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        canDismiss={true}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MediQApp />
    </AuthProvider>
  );
}
