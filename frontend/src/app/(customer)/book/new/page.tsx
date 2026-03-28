'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Topbar } from '@/components/Topbar';
import { Loading } from '@/components/Loading';
import { bookingApi } from '@/lib/api';
import { PublicService } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Calendar, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function NewBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = searchParams.get('serviceId');
  
  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateTime, setDateTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId || !user?.tenant_id) {
        setLoading(false);
        return;
      }
      try {
        const services = await bookingApi.getPublicServices(user.tenant_id);
        const found = services.find(s => s.id === serviceId);
        setService(found || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [serviceId, user?.tenant_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !dateTime) return;

    setSubmitting(true);
    setError(null);

    try {
      await bookingApi.createBooking({
        service_id: service.id,
        start_at: new Date(dateTime).toISOString(),
        notes,
      });
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        router.push('/book/my-bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading service..." />;

  if (!service) {
    return (
      <div>
        <Topbar title="Book Service" />
        <div className="p-6">
          <Link href="/book/home" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-500">Service not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Book Service" />
      <div className="p-6">
        <Link href="/book/home" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{service.name}</h2>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {service.duration_min} min
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${service.price}
              </div>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3"
                  rows={3}
                  placeholder="Any special requests or notes..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
