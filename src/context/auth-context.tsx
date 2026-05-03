'use client';

import { createContext, useContext } from 'react';

export type UserRole = 'staff' | 'admin';

export interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  user: { 
    name: string; 
    email: string; 
    photoURL?: string;
    personalId: string;
  } | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
