import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { verifyPaymentSignature, recordPaymentTransaction } from '@/lib/payment';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, paymentId, signature, bookingId, serviceBookingId } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Order ID, Payment ID, and Gateway Signature are required for verification.' },
        { status: 400 }
      );
    }

    // 1. Cryptographic HMAC-SHA256 Signature Verification
    const isValid = await verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      bookingId,
      serviceBookingId,
    });

    if (!isValid) {
      // Record failed transaction attempt
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Payment signature verification failed. Untrusted or invalid transaction.' },
        { status: 400 }
      );
    }

    // 2. Verified Successful Transaction — Commit to Database Ledger
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { listing: true, renter: true, owner: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Associated booking not found.' }, { status: 404 });
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' },
      });

      await recordPaymentTransaction({
        bookingId,
        amount: booking.grandTotal,
        orderId,
        paymentId,
        signature,
        status: 'SUCCESS',
      });

      // Dispatch Notifications to both parties
      await prisma.notification.createMany({
        data: [
          {
            userId: booking.ownerId,
            title: 'Payment Received — Booking Confirmed!',
            message: `Payment of ₹${booking.grandTotal} received from ${booking.renter.name} for "${booking.listing.title}". Please prepare the item for pickup/delivery.`,
            link: '/dashboard/owner',
            type: 'PAYMENT_RECEIVED',
          },
          {
            userId: booking.renterId,
            title: 'Payment Confirmed — Pickup Address Unlocked!',
            message: `Your booking for "${booking.listing.title}" is confirmed. Exact address: ${booking.listing.exactAddress || booking.listing.approxAddress}.`,
            link: '/dashboard/renter',
            type: 'BOOKING_ACCEPTED',
          },
        ],
      });
    } else if (serviceBookingId) {
      const sBooking = await prisma.serviceBooking.findUnique({
        where: { id: serviceBookingId },
        include: { service: true, customer: true, provider: true },
      });

      if (!sBooking) {
        return NextResponse.json({ error: 'Associated service booking not found.' }, { status: 404 });
      }

      await prisma.serviceBooking.update({
        where: { id: serviceBookingId },
        data: { status: 'CONFIRMED' },
      });

      await recordPaymentTransaction({
        serviceBookingId,
        amount: sBooking.grandTotal,
        orderId,
        paymentId,
        signature,
        status: 'SUCCESS',
      });

      await prisma.notification.createMany({
        data: [
          {
            userId: sBooking.providerId,
            title: 'Service Booking Paid & Confirmed',
            message: `Payment received for ${sBooking.service.title}. Scheduled for ${sBooking.scheduledDate.toISOString().split('T')[0]} at ${sBooking.scheduledTime}.`,
            link: '/dashboard/provider',
            type: 'PAYMENT_RECEIVED',
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and transaction confirmed in ledger.',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification processing error.' },
      { status: 500 }
    );
  }
}
