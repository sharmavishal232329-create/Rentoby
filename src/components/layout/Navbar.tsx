'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import LocationSelectorModal from '../location/LocationSelectorModal';
import {
  MapPin,
  Search,
  PlusCircle,
  User,
  Heart,
  MessageSquare,
  Shield,
  LogOut,
  ChevronDown,
  Layers,
  Wrench,
  Tractor,
  Menu,
  X,
  Bell,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { location } = useLocation();

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <span className="font-extrabold text-2xl tracking-tighter">R</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Rentoby
                </span>
                <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                  Hyperlocal Rentals & Services
                </span>
              </div>
            </Link>

            {/* Hyperlocal Location Pill */}
            <div>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold transition border border-slate-200 group"
                title="Change location or search radius"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[130px]">{location.city}</span>
                <span className="text-slate-400">·</span>
                <span className="truncate max-w-[110px] text-slate-600 font-normal">
                  {location.localArea}
                </span>
                {location.radiusKm && (
                  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-1.5 py-0.2 rounded-full border border-brand-200/60">
                    {location.radiusKm}km
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <LocationSelectorModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
              />
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/rentals"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              All Rentals
            </Link>

            <Link
              href="/rentals/agriculture"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/50 transition"
            >
              <Tractor className="w-4 h-4 text-emerald-600" />
              <span>Agriculture</span>
            </Link>

            <Link
              href="/services"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Wrench className="w-4 h-4 text-slate-500" />
              <span>Local Services</span>
            </Link>
          </nav>

          {/* Right Action Buttons & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* List an Item Button */}
            <Link
              href="/listings/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition border border-brand-200"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-600" />
              <span>List an Item</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Saved Link */}
                <Link
                  href="/dashboard/saved"
                  title="Saved Items"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Heart className="w-4 h-4" />
                </Link>

                {/* Messages Link */}
                <Link
                  href="/dashboard/messages"
                  title="Conversations"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-semibold">
                          <span>Verified Member</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard/renter"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>Renter Dashboard</span>
                        </Link>

                        <Link
                          href="/dashboard/owner"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <PlusCircle className="w-4 h-4 text-brand-600" />
                          <span>Owner Dashboard & Earnings</span>
                        </Link>

                        <Link
                          href="/dashboard/provider"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Wrench className="w-4 h-4 text-amber-600" />
                          <span>Service Provider Dashboard</span>
                        </Link>

                        <Link
                          href="/services/create"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Wrench className="w-4 h-4 text-slate-400" />
                          <span>Register as Local Service</span>
                        </Link>

                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50/60 hover:bg-rose-100/60"
                          >
                            <Shield className="w-4 h-4 text-rose-600" />
                            <span>Admin Center</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Selected Location:</span>
              <button
                onClick={() => {
                  setIsLocationModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="font-bold text-brand-700 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                {location.city}, {location.localArea}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/rentals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-800"
              >
                All Rentals
              </Link>
              <Link
                href="/rentals/agriculture"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-emerald-50 text-center text-xs font-semibold text-emerald-800 border border-emerald-200"
              >
                🌾 Agriculture
              </Link>
              <Link
                href="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-amber-50 text-center text-xs font-semibold text-amber-800 border border-amber-200"
              >
                ⚡ Local Services
              </Link>
              <Link
                href="/listings/create"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-brand-600 text-center text-xs font-semibold text-white"
              >
                + List an Item
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
