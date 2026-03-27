"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { saasApi } from "@/lib/api";
import { TenantStats } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/widgets/kpi-card";
import { ArrowLeft, Users, Calendar, DollarSign, Scissors, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function TenantStatsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await saasApi.getTenantStats(tenantId);
      setStats(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tenant stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tenantId]);

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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/saas/tenants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenant Statistics</h1>
          <p className="text-muted-foreground">Detailed analytics for this tenant</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Customers" value={stats?.total_customers || 0} icon={<Users className="h-6 w-6" />} />
        <KpiCard title="Bookings" value={stats?.total_bookings || 0} icon={<Calendar className="h-6 w-6" />} />
        <KpiCard title="Revenue" value={`$${(stats?.total_revenue || 0).toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} />
        <KpiCard title="Active Services" value={stats?.active_services || 0} icon={<Scissors className="h-6 w-6" />} />
        <KpiCard title="Active Staff" value={stats?.active_staff || 0} icon={<Users className="h-6 w-6" />} />
      </div>

      {stats?.bookings_by_status && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Bookings by Status</CardTitle>
            <CardDescription>Distribution of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {Object.entries(stats.bookings_by_status).map(([status, count]) => (
                <div key={status} className="rounded-2xl bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground capitalize">{status.replace("_", " ")}</p>
                  <p className="mt-1 text-2xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
