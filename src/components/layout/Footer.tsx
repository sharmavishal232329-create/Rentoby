import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, MapPin, Sparkles, Tractor } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <span className="font-extrabold text-2xl tracking-tighter">R</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rentoby
              </span>
            </Link>

            <p className="text-sm font-semibold text-brand-400">
              Rent Anything. Book Local Services. Right Nearby.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Rentoby is the commercial hyperlocal sharing economy marketplace. Connect with verified item owners and trusted local service providers right in your neighborhood.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Escrow Deposit Protection</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-brand-400" />
                <span>Address Privacy Shield</span>
              </div>
            </div>
          </div>

          {/* Agriculture Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Tractor className="w-4 h-4" />
              <span>Agriculture Hub</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/rentals/agriculture/agricultural-machinery" className="hover:text-white transition">
                  Agricultural Machinery
                </Link>
              </li>
              <li>
                <Link href="/rentals/agriculture/irrigation-equipment" className="hover:text-white transition">
                  Irrigation & Pumps
                </Link>
              </li>
              <li>
                <Link href="/rentals/agriculture/farm-tools" className="hover:text-white transition">
                  Farm Tools & Weeders
                </Link>
              </li>
              <li>
                <Link href="/rentals/agriculture/agricultural-storage-equipment" className="hover:text-white transition">
                  Storage & Farm Equipment
                </Link>
              </li>
              <li>
                <Link href="/services/service-equipment-operators" className="hover:text-white transition">
                  Equipment Operators
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Rentals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Rental Categories
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/rentals/electronics" className="hover:text-white transition">
                  Cameras & Audio Gear
                </Link>
              </li>
              <li>
                <Link href="/rentals/tools-equipment" className="hover:text-white transition">
                  Power Tools & Ladders
                </Link>
              </li>
              <li>
                <Link href="/rentals/travel-outdoor" className="hover:text-white transition">
                  Camping & Trekking Tents
                </Link>
              </li>
              <li>
                <Link href="/rentals/events-parties" className="hover:text-white transition">
                  Event Sound & Staging
                </Link>
              </li>
              <li>
                <Link href="/rentals/home-lifestyle" className="hover:text-white transition">
                  Home Appliances & Cleaning
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Local Services & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/services/service-photography" className="hover:text-white transition">
                  Photographers & Drone Film
                </Link>
              </li>
              <li>
                <Link href="/services/service-repairs" className="hover:text-white transition">
                  Technicians & Electricians
                </Link>
              </li>
              <li>
                <Link href="/services/service-cleaning" className="hover:text-white transition">
                  Deep Clean & Wash
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition">
                  Trust & Safety Policies
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Rental Rules & Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Rentoby Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Secure Hyperlocal Commerce</span>
            <span>·</span>
            <span>Razorpay Verified Gateway</span>
            <span>·</span>
            <span>Zero Fake Transactions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
