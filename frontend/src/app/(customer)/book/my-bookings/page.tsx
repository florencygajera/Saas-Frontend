'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { DataTable } from '@/components/DataTable';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { bookingApi } from '@/lib/api';
import { Booking } from '@/lib/types';
import Link from 'next/link';
import { CreditCard, X } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.cancelBooking(id);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <Loading message="Loading bookings..." />;
  if (error) return <ErrorState message={error} onRetry={fetchBookings} />;

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

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (status: string) => {
    return status === 'pending' || status === 'confirmed';
  };

  const columns = [
    { key: 'service_name', header: 'Service' },
    { key: 'tenant_name', header: 'Business' },
    {
      key: 'start_time',
      header: 'Date/Time',
      render: (b: Booking) => new Date(b.start_time).toLocaleString(),
    },
    {
      key: 'service_price',
      header: 'Price',
      render: (b: Booking) => `$${b.service_price}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b: Booking) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(b.status)}`}>
          {b.status.replace('_', ' ').toUpperCase()}
        </span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (b: Booking) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(b.payment_status)}`}>
          {b.payment_status?.toUpperCase() || 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (b: Booking) => (
        <div className="flex space-x-2">
          {b.payment_status === 'pending' && b.status !== 'cancelled' && (
            <Link
              href={`/pay/${b.id}`}
              className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Pay
            </Link>
          )}
          {canCancel(b.status) && (
            <button
              onClick={() => handleCancel(b.id)}
              className="flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Topbar title="My Bookings" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <Link
            href="/book/home"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Book New
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={bookings}
            columns={columns}
            keyField="id"
            emptyMessage="No bookings found. Book a service to get started!"
          />
        </div>
      </div>
    </div>
  );
}
