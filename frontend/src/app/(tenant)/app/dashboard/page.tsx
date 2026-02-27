'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { StatCard } from '@/components/StatCard';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { tenantApi } from '@/lib/api';
import { TenantAdminStats } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { Users, Calendar, DollarSign, Clock } from 'lucide-react';

export default function TenantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TenantAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchStats} />;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.tenant_name || 'Business'}!
          </h1>
          <p className="text-gray-600">Here's your business overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={<Users className="w-8 h-8" />}
          />
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings || 0}
            icon={<Calendar className="w-8 h-8" />}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
            icon={<DollarSign className="w-8 h-8" />}
          />
          <StatCard
            title="Pending Appointments"
            value={stats?.pending_appointments || 0}
            icon={<Clock className="w-8 h-8" />}
          />
        </div>
      </div>
    </div>
  );
}
