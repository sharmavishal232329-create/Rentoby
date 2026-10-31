import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import ListingBookingWidget from '@/components/listings/ListingBookingWidget';
import ListingDetailGallery from '@/components/listings/ListingDetailGallery';
import {
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  ChevronRight,
  Tractor,
  Star,
  Info,
  Lock,
  MessageSquare,
  Heart,
  Flag,
} from 'lucide-react';

export default async function ListingDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const listing = await prisma.listing.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: 'ACTIVE',
    },
    include: {
      category: {
        include: { parent: true },
      },
      owner: {
        select: {
          id: true,
          name: true,
          city: true,
          localArea: true,
          avatarUrl: true,
          bio: true,
          isVerified: true,
          createdAt: true,
        },
      },
      reviews: {
        include: {
          author: {
            select: { name: true, avatarUrl: true, city: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  let images: string[] = [];
  if (typeof listing.images === 'string') {
    try {
      const parsed = JSON.parse(listing.images);
      if (Array.isArray(parsed)) {
        images = parsed;
      } else if (typeof parsed === 'string') {
        images = [parsed];
      }
    } catch (e) {
      if (listing.images.trim()) {
        images = [listing.images.trim()];
      }
    }
  } else if (Array.isArray(listing.images)) {
    images = listing.images;
  }
  images = images.map((s) => String(s).trim()).filter(Boolean);

  let specs: Record<string, string> = {};
  if (listing.specs) {
    try {
      specs = JSON.parse(listing.specs);
    } catch (e) {
      specs = {};
    }
  }

  const ratings = listing.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
  const isAgri = listing.category.slug === 'agriculture' || listing.category.parent?.slug === 'agriculture';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/rentals" className="hover:text-slate-900">
          Rentals
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/rentals/${listing.category.slug}`} className="hover:text-slate-900 font-medium">
          {listing.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{listing.title}</span>
      </div>

      {/* Main Grid: Gallery & Details on Left, Booking Widget on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <ListingDetailGallery images={images} title={listing.title} />

          {/* Title & Key Attributes */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                {listing.category.name}
              </span>
              {listing.condition && (
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                  Condition: {listing.condition.replace('_', ' ')}
                </span>
              )}
              {isAgri && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <Tractor className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Farm Equipment</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {listing.title}
            </h1>

            {/* Approximate Location Protection Card */}
            <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">{listing.approxAddress}</span>
                <span className="text-slate-500"> ({listing.city})</span>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Exact residential address is strictly confidential until booking is confirmed.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Agriculture & Machine Technical Specs (if applicable) */}
          {Object.keys(specs).length > 0 && (
            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-4">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <Tractor className="w-4 h-4 text-emerald-700" />
                <span>Technical Specifications & Field Compatibility</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-slate-900 font-semibold text-xs mt-0.5 block">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">About this Item</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>

          {/* Rental Rules & Cancellation Policy */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Rental Rules & Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Owner Rental Rules</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {listing.rentalRules || 'Govt photo ID required at pickup. Return clean and in original working condition.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Cancellation Policy: {listing.cancellationPolicy}</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {listing.cancellationPolicy === 'FLEXIBLE'
                    ? 'Full refund of rental fee if cancelled up to 24 hours before the booking starts.'
                    : listing.cancellationPolicy === 'MODERATE'
                    ? 'Full refund up to 3 days before pickup; 50% refund thereafter.'
                    : 'Strict policy: 50% refund up to 7 days before pickup.'}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Listed By Verified Member
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                  {listing.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-base text-slate-900">{listing.owner.name}</h4>
                    {listing.owner.isVerified && (
                      <span title="Verified ID">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-50" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Member since {formatDate(listing.owner.createdAt)} · {listing.owner.city}
                  </p>
                  {listing.owner.bio && (
                    <p className="text-xs text-slate-600 mt-1 max-w-md">{listing.owner.bio}</p>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/messages?newRecipient=${listing.owner.id}&listingId=${listing.id}`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Owner</span>
              </Link>
            </div>
          </div>

          {/* Real Customer Reviews */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Verified Reviews</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {listing.reviews.length}
                </span>
              </h2>

              {avgRating && (
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{avgRating.toFixed(1)} out of 5</span>
                </div>
              )}
            </div>

            {listing.reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No reviews yet. Reviews can only be submitted after a verified rental is completed.
              </div>
            ) : (
              <div className="space-y-3">
                {listing.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center">
                          {rev.author.name.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-slate-900">{rev.author.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar: Interactive Booking Widget */}
        <div className="lg:col-span-1">
          <ListingBookingWidget
            listing={{
              id: listing.id,
              title: listing.title,
              priceDaily: listing.priceDaily,
              securityDeposit: listing.securityDeposit,
              pickupAvailable: listing.pickupAvailable,
              deliveryAvailable: listing.deliveryAvailable,
              deliveryFee: listing.deliveryFee,
              ownerId: listing.owner.id,
            }}
          />
        </div>
      </div>
    </div>
  );
}
