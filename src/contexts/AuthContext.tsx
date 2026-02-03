import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthState, UserRole } from '@/types/user';
import { api } from '@/services/api'; 
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  // Restore user directly from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        setAuthState({
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await api.auth.login(credentials);
      
      const { user, token } = response; 
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });

      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await api.auth.register(data);
      toast({
        title: 'Registration Successful',
        description: 'Your account is pending approval. You will be notified once approved.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const updatedUser = await api.users.update(authState.user.id, updates);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
      return false;
    }
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
