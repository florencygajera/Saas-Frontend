'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/DataTable';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { tenantApi } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/lib/types';

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdating(appointmentId);
      await tenantApi.updateAppointmentStatus(appointmentId, newStatus);
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Loading message="Loading appointments..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAppointments} />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled'];
      case 'confirmed':
        return ['in_progress', 'cancelled'];
      case 'in_progress':
        return ['completed', 'cancelled'];
      default:
        return [];
    }
  };

  const columns = [
    {
      key: 'service_name',
      header: 'Service',
      render: (a: Appointment) => a.service_name || '-',
    },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (a: Appointment) => a.customer_name || '-',
    },
    {
      key: 'staff_name',
      header: 'Staff',
      render: (a: Appointment) => a.staff_name || '-',
    },
    {
      key: 'start_time',
      header: 'Date/Time',
      render: (a: Appointment) => new Date(a.start_time).toLocaleString(),
    },
    {
      key: 'total_price',
      header: 'Price',
      render: (a: Appointment) => `$${a.total_price}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (a: Appointment) => (
        <select
          value={a.status}
          onChange={(e) => handleStatusChange(a.id, e.target.value)}
          disabled={updating === a.id}
          className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(a.status)} disabled:opacity-50`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} disabled={!getNextStatuses(a.status).includes(status)}>
              {status.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="Appointments" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <button
            onClick={fetchAppointments}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={appointments}
            columns={columns}
            keyField="id"
            emptyMessage="No appointments found"
          />
        </div>
      </div>
    </div>
  );
}
