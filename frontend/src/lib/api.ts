// ✅ API client for backend communication
import axios from "axios";

// ✅ Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      if (config.url && config.url.includes("/petitions")) {
        // Only log for petitions endpoint to avoid noise
        console.warn("[API] No token found in localStorage when calling", config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ======================
// ✅ Type Definitions
// ======================
export interface Poll {
  _id: string;
  title: string;
  description: string;
  options: string[];
  category: string;
  duration: number;
  target_location: string;
  created_by: string;
}

export interface Petition {
  _id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  location: string;
  targetAuthority: string;
  signatureGoal: number;
  status: string;
  creator: string;
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  photo_url?: string;
  status: "received" | "in_review" | "resolved";
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
  status: "in_review" | "resolved";
}

export interface AssignComplaintData {
  volunteerId: string;
}

// ======================
// ✅ Auth API
// ======================
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/signin", { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// ======================
// ✅ Complaints API
// ======================
export const complaintsAPI = {
  createComplaint: async (complaintData: CreateComplaintData, photoFile?: File) => {
    const formData = new FormData();
    formData.append("title", complaintData.title);
    formData.append("description", complaintData.description);
    formData.append("category", complaintData.category);
    formData.append("location", complaintData.location);

    if (complaintData.latitude)
      formData.append("latitude", complaintData.latitude.toString());
    if (complaintData.longitude)
      formData.append("longitude", complaintData.longitude.toString());

    if (photoFile) formData.append("photo", photoFile);

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await api.post("/complaints", formData, {
      headers,
    });
    return response.data;
  },

  getAllComplaints: async (filters?: {
    category?: string;
    status?: string;
    assigned_to?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.assigned_to) params.append("assigned_to", filters.assigned_to);

    const response = await api.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  getVolunteerComplaints: async () => {
    const response = await api.get("/complaints/volunteers/me/complaints");
    return response.data;
  },

  getMyComplaints: async () => {
    const response = await api.get("/complaints/mine");
    return response.data;
  },

  assignComplaint: async (complaintId: string, data: AssignComplaintData) => {
    const response = await api.put(`/complaints/${complaintId}/assign`, data);
    return response.data;
  },

  getVolunteers: async () => {
    const response = await api.get("/users/volunteers");
    return response.data;
  },

  updateComplaintStatus: async (complaintId: string, data: UpdateComplaintStatusData) => {
    const response = await api.put(`/complaints/${complaintId}/status`, data);
    return response.data;
  },
};

// ======================
// ✅ Polls API
// ======================
export const pollsAPI = {
  getAllPolls: async (filters?: { target_location?: string; category?: string; }) => {
    const params = new URLSearchParams();
    if (filters?.target_location) params.append("target_location", filters.target_location);
    if (filters?.category) params.append("category", filters.category);
    const response = await api.get(`/polls?${params.toString()}`);
    return response.data;
  },
  createPoll: async (pollData: {
    title: string;
    options: string[];
    description?: string;
    category?: string;
    duration?: number;
    target_location?: string;
    targetAuthority?: string;
  }) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await api.post("/polls", pollData, { headers });
    return response.data;
  },

  getPolls: async (target_location?: string) => {
    const params = target_location ? { target_location } : {};
    const response = await api.get("/polls", { params });
    return response.data;
  },

  vote: async (pollId: string, selected_option: string) => {
    const response = await api.post(`/polls/${pollId}/vote`, { selected_option });
    return response.data;
  },

  // GET /polls/:id/results - Fetch aggregated vote counts
  getPollResults: async (pollId: string) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  },
};

// ======================
// ✅ Petitions API
// ======================
export const petitionsAPI = {
  // GET /petitions/local - Official views petitions in their area
  getLocalPetitions: async () => {
    const response = await api.get('/petitions/local');
    return response.data;
  },

  // PUT /petitions/:id/assign - Official assigns petition to volunteer
  assignPetition: async (petitionId: string, data: { assigned_to: string; note?: string }) => {
    const response = await api.put(`/petitions/${petitionId}/assign`, data);
    return response.data;
  },

  // PUT /petitions/:id/volunteer-update - Volunteer adds progress notes
  volunteerUpdatePetition: async (petitionId: string, data: { note: string; status?: string }) => {
    const response = await api.put(`/petitions/${petitionId}/volunteer-update`, data);
    return response.data;
  },

  // PUT /petitions/:id/respond - Official gives final comment or closes petition
  respondPetition: async (petitionId: string, data: { official_response?: string; status?: string }) => {
    const response = await api.put(`/petitions/${petitionId}/respond`, data);
    return response.data;
  },
  getAllPetitions: async (filters?: { location?: string; category?: string; status?: string; }) => {
    const params = new URLSearchParams();
    if (filters?.location) params.append("location", filters.location);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.status) params.append("status", filters.status);
    const response = await api.get(`/petitions?${params.toString()}`);
    return Array.isArray(response.data) ? response.data : (response.data.petitions || []);
  },

  // POST /petitions/:id/comment - Add comment to petition
  commentPetition: async (petitionId: string, text: string) => {
    const response = await api.post(`/petitions/${petitionId}/comment`, { text });
    return response.data;
  },

  // PUT /petitions/:id/resolve - Admin resolves petition
  resolvePetition: async (petitionId: string, note?: string) => {
    const response = await api.put(`/petitions/${petitionId}/resolve`, { note });
    return response.data;
  },
  createPetition: async (petitionData: {
    title: string;
    summary: string;
    description: string;
    category: string;
    location: string;
    targetAuthority: string;
    signatureGoal: number;
  }) => {
  const response = await api.post("/petitions", petitionData);
  return response.data;
  },

  getPetitions: async (filters?: {
    category?: string;
    location?: string;
    status?: string;
  }) => {
    const response = await api.get("/petitions", { params: filters });
    return response.data;
  },

  signPetition: async (petitionId: string) => {
    const response = await api.post(`/petitions/${petitionId}/sign`);
    return response.data;
  },
};

// ======================
// ✅ Reports API
// ======================
export const reportsAPI = {
  getEngagementReport: async () => {
    const response = await api.get("/reports/engagement");
    return response.data;
  },

  exportReports: async (format: "csv" | "pdf" = "csv") => {
    const response = await api.get(`/reports/export`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },
};

// ======================
// ✅ Utility Functions
// ======================
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  api.defaults.headers.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.Authorization;
};

// ✅ Default export
export default api;
