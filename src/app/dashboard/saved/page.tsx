'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';

export default function SavedItemsPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = () => {
    setLoading(true);
    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => setFavorites(data.favorites || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (listingId?: string, serviceId?: string) => {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, serviceId }),
    });
    fetchFavorites();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Your Saved Listings & Services</h2>
        <p className="text-xs text-slate-500 mt-0.5">Quickly access items and pros you bookmarked.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-xs text-slate-500">Loading saved items...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-base">No saved items yet</p>
          <p className="text-xs text-slate-500">
            Click the heart icon on any rental listing or local service to save it here.
          </p>
          <Link
            href="/rentals"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition hover:bg-brand-500"
          >
            Browse Rentals
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const item = fav.listing || fav.service;
            if (!item) return null;

            let images = [];
            try {
              images = JSON.parse(item.images);
            } catch (e) {
              images = [];
            }
            const img = images[0] || 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80';
            const isRental = Boolean(fav.listing);
            const linkHref = isRental ? `/listing/${item.slug}` : `/service/${item.slug}`;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100">
                    <img src={img} alt={item.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemove(fav.listingId, fav.serviceId)}
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-full shadow-sm transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-900">
                      {item.category?.name}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.localArea}</span>
                      <span>·</span>
                      <span>{item.city}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h3>
                  </div>
                </div>

                <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">
                    {isRental ? `${formatCurrency(item.priceDaily)} / day` : 'On Request'}
                  </span>

                  <Link
                    href={linkHref}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
