/**
 * API Client for InterviewGPT Backend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async signUp(email, password, full_name, username) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name, username }),
    });
  }

  async signIn(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    // Store token if returned
    if (data.access_token) {
      localStorage.setItem("auth_token", data.access_token);
    }
    
    return data;
  }

  async logout() {
    localStorage.removeItem("auth_token");
  }

  // Analysis endpoints
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${this.baseURL}/analysis/upload`, {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return await response.json();
  }

  async analyzeResume(fileId) {
    return this.request("/analysis/analyze", {
      method: "POST",
      body: JSON.stringify({ file_id: fileId }),
    });
  }

  async getAnalysis(analysisId) {
    return this.request(`/analysis/${analysisId}`);
  }

  // Chat endpoints
  async sendMessage(message, conversationId = null) {
    return this.request("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });
  }

  async getConversation(conversationId) {
    return this.request(`/chat/conversation/${conversationId}`);
  }

  async getConversations() {
    return this.request("/chat/conversations");
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

export default new APIClient();
