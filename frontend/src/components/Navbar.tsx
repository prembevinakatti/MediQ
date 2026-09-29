"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Stethoscope,
  MessageSquare,
  FileText,
  Search,
  LogOut,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  activeTab: "chat" | "documents" | "search";
  setActiveTab: (tab: "chat" | "documents" | "search") => void;
  onOpenAuth: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAuth }: NavbarProps) {
  const { user, logout } = useAuth();
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const health = await api.checkHealth();
        setSystemOnline(health.status === "healthy");
      } catch {
        setSystemOnline(false);
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-2xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Hospital CDSS Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Medi<span className="text-sky-700">Q</span>
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-200">
                Clinical Decision Support
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Evidence-Based Literature & Institutional Protocol System
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-sky-700" />
            <span>Clinical Consult</span>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "documents"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-sky-700" />
            <span>Formulary & Guidelines</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "search"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-sky-700" />
            <span>Clinical Search</span>
          </button>
        </nav>

        {/* Status & User */}
        <div className="flex items-center gap-3">
          {/* Clinical Protocol Status */}
          <div className="hidden lg:flex items-center gap-2 text-[11px]">
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border font-medium ${
                systemOnline
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  systemOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{systemOnline ? "Knowledge Engine Active" : "Connecting..."}</span>
            </span>
          </div>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "MD"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  {user.name}
                  <UserCheck className="h-3 w-3 text-sky-700" />
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out of clinical portal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 transition shadow-xs"
            >
              Practitioner Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
