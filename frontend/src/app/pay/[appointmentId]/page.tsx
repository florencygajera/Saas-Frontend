"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { bookingApi, paymentApi } from "@/lib/api";
import { Booking, PaymentVerifyResponse } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

type PaymentStep = "summary" | "processing" | "otp" | "success" | "error";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const appointmentId = params.appointmentId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<PaymentStep>("summary");
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentVerifyResponse | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (role !== "CUSTOMER") {
        router.push(role === "SUPER_ADMIN" ? "/saas/dashboard" : "/app/dashboard");
      }
    }
  }, [authLoading, user, role, router]);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user || role !== "CUSTOMER") return;
      try {
        const bookings = await bookingApi.getMyBookings();
        const found = bookings.find((b) => b.id === appointmentId);
        if (!found) {
          setError("Appointment not found for your account.");
        } else {
          setBooking(found);
        }
      } catch (error: unknown) {
        setError(getApiErrorMessage(error, "Failed to load appointment."));
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [appointmentId, user, role]);

  const startPayment = async () => {
    try {
      setStep("processing");
      setError(null);
      const response = await paymentApi.startPayment(appointmentId);
      setPaymentAmount(response.amount);
      setPaymentId(response.payment_id ?? response.id ?? null);
      setStep("otp");
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Failed to start payment."));
      setStep("error");
    }
  };

  const verifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    try {
      setProcessing(true);
      setError(null);
      if (!paymentId) {
        setError("Payment session not initialized. Please restart payment.");
        setProcessing(false);
        return;
      }
      const response = await paymentApi.verifyPayment(paymentId, otp);
      if (response.status === "paid") {
        setReceipt(response);
        setStep("success");
      } else {
        setError(response.message || "Payment verification failed.");
      }
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Invalid OTP."));
    } finally {
      setProcessing(false);
    }
  };

  if (loading || authLoading) {
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
      <SectionHeader
        title="Appointment Payment"
        description="Secure OTP payment verification flow."
        action={
          <Button variant="outline" asChild>
            <Link href="/book/my-bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Bookings
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Appointment" value={booking.id.slice(0, 8)} trendPercent={100} trendLabel="payment target" />
        <StatCard title="Current Step" value={step.toUpperCase()} trendPercent={step === "success" ? 100 : step === "otp" ? 75 : 25} trendLabel="flow status" />
        <StatCard title="Amount" value={paymentAmount ? `$${paymentAmount.toFixed(2)}` : "Pending"} trendPercent={paymentAmount ?? 0} trendLabel="after initialization" />
      </div>

      <Card className="max-w-xl rounded-2xl border-border/70 shadow-sm">
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
