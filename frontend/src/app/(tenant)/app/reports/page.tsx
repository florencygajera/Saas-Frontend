"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { KpiCard } from "@/components/widgets/kpi-card";
import { Download, FileText, Search, Calendar, DollarSign, Users, TrendingUp, Filter } from "lucide-react";
import { toast } from "sonner";

const reportData = [
  { id: "1", date: "2026-03-25", service: "Haircut", customer: "John Doe", amount: 45, status: "completed" },
  { id: "2", date: "2026-03-25", service: "Massage", customer: "Sarah M.", amount: 80, status: "completed" },
  { id: "3", date: "2026-03-24", service: "Facial", customer: "Mike R.", amount: 60, status: "completed" },
  { id: "4", date: "2026-03-24", service: "Haircut", customer: "Emily K.", amount: 45, status: "cancelled" },
  { id: "5", date: "2026-03-23", service: "Manicure", customer: "Lisa P.", amount: 35, status: "completed" },
  { id: "6", date: "2026-03-23", service: "Massage", customer: "Tom W.", amount: 80, status: "completed" },
  { id: "7", date: "2026-03-22", service: "Haircut", customer: "Anna B.", amount: 45, status: "completed" },
  { id: "8", date: "2026-03-22", service: "Facial", customer: "Chris D.", amount: 60, status: "refunded" },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = reportData.filter((row) => {
    const matchesSearch =
      row.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filteredData
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const handleExportCSV = () => {
    toast.success("CSV export started");
  };

  const handleExportPDF = () => {
    toast.success("PDF export started");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">View and export your business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <KpiCard
          title="Transactions"
          value={filteredData.length}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <KpiCard
          title="Avg. Transaction"
          value={`$${filteredData.length > 0 ? Math.round(totalRevenue / filteredData.filter((r) => r.status === "completed").length) : 0}`}
          icon={<Calendar className="h-6 w-6" />}
        />
        <KpiCard
          title="Completion Rate"
          value={`${Math.round((filteredData.filter((r) => r.status === "completed").length / filteredData.length) * 100)}%`}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Filters */}
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
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
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
                    <TableCell>${row.amount}.00</TableCell>
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
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
