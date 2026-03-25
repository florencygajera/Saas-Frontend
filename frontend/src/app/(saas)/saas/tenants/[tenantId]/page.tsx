'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { StatCard } from '@/components/StatCard';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { saasApi } from '@/lib/api';
import { TenantStats } from '@/lib/types';
import { ArrowLeft, Users, Calendar, DollarSign, Scissors } from 'lucide-react';
import Link from 'next/link';

export default function TenantStatsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await saasApi.getTenantStats(tenantId);
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tenant stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [tenantId]);

  if (loading) return <Loading message="Loading tenant stats..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <Topbar title="Tenant Stats" />
      <div className="p-6">
        <Link
          href="/saas/tenants"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tenants
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Customers"
            value={stats?.total_customers || 0}
            icon={<Users className="w-8 h-8" />}
          />
          <StatCard
            title="Bookings"
            value={stats?.total_bookings || 0}
            icon={<Calendar className="w-8 h-8" />}
          />
          <StatCard
            title="Revenue"
            value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
            icon={<DollarSign className="w-8 h-8" />}
          />
          <StatCard
            title="Services"
            value={stats?.active_services || 0}
            icon={<Scissors className="w-8 h-8" />}
          />
          <StatCard
            title="Staff"
            value={stats?.active_staff || 0}
            icon={<Users className="w-8 h-8" />}
          />
        </div>

        {stats?.bookings_by_status && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Bookings by Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.bookings_by_status).map(([status, count]) => (
                <div key={status} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 capitalize">{status.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
