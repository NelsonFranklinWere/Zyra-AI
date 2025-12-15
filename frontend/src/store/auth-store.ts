import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  orgId: string | null;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  members?: User[];
  _count?: {
    members: number;
    products: number;
  };
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setOrganization: (organization: Organization | null) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      token: null,
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ user: null, organization: null, token: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);

