"use client";

import { useEffect, useState } from "react";
import { saasApi } from "@/lib/api";
import { Tenant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TableCard } from "@/components/dashboard/table-card";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, Search, Building2, CheckCircle2, PauseCircle, Layers } from "lucide-react";
import { toast } from "sonner";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await saasApi.getTenants();
      setTenants(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleActive = async (tenant: Tenant) => {
    try {
      await saasApi.updateTenant(tenant.id, { is_active: !tenant.is_active });
      toast.success(`Tenant ${tenant.is_active ? "deactivated" : "activated"}`);
      await fetchTenants();
    } catch (err: any) {
      toast.error(err.message || "Failed to update tenant");
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeCount = tenants.filter((tenant) => tenant.is_active).length;
  const inactiveCount = Math.max(0, tenants.length - activeCount);
  const proPlanCount = tenants.filter((tenant) => tenant.plan === "pro" || tenant.plan === "enterprise").length;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Tenants"
        description="Manage platform tenants, plans, and activation status."
        action={
          <Button asChild>
          <Link href="/saas/tenants/new">
            <Plus className="mr-2 h-4 w-4" />
            New Tenant
          </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Tenants" value={tenants.length} trendPercent={100} trendLabel="current base" icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Active" value={activeCount} trendPercent={tenants.length ? (activeCount / tenants.length) * 100 : 0} trendLabel="activation rate" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard title="Pro / Enterprise" value={proPlanCount} trendPercent={tenants.length ? (proPlanCount / tenants.length) * 100 : 0} trendLabel="higher tiers" icon={<Layers className="h-5 w-5" />} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tenants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <TableCard title="Tenant Directory" description={`Active: ${activeCount}, Inactive: ${inactiveCount}`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Building2 className="h-8 w-8" />
                      <p>No tenants found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Link
                        href={`/saas/tenants/${tenant.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {tenant.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{tenant.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggleActive(tenant)}>
                        <Badge variant={tenant.is_active ? "success" : "destructive"}>
                          {tenant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString()}
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
