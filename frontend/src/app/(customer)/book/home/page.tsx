"use client";

import { useEffect, useState } from "react";
import { bookingApi } from "@/lib/api";
import { PublicService } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CustomerHome() {
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getPublicServices("");
      setServices(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Services</h1>
        <p className="text-muted-foreground">Browse and book services from our providers</p>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No services available at the moment.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
                <CardDescription>{service.tenant_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    ${service.price}
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/book/new?serviceId=${service.id}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
