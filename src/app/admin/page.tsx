'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Shield,
  Users,
  Layers,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  activeListings: number;
  totalListings: number;
  activeServices: number;
  totalBookings: number;
  completedBookings: number;
  totalGMV: number;
  totalPlatformRevenue: number;
  totalVerifiedPayments: number;
  openDisputes: number;
  pendingReports: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        if (res.status === 403) throw new Error('You do not have administrative privileges.');
        throw new Error('Failed to load admin analytics.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAdminData();
    }
  }, [authLoading, user]);

  const handleToggleVerify = async (userId: string) => {
    setActionInProgress(userId);
    try {
      await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_USER_VERIFY', targetId: userId }),
      });
      fetchAdminData();
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSetListingStatus = async (listingId: string, status: string) => {
    setActionInProgress(listingId);
    try {
      await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_LISTING_STATUS', targetId: listingId, value: status }),
      });
      fetchAdminData();
    } finally {
      setActionInProgress(null);
    }
  };

  if (authLoading || loading) {
    return <div className="p-16 text-center text-sm text-slate-500">Loading Admin Control Suite...</div>;
  }

  if (error || !user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          This panel is strictly restricted to platform administrators with verified credentials.
        </p>
        <Link
          href="/dashboard/renter"
          className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
        >
          Return to User Dashboard
        </Link>
      </div>
    );
  }

  const metrics: Metrics = data?.metrics || {
    totalUsers: 0,
    activeListings: 0,
    totalListings: 0,
    activeServices: 0,
    totalBookings: 0,
    completedBookings: 0,
    totalGMV: 0,
    totalPlatformRevenue: 0,
    totalVerifiedPayments: 0,
    openDisputes: 0,
    pendingReports: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">Rentoby Admin Control Center</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Live Database Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Admin operations, real marketplace financials, inventory moderation, and user verifications.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Authenticated as: <span className="font-bold text-white">{user.name}</span>
        </div>
      </div>

      {/* Real Data Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform GMV</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatCurrency(metrics.totalGMV)}
          </div>
          <p className="text-[10px] text-slate-500">Total gross value of all bookings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {formatCurrency(metrics.totalPlatformRevenue)}
          </div>
          <p className="text-[10px] text-slate-500">5% Facilitation fees earned</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalUsers}</div>
          <p className="text-[10px] text-slate-500">Renters, Owners, & Providers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Listings</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.activeListings}</div>
          <p className="text-[10px] text-slate-500">Rentals currently live in marketplace</p>
        </div>
      </div>

      {/* Recent Users Moderation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-600" />
          <span>User Management & Identity Verification</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Location</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Verification</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.recentUsers?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{u.city}</td>
                  <td className="p-3">{formatDate(u.createdAt)}</td>
                  <td className="p-3">
                    {u.isVerified ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Unverified</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleVerify(u.id)}
                      disabled={actionInProgress === u.id}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition"
                    >
                      {u.isVerified ? 'Revoke Badge' : 'Verify Member'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Listings Moderation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-slate-600" />
          <span>Listings Moderation</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3">Listing Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Daily Rate</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.recentListings?.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{l.title}</td>
                  <td className="p-3">{l.category?.name}</td>
                  <td className="p-3">{l.owner?.name}</td>
                  <td className="p-3 font-semibold text-slate-900">{formatCurrency(l.priceDaily)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.status === 'PAUSED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {l.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleSetListingStatus(l.id, 'PAUSED')}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg transition"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSetListingStatus(l.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition"
                      >
                        Approve / Activate
                      </button>
                    )}

                    <button
                      onClick={() => handleSetListingStatus(l.id, 'REMOVED')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
