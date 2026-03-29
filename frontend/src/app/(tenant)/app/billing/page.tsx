"use client";

import { useCallback, useMemo, useState } from "react";
import { billingApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TableCard } from "@/components/dashboard/table-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Star, CreditCard, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";

export default function BillingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const fetchBillingData = useCallback(async () => {
    const [plans, subscription, invoices] = await Promise.all([
      billingApi.getPlans(),
      billingApi.getSubscription(),
      billingApi.getInvoices(),
    ]);
    return { plans, subscription, invoices };
  }, []);

  const { data, loading, error, refetch } = useApi(fetchBillingData);

  const currentSpend = useMemo(() => {
    if (!data?.subscription) return 0;
    return data.subscription.amount;
  }, [data?.subscription]);

  const handleUpgrade = async (planId: string) => {
    try {
      await billingApi.changePlan(planId, isYearly ? "yearly" : "monthly");
      toast.success("Subscription updated");
      await refetch();
    } catch {
      toast.error("Failed to update subscription");
    }
  };

  const manageSubscription = async () => {
    try {
      const result = await billingApi.openPortal();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[220px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <SectionHeader
        title="Billing"
        description="Manage subscription plans, invoices, and billing preferences."
        action={
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Current Plan" value={data?.subscription?.plan_name ?? "-"} trendPercent={isYearly ? 17 : 0} trendLabel="yearly savings" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Current Spend" value={`${data?.subscription?.currency ?? "$"} ${currentSpend}`} trendPercent={100} trendLabel={isYearly ? "billed yearly" : "billed monthly"} icon={<Star className="h-5 w-5" />} />
        <StatCard title="Paid Invoices" value={data?.invoices?.filter((invoice) => invoice.status === "paid").length ?? 0} trendPercent={100} trendLabel="historical payments" icon={<Download className="h-5 w-5" />} />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{data?.subscription?.plan_name ?? "No active plan"}</h3>
                <Badge>{data?.subscription?.status ?? "unknown"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {data?.subscription?.currency ?? "$"} {data?.subscription?.amount ?? 0}/{data?.subscription?.billing_cycle === "yearly" ? "year" : "month"}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={manageSubscription}>Manage Subscription</Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={cn(!isYearly && "font-semibold")}>Monthly</Label>
        <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-toggle" className={cn(isYearly && "font-semibold")}>
          Yearly
          <Badge variant="success" className="ml-2">Save 17%</Badge>
        </Label>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(data?.plans ?? []).map((plan) => {
          const isCurrent = data?.subscription?.plan_id === plan.id;
          const price = isYearly ? plan.price_yearly ?? plan.price_monthly * 12 : plan.price_monthly;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border bg-card text-card-foreground shadow-sm",
                plan.popular && "border-primary shadow-lg",
                isCurrent && "border-primary/30"
              )}
            >
              {plan.popular ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 px-3"><Star className="h-3 w-3" />Most Popular</Badge>
                </div>
              ) : null}
              <div className="space-y-4 p-6">
                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={isCurrent ? "outline" : "default"} disabled={isCurrent} onClick={() => handleUpgrade(plan.id)}>
                  {isCurrent ? "Current Plan" : `Switch to ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <TableCard
        title="Payment History"
        description="Recent billing transactions"
        action={
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.invoices ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No invoices yet.</TableCell>
              </TableRow>
            ) : (
              (data?.invoices ?? []).map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.description || "Invoice"}</TableCell>
                  <TableCell className="font-medium">{invoice.currency} {invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "paid" ? "success" : invoice.status === "failed" ? "destructive" : "warning"}>
                      {invoice.status}
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

