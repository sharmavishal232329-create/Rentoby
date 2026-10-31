'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocation } from '@/components/context/LocationContext';
import LocationSelectorModal from '@/components/location/LocationSelectorModal';
import { formatCurrency } from '@/lib/utils';
import {
  Briefcase,
  Search,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string;
  hourlyRate: number | null;
  fixedRate: number | null;
  pricingType: string;
  experienceYears: number;
  serviceArea: string;
  city: string;
  localArea: string;
  availability: string | null;
  category: { id: string; name: string; slug: string };
  provider: { id: string; name: string; isVerified: boolean; localArea: string; city: string };
  avgRating: number | null;
  reviewCount: number;
}

export default function ServicesPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading services...</div>}>
      <ServicesView />
    </React.Suspense>
  );
}

function ServicesView() {
  const searchParams = useSearchParams();
  const { location } = useLocation();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchServices = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location.city && location.city !== 'All') params.set('city', location.city);
    if (selectedCategory) params.set('category', selectedCategory);

    fetch(`/api/services?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>Hyperlocal Local Services</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Book Trusted Local Services
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hire skilled equipment operators, photographers, cleaners, and technicians right in your area.
          </p>
        </div>

        <Link
          href="/services/create"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <span>+ Offer a Service</span>
        </Link>
      </div>

      {/* Search Header Bar */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3"
      >
        <div className="flex items-center gap-2 flex-grow w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search service: Photographer, Tractor Driver, Cleaner, Repair..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto transition text-left group"
          >
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="truncate text-xs font-semibold text-slate-800">
              {location.city}
              {location.localArea && location.localArea !== `All ${location.city}` && (
                <span className="text-slate-500 font-normal"> · {location.localArea}</span>
              )}
            </div>
            {location.radiusKm && (
              <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-full border border-brand-200/60 ml-auto">
                {location.radiusKm}km
              </span>
            )}
          </button>

          <LocationSelectorModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
          />

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Services Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-medium animate-pulse">Finding available local providers...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <p className="font-bold text-slate-800 text-base">No services found matching your criteria</p>
          <p className="text-slate-500 text-xs">Be the first to offer local services in this location!</p>
          <Link
            href="/services/create"
            className="inline-block px-4 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition"
          >
            Register Your Service Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            let images = [];
            try {
              images = JSON.parse(srv.images);
            } catch (e) {
              images = [];
            }
            const img = images[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';

            return (
              <Link
                key={srv.id}
                href={`/service/${srv.slug}`}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={img}
                      alt={srv.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                      {srv.category.name}
                    </div>
                    <div className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                      {srv.experienceYears} Yrs Exp
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{srv.localArea}</span>
                      <span>·</span>
                      <span>{srv.city}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
                      {srv.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <span className="font-medium">{srv.provider.name}</span>
                        {srv.provider.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                        )}
                      </div>

                      {srv.avgRating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{srv.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400">Rate</span>
                    <p className="text-base font-black text-slate-900">
                      {srv.pricingType === 'HOURLY' && srv.hourlyRate
                        ? `${formatCurrency(srv.hourlyRate)} / hr`
                        : srv.fixedRate
                        ? `${formatCurrency(srv.fixedRate)} fixed`
                        : 'On Request'}
                    </p>
                  </div>

                  <span className="px-3.5 py-2 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-800 font-bold text-xs transition">
                    Book Service
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
