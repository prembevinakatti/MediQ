"use client";

import React, { useState, useRef } from "react";
import { DocumentRecord, api } from "@/lib/api";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Layers,
  Calendar,
  ArrowRight,
  Database,
  FileCode,
  FolderOpen,
} from "lucide-react";

interface DocumentManagerProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  onRefreshDocs: () => void;
  onAskAboutDoc: (docName: string) => void;
}

export function DocumentManager({
  documents,
  isLoading,
  onRefreshDocs,
  onAskAboutDoc,
}: DocumentManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = documents.reduce((acc, d) => acc + (d.pages || 0), 0);
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunks || 0), 0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF documents are supported for clinical indexing.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadDocument(file);
      setUploadSuccess(
        `Successfully indexed "${file.name}" into Pinecone (${res.data?.chunks || "multiple"} vector chunks).`
      );
      onRefreshDocs();
    } catch (err: any) {
      setUploadError(err.message || "Failed to process document");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-sky-600" />
              Clinical Document & Formulary Library
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Manage hospital guidelines, medical textbooks, and clinical trial studies indexed in Pinecone.
            </p>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 active:scale-[0.99] transition"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Clinical PDF
          </button>
        </div>

        {/* Clinical Statistics Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-sky-600" /> Active Documents
            </span>
            <p className="mt-2 text-2xl font-extrabold text-slate-900">
              {documents.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-teal-600" /> Vector Chunks
            </span>
            <p className="mt-2 text-2xl font-extrabold text-teal-700">
              {totalChunks}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" /> Total Pages
            </span>
            <p className="mt-2 text-2xl font-extrabold text-indigo-700">
              {totalPages}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-600" /> Vector Index
            </span>
            <p className="mt-2 text-xs font-bold text-slate-900">
              768-Dim Cosine
            </p>
            <p className="text-[10px] text-slate-500">Gemini Embedding-001</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all bg-white ${
            dragActive
              ? "border-sky-500 bg-sky-50/50 scale-[1.005]"
              : "border-slate-300 hover:border-sky-400 hover:bg-slate-50/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 mb-3 shadow-2xs">
              <UploadCloud className="h-6 w-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {uploading
                ? "Extracting Chunks & Vectorizing into Pinecone..."
                : "Upload Medical Literature or Institutional Guidelines"}
            </h3>

            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Drag and drop clinical PDF documents here. Text will be chunked, embedded via Gemini, and indexed into your Pinecone namespace.
            </p>

            {uploading && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-xs text-sky-800 border border-sky-200 font-semibold">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
                Generating 768-dim embeddings and saving record...
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {uploadError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{uploadSuccess}</span>
          </div>
        )}

        {/* Document Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-sky-600" />
              Indexed Medical Literature ({documents.length})
            </h2>
            <button
              onClick={onRefreshDocs}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Refresh List
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-slate-200/60 animate-pulse"
                />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">
                No documents uploaded yet
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Upload your first medical guideline or pharmacology guide to start asking questions with citations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4
                            className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition truncate max-w-[210px]"
                            title={doc.document_name}
                          >
                            {doc.document_name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Indexed on {formatDate(doc.created_at)}
                          </span>
                        </div>
                      </div>

                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Pinecone Live
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 p-2 border border-slate-200/60">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Pages
                        </span>
                        <p className="font-bold text-slate-900">{doc.pages}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2 border border-slate-200/60">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          Pinecone Chunks
                        </span>
                        <p className="font-bold text-teal-700">{doc.chunks}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Ready for RAG Query
                    </span>

                    <button
                      onClick={() => onAskAboutDoc(doc.document_name)}
                      className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition"
                    >
                      <span>Consult on this document</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
