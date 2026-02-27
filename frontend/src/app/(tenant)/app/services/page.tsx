'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/DataTable';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { tenantApi } from '@/lib/api';
import { Service } from '@/lib/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    is_active: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await tenantApi.updateService(editingService.id, formData);
      } else {
        await tenantApi.createService(formData);
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: 0, duration_minutes: 30, is_active: true });
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await tenantApi.deleteService(id);
      fetchServices();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service');
    }
  };

  if (loading) return <Loading message="Loading services..." />;
  if (error) return <ErrorState message={error} onRetry={fetchServices} />;

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'price',
      header: 'Price',
      render: (s: Service) => `$${s.price}`,
    },
    {
      key: 'duration_minutes',
      header: 'Duration',
      render: (s: Service) => `${s.duration_minutes} min`,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (s: Service) => (
        <span className={`px-2 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {s.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s: Service) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Services" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <button
            onClick={() => {
              setEditingService(null);
              setFormData({ name: '', description: '', price: 0, duration_minutes: 30, is_active: true });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Service
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={services}
            columns={columns}
            keyField="id"
            emptyMessage="No services found"
          />
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingService ? 'Edit Service' : 'New Service'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (min)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingService ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
