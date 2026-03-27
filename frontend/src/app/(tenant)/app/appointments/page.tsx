"use client";

import { useEffect, useState } from "react";
import { tenantApi } from "@/lib/api";
import { Appointment, AppointmentStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const STATUS_OPTIONS: AppointmentStatus[] = ["pending", "confirmed", "in_progress", "completed", "cancelled"];

const statusVariant: Record<string, "warning" | "default" | "secondary" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "default",
  in_progress: "secondary",
  completed: "success",
  cancelled: "destructive",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await tenantApi.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdating(appointmentId);
      await tenantApi.updateAppointmentStatus(appointmentId, newStatus);
      toast.success("Status updated");
      await fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "pending":
        return ["confirmed", "cancelled"];
      case "confirmed":
        return ["in_progress", "cancelled"];
      case "in_progress":
        return ["completed", "cancelled"];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage your appointments and bookings</p>
        </div>
        <Button variant="outline" onClick={fetchAppointments}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                      <p>No appointments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.service_name || "-"}</TableCell>
                    <TableCell>{apt.customer_name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{apt.staff_name || "-"}</TableCell>
                    <TableCell>{new Date(apt.start_time).toLocaleString()}</TableCell>
                    <TableCell>${apt.total_price}</TableCell>
                    <TableCell>
                      <Select
                        value={apt.status}
                        onValueChange={(val) => handleStatusChange(apt.id, val)}
                        disabled={updating === apt.id || getNextStatuses(apt.status).length === 0}
                      >
                        <SelectTrigger className="h-8 w-[140px] border-0 bg-transparent p-0">
                          <Badge variant={statusVariant[apt.status] || "secondary"}>
                            {apt.status.replace("_", " ")}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              disabled={!getNextStatuses(apt.status).includes(status) && status !== apt.status}
                            >
                              {status.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
