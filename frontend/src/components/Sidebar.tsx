'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  Scissors, 
  UserCheck,
  UserCircle,
  BookOpen,
  Home,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'CUSTOMER';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const superAdminLinks = [
    { href: '/saas/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/saas/tenants', label: 'Tenants', icon: Building2 },
  ];

  const tenantAdminLinks = [
    { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/services', label: 'Services', icon: Scissors },
    { href: '/app/staff', label: 'Staff', icon: UserCheck },
    { href: '/app/customers', label: 'Customers', icon: Users },
    { href: '/app/appointments', label: 'Appointments', icon: Calendar },
  ];

  const customerLinks = [
    { href: '/book/home', label: 'Services', icon: BookOpen },
    { href: '/book/my-bookings', label: 'My Bookings', icon: Calendar },
  ];

  const links = role === 'SUPER_ADMIN' 
    ? superAdminLinks 
    : role === 'TENANT_ADMIN' 
      ? tenantAdminLinks 
      : customerLinks;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">
          {role === 'SUPER_ADMIN' ? 'SaaS Admin' : role === 'TENANT_ADMIN' ? 'Business Portal' : 'Booking'}
        </h1>
      </div>
      <nav className="mt-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
