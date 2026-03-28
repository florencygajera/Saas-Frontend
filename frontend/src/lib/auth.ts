import { UserRole } from './types';

const TOKEN_KEY = 'token';
const ROLE_KEY = 'auth_role';

const setCookie = (key: string, value: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; samesite=lax`;
};

const clearCookie = (key: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  clearCookie(TOKEN_KEY);
};

export const setRole = (role: UserRole): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
  setCookie(ROLE_KEY, role);
};

export const removeRole = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ROLE_KEY);
  clearCookie(ROLE_KEY);
};

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
  if (pathname.startsWith('/book') || pathname.startsWith('/pay')) return 'CUSTOMER';
  return null;
};

export const canAccessRoute = (role: UserRole, pathname: string): boolean => {
  const requiredRole = getRoleFromPath(pathname);
  if (!requiredRole) return false;
  return role === requiredRole;
};

export const redirectToHome = (role: UserRole): void => {
  if (typeof window === 'undefined') return;
  const homePath = getHomeRoute(role);
  window.location.href = homePath;
};
