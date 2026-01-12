import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    email: 'demo@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
    createdAt: '2024-01-15T10:00:00Z'
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: false,
      isLoading: false,

      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = mockUsers.find(u => u.email === email);
        
        if (email === 'demo@example.com' && password === 'password') {
          set({
            user: user || {
              id: '1',
              name: 'Utilisateur Demo',
              email,
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
              createdAt: new Date().toISOString()
            },
            token: 'mock-jwt-token-' + Date.now(),
            isAuthenticated: true,
            rememberMe,
            isLoading: false
          });
        } else {
          set({ isLoading: false });
          throw new Error('Email ou mot de passe incorrect');
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          createdAt: new Date().toISOString()
        };
        
        set({
          user: newUser,
          token: 'mock-jwt-token-' + Date.now(),
          isAuthenticated: true,
          rememberMe: false,
          isLoading: false
        });
      },

      loginWithOAuth: async (provider: 'google' | 'github') => {
        set({ isLoading: true });
        
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockOAuthUser: User = {
          id: Date.now().toString(),
          name: provider === 'google' ? 'Google User' : 'GitHub User',
          email: `${provider}user@example.com`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
          createdAt: new Date().toISOString()
        };
        
        set({
          user: mockOAuthUser,
          token: 'mock-oauth-token-' + Date.now(),
          isAuthenticated: true,
          rememberMe: true,
          isLoading: false
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          rememberMe: false
        });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ isLoading: false });
        // In real app, this would send an email
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => 
        state.rememberMe 
          ? { user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, rememberMe: state.rememberMe }
          : {}
    }
  )
);
