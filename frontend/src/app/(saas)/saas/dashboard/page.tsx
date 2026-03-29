"use client";

import { useEffect, useState } from "react";
import { saasApi } from "@/lib/api";
import { PlatformStats, Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TableCard } from "@/components/dashboard/table-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Users, DollarSign, Calendar, RefreshCw, ArrowRight, LineChart as LineChartIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TopTenantRow = {
  tenant_id: string;
  tenant_name: string;
  revenue: number;
  bookings: number;
};

function buildSixMonthTrend(tenants: Tenant[], platformRevenue: number, activeTenants: number) {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.toLocaleString("default", { month: "short" })} ${String(d.getFullYear()).slice(-2)}`);
  }

  const createdByMonth = new Map<string, number>();
  for (const tenant of tenants) {
    const created = new Date(tenant.created_at);
    const key = `${created.toLocaleString("default", { month: "short" })} ${String(created.getFullYear()).slice(-2)}`;
    createdByMonth.set(key, (createdByMonth.get(key) ?? 0) + 1);
  }

  let cumulativeNew = Math.max(0, tenants.length - months.reduce((acc, m) => acc + (createdByMonth.get(m) ?? 0), 0));

  return months.map((month) => {
    const newTenants = createdByMonth.get(month) ?? 0;
    cumulativeNew += newTenants;
    const ratio = activeTenants > 0 ? Math.min(1, cumulativeNew / activeTenants) : 0;
    return {
      month,
      revenue: Math.round(platformRevenue * ratio),
      tenants: newTenants,
    };
  });
}

export default function SaaSDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [topTenantRows, setTopTenantRows] = useState<TopTenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, tenantsData] = await Promise.all([
        saasApi.getPlatformStats(),
        saasApi.getTenants(),
      ]);
      setStats(statsData);
      setTenants(tenantsData);

      const topRows = (statsData.top_tenants_by_revenue ?? []).slice(0, 6);
      const topWithBookings = await Promise.all(
        topRows.map(async (t) => {
          try {
            const tenantStats = await saasApi.getTenantStats(t.tenant_id);
            return {
              tenant_id: t.tenant_id,
              tenant_name: t.tenant_name,
              revenue: t.revenue,
              bookings: tenantStats.total_bookings ?? 0,
            };
          } catch {
            return {
              tenant_id: t.tenant_id,
              tenant_name: t.tenant_name,
              revenue: t.revenue,
              bookings: 0,
            };
          }
        })
      );
      setTopTenantRows(topWithBookings);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[320px] rounded-2xl" />
          <Skeleton className="h-[320px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const trendData = buildSixMonthTrend(tenants, stats?.platform_revenue ?? 0, stats?.active_tenants ?? 0);
  const activeRate = tenants.length > 0 ? ((stats?.active_tenants ?? 0) / tenants.length) * 100 : 0;
  const newTenantRate = (stats?.active_tenants ?? 0) > 0 ? ((stats?.new_tenants_last_30d ?? 0) / (stats?.active_tenants ?? 1)) * 100 : 0;
  const bookingsPerTenant = (stats?.active_tenants ?? 0) > 0 ? ((stats?.total_bookings ?? 0) / (stats?.active_tenants ?? 1)) : 0;
  const revenuePerBooking =
    (stats?.total_bookings ?? 0) > 0 ? ((stats?.platform_revenue ?? 0) / (stats?.total_bookings ?? 1)) : 0;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Platform Dashboard"
        description="Cross-tenant revenue, bookings, and growth performance."
        action={
          <Button variant="outline" onClick={fetchData} className="transition-colors">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Tenants"
          value={stats?.active_tenants || 0}
          trendPercent={activeRate}
          trendLabel="active ratio"
          icon={<Building2 className="h-6 w-6" />}
        />
        <StatCard
          title="New Tenants (30d)"
          value={stats?.new_tenants_last_30d || 0}
          trendPercent={newTenantRate}
          trendLabel="of active base"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          trendPercent={bookingsPerTenant}
          trendLabel="bookings/tenant"
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.platform_revenue || 0).toLocaleString()}`}
          trendPercent={revenuePerBooking}
          trendLabel="avg / booking"
          icon={<DollarSign className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Revenue Trend"
          description="Estimated month-over-month movement using active tenant growth."
          className="xl:col-span-2"
          action={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tenant Growth Snapshot" description="New tenants in each month of the same window.">
          <div className="space-y-2">
            {trendData.map((point) => (
              <div key={point.month} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
                <p className="text-sm font-medium">{point.month}</p>
                <Badge variant="secondary">{point.tenants} new</Badge>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <TableCard
        title="Top Tenants"
        description="Highest revenue tenants with booking volume context."
        action={
          <Button variant="ghost" size="sm" asChild>
            <Link href="/saas/tenants">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      >
        {topTenantRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Growth Signal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topTenantRows.map((tenant) => (
                <TableRow key={tenant.tenant_id}>
                  <TableCell>
                    <Link
                      href={`/saas/tenants/${tenant.tenant_id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {tenant.tenant_name}
                    </Link>{" "}
                    <span className="text-xs text-muted-foreground">#{tenant.tenant_id.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium">${tenant.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{tenant.bookings.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={tenant.bookings > 0 ? "success" : "secondary"}>
                      {tenant.bookings > 0 ? "Healthy" : "Needs traction"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-36 items-center justify-center px-6 text-sm text-muted-foreground">
            No tenant revenue data available yet.
          </div>
        )}
      </TableCard>
    </div>
  );
}
