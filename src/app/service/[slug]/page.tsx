import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/utils';
import ServiceBookingWidget from '@/components/services/ServiceBookingWidget';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Briefcase,
  Star,
  MessageSquare,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default async function ServiceDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const service = await prisma.service.findFirst({
    where: {
      OR: [{ slug: params.slug }, { id: params.slug }],
      status: 'ACTIVE',
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
          author: { select: { name: true, avatarUrl: true, city: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!service) {
    notFound();
  }

  let images: string[] = [];
  try {
    images = JSON.parse(service.images);
  } catch (e) {
    images = [];
  }
  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'];
  }

  const ratings = service.reviews.map((r) => r.rating);
  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/services" className="hover:text-slate-900">
          Local Services
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{service.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Media & Service Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Banner */}
          <div className="relative h-[300px] sm:h-[420px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img src={images[0]} alt={service.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-amber-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
              {service.experienceYears} Years Verified Experience
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              {service.category.name}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {service.title}
            </h1>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="font-semibold">{service.serviceArea}</span>
              <span>·</span>
              <span>Based in {service.city} ({service.localArea})</span>
            </div>
          </div>

          {/* Provider Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-xl">
                {service.provider.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-base text-slate-900">{service.provider.name}</h4>
                  {service.provider.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-50" />
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Provider since {formatDate(service.provider.createdAt)}
                </p>
                {service.provider.bio && (
                  <p className="text-xs text-slate-600 mt-1 max-w-md">{service.provider.bio}</p>
                )}
              </div>
            </div>

            <Link
              href={`/dashboard/messages?newRecipient=${service.provider.id}&serviceId=${service.id}`}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </Link>
          </div>

          {/* Description */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Service Description & Scope</h2>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {service.description}
            </div>
          </div>

          {/* Availability & Hours */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Standard Availability Hours: </span>
              <span>{service.availability || 'Monday - Saturday: 8:00 AM - 7:00 PM'}</span>
            </div>
          </div>

          {/* Verified Customer Reviews */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Customer Reviews</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {service.reviews.length}
                </span>
              </h2>

              {avgRating && (
                <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{avgRating.toFixed(1)} / 5.0</span>
                </div>
              )}
            </div>

            {service.reviews.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No reviews yet for this service provider.
              </div>
            ) : (
              <div className="space-y-3">
                {service.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{rev.author.name}</span>
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

        {/* Right Sticky Sidebar: Service Booking Widget */}
        <div className="lg:col-span-1">
          <ServiceBookingWidget
            service={{
              id: service.id,
              title: service.title,
              pricingType: service.pricingType,
              hourlyRate: service.hourlyRate,
              fixedRate: service.fixedRate,
              providerId: service.provider.id,
            }}
          />
        </div>
      </div>
    </div>
  );
}
