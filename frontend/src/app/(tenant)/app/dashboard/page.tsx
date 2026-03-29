"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { tenantApi } from "@/lib/api";
import { TenantAdminStats } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Heatmap7x24 } from "@/components/dashboard/heatmap-7x24";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getApiErrorMessage } from "@/lib/api-error";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-[260px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  );
}

export default function TenantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TenantAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingTrendData = useMemo(() => {
    const heatmap = stats?.heatmap_7x24 ?? [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => {
      const sum = (heatmap[index] ?? []).reduce((acc, value) => acc + value, 0);
      return { day, bookings: sum };
    });
  }, [stats?.heatmap_7x24]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getStats();
      setStats(data);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Failed to load tenant stats"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[420px]">
        <Card className="w-full max-w-md rounded-2xl border-border/70 shadow-sm">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantTitle = user?.tenant_name || user?.tenant_id || "Tenant";
  const totalBookings = stats?.total_bookings ?? 0;
  const completedRate = totalBookings > 0 ? ((stats?.completed_count ?? 0) / totalBookings) * 100 : 0;
  const cancelledRate = totalBookings > 0 ? ((stats?.cancelled_count ?? 0) / totalBookings) * 100 : 0;
  const revenuePerBooking = totalBookings > 0 ? (stats?.revenue ?? 0) / totalBookings : 0;

  const topServicesData = (stats?.top_services ?? []).slice(0, 6).map((service) => ({
    name: service.service_name,
    bookings: service.bookings,
  }));

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title={`${tenantTitle} Dashboard`}
        description="Revenue, bookings, and service performance in one view."
        action={
          <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue"
          value={`$${(stats?.revenue || 0).toLocaleString()}`}
          trendPercent={revenuePerBooking}
          trendLabel="avg / booking"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="Bookings"
          value={stats?.total_bookings || 0}
          trendPercent={100 - cancelledRate}
          trendLabel="non-cancelled share"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Completed"
          value={stats?.completed_count || 0}
          trendPercent={completedRate}
          trendLabel="completion rate"
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <StatCard
          title="Cancelled"
          value={stats?.cancelled_count || 0}
          trendPercent={-cancelledRate}
          trendLabel="cancellation rate"
          icon={<XCircle className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Booking Trend" description="Daily activity derived from your weekly booking heatmap.">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <Tooltip
                  formatter={(value: number) => [`${value}`, "Bookings"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Top Services"
          description="Most-booked services in your tenant workspace."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/services">
                Manage services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {topServicesData.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis type="number" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Bookings"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              No service performance data yet.
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Peak Time Heatmap" description="7x24 booking intensity to spot demand hotspots.">
        <Heatmap7x24 values={stats?.heatmap_7x24 ?? []} />
      </ChartCard>
    </div>
  );
}

