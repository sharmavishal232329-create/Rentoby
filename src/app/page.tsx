import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import {
  Search,
  MapPin,
  Tractor,
  Camera,
  Wrench,
  Compass,
  PartyPopper,
  Home,
  Dumbbell,
  Briefcase,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Star,
} from 'lucide-react';
import HeroSearch from '@/components/home/HeroSearch';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  // Fetch real featured listings from database
  const featuredListings = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: {
      category: true,
      owner: {
        select: { name: true, isVerified: true, city: true, localArea: true },
      },
    },
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  // Fetch real agriculture listings
  const agriCategory = await prisma.category.findUnique({
    where: { slug: 'agriculture' },
  });

  const agriListings = agriCategory
    ? await prisma.listing.findMany({
        where: { categoryId: agriCategory.id, status: 'ACTIVE' },
        include: {
          category: true,
          owner: { select: { name: true, isVerified: true, localArea: true } },
        },
        take: 3,
      })
    : [];

  // Fetch real services from database
  const featuredServices = await prisma.service.findMany({
    where: { status: 'ACTIVE' },
    include: {
      category: true,
      provider: {
        select: { name: true, isVerified: true, city: true, localArea: true },
      },
    },
    take: 3,
  });

  const mainCategories = [
    { name: 'Agriculture', icon: Tractor, slug: 'agriculture', count: 'Tractors, Pumps, Tools', color: 'emerald' },
    { name: 'Electronics', icon: Camera, slug: 'electronics', count: 'Cameras, Audio, Lenses', color: 'blue' },
    { name: 'Tools & Equipment', icon: Wrench, slug: 'tools-equipment', count: 'Power Drills, Washers', color: 'amber' },
    { name: 'Travel & Outdoor', icon: Compass, slug: 'travel-outdoor', count: 'Tents, Bags, Gear', color: 'teal' },
    { name: 'Events & Parties', icon: PartyPopper, slug: 'events-parties', count: 'Staging, Lights, Sound', color: 'purple' },
    { name: 'Home & Lifestyle', icon: Home, slug: 'home-lifestyle', count: 'Appliances, Furniture', color: 'rose' },
    { name: 'Sports & Fitness', icon: Dumbbell, slug: 'sports-fitness', count: 'Cycles, Gym Gear', color: 'indigo' },
    { name: 'Local Services', icon: Briefcase, slug: 'local-services', isService: true, count: 'Photography, Operators, Pros', color: 'orange' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold backdrop-blur-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hyperlocal Sharing Economy Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Rent Anything. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-teal-200">
              Book Local Services.
            </span> <br />
            Right Nearby.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Find useful items and trusted local services around you — or earn from the things and skills you already have.
          </p>

          {/* Interactive Hero Search Form Component */}
          <div className="pt-2">
            <HeroSearch />
          </div>

          {/* Direct CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold">
            <Link
              href="/rentals"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
            >
              <span>Find Rentals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-2"
            >
              <span>Find Services</span>
            </Link>
            <Link
              href="/listings/create"
              className="px-6 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
            >
              + List an Item
            </Link>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select a category to browse verified listings in your area.
            </p>
          </div>
          <Link
            href="/rentals"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mainCategories.map((cat) => {
            const Icon = cat.icon;
            const targetUrl = cat.isService ? '/services' : `/rentals/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                href={targetUrl}
                className="group relative p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-800 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  {cat.slug === 'agriculture' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Key Category
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. AGRICULTURE SPOTLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white p-8 sm:p-12 border border-emerald-800/50 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                <Tractor className="w-3.5 h-3.5" />
                <span>Agriculture Marketplace</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Modern Farming Machinery & Irrigation On-Demand
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect directly with equipment owners for tractors, rotavators, seed drills, harvesters, high-discharge water pumps, and skilled operators. Save on capital expenses by renting during critical sowing and harvesting windows.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/rentals/agriculture"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2"
                >
                  <span>Browse Agricultural Gear</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/listings/create?category=agriculture"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition"
                >
                  List Farming Equipment
                </Link>
              </div>
            </div>

            {/* Quick Subcategory Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/rentals/agriculture/agricultural-machinery"
                className="p-4 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 transition group"
              >
                <h4 className="font-bold text-sm text-emerald-200 group-hover:text-white">
                  Agricultural Machinery
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Tractors, rotavators, seed drills, harvesters & sprayers
                </p>
              </Link>
              <Link
                href="/rentals/agriculture/irrigation-equipment"
                className="p-4 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 transition group"
              >
                <h4 className="font-bold text-sm text-emerald-200 group-hover:text-white">
                  Irrigation Equipment
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  High-pressure pumps, sprinkler systems & pipes
                </p>
              </Link>
              <Link
                href="/rentals/agriculture/farm-tools"
                className="p-4 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 transition group"
              >
                <h4 className="font-bold text-sm text-emerald-200 group-hover:text-white">
                  Farm Tools
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Power weeders, brush cutters & harvesting implements
                </p>
              </Link>
              <Link
                href="/services/service-equipment-operators"
                className="p-4 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 transition group"
              >
                <h4 className="font-bold text-sm text-emerald-200 group-hover:text-white">
                  Equipment Operators
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Certified tractor drivers & farm machinery operators
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED RENTALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Items Nearby
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verified items available for hourly, daily, or weekly rental.
            </p>
          </div>
          <Link
            href="/rentals"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredListings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No listings currently available in this location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((item) => {
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
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition flex flex-col"
                >
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={displayImg}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm">
                      {item.category.name}
                    </div>
                    {item.condition && (
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white">
                        {item.condition.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.localArea}</span>
                        <span>·</span>
                        <span>{item.city}</span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Starting from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900">
                            {formatCurrency(item.priceDaily)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ day</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-800 group-hover:text-brand-700 font-semibold text-xs transition">
                          View Details
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. LOCAL SERVICES HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Skill & Service Marketplace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trusted Local Service Providers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hire vetted local professionals for photography, equipment operation, repairs, and home help.
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((srv) => {
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
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition flex flex-col"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img src={img} alt={srv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                    {srv.experienceYears} Years Exp
                  </div>
                </div>

                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{srv.city}</span>
                      <span>·</span>
                      <span>{srv.localArea}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors line-clamp-1">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{srv.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Rate</span>
                      <p className="text-base font-black text-slate-900">
                        {srv.pricingType === 'HOURLY' && srv.hourlyRate
                          ? `${formatCurrency(srv.hourlyRate)} / hr`
                          : srv.fixedRate
                          ? `${formatCurrency(srv.fixedRate)} fixed`
                          : 'On Request'}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-semibold text-xs group-hover:bg-amber-100 transition">
                      Book Service
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. HOW RENTOBY WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Rentoby Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A safe, transparent, and verified community marketplace for neighbors, businesses, and farmers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-xl">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900">1. Discover Nearby</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Search equipment or services by locality. Filter by distance, price, and availability while owner addresses remain private.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-xl">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900">2. Request & Escrow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select your dates. Owner approves the request, and payments/deposits are verified via secure gateway escrow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-extrabold text-xl">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900">3. Complete & Earn</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pickup the item or receive the service. Once safely returned, security deposits are refunded and verified reviews are posted.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
