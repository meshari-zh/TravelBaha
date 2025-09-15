import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUnauthenticated: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/user");
        
        if (!isMounted) return;
        
        if (response.status === 401) {
          setIsUnauthenticated(true);
          setUser(null);
        } else if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsUnauthenticated(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsUnauthenticated(true);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value: AuthState = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isUnauthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}