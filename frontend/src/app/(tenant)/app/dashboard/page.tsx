"use client";

import { useEffect, useState } from "react";
import { tenantApi } from "@/lib/api";
import { TenantAdminStats } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { KpiCard } from "@/components/widgets/kpi-card";
import { RevenueLineChart, AppointmentsBarChart } from "@/components/widgets/charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, DollarSign, Clock, ArrowRight, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 5100 },
  { month: "Mar", revenue: 4800 },
  { month: "Apr", revenue: 6200 },
  { month: "May", revenue: 5900 },
  { month: "Jun", revenue: 7100 },
  { month: "Jul", revenue: 6800 },
  { month: "Aug", revenue: 8200 },
  { month: "Sep", revenue: 7500 },
  { month: "Oct", revenue: 9100 },
  { month: "Nov", revenue: 8700 },
  { month: "Dec", revenue: 10200 },
];

const appointmentsData = [
  { day: "Mon", appointments: 12 },
  { day: "Tue", appointments: 18 },
  { day: "Wed", appointments: 15 },
  { day: "Thu", appointments: 22 },
  { day: "Fri", appointments: 28 },
  { day: "Sat", appointments: 35 },
  { day: "Sun", appointments: 8 },
];

const recentActivity = [
  { id: 1, action: "New booking", detail: "John Doe - Haircut", time: "2 min ago", type: "success" },
  { id: 2, action: "Payment received", detail: "$45.00 from Sarah M.", time: "15 min ago", type: "info" },
  { id: 3, action: "Appointment cancelled", detail: "Mike R. - Massage", time: "1 hour ago", type: "warning" },
  { id: 4, action: "New customer", detail: "Emily K. signed up", time: "2 hours ago", type: "success" },
  { id: 5, action: "Staff added", detail: "Alex T. joined the team", time: "3 hours ago", type: "info" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[140px] rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-[360px] rounded-2xl" />
      </div>
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
      setError(err.message || "Failed to load stats");
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
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-destructive text-4xl">⚠</div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchStats}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.tenant_name || "Business"}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/appointments">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          change={12}
          changeLabel="vs last month"
          icon={<Users className="h-6 w-6" />}
        />
        <KpiCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          change={8}
          changeLabel="vs last month"
          icon={<Calendar className="h-6 w-6" />}
        />
        <KpiCard
          title="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          change={15}
          changeLabel="vs last month"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KpiCard
          title="Pending Appointments"
          value={stats?.pending_appointments || 0}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueLineChart data={revenueData} />
        <AppointmentsBarChart data={appointmentsData} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest actions in your business</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/appointments">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div
                  className={`h-2 w-2 rounded-full ${
                    activity.type === "success"
                      ? "bg-emerald-500"
                      : activity.type === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Add Customer</p>
              <p className="text-xs text-muted-foreground">Create a new customer profile</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Schedule Appointment</p>
              <p className="text-xs text-muted-foreground">Book a new appointment</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">View Reports</p>
              <p className="text-xs text-muted-foreground">Check your business reports</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
