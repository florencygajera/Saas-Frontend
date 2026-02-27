'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookingApi, paymentApi } from '@/lib/api';
import { Booking, PaymentStartResponse } from '@/lib/types';
import { ArrowLeft, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';

type PaymentStep = 'summary' | 'processing' | 'otp' | 'success' | 'error';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<PaymentStep>('summary');
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await bookingApi.getMyBookings();
        const found = bookings.find(b => b.id === appointmentId);
        if (!found) {
          setError('Booking not found');
        } else if (found.payment_status === 'paid') {
          setError('This booking has already been paid');
        } else {
          setBooking(found);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [appointmentId]);

  const handleStartPayment = async () => {
    setStep('processing');
    setError(null);

    // Simulate processing delay (2-3 seconds as per workflow)
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const response = await paymentApi.startPayment(appointmentId);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to start payment');
      setStep('error');
    }
  };

  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;

    setProcessing(true);
    setError(null);

    try {
      const response = await paymentApi.verifyPayment(appointmentId, otp);
      if (response.success) {
        setStep('success');
      } else {
        setError(response.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Invalid OTP');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/book/my-bookings" className="text-primary-600 hover:underline">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Link href="/book/my-bookings" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Bookings
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Step 1: Summary */}
          {step === 'summary' && booking && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment</h1>
              
              <div className="border-b pb-4 mb-4">
                <h2 className="text-lg font-semibold">{booking.service_name}</h2>
                <p className="text-gray-600 text-sm">{booking.tenant_name}</p>
                <p className="text-gray-600 text-sm">
                  {new Date(booking.start_time).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">${booking.service_price}</span>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleStartPayment}
                className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay Now
              </button>
            </>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {/* Step 3: OTP */}
          {step === 'otp' && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h1>
              <p className="text-gray-600 mb-6">Please enter the 4-digit OTP sent to your registered mobile number.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyPayment}>
                <div className="mb-6">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg py-3 px-4 focus:border-primary-500 focus:outline-none"
                    maxLength={4}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing || otp.length < 4}
                  className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Pay'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">${booking?.service_price}</p>
              </div>

              <Link
                href="/book/my-bookings"
                className="block w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View My Bookings
              </Link>
            </div>
          )}

          {/* Error state */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('summary');
                    setError(null);
                  }}
                  className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Try Again
                </button>
                <Link
                  href="/book/my-bookings"
                  className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to My Bookings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
