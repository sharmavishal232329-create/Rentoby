'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/components/context/LocationContext';
import LocationSelectorModal from '@/components/location/LocationSelectorModal';
import { Search, MapPin, ArrowRight } from 'lucide-react';

const SAMPLE_SEARCHES = [
  'Tractor',
  'Camera',
  'Projector',
  'Bike',
  'Drill',
  'Tent',
  'Photographer',
  'Water Pump',
];

export default function HeroSearch() {
  const router = useRouter();
  const { location } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState(location.localArea || location.city);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !searchLocation.trim()) return;

    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (searchLocation.trim()) params.set('area', searchLocation.trim());

    // If query is photographer or other service, route to services if matching, else rentals
    const isServiceQuery = ['photographer', 'operator', 'cleaning', 'plumber', 'driver'].some(
      (s) => query.toLowerCase().includes(s)
    );

    if (isServiceQuery) {
      router.push(`/services?${params.toString()}`);
    } else {
      router.push(`/rentals?${params.toString()}`);
    }
  };

  const handlePillClick = (item: string) => {
    setQuery(item);
    const isService = ['photographer', 'operator', 'cleaner'].some((s) =>
      item.toLowerCase().includes(s)
    );
    if (isService) {
      router.push(`/services?q=${encodeURIComponent(item)}`);
    } else {
      router.push(`/rentals?q=${encodeURIComponent(item)}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200/40 flex flex-col md:flex-row items-center gap-2 text-slate-900"
      >
        {/* Keyword Search */}
        <div className="flex items-center gap-3 w-full md:flex-[1.5] px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 focus-within:ring-2 focus-within:ring-brand-500 focus-within:bg-white transition">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="flex flex-col w-full text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              What are you looking for?
            </span>
            <input
              type="text"
              placeholder="e.g. Tractor, Sony FX3, Tent, Drill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Location Input */}
        <div
          onClick={() => setIsLocationModalOpen(true)}
          className="cursor-pointer flex items-center gap-3 w-full md:flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 focus-within:ring-2 focus-within:ring-brand-500 transition group"
        >
          <MapPin className="w-5 h-5 text-brand-600 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col w-full text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Where?
              </span>
              <span className="text-[10px] font-semibold text-brand-600">Change</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 truncate">
              {location.localArea && location.localArea !== `All ${location.city}`
                ? `${location.localArea}, ${location.city}`
                : location.city}
              {location.radiusKm && (
                <span className="ml-1.5 text-xs text-brand-600 font-normal">
                  ({location.radiusKm} km)
                </span>
              )}
            </div>
          </div>
        </div>

        <LocationSelectorModal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSearchLocation(location.city);
          }}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full md:w-auto px-7 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition flex items-center justify-center gap-2 shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Suggestion Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Popular:</span>
        {SAMPLE_SEARCHES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handlePillClick(item)}
            className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
