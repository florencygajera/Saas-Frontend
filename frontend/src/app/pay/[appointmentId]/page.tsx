"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { bookingApi, paymentApi } from "@/lib/api";
import { Booking, PaymentVerifyResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

type PaymentStep = "summary" | "processing" | "otp" | "success" | "error";

export default function PaymentPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<PaymentStep>("summary");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<PaymentVerifyResponse | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookings = await bookingApi.getMyBookings();
        const found = bookings.find((b) => b.id === appointmentId);
        if (!found) {
          setError("Appointment not found for your account.");
        } else {
          setBooking(found);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Failed to load appointment.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [appointmentId]);

  const startPayment = async () => {
    try {
      setStep("processing");
      setError(null);
      const response = await paymentApi.startPayment(appointmentId);
      setPaymentAmount(response.amount);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to start payment.");
      setStep("error");
    }
  };

  const verifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    try {
      setProcessing(true);
      setError(null);
      const response = await paymentApi.verifyPayment(appointmentId, otp);
      if (response.status === "paid") {
        setReceipt(response);
        setStep("success");
      } else {
        setError(response.message || "Payment verification failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Invalid OTP.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-6 w-[220px]" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-destructive">{error || "Booking not found."}</p>
            <Button asChild>
              <Link href="/book/my-bookings">Back to My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Link href="/book/my-bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to My Bookings
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Appointment Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "summary" && (
            <>
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Appointment ID</p>
                <p className="font-mono text-sm">{booking.id}</p>
                <Separator />
                <p className="text-sm text-muted-foreground">Scheduled at</p>
                <p>{new Date(booking.start_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Amount is finalized after payment initialization.
                </p>
              </div>
              <Button className="w-full" onClick={startPayment}>
                Pay Now
              </Button>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="font-medium">Processing payment start...</p>
              <p className="text-sm text-muted-foreground">Please wait. Do not close this page.</p>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={verifyPayment} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Payment started for <strong>${(paymentAmount || 0).toFixed(2)}</strong>. Enter OTP to verify.
                </p>
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter OTP"
                  inputMode="numeric"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={processing || otp.length < 4}>
                {processing ? "Verifying..." : "Verify Payment"}
              </Button>
            </form>
          )}

          {step === "success" && receipt && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Payment successful</p>
              </div>
              <div className="space-y-2 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono">{receipt.payment_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{receipt.currency} {receipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paid at</span>
                  <span>{new Date(receipt.paid_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="capitalize">{receipt.status}</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href="/book/my-bookings">View My Bookings</Link>
              </Button>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-destructive">{error || "Payment failed."}</p>
              <Button
                className="w-full"
                onClick={() => {
                  setStep("summary");
                  setError(null);
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
