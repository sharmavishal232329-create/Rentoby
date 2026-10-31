'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { formatCurrency, calculateRentalTotals } from '@/lib/utils';
import {
  Calendar,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ListingProps {
  id: string;
  title: string;
  priceDaily: number;
  securityDeposit: number;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  deliveryFee: number | null;
  ownerId: string;
  bookedRanges?: { startDate: string; endDate: string }[];
}

export default function ListingBookingWidget({ listing }: { listing: ListingProps }) {
  const router = useRouter();
  const { user } = useAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStartDate = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const defaultEndDate = dayAfter.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [fulfillmentType, setFulfillmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  // Compute live totals
  const totals = calculateRentalTotals({
    priceDaily: listing.priceDaily,
    startDate,
    endDate,
    securityDeposit: listing.securityDeposit,
    fulfillmentType,
    deliveryFee: listing.deliveryFee || 0,
  });

  const isOwner = user && user.id === listing.ownerId;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push(`/auth/login?redirect=/listing/${listing.id}`);
      return;
    }

    if (isOwner) {
      setError('You cannot rent your own item.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          startDate,
          endDate,
          fulfillmentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request.');
      }

      setSuccessBookingId(data.booking.id);
    } catch (err: any) {
      setError(err.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl space-y-6 sticky top-24">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-5">
        <div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatCurrency(listing.priceDaily)}
          </span>
          <span className="text-xs text-slate-500 font-semibold ml-1">/ day</span>
        </div>

        {listing.securityDeposit > 0 ? (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            ₹{listing.securityDeposit} deposit
          </span>
        ) : (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            No Security Deposit
          </span>
        )}
      </div>

      {successBookingId ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-emerald-950">Rental Request Sent!</h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            The owner has received your request. Once they accept, you will receive a notification to verify payment and unlock pickup coordinates.
          </p>
          <button
            onClick={() => router.push('/dashboard/renter')}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
          >
            Go to Renter Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white text-xs font-semibold p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white text-xs font-semibold p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>
          </div>

          {/* Fulfillment Options */}
          <div className="space-y-2">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
              Fulfillment Method
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                className={`p-3 rounded-xl border text-left font-semibold transition ${
                  fulfillmentType === 'PICKUP'
                    ? 'border-brand-500 bg-brand-50/60 text-brand-900 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Self Pickup</span>
                <span className="block text-[10px] font-normal text-slate-500">Free</span>
              </button>

              {listing.deliveryAvailable ? (
                <button
                  type="button"
                  onClick={() => setFulfillmentType('DELIVERY')}
                  className={`p-3 rounded-xl border text-left font-semibold transition ${
                    fulfillmentType === 'DELIVERY'
                      ? 'border-brand-500 bg-brand-50/60 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-600" />
                    <span>Delivery</span>
                  </div>
                  <span className="block text-[10px] font-normal text-slate-500">
                    +₹{listing.deliveryFee || 0}
                  </span>
                </button>
              ) : (
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-left">
                  <span>Delivery</span>
                  <span className="block text-[10px]">Not offered</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Price Breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>
                {formatCurrency(listing.priceDaily)} × {totals.durationDays} day(s)
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(totals.itemTotal)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Platform Facilitation (5%)</span>
              </span>
              <span className="font-semibold text-slate-900">{formatCurrency(totals.platformFee)}</span>
            </div>

            {totals.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Delivery & Logistics</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totals.deliveryFee)}</span>
              </div>
            )}

            {totals.securityDeposit > 0 && (
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1 text-slate-500">
                  <span>Refundable Security Deposit</span>
                </span>
                <span className="font-semibold text-slate-900">{formatCurrency(totals.securityDeposit)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
              <span>Total Estimated</span>
              <span className="text-base text-brand-700">{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>

          {/* Escrow Badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Escrow Protected: Funds held safely until rental is inspected and complete.</span>
          </div>

          {/* Submit Action */}
          {isOwner ? (
            <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
              You are the owner of this listing
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-xl shadow-brand-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <span>Request to Rent</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>
      )}
    </div>
  );
}
