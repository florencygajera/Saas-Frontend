"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  Scissors,
  UserCheck,
  UserCircle,
  BookOpen,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "CUSTOMER";
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, collapsed = false, onToggle }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const superAdminGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/saas/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Management",
      items: [
        { href: "/saas/tenants", label: "Tenants", icon: Building2 },
      ],
    },
  ];

  const tenantAdminGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Workspace",
      items: [
        { href: "/app/services", label: "Services", icon: Scissors },
        { href: "/app/staff", label: "Staff", icon: UserCheck },
        { href: "/app/customers", label: "Customers", icon: Users },
        { href: "/app/appointments", label: "Appointments", icon: Calendar },
      ],
    },
    {
      label: "Insights",
      items: [
        { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/app/billing", label: "Billing", icon: CreditCard },
        { href: "/app/reports", label: "Reports", icon: FileText },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/app/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const customerGroups: NavGroup[] = [
    {
      label: "Browse",
      items: [
        { href: "/book/home", label: "Services", icon: BookOpen },
        { href: "/book/my-bookings", label: "My Bookings", icon: Calendar },
      ],
    },
  ];

  const groups =
    role === "SUPER_ADMIN"
      ? superAdminGroups
      : role === "TENANT_ADMIN"
        ? tenantAdminGroups
        : customerGroups;

  const brandName =
    role === "SUPER_ADMIN"
      ? "SaaS Admin"
      : role === "TENANT_ADMIN"
        ? "Business Portal"
        : "Booking";

  const brandInitial = brandName.charAt(0).toUpperCase();

  const isActive = (href: string) => pathname === href;

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const link = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
          active
            ? "bg-primary/10 text-primary dark:bg-primary/20"
            : "text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return link;
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-16 items-center border-b px-4", collapsed && "justify-center px-2")}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">{brandName}</span>
              <span className="text-xs text-muted-foreground">
                {role === "SUPER_ADMIN" ? "Platform" : role === "TENANT_ADMIN" ? "Business" : "Customer"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              {collapsed && group.label !== groups[0].label && (
                <Separator className="my-2" />
              )}
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <NavItemComponent item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <div className={cn("flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {role.replace("_", " ").toLowerCase()}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn("mt-1 w-full justify-start text-muted-foreground hover:text-destructive", collapsed && "justify-center")}
          onClick={logout}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Sign out"}
        </Button>
      </div>

      {/* Collapse toggle */}
      {onToggle && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-20 -right-4 hidden h-8 w-8 rounded-full border bg-card shadow-md md:flex"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </aside>
  );
};
