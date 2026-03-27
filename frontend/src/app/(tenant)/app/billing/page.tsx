"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Star, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: { monthly: 29, yearly: 290 },
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 100 appointments/month",
      "5 staff members",
      "Basic analytics",
      "Email support",
      "Customer management",
    ],
    current: false,
    popular: false,
  },
  {
    name: "Professional",
    price: { monthly: 79, yearly: 790 },
    description: "Best for growing businesses",
    features: [
      "Unlimited appointments",
      "25 staff members",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "API access",
      "Reports & exports",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 199, yearly: 1990 },
    description: "For large organizations",
    features: [
      "Everything in Professional",
      "Unlimited staff",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "White-label solution",
      "Advanced security",
    ],
    current: false,
    popular: false,
  },
];

const paymentHistory = [
  { id: "1", date: "2026-03-01", amount: 79, status: "paid", description: "Professional Plan - Monthly" },
  { id: "2", date: "2026-02-01", amount: 79, status: "paid", description: "Professional Plan - Monthly" },
  { id: "3", date: "2026-01-01", amount: 79, status: "paid", description: "Professional Plan - Monthly" },
  { id: "4", date: "2025-12-01", amount: 79, status: "paid", description: "Professional Plan - Monthly" },
  { id: "5", date: "2025-11-01", amount: 29, status: "paid", description: "Starter Plan - Monthly" },
];

export default function BillingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgrade = (planName: string) => {
    toast.info(`Upgrade to ${planName} - Coming soon!`);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Professional Plan</h3>
                <Badge>Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground">$79/month &middot; Renews on April 1, 2026</p>
            </div>
          </div>
          <Button variant="outline">Manage Subscription</Button>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="billing-toggle" className={cn(!isYearly && "font-semibold")}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
        <Label htmlFor="billing-toggle" className={cn(isYearly && "font-semibold")}>
          Yearly
          <Badge variant="success" className="ml-2">
            Save 17%
          </Badge>
        </Label>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative transition-shadow",
              plan.popular && "border-primary shadow-lg scale-[1.02]",
              plan.current && "border-primary/30"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1 px-3">
                  <Star className="h-3 w-3" />
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  ${isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                disabled={plan.current}
                onClick={() => handleUpgrade(plan.name)}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Payment History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {paymentHistory.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.description}</TableCell>
                  <TableCell className="font-medium">${payment.amount}.00</TableCell>
                  <TableCell>
                    <Badge variant="success">Paid</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
