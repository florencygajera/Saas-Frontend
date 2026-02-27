'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { saasApi } from '@/lib/api';
import { Tenant } from '@/lib/types';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const tenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  plan: z.string().min(1, 'Plan is required'),
  admin_email: z.string().email('Valid email is required'),
  admin_password: z.string().min(6, 'Password must be at least 6 characters'),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface ProvisionResult {
  tenant: Tenant;
  admin_email: string;
  admin_password: string;
}

export default function NewTenantPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const onSubmit = async (data: TenantFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const tenant = await saasApi.createTenant(data);
      setResult({
        tenant,
        admin_email: data.admin_email,
        admin_password: data.admin_password,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div>
        <Topbar title="Tenant Provisioned" />
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Tenant Provisioned Successfully!</h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ⚠️ Save these credentials - they will not be shown again!
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant ID</label>
                  <p className="mt-1 text-lg font-mono bg-gray-100 p-2 rounded">{result.tenant.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                  <p className="mt-1 text-lg">{result.tenant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                  <p className="mt-1 text-lg">{result.admin_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                  <p className="mt-1 text-lg font-mono bg-gray-100 p-2 rounded">{result.admin_password}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <Link
                  href="/saas/tenants"
                  className="flex-1 text-center py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Back to Tenants
                </Link>
                <Link
                  href={`/saas/tenants/${result.tenant.id}`}
                  className="flex-1 text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  View Tenant Stats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Create New Tenant" />
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/saas/tenants"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tenants
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Provision New Tenant</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tenant Name</label>
                <input
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 border"
                  placeholder="My Business"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  {...register('slug')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 border"
                  placeholder="my-business"
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <select
                  {...register('plan')}
                  class1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500Name="mt- py-2 px-3 border"
                >
                  <option value="">Select a plan</option>
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                {errors.plan && <p className="mt-1 text-sm text-red-600">{errors.plan.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                <input
                  {...register('admin_email')}
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 border"
                  placeholder="admin@business.com"
                />
                {errors.admin_email && <p className="mt-1 text-sm text-red-600">{errors.admin_email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Password</label>
                <input
                  {...register('admin_password')}
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 border"
                  placeholder="••••••••"
                />
                {errors.admin_password && <p className="mt-1 text-sm text-red-600">{errors.admin_password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Provisioning...' : 'Provision Tenant'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
