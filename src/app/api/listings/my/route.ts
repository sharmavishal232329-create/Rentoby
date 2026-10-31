import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        ownerId: user.id,
        status: { not: 'REMOVED' },
      },
      include: {
        category: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ listings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user listings.' }, { status: 500 });
  }
}
