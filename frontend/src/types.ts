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

export interface CreateComplaintData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
}