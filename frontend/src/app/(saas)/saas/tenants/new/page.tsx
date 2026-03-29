"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saasApi } from "@/lib/api";
import { Tenant, TenantProvisionResult } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/dashboard/section-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";

const tenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  plan: z.string().min(1, "Plan is required"),
  admin_email: z.string().email("Valid email is required"),
  admin_password: z.string().min(6, "Password must be at least 6 characters"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface ProvisionResult {
  tenant: Tenant;
  admin_email: string;
  admin_password: string;
}

export default function NewTenantPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const onSubmit = async (data: TenantFormData) => {
    setLoading(true);
    try {
      const provision: TenantProvisionResult = await saasApi.createTenant(data);
      const tenant = provision.tenant || {
        id: provision.tenant_id || "unknown",
        name: data.name,
        plan: data.plan,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setResult({
        tenant,
        admin_email: provision.admin_email || data.admin_email,
        admin_password: provision.temp_password || data.admin_password,
      });
      toast.success("Tenant provisioned successfully!");
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Failed to create tenant"));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6 p-6">
        <SectionHeader
          title="Tenant Provisioned"
          description="Credentials generated successfully. Store them securely."
          action={
            <Button variant="outline" asChild>
              <Link href="/saas/tenants">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          }
        />
        <div className="mx-auto max-w-2xl">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Tenant Provisioned!</h2>
                <p className="text-muted-foreground mt-1">Save these credentials - they will not be shown again.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-6 text-left space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Tenant ID</p>
                  <p className="font-mono text-sm">{result.tenant.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Tenant Name</p>
                  <p className="text-sm">{result.tenant.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Admin Email</p>
                  <p className="text-sm">{result.admin_email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Admin Password</p>
                  <p className="font-mono text-sm">{result.admin_password}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/saas/tenants">Back to Tenants</Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href={`/saas/tenants/${result.tenant.id}`}>View Stats</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Provision New Tenant"
        description="Create a tenant and admin user in a single flow."
        action={
          <Button variant="outline" asChild>
            <Link href="/saas/tenants">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Provision New Tenant</CardTitle>
            <CardDescription>Create a new tenant with an admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label>Tenant Name</Label>
                <Input {...register("name")} placeholder="My Business" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input {...register("slug")} placeholder="my-business" />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select onValueChange={(val) => setValue("plan", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                {errors.plan && <p className="text-sm text-destructive">{errors.plan.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input {...register("admin_email")} type="email" placeholder="admin@business.com" />
                {errors.admin_email && <p className="text-sm text-destructive">{errors.admin_email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Admin Password</Label>
                <Input {...register("admin_password")} type="password" placeholder="••••••••" />
                {errors.admin_password && <p className="text-sm text-destructive">{errors.admin_password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Provisioning..." : "Provision Tenant"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

