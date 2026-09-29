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
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Pill,
  Lock,
  Sparkles,
  Send,
  User,
  CheckCircle2,
} from "lucide-react";

function MediQApp() {
  const { user, isLoading: authLoading, login, register } = useAuth();

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
    if (!user) return;
    let isMounted = true;

    api
      .listDocuments()
      .then((docs) => {
        if (isMounted) setDocuments(docs || []);
      })
      .catch((err: unknown) => {
        console.error("Failed to load documents", err);
      });

    api
      .getChatHistory()
      .then((history) => {
        if (isMounted) setConversations(history || []);
      })
      .catch((err: unknown) => {
        console.error("Failed to load conversation history", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const docs = await api.listDocuments();
      setDocuments(docs || []);
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      const errorText =
        err instanceof Error
          ? err.message
          : "Failed to reach clinical knowledge service.";
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Note: ${errorText}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAskAboutDoc = (docName: string) => {
    setActiveTab("chat");
    handleSendMessage(
      `Provide a clinical summary and primary recommendations from "${docName}"`
    );
  };

  const handleAskQuestionFromSearch = (question: string) => {
    setActiveTab("chat");
    handleSendMessage(question);
  };

  const handleDemoAccess = async (presetQuestion?: string) => {
    const demoEmail = "dr.smith@mediq.hospital";
    const demoPass = "ClinicalPass2026!";
    const demoName = "Dr. Julian Smith, MD";

    try {
      await login(demoEmail, demoPass);
    } catch {
      try {
        await register(demoName, demoEmail, demoPass);
      } catch {
        setAuthModalOpen(true);
        return;
      }
    }

    if (presetQuestion) {
      setActiveTab("chat");
      handleSendMessage(presetQuestion);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs animate-pulse">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Loading MediQ...
          </span>
        </div>
      </div>
    );
  }

  // Clean, Minimal Landing Page (Left: Project Info | Right: Clean Chat Example Card)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
        {/* Simple Header */}
        <header className="border-b border-slate-200/80 bg-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Medi<span className="text-sky-600">Q</span>
                </span>
                <span className="ml-2 text-xs font-medium text-slate-500">
                  Clinical Copilot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content: Left Info / Right Chat Card */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Side: About the Project */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                <span>Clinical Decision Support System</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Evidence-based clinical intelligence for healthcare teams.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                MediQ helps physicians, residents, and healthcare professionals quickly query hospital protocols, verify drug dosages, and check care pathways—with verifiable, page-specific citations.
              </p>

              {/* Simple Feature Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Hospital Guidelines & Pathways</h3>
                    <p className="text-xs text-slate-500">Upload and search your institution&apos;s own practice manuals and treatment algorithms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 mt-0.5">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Dosage & Renal Adjustments</h3>
                    <p className="text-xs text-slate-500">Fast checks for eGFR cutoffs, adverse reactions, and contraindications before prescribing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Verified Literature Citations</h3>
                    <p className="text-xs text-slate-500">Every guidance note links directly to exact document names and page numbers.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-sky-700 active:scale-95 transition"
                >
                  <span>Start Consultation</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                
              </div>
            </div>

            {/* Right Side: Exactly One Clean Chat Example Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden text-left">
                {/* Chat Card Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900">Clinical Consultation Example</h2>
                      <p className="text-[10px] text-slate-500">Evidence-Grounded Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Literature Grounded</span>
                  </div>
                </div>

                {/* Chat Messages Body */}
                <div className="p-5 space-y-4 text-xs">
                  {/* Physician User Bubble */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="rounded-2xl rounded-tr-xs bg-sky-600 p-3.5 text-white max-w-[85%] leading-relaxed shadow-xs">
                      What are the renal dosage adjustments for Metformin in a patient with Type 2 Diabetes and CKD Stage 3b (eGFR 38 mL/min)?
                    </div>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* MediQ Assistant Response Bubble */}
                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white">
                      <Stethoscope className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-slate-50/60 p-4 text-slate-800 space-y-2.5 leading-relaxed max-w-[88%] shadow-2xs">
                      <p className="font-bold text-sky-800 text-xs">
                        Clinical Guidance & Titration:
                      </p>
                      <p>
                        According to the <strong>KDIGO Diabetes in CKD Guidelines</strong>:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        <li>
                          <strong>Dose Reduction:</strong> Reduce maximum dose to <strong>1,000 mg daily</strong> (e.g. 500 mg twice daily) for eGFR 30–44 mL/min.
                        </li>
                        <li>
                          <strong>Monitoring:</strong> Assess renal function (eGFR and serum creatinine) every 3 to 6 months.
                        </li>
                        <li>
                          <strong>Contraindication:</strong> Discontinue if eGFR drops below <strong>30 mL/min</strong>.
                        </li>
                      </ul>

                      {/* Verified Citation Pill */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <div
                          onClick={() =>
                            setSelectedSource({
                              id: 1,
                              document: "KDIGO 2023 Clinical Practice Guideline for Diabetes in CKD",
                              page: 48,
                              section: "Recommendation 1.3 - Metformin Titration",
                              score: 0.96,
                              text: "In patients with eGFR 30–44 mL/min/1.73m², the maximum recommended dose of metformin is 1,000 mg daily. Continue monitoring renal indices quarterly.",
                            })
                          }
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-sky-50 transition shadow-2xs"
                        >
                          <span className="font-bold text-sky-700">Ref #1</span>
                          <span className="truncate max-w-[170px] text-slate-600">
                            KDIGO 2023 Diabetes in CKD
                          </span>
                          <span className="rounded bg-slate-100 px-1 text-[9px] text-slate-500">
                            p. 48
                          </span>
                          <span className="font-bold text-emerald-600 text-[10px]">
                            96%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Prompt / Interaction Bar */}
                <div className="border-t border-slate-100 bg-white p-3.5">
                  <div
                    onClick={() => handleDemoAccess()}
                    className="cursor-pointer flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-400 hover:border-sky-300 hover:bg-sky-50/50 transition"
                  >
                    <span>Click to ask a clinical question in demo...</span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs">
                      <Send className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
          <p>
            MediQ Clinical Decision Support • Designed for healthcare practitioners
          </p>
        </footer>

        {/* Source Citation Modal */}
        <SourceModal
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          canDismiss={true}
        />
      </div>
    );
  }

  // Active Main Application Shell (Authenticated)
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
        {/* Sidebar on Consult Tab */}
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

      {/* Auth Modal */}
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
