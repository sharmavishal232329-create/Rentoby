import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ favorites: [] });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            category: true,
            owner: { select: { name: true, isVerified: true, city: true, localArea: true } },
          },
        },
        service: {
          include: {
            category: true,
            provider: { select: { name: true, isVerified: true, city: true, localArea: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ favorites });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch favorites.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const body = await req.json();
    const { listingId, serviceId } = body;

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        listingId: listingId || null,
        serviceId: serviceId || null,
      },
    });

    if (existing) {
      // Toggle off / remove
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId: listingId || null,
        serviceId: serviceId || null,
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update favorites.' }, { status: 500 });
  }
}
