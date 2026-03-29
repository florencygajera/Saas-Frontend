"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookingApi } from "@/lib/api";
import { Booking } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TableCard } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Pencil, XCircle, CreditCard, Clock3, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const CANCELLABLE = new Set(["pending", "confirmed"]);

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [newStartAt, setNewStartAt] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id: string) => {
    try {
      await bookingApi.cancelBooking(id);
      toast.success("Booking cancelled.");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to cancel booking");
    }
  };

  const openReschedule = (booking: Booking) => {
    setRescheduleTarget(booking);
    setNewStartAt(new Date(booking.start_at).toISOString().slice(0, 16));
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget || !newStartAt) return;
    try {
      setSaving(true);
      await bookingApi.rescheduleBooking(rescheduleTarget.id, {
        start_at: new Date(newStartAt).toISOString(),
      });
      toast.success("Booking rescheduled.");
      setRescheduleTarget(null);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || "Failed to reschedule booking");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-destructive">{error}</p>
            <Button onClick={fetchBookings}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingCount = bookings.filter((booking) => new Date(booking.start_at) > new Date() && booking.status !== "cancelled").length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const cancellableCount = bookings.filter((booking) => CANCELLABLE.has(booking.status)).length;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="My Bookings"
        description="Review, edit, cancel, and pay for your active bookings."
        action={
          <Button asChild>
          <Link href="/book/home">Book New Service</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Upcoming" value={upcomingCount} trendPercent={bookings.length ? (upcomingCount / bookings.length) * 100 : 0} trendLabel="future bookings" icon={<Clock3 className="h-5 w-5" />} />
        <StatCard title="Completed" value={completedCount} trendPercent={bookings.length ? (completedCount / bookings.length) * 100 : 0} trendLabel="history share" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Cancellable" value={cancellableCount} trendPercent={bookings.length ? (cancellableCount / bookings.length) * 100 : 0} trendLabel="editable entries" icon={<Calendar className="h-5 w-5" />} />
      </div>

      <TableCard title="Booking List" description="Only bookings tied to your account are shown.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                      <p>No bookings yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{new Date(booking.start_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{booking.status.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {CANCELLABLE.has(booking.status) && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => openReschedule(booking)}>
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => cancelBooking(booking.id)}>
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Cancel
                            </Button>
                            <Button size="sm" asChild>
                              <Link href={`/pay/${booking.id}`}>
                                <CreditCard className="mr-1 h-3.5 w-3.5" />
                                Pay
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </TableCard>

      <Dialog open={!!rescheduleTarget} onOpenChange={() => setRescheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>Choose a new date and time for your booking.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newStartAt">New date & time</Label>
            <Input
              id="newStartAt"
              type="datetime-local"
              value={newStartAt}
              onChange={(e) => setNewStartAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={submitReschedule} disabled={saving || !newStartAt}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
