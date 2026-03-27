"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  UserCheck,
  BarChart3,
  CreditCard,
  FileText,
  Settings,
  Building2,
  BookOpen,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/lib/AuthContext";

interface CommandItemData {
  label: string;
  href: string;
  icon: React.ElementType;
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const tenantCommands: CommandItemData[] = [
    { label: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard, group: "Navigation" },
    { label: "Services", href: "/app/services", icon: Scissors, group: "Navigation" },
    { label: "Staff", href: "/app/staff", icon: UserCheck, group: "Navigation" },
    { label: "Customers", href: "/app/customers", icon: Users, group: "Navigation" },
    { label: "Appointments", href: "/app/appointments", icon: Calendar, group: "Navigation" },
    { label: "Analytics", href: "/app/analytics", icon: BarChart3, group: "Insights" },
    { label: "Billing", href: "/app/billing", icon: CreditCard, group: "Insights" },
    { label: "Reports", href: "/app/reports", icon: FileText, group: "Insights" },
    { label: "Settings", href: "/app/settings", icon: Settings, group: "Account" },
  ];

  const adminCommands: CommandItemData[] = [
    { label: "Dashboard", href: "/saas/dashboard", icon: LayoutDashboard, group: "Navigation" },
    { label: "Tenants", href: "/saas/tenants", icon: Building2, group: "Navigation" },
  ];

  const customerCommands: CommandItemData[] = [
    { label: "Services", href: "/book/home", icon: BookOpen, group: "Navigation" },
    { label: "My Bookings", href: "/book/my-bookings", icon: Calendar, group: "Navigation" },
  ];

  const commands =
    user?.role === "SUPER_ADMIN"
      ? adminCommands
      : user?.role === "TENANT_ADMIN"
        ? tenantCommands
        : customerCommands;

  const groupedCommands = commands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItemData[]>
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedCommands).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
