'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/DataTable';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { saasApi } from '@/lib/api';
import { Tenant } from '@/lib/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await saasApi.getTenants();
      setTenants(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      setUpdating(tenant.id);
      await saasApi.updateTenant(tenant.id, { is_active: !tenant.is_active });
      await fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Loading message="Loading tenants..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTenants} />;

  const columns = [
    {
      key: 'name',
      header: 'Name',
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
        <button
          onClick={() => handleToggleActive(tenant)}
          disabled={updating === tenant.id}
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            tenant.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          } disabled:opacity-50`}
        >
          {tenant.is_active ? 'Active' : 'Inactive'}
        </button>
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
      <Topbar title="Tenants" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <Link
            href="/saas/tenants/new"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Tenant
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={tenants}
            columns={columns}
            keyField="id"
            emptyMessage="No tenants found"
          />
        </div>
      </div>
    </div>
  );
}
