'use client';

import {
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './layout/app-sidebar';
import { AuthContext, type AuthContextType, type UserRole } from '@/context/auth-context';

const AUTH_KEY = 'mph_auth_status';
const ROLE_KEY = 'mph_user_role';
const PERSONAL_ID_KEY = 'mph_personal_id';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem(AUTH_KEY);
      const savedRole = sessionStorage.getItem(ROLE_KEY) as UserRole | null;
      let personalId = localStorage.getItem(PERSONAL_ID_KEY);
      
      if (!personalId) {
        personalId = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(PERSONAL_ID_KEY, personalId);
      }

      if (authStatus === 'true' && savedRole) {
        setIsAuthenticated(true);
        setRole(savedRole);
        setUser({
          name: savedRole === 'admin' ? 'Administrator' : 'Staff Member',
          email: savedRole === 'admin' ? 'admin@mph.com' : 'staff@mph.com',
          personalId: personalId
        });
      }
    } catch (error) {
      // Storage not available
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

  const login = (selectedRole: UserRole) => {
    let personalId = localStorage.getItem(PERSONAL_ID_KEY);
    if (!personalId) {
        personalId = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem(PERSONAL_ID_KEY, personalId);
    }

    sessionStorage.setItem(AUTH_KEY, 'true');
    sessionStorage.setItem(ROLE_KEY, selectedRole);
    
    setIsAuthenticated(true);
    setRole(selectedRole);
    setUser({
      name: selectedRole === 'admin' ? 'Administrator' : 'Staff Member',
      email: selectedRole === 'admin' ? 'admin@mph.com' : 'staff@mph.com',
      personalId: personalId
    });
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
    router.push('/login');
  };

  const isLoginPage = pathname === '/login';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, user, login, logout }}>
      {!isAuthenticated ? (
        isLoginPage ? children : null
      ) : (
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset className="bg-background/50 backdrop-blur-sm">
            {isLoginPage ? null : children}
          </SidebarInset>
        </SidebarProvider>
      )}
    </AuthContext.Provider>
  );
}
