// API client for backend communication
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  photo_url?: string;
  status: 'received' | 'in_review' | 'resolved';
  assigned_to?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateComplaintStatusData {
  status: 'in_review' | 'resolved';
}

export interface AssignComplaintData {
  volunteerId: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    // backend expects /api/auth/signin
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    // backend expects /api/auth/signup
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Complaints API
export const complaintsAPI = {
  // Create a new complaint
  createComplaint: async (complaintData: CreateComplaintData, photoFile?: File) => {
    const formData = new FormData();
    formData.append('title', complaintData.title);
    formData.append('description', complaintData.description);
    formData.append('category', complaintData.category);
    formData.append('location', complaintData.location);
    
    if (complaintData.latitude) {
      formData.append('latitude', complaintData.latitude.toString());
    }
    if (complaintData.longitude) {
      formData.append('longitude', complaintData.longitude.toString());
    }
    
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    // allow the browser/axios to set the multipart boundary by clearing content-type here
    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return response.data;
  },

  // Get all complaints (admin only)
  getAllComplaints: async (filters?: {
    category?: string;
    status?: string;
    assigned_to?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    
    const response = await api.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  // Get volunteer's assigned complaints
  getVolunteerComplaints: async () => {
    const response = await api.get('/complaints/volunteers/me/complaints');
    return response.data;
  },

  // Get authenticated user's complaints (my complaints)
  getMyComplaints: async () => {
    const response = await api.get('/complaints/mine');
    return response.data;
  },

  // Assign complaint to volunteer (admin only)
  assignComplaint: async (complaintId: string, data: AssignComplaintData) => {
    const response = await api.put(`/complaints/${complaintId}/assign`, data);
    return response.data;
  },

  // Get list of volunteers (admin)
  getVolunteers: async () => {
    const response = await api.get('/users/volunteers');
    return response.data;
  },

  // Update complaint status (volunteer only)
  updateComplaintStatus: async (complaintId: string, data: UpdateComplaintStatusData) => {
    const response = await api.put(`/complaints/${complaintId}/status`, data);
    return response.data;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.Authorization;
};

export default api;