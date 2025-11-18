import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserWithRoles } from '@/lib/auth/utils';

// Query key untuk auth
export const authKeys = {
  session: ['lark-auth', 'session'] as const,
};

// API function untuk fetch user
const fetchUser = async (): Promise<UserWithRoles | null> => {
  const response = await fetch('/api/auth/session');
  const data = await response.json();

  if (response.ok && data.user) {
    return data.user;
  }
  return null;
};

// Custom hook untuk auth dengan React Query
export const useAuth = () => {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5 menit
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Hook untuk invalidate auth cache
export const useInvalidateAuth = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAuth: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
    resetAuth: () => {
      queryClient.resetQueries({ queryKey: authKeys.session });
    },
  };
};

// Convenience hooks untuk permission checks
export const useUserPermissions = () => {
  const { data: user } = useAuth();

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]) => {
    return user?.permissions.some(permission => permissions.includes(permission)) ?? false;
  };

  return { hasPermission, hasAnyPermission };
};

export const useUserRoles = () => {
  const { data: user } = useAuth();

  const hasRole = (role: string) => {
    return user?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.roles.some(role => roles.includes(role)) ?? false;
  };

  return { hasRole, hasAnyRole };
};

// Hook for getting current user data
export const useCurrentUser = () => {
  const { data: user, isLoading, error } = useAuth();
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error
  };
};

// Hook untuk sign out
export const useSignOut = () => {
  const { invalidateAuth } = useInvalidateAuth();

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (response.ok) {
        invalidateAuth();
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { signOut };
};

