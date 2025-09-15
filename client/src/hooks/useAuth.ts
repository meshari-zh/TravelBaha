import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity, // Never consider the data stale
    gcTime: Infinity, // Keep in cache forever
  });

  // If we get a 401 error, the user is not authenticated
  const isUnauthenticated = error && (error as any).status === 401;

  return {
    user,
    isLoading: isLoading && !isUnauthenticated,
    isAuthenticated: !!user,
    isUnauthenticated,
  };
}
