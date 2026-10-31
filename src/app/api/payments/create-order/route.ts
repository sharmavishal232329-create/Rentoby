import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createPaymentOrder } from '@/lib/payment';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for payment.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, serviceBookingId } = body;

    if (!bookingId && !serviceBookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    let amount = 0;
    let receipt = '';

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { listing: true },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Rental booking not found.' }, { status: 404 });
      }

      if (booking.renterId !== user.id) {
        return NextResponse.json({ error: 'You are not authorized to pay for this booking.' }, { status: 403 });
      }

      amount = booking.grandTotal;
      receipt = `rcpt_b_${booking.id.substring(0, 10)}`;
    } else if (serviceBookingId) {
      const sBooking = await prisma.serviceBooking.findUnique({
        where: { id: serviceBookingId },
        include: { service: true },
      });

      if (!sBooking) {
        return NextResponse.json({ error: 'Service booking not found.' }, { status: 404 });
      }

      if (sBooking.customerId !== user.id) {
        return NextResponse.json({ error: 'You are not authorized to pay for this service booking.' }, { status: 403 });
      }

      amount = sBooking.grandTotal;
      receipt = `rcpt_sb_${sBooking.id.substring(0, 10)}`;
    }

    const order = await createPaymentOrder({
      amountInINR: amount,
      receipt,
      notes: {
        userId: user.id,
        bookingId: bookingId || '',
        serviceBookingId: serviceBookingId || '',
      },
    });

    // Save/update initial payment attempt in database
    await prisma.payment.upsert({
      where: {
        bookingId: bookingId || 'none',
      },
      update: {
        amount,
        orderId: order.orderId,
        status: 'CREATED',
      },
      create: {
        bookingId: bookingId || null,
        serviceBookingId: serviceBookingId || null,
        amount,
        orderId: order.orderId,
        status: 'CREATED',
        currency: 'INR',
        provider: 'RAZORPAY',
        receipt,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      isSandboxNotice: (order as any).isSandboxNotice,
    });
  } catch (error: any) {
    console.error('Create payment order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize payment gateway order.' }, { status: 500 });
  }
}
