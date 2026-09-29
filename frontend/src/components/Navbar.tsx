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
  Activity,
  Database,
  Layers,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface NavbarProps {
  activeTab: "chat" | "documents" | "search";
  setActiveTab: (tab: "chat" | "documents" | "search") => void;
  onOpenAuth: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAuth }: NavbarProps) {
  const { user, logout } = useAuth();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [dbOnline, setDbOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSystem = async () => {
      try {
        const health = await api.checkHealth();
        setApiOnline(health.status === "healthy");
      } catch {
        setApiOnline(false);
      }

      try {
        const dbHealth = await api.checkDbHealth();
        setDbOnline(dbHealth.status === "connected");
      } catch {
        setDbOnline(false);
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Hospital Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Medi<span className="text-sky-600">Q</span>
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 border border-sky-200">
                Clinical Decision Support
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Evidence-Based Literature & Hospital Protocol Copilot
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "chat"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-sky-600" />
            <span>Consultation</span>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "documents"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-sky-600" />
            <span>Document Library</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeTab === "search"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-sky-600" />
            <span>Vector Search</span>
          </button>
        </nav>

        {/* Status & User */}
        <div className="flex items-center gap-3">
          {/* Health Badges */}
          <div className="hidden lg:flex items-center gap-2 text-[11px]">
            <span
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 border font-medium ${
                apiOnline
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? "bg-emerald-500" : "bg-red-500"}`} />
              API: {apiOnline ? "Ready" : "Offline"}
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
                  <UserCheck className="h-3 w-3 text-sky-600" />
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out of portal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
