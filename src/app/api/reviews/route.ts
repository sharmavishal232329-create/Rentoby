import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, serviceBookingId, rating, comment } = body;

    const numRating = parseInt(rating, 10);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Review comment must be at least 5 characters.' }, { status: 400 });
    }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { review: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
      }

      if (booking.renterId !== user.id) {
        return NextResponse.json({ error: 'Only the renter can review this transaction.' }, { status: 403 });
      }

      // Enforce: Only COMPLETED bookings can be reviewed
      if (booking.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Reviews can only be submitted after the rental is completed.' },
          { status: 400 }
        );
      }

      if (booking.review) {
        return NextResponse.json({ error: 'You have already reviewed this rental.' }, { status: 409 });
      }

      const review = await prisma.review.create({
        data: {
          authorId: user.id,
          targetUserId: booking.ownerId,
          listingId: booking.listingId,
          bookingId: booking.id,
          rating: numRating,
          comment: comment.trim(),
        },
      });

      return NextResponse.json({ success: true, review });
    } else if (serviceBookingId) {
      const sBooking = await prisma.serviceBooking.findUnique({
        where: { id: serviceBookingId },
        include: { review: true },
      });

      if (!sBooking) {
        return NextResponse.json({ error: 'Service booking not found.' }, { status: 404 });
      }

      if (sBooking.customerId !== user.id) {
        return NextResponse.json({ error: 'Only the customer can review this service.' }, { status: 403 });
      }

      if (sBooking.status !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Reviews can only be submitted after the service is completed.' },
          { status: 400 }
        );
      }

      if (sBooking.review) {
        return NextResponse.json({ error: 'You have already reviewed this service.' }, { status: 409 });
      }

      const review = await prisma.review.create({
        data: {
          authorId: user.id,
          targetUserId: sBooking.providerId,
          serviceId: sBooking.serviceId,
          serviceBookingId: sBooking.id,
          rating: numRating,
          comment: comment.trim(),
        },
      });

      return NextResponse.json({ success: true, review });
    }

    return NextResponse.json({ error: 'Booking ID or Service Booking ID is required.' }, { status: 400 });
  } catch (error: any) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
