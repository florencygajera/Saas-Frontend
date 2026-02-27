import { User, UserRole } from './types';

const TOKEN_KEY = 'token';

// Token helpers
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// Role-based route helpers
export const getHomeRoute = (role: UserRole): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/saas/dashboard';
    case 'TENANT_ADMIN':
      return '/app/dashboard';
    case 'CUSTOMER':
      return '/book/home';
    default:
      return '/login';
  }
};

export const getRoleFromPath = (pathname: string): UserRole | null => {
  if (pathname.startsWith('/saas')) return 'SUPER_ADMIN';
  if (pathname.startsWith('/app')) return 'TENANT_ADMIN';
  if (pathname.startsWith('/book')) return 'CUSTOMER';
  return null;
};

export const canAccessRoute = (role: UserRole, pathname: string): boolean => {
  const requiredRole = getRoleFromPath(pathname);
  if (!requiredRole) return false;
  return role === requiredRole;
};

// Redirect based on role
export const redirectToHome = (role: UserRole): void => {
  if (typeof window === 'undefined') return;
  const homePath = getHomeRoute(role);
  window.location.href = homePath;
};
