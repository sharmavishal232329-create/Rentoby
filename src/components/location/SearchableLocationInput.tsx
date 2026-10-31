'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IndianLocation } from '@/lib/location/indianLocationsData';
import { MapPin, Search, Navigation, Loader2, X } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

interface SelectedLocationDetails {
  city: string;
  localArea: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

interface SearchableLocationInputProps {
  value: string;
  onChange?: (val: string) => void;
  onSelectLocation: (loc: SelectedLocationDetails) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showGpsButton?: boolean;
}

export default function SearchableLocationInput({
  value,
  onChange,
  onSelectLocation,
  placeholder = 'Type City, District, Locality, or PIN code...',
  required = false,
  className = '',
  showGpsButton = true,
}: SearchableLocationInputProps) {
  const { detectCurrentLocation } = useLocation();

  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<IndianLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions
  useEffect(() => {
    if (!inputValue.trim() || !isOpen) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(inputValue.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.locations || []);
        }
      } catch (err) {
        console.error('Error fetching location query:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (item: IndianLocation) => {
    const display = item.locality ? `${item.locality}, ${item.city}` : `${item.city}, ${item.state}`;
    setInputValue(display);
    if (onChange) onChange(display);
    setIsOpen(false);

    onSelectLocation({
      city: item.city,
      localArea: item.locality || `All ${item.city}`,
      district: item.district,
      state: item.state,
      pincode: item.pincode,
      latitude: item.latitude,
      longitude: item.longitude,
    });
  };

  const handleGpsClick = async () => {
    setIsDetecting(true);
    const result = await detectCurrentLocation();
    setIsDetecting(false);

    if (result.success && result.location) {
      const loc = result.location;
      const display = loc.localArea ? `${loc.localArea}, ${loc.city}` : loc.city;
      setInputValue(display);
      if (onChange) onChange(display);
      setIsOpen(false);

      onSelectLocation({
        city: loc.city,
        localArea: loc.localArea,
        district: loc.district,
        state: loc.state,
        pincode: loc.pincode,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
    } else {
      alert(result.error || 'Failed to detect current location.');
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full text-sm pl-10 pr-20 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 transition"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                if (onChange) onChange('');
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {showGpsButton && (
            <button
              type="button"
              onClick={handleGpsClick}
              disabled={isDetecting}
              title="Use current GPS location"
              className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition"
            >
              {isDetecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
          {loading && (
            <div className="p-3 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              <span>Searching locations...</span>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((item, idx) => (
                <button
                  key={`${item.city}-${item.locality || ''}-${item.pincode || idx}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-brand-50/70 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700 block">
                        {item.locality ? `${item.locality}, ` : ''}{item.city}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {item.district && item.district !== item.city ? `${item.district}, ` : ''}{item.state}
                      </span>
                    </div>
                  </div>
                  {item.pincode && (
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.pincode}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && inputValue.trim().length > 1 && results.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-500">
              No matching location. You can still use &ldquo;{inputValue}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
