import axios, { AxiosInstance } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { LoginCredentials, RegisterCredentials, User, Conversation, Message } from '../../../shared/index';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const ensureSerializable = (data: any): any => {
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(ensureSerializable);
  }
  if (data !== null && typeof data === "object") {
    const result: any = {};
    for (const key in data) {
      result[key] = ensureSerializable(data[key]);
    }
    return result;
  }
  return data;
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token =
          store.getState().auth.token || localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Ensure all data is serializable
        response.data = ensureSerializable(response.data);
        return response.data;
      },
      (error) => {
        if (error.response?.status === 401) {
          store.dispatch(logout());
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    return this.api.post("/auth/login", credentials);
  }

  async register(credentials: RegisterCredentials) {
    return this.api.post("/auth/register", credentials);
  }

  async getMe() {
    return this.api.get("/auth/me");
  }

  // User endpoints
  async getUsers() {
    return this.api.get("/users");
  }

  async getUserById(userId: string) {
    return this.api.get(`/users/${userId}`);
  }

  async updateProfile(data: FormData) {
    return this.api.patch("/users/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  // Conversation endpoints
  async getConversations() {
    return this.api.get("/conversations");
  }

  async createConversation(data: {
    participantIds: string[];
    isGroup?: boolean;
    groupName?: string;
  }) {
    return this.api.post("/conversations", data);
  }

  async updateConversation(id: string, data: Partial<Conversation>) {
    return this.api.patch(`/conversations/${id}`, data);
  }

  async addParticipants(conversationId: string, participantIds: string[]) {
    return this.api.post(`/conversations/${conversationId}/participants`, {
      participantIds,
    });
  }

  // Message endpoints
  async getMessages(conversationId: string, page = 1) {
    return this.api.get(`/messages/${conversationId}?page=${page}&limit=50`);
  }

  async sendMessage(data: {
    conversationId: string;
    content: string;
    type?: string;
  }) {
    return this.api.post("/messages", data);
  }

  async uploadFile(formData: FormData) {
    return this.api.post("/messages/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async markAsRead(messageId: string) {
    return this.api.patch(`/messages/${messageId}/read`);
  }
}

export const apiService = new ApiService();

// Export individual API modules
export const authAPI = {
  login: (credentials: LoginCredentials) => apiService.login(credentials),
  register: (credentials: RegisterCredentials) =>
    apiService.register(credentials),
  getMe: () => apiService.getMe(),
};

export const userAPI = {
  getUsers: () => apiService.getUsers(),
  getUserById: (userId: string) => apiService.getUserById(userId),
  updateProfile: (data: FormData) => apiService.updateProfile(data),
};

export const conversationAPI = {
  getConversations: () => apiService.getConversations(),
  createConversation: (data: {
    participantIds: string[];
    isGroup?: boolean;
    groupName?: string;
  }) => apiService.createConversation(data),
  updateConversation: (id: string, data: Partial<Conversation>) =>
    apiService.updateConversation(id, data),
  addParticipants: (conversationId: string, participantIds: string[]) =>
    apiService.addParticipants(conversationId, participantIds),
};

export const messageAPI = {
  getMessages: (conversationId: string, page?: number) =>
    apiService.getMessages(conversationId, page),
  sendMessage: (data: {
    conversationId: string;
    content: string;
    type?: string;
  }) => apiService.sendMessage(data),
  uploadFile: (formData: FormData) => apiService.uploadFile(formData),
  markAsRead: (messageId: string) => apiService.markAsRead(messageId),
};