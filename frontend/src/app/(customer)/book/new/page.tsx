"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingApi } from "@/lib/api";
import { PublicService } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ArrowLeft, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

function NewBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const serviceId = searchParams.get("serviceId");

  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const services = await bookingApi.getPublicServices(user?.tenant_id);
        setService(services.find((s) => s.id === serviceId) || null);
      } catch (error: unknown) {
        setError(getApiErrorMessage(error, "Failed to load service"));
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, user?.tenant_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !dateTime) return;

    try {
      setSubmitting(true);
      setError(null);
      await bookingApi.createBooking({
        service_id: service.id,
        start_at: new Date(dateTime).toISOString(),
        notes: notes.trim() || undefined,
      });
      toast.success("Booking created successfully.");
      router.push("/book/my-bookings");
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Failed to create booking"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="space-y-6 p-6">
        <Link href="/book/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Service not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="New Booking"
        description="Confirm schedule details before creating your booking."
        action={
          <Button variant="outline" asChild>
            <Link href="/book/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to services
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Service Price" value={`$${service.price}`} trendPercent={service.price} trendLabel="estimated amount" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="Duration" value={`${service.duration_min} min`} trendPercent={service.duration_min} trendLabel="slot length" icon={<Clock className="h-5 w-5" />} />
        <StatCard title="Status" value="Ready" trendPercent={100} trendLabel="booking setup" icon={<Clock className="h-5 w-5" />} />
      </div>

      <Card className="max-w-2xl rounded-2xl border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {service.duration_min} min
            </span>
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              ${service.price}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="datetime">Date & time</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any extra details for this booking"
                rows={4}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating booking..." : "Confirm booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <NewBookingContent />
    </Suspense>
  );
}

