'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import {
  Layers,
  PlusCircle,
  Wrench,
  MessageSquare,
  Heart,
  Shield,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-16 text-center text-sm text-slate-500">Loading your dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign in to Access Dashboard</h2>
        <p className="text-xs text-slate-500">
          Manage your rentals, item earnings, services, and neighborhood messages in one place.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition hover:bg-brand-500"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const tabs = [
    { label: 'Renter Hub', href: '/dashboard/renter', icon: Layers },
    { label: 'Owner & Earnings', href: '/dashboard/owner', icon: PlusCircle },
    { label: 'Service Provider Hub', href: '/dashboard/provider', icon: Wrench },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { label: 'Saved Items', href: '/dashboard/saved', icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* User Header Profile Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name}</h1>
              {user.isVerified && (
                <span title="Verified Marketplace Member">
                  <CheckCircle2 className="w-5 h-5 text-brand-600 fill-brand-50" />
                </span>
              )}
              {user.role === 'ADMIN' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user.localArea}, {user.city}
              </span>
              <span>·</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/listings/create"
            className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 transition"
          >
            + List an Item
          </Link>
          <Link
            href="/services/create"
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition"
          >
            + Offer a Service
          </Link>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Dashboard Viewport */}
      <div>{children}</div>
    </div>
  );
}
