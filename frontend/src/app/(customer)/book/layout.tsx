'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Sidebar } from '@/components/Sidebar';

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'CUSTOMER') {
        if (role === 'SUPER_ADMIN') {
          router.push('/saas/dashboard');
        } else {
          router.push('/app/dashboard');
        }
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== 'CUSTOMER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CUSTOMER" />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
