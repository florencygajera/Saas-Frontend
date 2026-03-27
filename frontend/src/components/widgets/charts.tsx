"use client";

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, children, className, action }: ChartCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// Revenue Line Chart
interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
  className?: string;
}

export function RevenueLineChart({ data, className }: RevenueChartProps) {
  return (
    <ChartCard title="Revenue Trend" description="Monthly revenue over time" className={className}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Appointments Bar Chart
interface AppointmentsBarChartProps {
  data: Array<{ day: string; appointments: number }>;
  className?: string;
}

export function AppointmentsBarChart({ data, className }: AppointmentsBarChartProps) {
  return (
    <ChartCard title="Appointments" description="Appointments per day this week" className={className}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="day" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Bar dataKey="appointments" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// User Growth Area Chart
interface UserGrowthChartProps {
  data: Array<{ month: string; users: number }>;
  className?: string;
}

export function UserGrowthChart({ data, className }: UserGrowthChartProps) {
  return (
    <ChartCard title="User Growth" description="Cumulative user growth" className={className}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Retention Line Chart
interface RetentionChartProps {
  data: Array<{ week: string; retention: number }>;
  className?: string;
}

export function RetentionChart({ data, className }: RetentionChartProps) {
  return (
    <ChartCard title="User Retention" description="Weekly retention rate (%)" className={className}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
            <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`${value}%`, "Retention"]}
            />
            <Line type="monotone" dataKey="retention" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Status Distribution Pie Chart
interface StatusPieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  className?: string;
}

export function StatusPieChart({ data, className }: StatusPieChartProps) {
  return (
    <ChartCard title="Status Distribution" description="Breakdown by status" className={className}>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
