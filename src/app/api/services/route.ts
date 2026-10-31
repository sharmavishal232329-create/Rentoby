import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const categorySlug = searchParams.get('category');
    const city = searchParams.get('city');
    const area = searchParams.get('area');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE' };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (city && city !== 'All') {
      where.city = { contains: city };
    }

    if (area && area !== 'All') {
      where.localArea = { contains: area };
    }

    const [total, services] = await Promise.all([
      prisma.service.count({ where }),
      prisma.service.findMany({
        where,
        include: {
          category: true,
          provider: {
            select: { id: true, name: true, city: true, localArea: true, isVerified: true, avatarUrl: true },
          },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const formattedServices = services.map((s) => {
      const ratings = s.reviews.map((r) => r.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      return {
        ...s,
        avgRating,
        reviewCount: ratings.length,
      };
    });

    return NextResponse.json({
      services: formattedServices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Services GET error:', error);
    return NextResponse.json({ error: 'Failed to search services.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to offer a service.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      categoryId,
      description,
      hourlyRate,
      fixedRate,
      pricingType = 'HOURLY',
      experienceYears = 1,
      serviceArea,
      city,
      localArea,
      availability,
      images = [],
    } = body;

    if (!title || !categoryId || !description || !city || !localArea || !serviceArea) {
      return NextResponse.json(
        { error: 'Title, category, description, service area, and location are required.' },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const newService = await prisma.service.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        categoryId,
        description: description.trim(),
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        fixedRate: fixedRate ? parseFloat(fixedRate) : null,
        pricingType,
        experienceYears: parseInt(experienceYears.toString(), 10) || 1,
        serviceArea: serviceArea.trim(),
        city: city.trim(),
        localArea: localArea.trim(),
        availability: availability ? availability.trim() : 'Mon - Sat: 9 AM - 7 PM',
        images: JSON.stringify(images),
        providerId: user.id,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      service: newService,
      message: 'Service profile registered successfully.',
    });
  } catch (error: any) {
    console.error('Service creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create service.' }, { status: 500 });
  }
}
