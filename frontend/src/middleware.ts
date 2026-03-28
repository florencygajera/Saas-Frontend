import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './lib/types';

const AUTH_PAGES = new Set(['/login', '/signup', '/forgot-password', '/verify-otp']);

const HOME_BY_ROLE: Record<UserRole, string> = {
  SUPER_ADMIN: '/saas/dashboard',
  TENANT_ADMIN: '/app/dashboard',
  CUSTOMER: '/book/home',
};

const getRequiredRole = (pathname: string): UserRole | null => {
  if (pathname.startsWith('/saas')) return 'SUPER_ADMIN';
  if (pathname.startsWith('/app')) return 'TENANT_ADMIN';
  if (pathname.startsWith('/book') || pathname.startsWith('/pay')) return 'CUSTOMER';
  return null;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('auth_role')?.value as UserRole | undefined;
  const requiredRole = getRequiredRole(pathname);

  if (requiredRole) {
    if (!token || !role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== requiredRole) {
      return NextResponse.redirect(new URL(HOME_BY_ROLE[role], request.url));
    }
  }

  if (AUTH_PAGES.has(pathname) && token && role) {
    return NextResponse.redirect(new URL(HOME_BY_ROLE[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/saas/:path*', '/app/:path*', '/book/:path*', '/pay/:path*', '/login', '/signup', '/forgot-password', '/verify-otp'],
};
