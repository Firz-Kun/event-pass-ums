import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthState, UserRole } from '@/types/user';
import { mockUsers, demoCredentials } from '@/data/mockUsers';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ums_auth';
const USERS_KEY = 'ums_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  // Initialize users in localStorage if not exists
  useEffect(() => {
    const storedUsers = localStorage.getItem(USERS_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const getUsers = (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getUsers();
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }

    // Check demo passwords
    const isValidPassword =
      (credentials.email === demoCredentials.admin.email && credentials.password === demoCredentials.admin.password) ||
      (credentials.email === demoCredentials.eventManager.email && credentials.password === demoCredentials.eventManager.password) ||
      (credentials.email === demoCredentials.student.email && credentials.password === demoCredentials.student.password) ||
      credentials.password === 'password123'; // Default password for other users

    if (!isValidPassword) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }

    if (user.status === 'pending') {
      toast({
        title: 'Account Pending',
        description: 'Your account is awaiting approval from an administrator',
        variant: 'destructive',
      });
      return false;
    }

    if (user.status === 'suspended') {
      toast({
        title: 'Account Suspended',
        description: 'Your account has been suspended. Please contact support.',
        variant: 'destructive',
      });
      return false;
    }

    // Update last login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    saveUsers(updatedUsers);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setAuthState({
      user: updatedUser,
      isAuthenticated: true,
      isLoading: false,
    });

    toast({
      title: 'Welcome back!',
      description: `Logged in as ${user.name}`,
    });

    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getUsers();
    const existingUser = users.find((u) => u.email === data.email);

    if (existingUser) {
      toast({
        title: 'Registration Failed',
        description: 'An account with this email already exists',
        variant: 'destructive',
      });
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      status: 'pending', // Requires admin approval
      studentId: data.studentId,
      faculty: data.faculty,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    saveUsers([...users, newUser]);

    toast({
      title: 'Registration Successful',
      description: 'Your account is pending approval. You will be notified once approved.',
    });

    return true;
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const users = getUsers();
    const updatedUser = { ...authState.user, ...updates };
    const updatedUsers = users.map((u) => (u.id === authState.user!.id ? updatedUser : u));

    saveUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    setAuthState((prev) => ({ ...prev, user: updatedUser }));

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated',
    });

    return true;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authState.user) return false;
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    return authState.user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updateProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
