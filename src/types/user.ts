export type UserRole = 'student' | 'event_manager' | 'admin';

export type AccountStatus = 'pending' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  studentId?: string;
  faculty?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'event_manager';
  studentId?: string;
  faculty?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
