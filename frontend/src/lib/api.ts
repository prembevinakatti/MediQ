export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("mediq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface User {
  user_id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  email: string;
}

export interface DocumentRecord {
  id: string;
  document_name: string;
  pages: number;
  chunks: number;
  created_at: string;
}

export interface SourceCitation {
  id: number;
  document: string;
  page: number;
  section: string;
  score: number;
  text?: string;
}

export interface ChatResponse {
  conversation_id: string;
  title?: string;
  question: string;
  search_query: string;
  answer: string;
  sources: SourceCitation[];
}

export interface ConversationHistoryItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  created_at?: string;
}

export interface SearchMatch {
  score: number;
  text: string;
  page_number: number;
  document_name: string;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error("Failed to get user profile");
    }
    return res.json();
  },

  // Documents
  async uploadDocument(file: File): Promise<{ message: string; data: any }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Document upload failed");
    }
    return res.json();
  },

  async listDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch(`${API_BASE_URL}/documents/`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch documents");
    }
    return res.json();
  },

  // Chat
  async chat(
    question: string,
    conversation_id?: string,
    top_k: number = 3
  ): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        question,
        conversation_id: conversation_id || null,
        top_k,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to generate answer");
    }
    return res.json();
  },

  async getChatHistory(): Promise<ConversationHistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/chat/history`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error("Failed to load chat history");
    }
    return res.json();
  },

  async getConversationMessages(conversationId: string): Promise<MessageItem[]> {
    const res = await fetch(`${API_BASE_URL}/chat/${conversationId}/messages`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      throw new Error("Failed to load conversation messages");
    }
    return res.json();
  },

  // Search
  async searchDocuments(query: string, top_k: number = 5): Promise<{ query: string; results: SearchMatch[] }> {
    const params = new URLSearchParams({ query, top_k: top_k.toString() });
    const res = await fetch(`${API_BASE_URL}/search/?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Search failed");
    }
    return res.json();
  },

  // Health
  async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  async checkDbHealth(): Promise<{ status: string; message?: string }> {
    const res = await fetch(`${API_BASE_URL}/health/db`);
    return res.json();
  },
};
