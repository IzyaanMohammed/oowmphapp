'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './layout/app-sidebar';
import { FirebaseClientProvider } from '@/firebase';

const AUTH_KEY = 'mph_auth_status';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem(AUTH_KEY);
      setIsAuthenticated(authStatus === 'true');
    } catch (error) {
      // sessionStorage is not available on the server
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && pathname !== '/login') {
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    sessionStorage.setItem(AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <FirebaseClientProvider>
        {isLoginPage ? (
          children
        ) : (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        )}
      </FirebaseClientProvider>
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
