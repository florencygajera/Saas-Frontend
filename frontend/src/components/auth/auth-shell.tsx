"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  sideTitle: string;
  sideDescription: string;
  sideFeatures?: string[];
  sideStats?: { label: string; description: string }[];
  backHref?: string;
  backLabel?: ReactNode;
  gradientClassName?: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  sideTitle,
  sideDescription,
  sideFeatures = [],
  sideStats = [],
  backHref,
  backLabel,
  gradientClassName,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="order-2 flex items-center justify-center p-6 lg:order-1 lg:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">SaaS Platform</span>
            </div>

            {backHref && backLabel ? (
              <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                {backLabel}
              </Link>
            ) : null}

            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
                {children}
              </CardContent>
            </Card>
          </div>
        </div>

        <div
          className={cn(
            "order-1 hidden overflow-hidden lg:order-2 lg:flex",
            "bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-600",
            gradientClassName
          )}
        >
          <div className="relative flex w-full items-center">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 mx-auto max-w-xl space-y-8 px-12">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">SaaS Platform</span>
              </div>

              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight text-white">{sideTitle}</h2>
                <p className="text-lg text-white/85">{sideDescription}</p>
              </div>

              {sideFeatures.length > 0 ? (
                <div className="space-y-3">
                  {sideFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-white/95">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {sideStats.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {sideStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
                      <p className="text-xl font-bold text-white">{stat.label}</p>
                      <p className="text-xs text-white/80">{stat.description}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
