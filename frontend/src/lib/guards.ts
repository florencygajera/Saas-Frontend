import { UserRole } from './types';
import { canAccessRoute, getHomeRoute, redirectToHome } from './auth';

// Route guard helpers
export const checkRouteAccess = (
  role: UserRole | null,
  pathname: string
): { allowed: boolean; redirectPath?: string } => {
  // If no role, not authenticated
  if (!role) {
    return { allowed: false, redirectPath: '/login' };
  }

  // Check if user can access this route
  if (!canAccessRoute(role, pathname)) {
    return { allowed: false, redirectPath: getHomeRoute(role) };
  }

  return { allowed: true };
};

// Guard component helper
export const guardRoute = (
  role: UserRole | null,
  pathname: string
): void => {
  const { allowed, redirectPath } = checkRouteAccess(role, pathname);
  if (!allowed && redirectPath) {
    window.location.href = redirectPath;
  }
};
