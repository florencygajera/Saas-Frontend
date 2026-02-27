'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Sidebar } from '@/components/Sidebar';

export default function SaaSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (role !== 'SUPER_ADMIN') {
        // Redirect to correct home based on role
        if (role === 'TENANT_ADMIN') {
          router.push('/app/dashboard');
        } else {
          router.push('/book/home');
        }
      }
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="SUPER_ADMIN" />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
