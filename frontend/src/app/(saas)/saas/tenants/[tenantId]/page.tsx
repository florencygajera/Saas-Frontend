"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { saasApi } from "@/lib/api";
import { TenantStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { TableCard } from "@/components/dashboard/table-card";
import { Heatmap7x24 } from "@/components/dashboard/heatmap-7x24";
import { ArrowLeft, Calendar, DollarSign, RefreshCw, XCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TenantStatsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await saasApi.getTenantStats(tenantId);
      setStats(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tenant stats");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalBookings = stats?.total_bookings ?? 0;
  const completedRate = totalBookings > 0 ? ((stats?.completed_count ?? 0) / totalBookings) * 100 : 0;
  const cancelledRate = totalBookings > 0 ? ((stats?.cancelled_count ?? 0) / totalBookings) * 100 : 0;
  const bookingTrendData = (stats?.heatmap_7x24 ?? []).map((row, index) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return { day: days[index], bookings: (row ?? []).reduce((sum, value) => sum + value, 0) };
  });
  const topServiceData = (stats?.top_services ?? []).slice(0, 6).map((service) => ({
    name: service.service_name,
    revenue: service.revenue,
  }));

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Tenant Statistics"
        description={`Detailed analytics for tenant #${tenantId.slice(0, 8)}.`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/saas/tenants">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} trendPercent={totalBookings ? (stats?.revenue ?? 0) / totalBookings : 0} trendLabel="avg / booking" icon={<DollarSign className="h-6 w-6" />} />
        <StatCard title="Total Bookings" value={stats?.total_bookings || 0} trendPercent={100 - cancelledRate} trendLabel="non-cancelled share" icon={<Calendar className="h-6 w-6" />} />
        <StatCard title="Completed" value={stats?.completed_count || 0} trendPercent={completedRate} trendLabel="completion rate" icon={<TrendingUp className="h-6 w-6" />} />
        <StatCard title="Cancelled" value={stats?.cancelled_count || 0} trendPercent={-cancelledRate} trendLabel="cancellation rate" icon={<XCircle className="h-6 w-6" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Weekly Booking Trend" description="Aggregated from tenant heatmap activity.">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Services by Revenue" description="Highest earning services for this tenant.">
          {topServiceData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServiceData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis type="number" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No service revenue data available.
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Peak Time Heatmap" description="7x24 booking intensity for this tenant.">
        <Heatmap7x24 values={stats?.heatmap_7x24 ?? []} />
      </ChartCard>

      {stats?.top_services && stats.top_services.length > 0 && (
        <TableCard title="Top Services Details" description="Bookings and revenue leaderboard.">
          <div className="space-y-2 p-4">
            {stats.top_services.map((svc) => (
              <div key={svc.service_id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{svc.service_name}</p>
                  <p className="text-xs text-muted-foreground">{svc.bookings} bookings</p>
                </div>
                <Badge variant="secondary">${svc.revenue.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </TableCard>
      )}
    </div>
  );
}
