'use client';

import { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { bookingApi } from '@/lib/api';
import { PublicService } from '@/lib/types';
import Link from 'next/link';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export default function CustomerHome() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getPublicServices();
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

  if (loading) return <Loading message="Loading services..." />;
  if (error) return <ErrorState message={error} onRetry={fetchServices} />;

  return (
    <div>
      <Topbar title="Available Services" />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Services</h1>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No services available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.tenant_name}</p>
                  </div>
                </div>
                
                {service.description && (
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration_minutes} min
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${service.price}
                  </div>
                </div>

                <Link
                  href={`/book/new?serviceId=${service.id}`}
                  className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
