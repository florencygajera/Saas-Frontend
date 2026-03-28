"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tenantApi } from "@/lib/api";
import { TenantAdminStats } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { KpiCard } from "@/components/widgets/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, Users, XCircle, RefreshCw, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-[260px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  );
}

export default function TenantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TenantAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to load tenant stats");
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
        <Card className="w-full max-w-md">
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tenantTitle} Dashboard</h1>
          <p className="text-muted-foreground">Live metrics for your tenant workspace.</p>
        </div>
        <Button variant="outline" onClick={fetchStats}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Bookings" value={stats?.total_bookings || 0} icon={<Calendar className="h-6 w-6" />} />
        <KpiCard title="Revenue" value={`$${(stats?.revenue || 0).toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} />
        <KpiCard title="Completed" value={stats?.completed_count || 0} icon={<Users className="h-6 w-6" />} />
        <KpiCard title="Cancelled" value={stats?.cancelled_count || 0} icon={<XCircle className="h-6 w-6" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Top Services</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/services">
              Manage services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.top_services?.length ? (
            <div className="space-y-3">
              {stats.top_services.map((service) => (
                <div key={service.service_id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-medium">{service.service_name}</p>
                    <p className="text-xs text-muted-foreground">{service.bookings} bookings</p>
                  </div>
                  <p className="font-semibold">${service.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No service performance data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
