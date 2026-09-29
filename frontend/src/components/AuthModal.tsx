"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Stethoscope,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  X,
  ShieldCheck,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function AuthModal({ isOpen, onClose, canDismiss = false }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error("Please enter your practitioner name & credential");
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      if (onClose) onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAccess = async () => {
    setError(null);
    setLoading(true);
    const demoEmail = "dr.smith@mediq.hospital";
    const demoPass = "ClinicalPass2026!";
    const demoName = "Dr. Julian Smith, MD";

    try {
      // Try login first
      await login(demoEmail, demoPass);
      if (onClose) onClose();
    } catch {
      // If user doesn't exist yet, auto-register
      try {
        await register(demoName, demoEmail, demoPass);
        if (onClose) onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to initialize demo session");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Clinical Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-700 text-white shadow-xs mb-3">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            Medi<span className="text-sky-700">Q</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              Practitioner Portal
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isRegister
              ? "Register your clinical practitioner credentials"
              : "Sign in to access institutional practice guidelines and clinical consultation"}
          </p>
        </div>



        {/* Tab Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${!isRegister
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${isRegister
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
              }`}
          >
            Register Practitioner
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Julian Smith, MD"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="physician@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-800 active:scale-[0.99] transition disabled:opacity-40"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>{isRegister ? "Register Practitioner Account" : "Access Clinical Workspace"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>Encrypted Clinical Access • Institutional Protocol Isolation</span>
        </div>
      </div>
    </div>
  );
}
