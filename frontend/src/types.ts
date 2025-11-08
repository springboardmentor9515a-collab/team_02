export type Page =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'request-password-reset'
  | 'reset-password'
  | 'petitions'
  | 'polls'
  | 'reports'
  | 'messages'
  | 'complaints'
  | 'admin'
  | 'volunteer';

export interface UserData {
  fullName: string;
  email: string;
  token?: string;
  role?: 'citizen' | 'admin' | 'volunteer';
}

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  photo_url?: string;
  status: 'received' | 'in_review' | 'resolved';
  assigned_to?:
    | string
    | {
        _id?: string;
        name?: string;
        email?: string;
      };
  createdAt: string;
  updatedAt: string;
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
  signatures?: Array<{
    name: string;
    email: string;
    comment?: string;
    date: string;
  }>;
  assigned_to?: {
    _id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  status_history?: Array<{
    status: string;
    by: string;
    note?: string;
    timestamp: string;
  }>;
  comments?: Array<{
    by: {
      _id: string;
      name?: string;
      email?: string;
      role?: string;
    };
    text: string;
    at: string;
  }>;
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