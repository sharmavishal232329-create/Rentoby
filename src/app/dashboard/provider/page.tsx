'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  Phone,
  User,
} from 'lucide-react';

interface ServiceBookingItem {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  durationHours: number;
  serviceFee: number;
  platformFee: number;
  grandTotal: number;
  notes: string | null;
  status: string;
  service: {
    id: string;
    title: string;
    slug: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string;
  };
}

export default function ProviderDashboardPage() {
  const [bookings, setBookings] = useState<ServiceBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    fetch('/api/services/bookings?role=provider')
      .then((res) => res.json())
      .then((data) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (bookingId: string, action: 'ACCEPT' | 'REJECT' | 'MARK_COMPLETED') => {
    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/services/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const totalEarned = bookings
    .filter((b) => ['CONFIRMED', 'COMPLETED'].includes(b.status))
    .reduce((sum, b) => sum + b.serviceFee, 0);

  const pendingRequests = bookings.filter((b) => b.status === 'PENDING');
  const upcomingServices = bookings.filter((b) => ['ACCEPTED', 'CONFIRMED'].includes(b.status));

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Services Earnings</span>
          <div className="text-3xl font-black text-slate-900">{formatCurrency(totalEarned)}</div>
          <p className="text-[11px] text-slate-500">From confirmed & completed service appointments</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New Requests</span>
          <div className="text-3xl font-black text-slate-900">{pendingRequests.length}</div>
          <p className="text-[11px] text-slate-500">Awaiting your confirmation</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Jobs</span>
          <div className="text-3xl font-black text-slate-900">{upcomingServices.length}</div>
          <p className="text-[11px] text-slate-500">Accepted & scheduled appointments</p>
        </div>
      </div>

      {/* Pending Service Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>New Service Requests</span>
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No new service requests currently pending.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{b.service.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">Customer: {b.customer.name}</span>
                    <span>·</span>
                    <span>
                      {formatDate(b.scheduledDate)} at {b.scheduledTime}
                    </span>
                    <span>·</span>
                    <span className="font-bold text-slate-900">Fee: {formatCurrency(b.serviceFee)}</span>
                  </div>
                  {b.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-xl">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(b.id, 'ACCEPT')}
                    disabled={actionLoading === b.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Job</span>
                  </button>
                  <button
                    onClick={() => handleAction(b.id, 'REJECT')}
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

      {/* Upcoming & Confirmed Appointments */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" />
          <span>Scheduled Appointments</span>
        </h3>

        {upcomingServices.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
            No upcoming service appointments scheduled.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingServices.map((b) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                      {b.status}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{b.service.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Customer: {b.customer.name}</span>
                    {b.customer.phone && <span>(Phone: {b.customer.phone})</span>}
                    <span>·</span>
                    <span>Date: {formatDate(b.scheduledDate)} at {b.scheduledTime}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-900">Payout: {formatCurrency(b.serviceFee)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAction(b.id, 'MARK_COMPLETED')}
                  disabled={actionLoading === b.id}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Mark Service Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
