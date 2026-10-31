import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    const user = await getCurrentUser(req);

    // Can search by cuid id or slug
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            localArea: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            author: {
              select: { name: true, avatarUrl: true, city: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'ACTIVE'] },
          },
          select: {
            id: true,
            renterId: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    // Strict Privacy Shield:
    // Only reveal exactAddress if user is the Owner OR has a Confirmed/Active booking
    const isOwner = user && user.id === listing.ownerId;
    const hasConfirmedBooking =
      user &&
      listing.bookings.some((b) => b.renterId === user.id);

    const safeListing = { ...listing };
    if (!isOwner && !hasConfirmedBooking) {
      safeListing.exactAddress = null; // Protected!
    }

    return NextResponse.json({ listing: safeListing });
  } catch (error: any) {
    console.error('Listing detail error:', error);
    return NextResponse.json({ error: 'Failed to retrieve listing.' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this listing.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: body.title !== undefined ? body.title : listing.title,
        description: body.description !== undefined ? body.description : listing.description,
        priceDaily: body.priceDaily !== undefined ? parseFloat(body.priceDaily) : listing.priceDaily,
        priceHourly: body.priceHourly !== undefined ? parseFloat(body.priceHourly) : listing.priceHourly,
        securityDeposit: body.securityDeposit !== undefined ? parseFloat(body.securityDeposit) : listing.securityDeposit,
        status: body.status !== undefined ? body.status : listing.status,
        availabilityStatus: body.availabilityStatus !== undefined ? body.availabilityStatus : listing.availabilityStatus,
        pickupAvailable: body.pickupAvailable !== undefined ? body.pickupAvailable : listing.pickupAvailable,
        deliveryAvailable: body.deliveryAvailable !== undefined ? body.deliveryAvailable : listing.deliveryAvailable,
        deliveryFee: body.deliveryFee !== undefined ? parseFloat(body.deliveryFee) : listing.deliveryFee,
        rentalRules: body.rentalRules !== undefined ? body.rentalRules : listing.rentalRules,
        images: body.images !== undefined ? (Array.isArray(body.images) ? JSON.stringify(body.images) : body.images) : listing.images,
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update listing.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.ownerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: You do not own this listing.' }, { status: 403 });
    }

    // Soft delete by updating status to REMOVED
    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'REMOVED' },
    });

    return NextResponse.json({ success: true, message: 'Listing removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete listing.' }, { status: 500 });
  }
}
