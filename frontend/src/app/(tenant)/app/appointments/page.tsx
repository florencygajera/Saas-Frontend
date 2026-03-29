"use client";

import { useEffect, useState } from "react";
import { tenantApi } from "@/lib/api";
import { Appointment, AppointmentStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
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
import { Calendar, RefreshCw, Clock3, CheckCircle2, XCircle } from "lucide-react";
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
  const pending = appointments.filter((appointment) => appointment.status === "pending").length;
  const completed = appointments.filter((appointment) => appointment.status === "completed").length;
  const cancelled = appointments.filter((appointment) => appointment.status === "cancelled").length;

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
      <SectionHeader
        title="Appointments"
        description="Manage upcoming appointments and status transitions."
        action={
          <Button variant="outline" onClick={fetchAppointments}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total" value={appointments.length} trendPercent={100} trendLabel="all appointments" icon={<Calendar className="h-5 w-5" />} />
        <StatCard title="Pending" value={pending} trendPercent={appointments.length ? (pending / appointments.length) * 100 : 0} trendLabel="awaiting action" icon={<Clock3 className="h-5 w-5" />} />
        <StatCard title="Completed" value={completed} trendPercent={appointments.length ? (completed / appointments.length) * 100 : 0} trendLabel="completion share" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Cancelled" value={cancelled} trendPercent={appointments.length ? -((cancelled / appointments.length) * 100) : 0} trendLabel="cancellation share" icon={<XCircle className="h-5 w-5" />} />
      </div>

      <TableCard title="Appointment Queue" description="Update statuses based on allowed flow transitions.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                      <p>No appointments found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>{new Date(apt.start_at).toLocaleString()}</TableCell>
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
      </TableCard>
    </div>
  );
}
