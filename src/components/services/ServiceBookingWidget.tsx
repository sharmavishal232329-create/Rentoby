'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { formatCurrency, calculatePlatformFee } from '@/lib/utils';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ServiceProps {
  id: string;
  title: string;
  pricingType: string;
  hourlyRate: number | null;
  fixedRate: number | null;
  providerId: string;
}

export default function ServiceBookingWidget({ service }: { service: ServiceProps }) {
  const router = useRouter();
  const { user } = useAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [scheduledDate, setScheduledDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [durationHours, setDurationHours] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const duration = parseFloat(durationHours) || 1;
  const serviceFee =
    service.pricingType === 'HOURLY' && service.hourlyRate
      ? service.hourlyRate * duration
      : service.fixedRate || 500;

  const platformFee = calculatePlatformFee(serviceFee);
  const grandTotal = serviceFee + platformFee;

  const isProvider = user && user.id === service.providerId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      router.push(`/auth/login?redirect=/service/${service.id}`);
      return;
    }

    if (isProvider) {
      setError('You cannot book your own service.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/services/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          scheduledDate,
          scheduledTime,
          durationHours: duration,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit booking');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Booking error');
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
            {service.pricingType === 'HOURLY' && service.hourlyRate
              ? `${formatCurrency(service.hourlyRate)}`
              : service.fixedRate
              ? `${formatCurrency(service.fixedRate)}`
              : '₹500'}
          </span>
          <span className="text-xs text-slate-500 font-semibold ml-1">
            {service.pricingType === 'HOURLY' ? '/ hour' : 'fixed fee'}
          </span>
        </div>
      </div>

      {success ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-amber-950">Service Requested!</h3>
          <p className="text-xs text-amber-900 leading-relaxed">
            The provider has received your schedule request. Once accepted, you will receive a notification to verify payment.
          </p>
          <button
            onClick={() => router.push('/dashboard/renter')}
            className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl transition"
          >
            View in Dashboard
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Select Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Start Time
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>

            {service.pricingType === 'HOURLY' && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Estimated Hours
                </label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="4">4 hours (Half Day)</option>
                  <option value="8">8 hours (Full Day)</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
              Job Requirements / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Provide exact address and specific details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Service Estimate</span>
              <span className="font-semibold text-slate-900">{formatCurrency(serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Facilitation (5%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(platformFee)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
              <span>Total Estimated</span>
              <span className="text-base text-amber-600">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {isProvider ? (
            <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
              You provide this service
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Requesting...</span>
              ) : (
                <>
                  <span>Request Booking</span>
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
