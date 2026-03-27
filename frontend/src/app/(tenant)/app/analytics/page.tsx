"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/widgets/kpi-card";
import { RevenueLineChart, UserGrowthChart, RetentionChart, StatusPieChart } from "@/components/widgets/charts";
import { DollarSign, Users, TrendingUp, Repeat, Download } from "lucide-react";

const revenue7d = [
  { month: "Mon", revenue: 1200 },
  { month: "Tue", revenue: 1800 },
  { month: "Wed", revenue: 1400 },
  { month: "Thu", revenue: 2100 },
  { month: "Fri", revenue: 2800 },
  { month: "Sat", revenue: 3200 },
  { month: "Sun", revenue: 1900 },
];

const revenue30d = [
  { month: "W1", revenue: 8200 },
  { month: "W2", revenue: 9800 },
  { month: "W3", revenue: 11200 },
  { month: "W4", revenue: 12600 },
];

const revenue90d = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 38000 },
  { month: "Mar", revenue: 42000 },
];

const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 240 },
  { month: "Apr", users: 310 },
  { month: "May", users: 420 },
  { month: "Jun", users: 520 },
];

const retentionData = [
  { week: "W1", retention: 95 },
  { week: "W2", retention: 88 },
  { week: "W3", retention: 82 },
  { week: "W4", retention: 78 },
  { week: "W5", retention: 75 },
  { week: "W6", retention: 72 },
  { week: "W8", retention: 68 },
];

const statusData = [
  { name: "Completed", value: 145, color: "#10b981" },
  { name: "Confirmed", value: 42, color: "#6366f1" },
  { name: "Pending", value: 28, color: "#f59e0b" },
  { name: "Cancelled", value: 15, color: "#ef4444" },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const revenueData =
    timeRange === "7d" ? revenue7d : timeRange === "30d" ? revenue30d : revenue90d;

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Track your business performance and insights</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Time Range Tabs */}
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="7d">7 days</TabsTrigger>
          <TabsTrigger value="30d">30 days</TabsTrigger>
          <TabsTrigger value="90d">90 days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              change={12.5}
              changeLabel={`vs prev ${timeRange}`}
              icon={<DollarSign className="h-6 w-6" />}
            />
            <KpiCard
              title="Active Users"
              value="520"
              change={8.2}
              changeLabel="vs prev period"
              icon={<Users className="h-6 w-6" />}
            />
            <KpiCard
              title="Growth Rate"
              value="18.5%"
              change={3.1}
              changeLabel="vs prev period"
              icon={<TrendingUp className="h-6 w-6" />}
            />
            <KpiCard
              title="Retention"
              value="72%"
              change={-2.4}
              changeLabel="vs prev period"
              icon={<Repeat className="h-6 w-6" />}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-6 md:grid-cols-2">
            <RevenueLineChart
              data={revenueData.map((d) => ({ month: d.month, revenue: d.revenue }))}
            />
            <UserGrowthChart data={userGrowthData} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 md:grid-cols-2">
            <RetentionChart data={retentionData} />
            <StatusPieChart data={statusData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
