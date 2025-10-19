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
}