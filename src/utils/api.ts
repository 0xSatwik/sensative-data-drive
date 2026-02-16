import axios from 'axios';

// Using the correct API URL from the shared code
const API_URL = 'https://crypto-vault-api.memonic.workers.dev';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send/receive httpOnly cookies with cross-origin requests
});

// No request interceptor needed — cookies are sent automatically by the browser

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login if unauthorized
    if (error.response && error.response.status === 401) {
      // Clear the JS-readable indicator cookie
      document.cookie = 'is_logged_in=; Path=/; Max-Age=0';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to check if user is logged in (reads JS-accessible indicator cookie)
export function isLoggedIn(): boolean {
  return document.cookie.split(';').some(c => c.trim().startsWith('is_logged_in=1'));
}

// Auth endpoints
export const auth = {
  register: (email: string, password: string) =>
    api.post('/api/register', { email, password }),

  login: (email: string, password: string) =>
    api.post('/api/login', { email, password }),

  logout: () => api.post('/api/logout').finally(() => {
    // Clear the JS-readable indicator cookie on the client side
    document.cookie = 'is_logged_in=; Path=/; Max-Age=0';
  })
};

// Profile endpoints
export const profiles = {
  getAll: () => api.get('/api/profiles'),

  create: (name: string) => api.post('/api/profiles', { name }),

  update: (id: string, name: string) =>
    api.put(`/api/profiles/${id}`, { name }),

  delete: (id: string) => api.delete(`/api/profiles/${id}`)
};

// Entry endpoints
export interface CreateEntryData {
  profile_id: string;
  title: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  category: 'mnemonic_phrase' | 'private_key' | 'password' | 'other';
  version?: number; // Encryption version: 2 = AES-GCM, undefined/1 = legacy AES-CBC
}

export interface UpdateEntryData {
  profile_id: string;
  title: string;
  encrypted_data: string;
  iv: string;
  salt: string;
  category: 'mnemonic_phrase' | 'private_key' | 'password' | 'other';
  version?: number; // Encryption version: 2 = AES-GCM, undefined/1 = legacy AES-CBC
}

export interface EntryFilters {
  profile_id?: string;
  search?: string;
  pinned?: boolean;
  category?: string;
}

export const entries = {
  getAll: (filters: EntryFilters = {}) => {
    const params = new URLSearchParams();

    if (filters.profile_id) {
      params.append('profile_id', filters.profile_id);
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.pinned !== undefined) {
      params.append('pinned', filters.pinned ? '1' : '0');
    }

    if (filters.category) {
      params.append('category', filters.category);
    }

    return api.get(`/api/entries?${params.toString()}`);
  },

  getById: (id: string) => api.get(`/api/entries/${id}`),

  create: (data: CreateEntryData) => api.post('/api/entries', data),

  update: (id: string, data: UpdateEntryData) =>
    api.put(`/api/entries/${id}`, data),

  delete: (id: string) => api.delete(`/api/entries/${id}`),

  togglePin: (id: string) => api.put(`/api/entries/${id}/pin`)
};

export default api;