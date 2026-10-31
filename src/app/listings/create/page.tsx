'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { useLocation } from '@/components/context/LocationContext';
import SearchableLocationInput from '@/components/location/SearchableLocationInput';
import {
  Upload,
  Plus,
  Trash2,
  Tractor,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export default function CreateListingPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading form...</div>}>
      <CreateListingForm />
    </React.Suspense>
  );
}

function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { location } = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [priceDaily, setPriceDaily] = useState('');
  const [priceHourly, setPriceHourly] = useState('');
  const [priceWeekly, setPriceWeekly] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [city, setCity] = useState(location.city || 'Bengaluru');
  const [localArea, setLocalArea] = useState(location.localArea || '');
  const [latitude, setLatitude] = useState<number | undefined>(location.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(location.longitude);
  const [approxAddress, setApproxAddress] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [rentalRules, setRentalRules] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('FLEXIBLE');

  // Agriculture specific specs
  const [agriHp, setAgriHp] = useState('');
  const [agriFuel, setAgriFuel] = useState('Diesel (Owner/Renter terms)');
  const [agriOperator, setAgriOperator] = useState('Available on Request');
  const [agriAttachments, setAgriAttachments] = useState('');

  // Images state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories?type=ITEM')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          const initialCategoryParam = searchParams.get('category');
          if (initialCategoryParam) {
            const found = data.categories.find(
              (c: Category) => c.slug === initialCategoryParam
            );
            if (found) setSelectedCategory(found.id);
          } else if (data.categories.length > 0) {
            setSelectedCategory(data.categories[0].id);
          }
        }
      });
  }, [searchParams]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const isAgriculture = activeCategoryObj?.slug === 'agriculture';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length >= 6) {
      setUploadError('Maximum 6 images allowed per listing.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'listings');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrls((prev) => [...prev, data.url]);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!user) {
      setSubmitError('Please sign in or register to publish an item.');
      return;
    }

    if (!selectedCategory) {
      setSubmitError('Please choose a category.');
      return;
    }

    if (imageUrls.length === 0) {
      setSubmitError('Please upload at least one clear photograph of your item.');
      return;
    }

    setIsSubmitting(true);

    const specs: Record<string, string> = {};
    if (isAgriculture) {
      if (agriHp) specs.horsepower = agriHp;
      if (agriFuel) specs.fuelPolicy = agriFuel;
      if (agriOperator) specs.operatorIncluded = agriOperator;
      if (agriAttachments) specs.attachments = agriAttachments;
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          categoryId: selectedCategory,
          subcategoryId: selectedSubcategory || null,
          images: imageUrls,
          condition,
          priceDaily,
          priceHourly: priceHourly || null,
          priceWeekly: priceWeekly || null,
          securityDeposit: securityDeposit || '0',
          city,
          localArea,
          latitude,
          longitude,
          approxAddress: approxAddress || `${localArea}, ${city}`,
          exactAddress: exactAddress || null,
          pickupAvailable,
          deliveryAvailable,
          deliveryFee: deliveryAvailable ? deliveryFee || '0' : null,
          rentalRules,
          cancellationPolicy,
          specs: Object.keys(specs).length > 0 ? specs : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish listing.');
      }

      router.push(`/listing/${data.listing.slug}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading session...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">List an Item for Rent</h1>
        <p className="text-sm text-slate-500 mt-1">
          Turn your unused equipment, tools, cameras, and machinery into steady income while helping neighbors.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. CATEGORY & ITEM NAME */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>Category & Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Marketplace Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="">Select Subcategory (Optional)</option>
                {activeCategoryObj?.children.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mahindra 575 DI 45HP Tractor with Rotavator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description & Specifications *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the condition, key capabilities, accessories included, and suitable use cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Item Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'NEW', label: 'Brand New', desc: 'Flawless in original box' },
                { id: 'LIKE_NEW', label: 'Like New', desc: 'Barely used, pristine' },
                { id: 'GOOD', label: 'Good', desc: 'Fully functional, normal signs of use' },
                { id: 'FAIR', label: 'Fair', desc: 'Well used, works reliably' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    condition === c.id
                      ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{c.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. AGRICULTURE SPECIFIC SECTION (Only if Agriculture category is selected) */}
        {isAgriculture && (
          <div className="bg-emerald-50/70 p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Tractor className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-emerald-950">
                Agricultural Machinery & Farming Specs
              </h2>
            </div>
            <p className="text-xs text-emerald-800 -mt-3">
              Provide technical specifications so farmers and equipment renters know exact field compatibility.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
                  Horsepower (HP) / Capacity
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 HP or 5 HP Pump"
                  value={agriHp}
                  onChange={(e) => setAgriHp(e.target.value)}
                  className="w-full text-sm rounded-xl border border-emerald-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
                  Fuel / Power Policy
                </label>
                <select
                  value={agriFuel}
                  onChange={(e) => setAgriFuel(e.target.value)}
                  className="w-full text-sm rounded-xl border border-emerald-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Diesel (Tank full to tank full)">Diesel (Tank full to tank full)</option>
                  <option value="Diesel (Renter fills on site)">Diesel (Renter fills on site)</option>
                  <option value="Electric (3-Phase power required)">Electric (3-Phase power required)</option>
                  <option value="Manual / Power Weeder (Petrol mix)">Manual / Power Weeder (Petrol mix)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
                  Driver / Operator Option
                </label>
                <select
                  value={agriOperator}
                  onChange={(e) => setAgriOperator(e.target.value)}
                  className="w-full text-sm rounded-xl border border-emerald-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="Equipment Only (Renter arranges driver)">Equipment Only (Renter arranges driver)</option>
                  <option value="Available with Skilled Operator (+ Additional daily fee)">
                    Available with Skilled Operator (+ Additional daily fee)
                  </option>
                  <option value="Self-operate only (Must show valid license)">
                    Self-operate only (Must show valid license)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
                  Attachments / Implements Included
                </label>
                <input
                  type="text"
                  placeholder="e.g. 42-blade Rotavator, 9-tyne Cultivator, 100m Hose"
                  value={agriAttachments}
                  onChange={(e) => setAgriAttachments(e.target.value)}
                  className="w-full text-sm rounded-xl border border-emerald-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PHOTOS UPLOAD */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>Photos (Cloud Storage)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Upload clear, authentic photographs of your item. Avoid stock photos. Max 6 images (5MB each).
          </p>

          {uploadError && <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={url} alt="Listing upload" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {imageUrls.length < 6 && (
              <label className="h-28 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 hover:bg-brand-50/30 transition text-slate-500">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-semibold">
                  {isUploading ? 'Uploading...' : 'Add Image'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* 4. PRICING & DEPOSIT */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>Rental Pricing & Security Deposit</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Daily Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 1500"
                value={priceDaily}
                onChange={(e) => setPriceDaily(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hourly Price (₹) (Optional)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 250"
                value={priceHourly}
                onChange={(e) => setPriceHourly(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Refundable Security Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 3000"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 5. LOCATION & ADDRESS PRIVACY */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black">
              4
            </span>
            <span>Location & Strict Privacy Protection</span>
          </h2>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Privacy Guarantee:</span> Your exact house number, survey number, or private street address is NEVER publicly visible on Rentoby. Renters will only see your general neighborhood or landmark until a booking is accepted and verified.
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Search & Select Location (City, District, Town, or PIN code) *
              </label>
              <SearchableLocationInput
                value={localArea && city ? `${localArea}, ${city}` : city}
                onSelectLocation={(loc) => {
                  setCity(loc.city);
                  setLocalArea(loc.localArea);
                  if (loc.latitude) setLatitude(loc.latitude);
                  if (loc.longitude) setLongitude(loc.longitude);
                  if (loc.pincode && !approxAddress) {
                    setApproxAddress(`${loc.localArea}, ${loc.city} - ${loc.pincode}`);
                  }
                }}
                placeholder="Type Indian City, District, Locality, or PIN (e.g. Gorakhpur, GIDA, 273209)..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  City *
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
                  Public Local Area / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GIDA, Golghar, Koramangala 4th Block"
                  value={localArea}
                  onChange={(e) => setLocalArea(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Public Landmark / Approximate Address
            </label>
            <input
              type="text"
              placeholder="e.g. Near Sony World Signal or Near Nelamangala Toll Gate"
              value={approxAddress}
              onChange={(e) => setApproxAddress(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Exact Confidential Pickup Address (Private until booking confirmed)
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302, Green View, 4th Block, Koramangala 560034"
              value={exactAddress}
              onChange={(e) => setExactAddress(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          {/* Pickup & Delivery */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={pickupAvailable}
                  onChange={(e) => setPickupAvailable(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Local Pickup Available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span>Delivery Available (Farm gate / Doorstep)</span>
              </label>
            </div>

            {deliveryAvailable && (
              <div className="max-w-xs pt-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 250"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* 6. RULES & CANCELLATION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xs font-black">
              5
            </span>
            <span>Rental Rules & Cancellation Policy</span>
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Rental Rules & Verification Requirements
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Govt photo ID required. Return clean. Do not expose to heavy rain."
              value={rentalRules}
              onChange={(e) => setRentalRules(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Cancellation Policy
            </label>
            <select
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full text-sm rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="FLEXIBLE">Flexible: Full refund up to 24 hours before rental start</option>
              <option value="MODERATE">Moderate: Full refund up to 3 days before rental start</option>
              <option value="STRICT">Strict: 50% refund up to 7 days before rental start</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-base shadow-xl shadow-brand-600/30 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing Item...' : 'Publish Listing to Rentoby'}
        </button>
      </form>
    </div>
  );
}
