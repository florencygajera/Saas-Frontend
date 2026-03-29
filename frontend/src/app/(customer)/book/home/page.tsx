"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { bookingApi } from "@/lib/api";
import { Booking, PublicService } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { TableCard } from "@/components/dashboard/table-card";
import { Calendar, Clock, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getApiErrorMessage } from "@/lib/api-error";

export default function CustomerHome() {
  const { user } = useAuth();
  const [services, setServices] = useState<PublicService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const monthlyHistory = useMemo(() => {
    const months: { month: string; bookings: number }[] = [];
    const current = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        bookings: 0,
      });
    }
    const indexMap = new Map(months.map((m, idx) => [m.month, idx]));
    for (const booking of bookings) {
      const label = new Date(booking.start_at).toLocaleString("default", { month: "short" });
      const idx = indexMap.get(label);
      if (idx !== undefined) {
        months[idx].bookings += 1;
      }
    }
    return months;
  }, [bookings]);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [serviceData, bookingData] = await Promise.all([
        bookingApi.getPublicServices(user?.tenant_id),
        bookingApi.getMyBookings(),
      ]);
      setServices(serviceData);
      setBookings(bookingData);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Failed to load dashboard");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user?.tenant_id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[260px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-[300px] rounded-2xl xl:col-span-2" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={fetchServices}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const serviceMap = new Map(services.map((service) => [service.id, service]));
  const now = new Date();
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );
  const upcoming = sortedBookings.filter((booking) => new Date(booking.start_at) >= now && booking.status !== "cancelled");
  const past = [...sortedBookings]
    .filter((booking) => new Date(booking.start_at) < now || booking.status === "cancelled")
    .reverse();
  const estimatedSpend = bookings.reduce((sum, booking) => sum + (serviceMap.get(booking.service_id)?.price ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Customer Dashboard"
        description="Track upcoming appointments, review history, and book services quickly."
        action={
          <Button asChild>
            <Link href="/book/new">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Bookings"
          value={upcoming.length}
          trendPercent={bookings.length > 0 ? (upcoming.length / bookings.length) * 100 : 0}
          trendLabel="of all bookings"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Past Bookings"
          value={past.length}
          trendPercent={bookings.length > 0 ? (past.length / bookings.length) * 100 : 0}
          trendLabel="history share"
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="Spending Summary"
          value={`$${estimatedSpend.toLocaleString()}`}
          trendPercent={bookings.length > 0 ? estimatedSpend / bookings.length : 0}
          trendLabel="avg / booking"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="Active Services"
          value={services.length}
          trendPercent={services.length > 0 ? 100 : 0}
          trendLabel="available now"
          icon={<Calendar className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Booking History" description="Monthly booking activity over the last 6 months." className="xl:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHistory}>
                <defs>
                  <linearGradient id="bookingHistoryArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <Tooltip
                  formatter={(value: number) => [`${value}`, "Bookings"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" fill="url(#bookingHistoryArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <TableCard title="Upcoming" description="Your next scheduled bookings.">
          {upcoming.length > 0 ? (
            <div className="space-y-2 p-4">
              {upcoming.slice(0, 5).map((booking) => (
                <div key={booking.id} className="rounded-xl border border-border/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{serviceMap.get(booking.service_id)?.name ?? "Service"}</p>
                    <Badge variant="secondary">{booking.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(booking.start_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
              No upcoming bookings. Book a service to get started.
            </div>
          )}
        </TableCard>
      </div>

      {past.length === 0 ? (
        <Card className="rounded-2xl border-border/70 p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No past bookings yet.</p>
        </Card>
      ) : (
        <TableCard title="Past Bookings" description="Recent completed or cancelled bookings.">
          <div className="space-y-2 p-4">
            {past.slice(0, 6).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{serviceMap.get(booking.service_id)?.name ?? "Service"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(booking.start_at).toLocaleString()}</p>
                </div>
                <Badge variant={booking.status === "cancelled" ? "destructive" : "secondary"}>
                  {booking.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </TableCard>
      )}

      {services.length === 0 ? (
        <Card className="rounded-2xl border-border/70 p-12 text-center shadow-sm">
          <p className="text-muted-foreground">No services available at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration_min} min
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    ${service.price}
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/book/new?serviceId=${service.id}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

