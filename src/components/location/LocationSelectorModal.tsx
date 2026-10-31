'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, LocationState } from '../context/LocationContext';
import { IndianLocation } from '@/lib/location/indianLocationsData';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Clock,
  Flame,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RADIUS_OPTIONS = [
  { label: '3 km (Walking/Quick)', value: 3 },
  { label: '5 km (Neighborhood)', value: 5 },
  { label: '10 km (City Zone)', value: 10 },
  { label: '25 km (Greater Area)', value: 25 },
  { label: 'Whole City', value: undefined },
];

const POPULAR_QUICK_HUBS = [
  { name: 'Gorakhpur', city: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lng: 83.3732 },
  { name: 'GIDA', city: 'Gorakhpur', localArea: 'GIDA', state: 'Uttar Pradesh', pincode: '273209', lat: 26.7455, lng: 83.2721 },
  { name: 'Deoria', city: 'Deoria', state: 'Uttar Pradesh', pincode: '274001', lat: 26.5024, lng: 83.7791 },
  { name: 'Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Delhi-NCR', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Patna', city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Kolkata', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
];

export default function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
  const { location, selectLocation, recentLocations, setRadiusKm, detectCurrentLocation } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IndianLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number | undefined>(location.radiusKm);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setGpsError(null);
    }
  }, [isOpen]);

  // Live location search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query.trim())}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.locations || []);
        }
      } catch (err) {
        console.error('Error fetching location suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handlePickLocation = (loc: {
    name?: string;
    city: string;
    localArea?: string;
    locality?: string;
    district?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  }) => {
    selectLocation({
      name: loc.name,
      city: loc.city,
      localArea: loc.localArea || loc.locality || `All ${loc.city}`,
      district: loc.district,
      state: loc.state,
      pincode: loc.pincode,
      latitude: loc.latitude || loc.lat,
      longitude: loc.longitude || loc.lng,
      radiusKm: selectedRadius,
    });
    onClose();
  };

  const handleUseCurrentLocation = async () => {
    setIsDetecting(true);
    setGpsError(null);
    const result = await detectCurrentLocation();
    setIsDetecting(false);

    if (result.success && result.location) {
      onClose();
    } else {
      setGpsError(result.error || 'Failed to detect current location. Please search manually.');
    }
  };

  const handleRadiusChange = (radius: number | undefined) => {
    setSelectedRadius(radius);
    setRadiusKm(radius);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Select Your Location</h3>
              <p className="text-xs text-slate-500">Discover rentals & local services right nearby across India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search City, District, Locality, or PIN code (e.g. Gorakhpur, GIDA, 273209)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-sm pl-10 pr-10 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 focus:bg-white text-slate-900 font-medium placeholder:font-normal placeholder:text-slate-400 transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-50 to-emerald-50 hover:from-brand-100 hover:to-emerald-100 text-brand-800 text-sm font-bold flex items-center justify-center gap-2.5 transition border border-brand-200/70 shadow-sm disabled:opacity-70 group"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span>Detecting your location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                <span>📍 Use My Current Location</span>
              </>
            )}
          </button>

          {gpsError && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              {gpsError}
            </p>
          )}

          {/* Search Results List */}
          {loading && (
            <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Searching locations across India...</span>
            </div>
          )}

          {!loading && query.trim() && results.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Matching Locations ({results.length})
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                {results.map((item, idx) => (
                  <button
                    key={`${item.city}-${item.locality || ''}-${item.pincode || idx}`}
                    type="button"
                    onClick={() => handlePickLocation(item)}
                    className="w-full text-left p-3 hover:bg-brand-50/60 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-brand-700">
                          {item.locality ? `${item.locality}, ` : ''}{item.city}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.district && item.district !== item.city ? `${item.district}, ` : ''}{item.state}
                        </div>
                      </div>
                    </div>
                    {item.pincode && (
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {item.pincode}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-xs">
              No matching locations found for &ldquo;{query}&rdquo;. Try another town, district, or PIN code.
            </div>
          )}

          {/* Recent Locations */}
          {recentLocations.length > 0 && !query.trim() && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Recent Locations</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {recentLocations.map((rec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickLocation(rec)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium border border-slate-200/80 transition flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{rec.localArea ? `${rec.localArea}, ` : ''}{rec.city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Hubs */}
          {!query.trim() && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Popular Hubs</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUICK_HUBS.map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => handlePickLocation(hub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      location.city.toLowerCase() === hub.city.toLowerCase() &&
                      (!hub.localArea || (location.localArea && location.localArea.toLowerCase().includes(hub.localArea.toLowerCase())))
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>{hub.name}</span>
                    {hub.pincode && <span className="opacity-70 text-[10px]">({hub.pincode})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Radius Selector */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Search Radius
              </span>
              <span className="text-xs text-brand-600 font-semibold">
                {selectedRadius ? `Within ${selectedRadius} km` : 'Entire City / Area'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleRadiusChange(opt.value)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition border text-center ${
                    selectedRadius === opt.value
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {opt.value ? `${opt.value} km` : 'All City'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer: Privacy Guarantee */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong className="text-slate-700">Privacy First:</strong> Exact house addresses are never visible publicly.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
