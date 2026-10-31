import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        listing: true,
        renter: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const isParty = booking.renterId === user.id || booking.ownerId === user.id || user.role === 'ADMIN';
    if (!isParty) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Only reveal exact address if booking is confirmed
    const isConfirmed = ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(booking.status);
    if (!isConfirmed && booking.renterId === user.id) {
      booking.listing.exactAddress = null;
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch booking.' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { listing: true, renter: true, owner: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const isOwner = booking.ownerId === user.id;
    const isRenter = booking.renterId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isRenter && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, reason } = body;

    let newStatus = booking.status;
    let notificationRecipientId = '';
    let notificationTitle = '';
    let notificationMessage = '';

    if (action === 'ACCEPT' && (isOwner || isAdmin)) {
      if (booking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only pending requests can be accepted.' }, { status: 400 });
      }
      newStatus = 'ACCEPTED';
      notificationRecipientId = booking.renterId;
      notificationTitle = 'Rental Request Accepted!';
      notificationMessage = `${booking.owner.name} accepted your booking for "${booking.listing.title}". Please proceed with payment.`;
    } else if (action === 'REJECT' && (isOwner || isAdmin)) {
      if (booking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only pending requests can be rejected.' }, { status: 400 });
      }
      newStatus = 'REJECTED';
      notificationRecipientId = booking.renterId;
      notificationTitle = 'Rental Request Declined';
      notificationMessage = `${booking.owner.name} could not accept your booking for "${booking.listing.title}". Reason: ${reason || 'Dates unavailable'}.`;
    } else if (action === 'CANCEL' && (isRenter || isAdmin)) {
      if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
        return NextResponse.json({ error: 'Cannot cancel booking in current state.' }, { status: 400 });
      }
      newStatus = 'CANCELLED';
      notificationRecipientId = booking.ownerId;
      notificationTitle = 'Booking Request Cancelled';
      notificationMessage = `${booking.renter.name} cancelled their booking request for "${booking.listing.title}".`;
    } else if (action === 'MARK_ACTIVE' && (isOwner || isAdmin)) {
      newStatus = 'ACTIVE';
    } else if (action === 'MARK_COMPLETED' && (isOwner || isAdmin)) {
      if (!['CONFIRMED', 'ACTIVE'].includes(booking.status)) {
        return NextResponse.json({ error: 'Only active or confirmed bookings can be completed.' }, { status: 400 });
      }
      newStatus = 'COMPLETED';
      notificationRecipientId = booking.renterId;
      notificationTitle = 'Rental Completed - Leave a Review!';
      notificationMessage = `Your rental for "${booking.listing.title}" is complete. Please share your rating and review.`;
    } else {
      return NextResponse.json({ error: 'Invalid action or permissions.' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        cancellationReason: reason || booking.cancellationReason,
      },
    });

    if (notificationRecipientId && notificationTitle) {
      await prisma.notification.create({
        data: {
          userId: notificationRecipientId,
          title: notificationTitle,
          message: notificationMessage,
          link: isOwner ? '/dashboard/renter' : '/dashboard/owner',
          type: 'SYSTEM',
        },
      });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error('Booking PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update booking status.' }, { status: 500 });
  }
}
