import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { PERMISSIONS } from '@/lib/auth/permissions';

interface AuthGuardOptions {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();
  const {
    requiredPermissions = [],
    requiredRoles = [],
    redirectTo = '/auth/signin',
    fallback = null
  } = options;

  const isAuthenticated = !!user;

  useEffect(() => {
    if (isLoading) return; // Wait for loading to complete

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      router.push(redirectTo);
      return;
    }

    // Check required permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        router.push('/admin'); // Redirect to admin dashboard or show access denied
        return;
      }
    }

    // Check required roles
    if (requiredRoles.length > 0) {
      const hasAnyRole = requiredRoles.some(role =>
        user.roles.includes(role)
      );

      if (!hasAnyRole) {
        router.push('/admin'); // Redirect to admin dashboard or show access denied
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, requiredPermissions, requiredRoles, redirectTo, router]);

  // Return loading state and fallback
  if (isLoading) {
    return { isLoading: true, fallback };
  }

  return { isLoading: false, fallback: null };
}

// Predefined guards for common scenarios
export function useAdminGuard() {
  return useAuthGuard({
    requiredPermissions: [PERMISSIONS.ADMIN_ACCESS],
    redirectTo: '/auth/signin'
  });
}

export function useDashboardGuard() {
  return useAuthGuard({
    requiredPermissions: [PERMISSIONS.DASHBOARD_ACCESS],
    redirectTo: '/auth/signin'
  });
}

export function useUsersGuard() {
  return useAuthGuard({
    requiredPermissions: [PERMISSIONS.USERS_READ],
    redirectTo: '/admin'
  });
}

export function useRolesGuard() {
  return useAuthGuard({
    requiredPermissions: [PERMISSIONS.ROLES_READ],
    redirectTo: '/admin'
  });
}

export function usePermissionsGuard() {
  return useAuthGuard({
    requiredPermissions: [PERMISSIONS.PERMISSIONS_READ],
    redirectTo: '/admin'
  });
}
