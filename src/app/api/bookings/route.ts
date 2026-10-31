import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateRentalTotals } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to book this item.' }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, startDate, endDate, fulfillmentType = 'PICKUP' } = body;

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Listing, start date, and end date are required.' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { owner: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.ownerId === user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own listing.' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid dates provided.' }, { status: 400 });
    }

    if (end < start) {
      return NextResponse.json({ error: 'End date cannot be earlier than start date.' }, { status: 400 });
    }

    // 1. Double Booking Prevention: Check for overlapping confirmed or active bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['CONFIRMED', 'ACTIVE', 'ACCEPTED'] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'This item is already booked for the selected dates. Please choose different dates.' },
        { status: 409 }
      );
    }

    // 2. Real Calculations
    const totals = calculateRentalTotals({
      priceDaily: listing.priceDaily,
      startDate: start,
      endDate: end,
      securityDeposit: listing.securityDeposit,
      fulfillmentType,
      deliveryFee: listing.deliveryFee || 0,
    });

    // 3. Create Booking in database
    const booking = await prisma.booking.create({
      data: {
        listingId,
        renterId: user.id,
        ownerId: listing.ownerId,
        startDate: start,
        endDate: end,
        durationDays: totals.durationDays,
        itemTotal: totals.itemTotal,
        platformFee: totals.platformFee,
        securityDeposit: totals.securityDeposit,
        deliveryFee: totals.deliveryFee,
        grandTotal: totals.grandTotal,
        fulfillmentType,
        status: 'PENDING',
      },
      include: {
        listing: true,
        renter: { select: { name: true, email: true, phone: true } },
      },
    });

    // 4. Notify Owner
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        title: 'New Rental Request',
        message: `${user.name} requested to rent "${listing.title}" for ${totals.durationDays} day(s).`,
        link: `/dashboard/owner`,
        type: 'BOOKING_REQUEST',
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Rental request submitted to owner for approval.',
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'renter' | 'owner'

    const where: any = {};
    if (role === 'owner') {
      where.ownerId = user.id;
    } else {
      where.renterId = user.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            city: true,
            localArea: true,
            approxAddress: true,
            exactAddress: true,
          },
        },
        renter: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Address privacy sanitation:
    // Only reveal exactAddress if booking is CONFIRMED, ACTIVE, or COMPLETED
    const sanitizedBookings = bookings.map((b) => {
      const isConfirmed = ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(b.status);
      if (!isConfirmed && b.listing) {
        b.listing.exactAddress = null; // Protected until payment & confirmation
      }
      return b;
    });

    return NextResponse.json({ bookings: sanitizedBookings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch bookings.' }, { status: 500 });
  }
}
