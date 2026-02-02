import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthState, UserRole } from '@/types/user';
import { authAPI } from '@/services/api';
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

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const user = await authAPI.getCurrentUser();
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem('auth_token');
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const { user, token } = await authAPI.login(credentials.email, credentials.password);
      
      localStorage.setItem('auth_token', token);
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
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
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
    try {
      await authAPI.register(data);
      toast({
        title: 'Registration Successful',
        description: 'Your account is pending approval. You will be notified once approved.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;

    try {
      const updatedUser = await authAPI.updateProfile(updates);
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