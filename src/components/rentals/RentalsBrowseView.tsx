'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocation } from '@/components/context/LocationContext';
import LocationSelectorModal from '@/components/location/LocationSelectorModal';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Tractor,
  Star,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  children: { id: string; name: string; slug: string }[];
}

interface ListingCard {
  id: string;
  title: string;
  slug: string;
  images: string;
  condition: string;
  priceDaily: number;
  securityDeposit: number;
  city: string;
  localArea: string;
  approxAddress: string;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  category: { id: string; name: string; slug: string };
  owner: { id: string; name: string; isVerified: boolean; localArea: string; city: string };
  avgRating: number | null;
  reviewCount: number;
  specs?: string | null;
  distanceKm?: number | null;
}

export default function RentalsBrowseView({
  initialCategorySlug,
  initialSubcategorySlug,
}: {
  initialCategorySlug?: string;
  initialSubcategorySlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location } = useLocation();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategorySlug || searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategorySlug || searchParams.get('subcategory') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || location.city || 'All');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'ALL');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [deliveryOnly, setDeliveryOnly] = useState(searchParams.get('delivery') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Category Hierarchy
  useEffect(() => {
    fetch('/api/categories?type=ITEM')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      });
  }, []);

  // Fetch Listings based on active filters
  const fetchListings = () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
    if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
    if (selectedArea) params.set('area', selectedArea);
    if (condition && condition !== 'ALL') params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (deliveryOnly) params.set('delivery', 'true');

    // Geo-radius coordinates
    if (location.latitude && location.longitude) {
      params.set('lat', location.latitude.toString());
      params.set('lng', location.longitude.toString());
      if (location.radiusKm) {
        params.set('radius', location.radiusKm.toString());
      }
    }

    params.set('sort', sort);
    params.set('page', page.toString());

    fetch(`/api/listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.listings || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedSubcategory, selectedCity, condition, sort, page, deliveryOnly, location]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedCity('All');
    setSelectedArea('');
    setCondition('ALL');
    setMinPrice('');
    setMaxPrice('');
    setDeliveryOnly(false);
    setSort('newest');
    setPage(1);
  };

  const currentCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const isAgri = selectedCategory === 'agriculture';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/rentals" className="hover:text-slate-900 font-medium">
            Rentals
          </Link>
          {currentCategoryObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-bold">{currentCategoryObj.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {isAgri && <Tractor className="w-7 h-7 text-emerald-600" />}
              <span>{currentCategoryObj ? `${currentCategoryObj.name} Rentals` : 'All Rental Listings'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing {total} verified items available nearby in {selectedCity === 'All' ? 'all locations' : selectedCity}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="newest">Sort: Recently Added</option>
              <option value="distance">📍 Distance (Nearest First)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agriculture Quick Category Sub-Navigation (if browsing Agriculture) */}
      {isAgri && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-emerald-900 mr-2 flex items-center gap-1.5">
            <Tractor className="w-4 h-4 text-emerald-700" />
            <span>Farming Categories:</span>
          </span>
          <button
            onClick={() => setSelectedSubcategory('')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              !selectedSubcategory
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            All Agriculture
          </button>
          {currentCategoryObj?.children.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcategory(sub.slug)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                selectedSubcategory === sub.slug
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Search Header Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3"
      >
        <div className="flex items-center gap-2 flex-grow w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by item name, model, tractor, camera, drill..."
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
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Main Content Layout: Sidebar Filters + Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-3xl border border-slate-200 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filter Listings</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700"
            >
              Reset All
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Categories
            </label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  !selectedCategory
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setSelectedSubcategory('');
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>

                  {/* Subcategories (if selected) */}
                  {selectedCategory === cat.slug && cat.children.length > 0 && (
                    <div className="pl-4 space-y-1 py-1">
                      {cat.children.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory(sub.slug)}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                            selectedSubcategory === sub.slug
                              ? 'text-brand-700 font-bold bg-brand-50/60'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          · {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
            >
              <option value="ALL">Any Condition</option>
              <option value="NEW">Brand New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>

          {/* Daily Price Range */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Daily Price (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2"
              />
            </div>
            <button
              type="button"
              onClick={fetchListings}
              className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Apply Price
            </button>
          </div>

          {/* Delivery Toggle */}
          <div className="pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={deliveryOnly}
                onChange={(e) => setDeliveryOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span>Delivery Available Only</span>
            </label>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-slate-500 text-sm font-medium animate-pulse">
                Searching marketplace inventory...
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <p className="font-bold text-slate-800 text-base">No listings found matching your criteria</p>
              <p className="text-slate-500 text-xs">
                Try clearing filters, selecting a different city, or broadening your search terms.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((item) => {
                let images = [];
                try {
                  images = JSON.parse(item.images);
                } catch (e) {
                  images = [];
                }
                const displayImg =
                  images[0] ||
                  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80';

                return (
                  <Link
                    key={item.id}
                    href={`/listing/${item.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={displayImg}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800 shadow-sm">
                          {item.category.name}
                        </div>
                        {item.condition && (
                          <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-semibold text-white">
                            {item.condition.replace('_', ' ')}
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        {/* Approximate Location Protection */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.localArea}</span>
                          <span>·</span>
                          <span className="truncate">{item.city}</span>
                          {item.distanceKm !== undefined && item.distanceKm !== null && (
                            <span className="ml-auto font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded-full border border-brand-200/60 text-[10px] shrink-0">
                              {item.distanceKm} km
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Owner & Verified Pill */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <span className="truncate font-medium">{item.owner.name}</span>
                            {item.owner.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            )}
                          </div>

                          {item.avgRating && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{item.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400">Rent</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900">
                            {formatCurrency(item.priceDaily)}
                          </span>
                          <span className="text-[10px] text-slate-500">/ day</span>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-800 group-hover:text-brand-700 font-semibold text-xs transition">
                        View Item
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
