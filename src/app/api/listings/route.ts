import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateDistance } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');
    const city = searchParams.get('city');
    const area = searchParams.get('area');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const pickup = searchParams.get('pickup');
    const delivery = searchParams.get('delivery');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const userLat = latParam ? parseFloat(latParam) : null;
    const userLng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : null;

    const where: any = {
      status: 'ACTIVE',
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: true },
      });

      if (category) {
        if (category.children.length > 0) {
          const catIds = [category.id, ...category.children.map((c) => c.id)];
          where.categoryId = { in: catIds };
        } else {
          where.categoryId = category.id;
        }
      }
    }

    if (subcategorySlug) {
      const subcat = await prisma.category.findUnique({
        where: { slug: subcategorySlug },
      });
      if (subcat) {
        where.subcategoryId = subcat.id;
      }
    }

    if (city && city !== 'All') {
      where.city = { contains: city };
    }

    if (area && area !== 'All') {
      where.localArea = { contains: area };
    }

    if (minPrice || maxPrice) {
      where.priceDaily = {};
      if (minPrice) where.priceDaily.gte = parseFloat(minPrice);
      if (maxPrice) where.priceDaily.lte = parseFloat(maxPrice);
    }

    if (condition && condition !== 'ALL') {
      where.condition = condition;
    }

    if (pickup === 'true') {
      where.pickupAvailable = true;
    }

    if (delivery === 'true') {
      where.deliveryAvailable = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { priceDaily: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { priceDaily: 'desc' };
    }

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          owner: {
            select: { id: true, name: true, isVerified: true, city: true, localArea: true, avatarUrl: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Public sanitation: Ensure exactAddress is NEVER leaked publicly
    let sanitizedListings = listings.map((l) => {
      const { exactAddress, ...publicListing } = l;
      const ratings = l.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      const distanceKm =
        userLat !== null && userLng !== null && l.latitude && l.longitude
          ? calculateDistance(userLat, userLng, l.latitude, l.longitude)
          : null;

      return {
        ...publicListing,
        avgRating,
        reviewCount: ratings.length,
        distanceKm,
      };
    });

    // Distance Radius Filtering
    if (radiusKm !== null && !isNaN(radiusKm)) {
      sanitizedListings = sanitizedListings.filter(
        (l) => l.distanceKm !== null && l.distanceKm <= radiusKm
      );
    }

    if (sort === 'distance') {
      sanitizedListings.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    return NextResponse.json({
      listings: sanitizedListings,
      total: radiusKm ? sanitizedListings.length : total,
      page,
      totalPages: Math.ceil((radiusKm ? sanitizedListings.length : total) / limit),
    });
  } catch (error: any) {
    console.error('Listings GET error:', error);
    return NextResponse.json({ error: 'Failed to search listings.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to create a listing.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      subcategoryId,
      description,
      images = [],
      condition = 'GOOD',
      priceDaily,
      priceHourly,
      priceWeekly,
      securityDeposit = 0,
      pricingPeriod = 'DAILY',
      city,
      localArea,
      approxAddress,
      exactAddress,
      pickupAvailable = true,
      deliveryAvailable = false,
      deliveryFee = 0,
      rentalRules,
      cancellationPolicy = 'FLEXIBLE',
      specs,
    } = body;

    if (!title || !categoryId || !description || !priceDaily || !city || !localArea) {
      return NextResponse.json(
        { error: 'Title, category, description, daily price, city, and local area are required.' },
        { status: 400 }
      );
    }

    // Generate unique SEO slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const newListing = await prisma.listing.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        description: description.trim(),
        categoryId,
        subcategoryId: subcategoryId || null,
        images: JSON.stringify(images),
        condition,
        priceDaily: parseFloat(priceDaily),
        priceHourly: priceHourly ? parseFloat(priceHourly) : null,
        priceWeekly: priceWeekly ? parseFloat(priceWeekly) : null,
        securityDeposit: parseFloat(securityDeposit || '0'),
        pricingPeriod,
        city: city.trim(),
        localArea: localArea.trim(),
        approxAddress: approxAddress ? approxAddress.trim() : `${localArea}, ${city}`,
        exactAddress: exactAddress ? exactAddress.trim() : null, // Private until confirmed booking
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        pickupAvailable: Boolean(pickupAvailable),
        deliveryAvailable: Boolean(deliveryAvailable),
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0,
        rentalRules: rentalRules ? rentalRules.trim() : null,
        cancellationPolicy,
        specs: specs ? JSON.stringify(specs) : null,
        ownerId: user.id,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      listing: newListing,
      message: 'Listing published successfully.',
    });
  } catch (error: any) {
    console.error('Listing creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing.' },
      { status: 500 }
    );
  }
}
