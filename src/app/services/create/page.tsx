'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { useLocation } from '@/components/context/LocationContext';
import SearchableLocationInput from '@/components/location/SearchableLocationInput';
import { Briefcase, Upload, Trash2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateServicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { location } = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricingType, setPricingType] = useState<'HOURLY' | 'FIXED'>('HOURLY');
  const [hourlyRate, setHourlyRate] = useState('');
  const [fixedRate, setFixedRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [serviceArea, setServiceArea] = useState('Within 20km radius');
  const [city, setCity] = useState(location.city || 'Bengaluru');
  const [localArea, setLocalArea] = useState(location.localArea || '');
  const [availability, setAvailability] = useState('Mon - Sat: 8:00 AM - 7:00 PM');

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories?type=SERVICE')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          // Flatten parent and children
          const list: Category[] = [];
          data.categories.forEach((cat: any) => {
            if (cat.children && cat.children.length > 0) {
              list.push(...cat.children);
            } else {
              list.push(cat);
            }
          });
          setCategories(list);
          if (list.length > 0) setSelectedCategory(list[0].id);
        }
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'services');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setImageUrls((prev) => [...prev, data.url]);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Please sign in or register to offer a service.');
      return;
    }

    if (!title || !selectedCategory || !description || !serviceArea) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          categoryId: selectedCategory,
          description,
          pricingType,
          hourlyRate: pricingType === 'HOURLY' ? hourlyRate : null,
          fixedRate: pricingType === 'FIXED' ? fixedRate : null,
          experienceYears,
          serviceArea,
          city,
          localArea: localArea || 'Central',
          availability,
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register service.');

      router.push(`/service/${data.service.slug}`);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return <div className="p-12 text-center text-sm text-slate-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Offer a Local Service</h1>
        <p className="text-sm text-slate-500 mt-1">
          Register your skills to receive booking requests from nearby customers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Certified Tractor & Farm Machine Operator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Service Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description of Work & Expertise *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain your services, equipment used, turnaround time, safety measures, and client expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Pricing Model */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Pricing Structure
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPricingType('HOURLY')}
                className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                  pricingType === 'HOURLY'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                Hourly Rate
              </button>
              <button
                type="button"
                onClick={() => setPricingType('FIXED')}
                className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                  pricingType === 'FIXED'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                Fixed / Per Job Rate
              </button>
            </div>

            {pricingType === 'HOURLY' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Hourly Rate (₹/hr) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  placeholder="e.g. 500"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fixed Rate (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="e.g. 2500"
                  value={fixedRate}
                  onChange={(e) => setFixedRate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>
            )}
          </div>

          {/* Location & Coverage */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Service Base Location (City, Town, or PIN code) *
              </label>
              <SearchableLocationInput
                value={localArea && city ? `${localArea}, ${city}` : city}
                onSelectLocation={(loc) => {
                  setCity(loc.city);
                  setLocalArea(loc.localArea);
                  if (!serviceArea || serviceArea === 'Within 20km radius') {
                    setServiceArea(`Within 25km of ${loc.localArea || loc.city}`);
                  }
                }}
                placeholder="Type City, District, Locality, or PIN (e.g. Gorakhpur, Lucknow, Deoria)..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Base City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Service Radius / Coverage Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Within 25km of GIDA or Entire Gorakhpur"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Portfolio / Work Photos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative h-24 rounded-2xl overflow-hidden border border-slate-200">
                  <img src={url} alt="Portfolio" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrls((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imageUrls.length < 4 && (
                <label className="h-24 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 transition text-slate-500">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-semibold">{isUploading ? 'Uploading...' : 'Add Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-xl transition disabled:opacity-50"
        >
          {submitting ? 'Registering...' : 'Register Local Service Profile'}
        </button>
      </form>
    </div>
  );
}
