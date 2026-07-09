import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get("refreshToken");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const newToken = data.data.accessToken;
          Cookies.set("accessToken", newToken, { expires: 1 });
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (email: string, name: string, password: string) =>
    api.post("/auth/register", { email, name, password }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  refresh: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
  me: () => api.get("/auth/me"),
};

export const accountsApi = {
  getAll: () => api.get("/accounts"),
};

export const transactionsApi = {
  getAll: (page = 0, size = 20) =>
    api.get(`/transactions?page=${page}&size=${size}`),
  create: (data: {
    amount: number;
    type: string;
    categoryName?: string;
    merchant?: string;
    description?: string;
    transactionDate?: string;
  }) => api.post("/transactions", data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getCategories: () => api.get("/transactions/categories"),
};

export const analyticsApi = {
  getSummary: () => api.get("/analytics/summary"),
  getFinancialScore: () => api.get("/analytics/financial-score"),
  recalculateScore: () => api.post("/analytics/recalculate-score"),
};

export const goalsApi = {
  getAll: () => api.get("/goals"),
  create: (data: {
    name: string;
    description?: string;
    targetAmount: number;
    currentAmount?: number;
    deadline: string;
  }) => api.post("/goals", data),
  update: (id: string, data: object) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
};

export const chatApi = {
  send: (data: object) => api.post("/chat", data),
  getHistory: (sessionId?: string) =>
    api.get(`/chat/history${sessionId ? `?sessionId=${sessionId}` : ""}`),
};

export const recommendationsApi = {
  getAll: () => api.get("/recommendations"),
  generate: () => api.post("/recommendations/generate"),
  updateStatus: (id: string, status: string) =>
    api.patch(`/recommendations/${id}/status`, { status }),
};

export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAllRead: () => api.post("/notifications/mark-read"),
};
