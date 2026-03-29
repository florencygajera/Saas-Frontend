"use client";

import { useCallback, useMemo, useState } from "react";
import { tenantApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TableCard } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileText, Search, Calendar, DollarSign, Users, TrendingUp, Filter, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { toast } from "sonner";

type ReportRow = {
  id: string;
  date: string;
  service: string;
  customer: string;
  amount: number;
  status: string;
};

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReportRows = useCallback(async () => {
    const [appointments, services, customers] = await Promise.all([
      tenantApi.getAppointments(),
      tenantApi.getServices(),
      tenantApi.getCustomers(),
    ]);

    const serviceMap = new Map(services.map((service) => [service.id, service]));
    const customerMap = new Map(customers.map((customer) => [customer.id, customer]));

    const rows: ReportRow[] = appointments.map((appointment) => ({
      id: appointment.id,
      date: appointment.start_at,
      service: serviceMap.get(appointment.service_id)?.name || "Unknown service",
      customer: customerMap.get(appointment.customer_id)?.name || appointment.customer_id,
      amount: serviceMap.get(appointment.service_id)?.price ?? 0,
      status: appointment.status,
    }));

    return rows;
  }, []);

  const { data, loading, error, refetch } = useApi(fetchReportRows);

  const filteredData = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((row) => {
      const matchesSearch =
        row.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.service.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const totalRevenue = filteredData.filter((row) => row.status === "completed").reduce((sum, row) => sum + row.amount, 0);
  const completedCount = filteredData.filter((row) => row.status === "completed").length;
  const completionRate = filteredData.length > 0 ? Math.round((completedCount / filteredData.length) * 100) : 0;

  const handleExportCSV = () => {
    const csvRows = [
      ["Date", "Service", "Customer", "Amount", "Status"],
      ...filteredData.map((row) => [new Date(row.date).toISOString(), row.service, row.customer, row.amount.toString(), row.status]),
    ];
    const csv = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reports.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Reports"
        description="Live appointments report data with filters and exports."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} />
        <StatCard title="Transactions" value={filteredData.length} icon={<TrendingUp className="h-6 w-6" />} />
        <StatCard title="Avg. Transaction" value={`$${filteredData.length > 0 ? Math.round(totalRevenue / Math.max(1, completedCount)) : 0}`} icon={<Calendar className="h-6 w-6" />} />
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<Users className="h-6 w-6" />} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TableCard title="Report Table" description="Filtered rows from appointments/services/customers APIs.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{row.service}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>${row.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "completed"
                          ? "success"
                          : row.status === "cancelled"
                            ? "destructive"
                            : "warning"
                      }
                    >
                      {row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableCard>
    </div>
  );
}

