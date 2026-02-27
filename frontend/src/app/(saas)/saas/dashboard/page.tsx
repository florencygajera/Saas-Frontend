'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { StatCard } from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { saasApi } from '@/lib/api';
import { PlatformStats, Tenant } from '@/lib/types';
import { Building2, Users, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function SaaSDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, tenantsData] = await Promise.all([
        saasApi.getPlatformStats(),
        saasApi.getTenants(),
      ]);
      setStats(statsData);
      setTenants(tenantsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading message="Loading platform stats..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const columns = [
    {
      key: 'name',
      header: 'Tenant Name',
      render: (tenant: Tenant) => (
        <Link
          href={`/saas/tenants/${tenant.id}`}
          className="text-primary-600 hover:underline font-medium"
        >
          {tenant.name}
        </Link>
      ),
    },
    { key: 'slug', header: 'Slug' },
    { key: 'plan', header: 'Plan' },
    {
      key: 'is_active',
      header: 'Status',
      render: (tenant: Tenant) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            tenant.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {tenant.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (tenant: Tenant) => new Date(tenant.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Topbar title="Platform Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tenants"
            value={stats?.total_tenants || 0}
            icon={<Building2 className="w-8 h-8" />}
          />
          <StatCard
            title="Active Tenants"
            value={stats?.active_tenants || 0}
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
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Top Tenants</h3>
          </div>
          <DataTable
            data={tenants.slice(0, 10)}
            columns={columns}
            keyField="id"
            emptyMessage="No tenants found"
          />
        </div>
      </div>
    </div>
  );
}
