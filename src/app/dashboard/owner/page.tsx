'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Layers,
  Eye,
  Trash2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

interface OwnerBooking {
  id: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  itemTotal: number;
  platformFee: number;
  grandTotal: number;
  status: string;
  fulfillmentType: string;
  listing: {
    id: string;
    title: string;
    slug: string;
    images: string;
  };
  renter: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface OwnerListing {
  id: string;
  title: string;
  slug: string;
  images: string;
  priceDaily: number;
  status: string;
  availabilityStatus: string;
  createdAt: string;
}

export default function OwnerDashboardPage() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, listingsRes] = await Promise.all([
        fetch('/api/bookings?role=owner'),
        fetch('/api/listings/my'),
      ]);

      const bData = await bookingsRes.json();
      setBookings(bData.bookings || []);

      if (listingsRes.ok) {
        const lData = await listingsRes.json();
        setListings(lData.listings || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingAction = async (bookingId: string, action: 'ACCEPT' | 'REJECT' | 'MARK_COMPLETED') => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating booking');
    } finally {
      setActionLoading(null);
    }
  };

  // Real database calculation: Total earnings from confirmed/completed rentals
  const totalEarned = bookings
    .filter((b) => ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(b.status))
    .reduce((sum, b) => sum + b.itemTotal, 0);

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const activeRentals = bookings.filter((b) => ['CONFIRMED', 'ACTIVE'].includes(b.status));

  return (
    <div className="space-y-8">
      {/* Earnings & Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(totalEarned)}</div>
          <p className="text-[11px] text-slate-500">Calculated directly from confirmed & completed bookings</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingRequests.length}</div>
          <p className="text-[11px] text-slate-500">Rentals requiring your approval</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rentals</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeRentals.length}</div>
          <p className="text-[11px] text-slate-500">Currently out on rental</p>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>Pending Rental Requests</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
            {pendingRequests.length}
          </span>
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No pending rental requests at this moment.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{b.listing.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-800">Renter: {b.renter.name}</span>
                    <span>·</span>
                    <span>
                      {formatDate(b.startDate)} to {formatDate(b.endDate)} ({b.durationDays} days)
                    </span>
                    <span>·</span>
                    <span className="font-bold text-slate-900">Earnings: {formatCurrency(b.itemTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookingAction(b.id, 'ACCEPT')}
                    disabled={actionLoading === b.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Rental</span>
                  </button>

                  <button
                    onClick={() => handleBookingAction(b.id, 'REJECT')}
                    disabled={actionLoading === b.id}
                    className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active & Confirmed Rentals */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-600" />
          <span>Active & Confirmed Rentals</span>
        </h3>

        {activeRentals.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No active rentals currently in progress.
          </div>
        ) : (
          <div className="space-y-3">
            {activeRentals.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                      {b.status}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{b.listing.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Renter: {b.renter.name}</span>
                    {b.renter.phone && <span>(Phone: {b.renter.phone})</span>}
                    <span>·</span>
                    <span>Dates: {formatDate(b.startDate)} - {formatDate(b.endDate)}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-900">Prorated Payout: {formatCurrency(b.itemTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookingAction(b.id, 'MARK_COMPLETED')}
                  disabled={actionLoading === b.id}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Mark Item Returned & Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
