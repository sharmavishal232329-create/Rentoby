import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculatePlatformFee } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to book a service.' }, { status: 401 });
    }

    const body = await req.json();
    const { serviceId, scheduledDate, scheduledTime, durationHours = 1, notes } = body;

    if (!serviceId || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Service, scheduled date, and time are required.' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 404 });
    }

    if (service.providerId === user.id) {
      return NextResponse.json({ error: 'You cannot book your own service.' }, { status: 400 });
    }

    const duration = parseFloat(durationHours.toString()) || 1;
    let serviceFee = 0;
    if (service.pricingType === 'HOURLY' && service.hourlyRate) {
      serviceFee = service.hourlyRate * duration;
    } else if (service.fixedRate) {
      serviceFee = service.fixedRate;
    } else {
      serviceFee = 500; // baseline
    }

    const platformFee = calculatePlatformFee(serviceFee);
    const grandTotal = serviceFee + platformFee;

    const booking = await prisma.serviceBooking.create({
      data: {
        serviceId,
        customerId: user.id,
        providerId: service.providerId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        durationHours: duration,
        serviceFee,
        platformFee,
        grandTotal,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
      include: {
        service: true,
        customer: { select: { name: true, email: true, phone: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: service.providerId,
        title: 'New Service Booking Request',
        message: `${user.name} requested "${service.title}" on ${new Date(scheduledDate).toISOString().split('T')[0]} at ${scheduledTime}.`,
        link: '/dashboard/provider',
        type: 'BOOKING_REQUEST',
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Service booking request sent to provider.',
    });
  } catch (error: any) {
    console.error('Service booking error:', error);
    return NextResponse.json({ error: 'Failed to book service.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'customer' | 'provider'

    const where: any = {};
    if (role === 'provider') {
      where.providerId = user.id;
    } else {
      where.customerId = user.id;
    }

    const bookings = await prisma.serviceBooking.findMany({
      where,
      include: {
        service: true,
        customer: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        provider: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
        payment: true,
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch service bookings.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, action } = body;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: { service: true, customer: true, provider: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Service booking not found.' }, { status: 404 });
    }

    const isProvider = booking.providerId === user.id;
    const isCustomer = booking.customerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isProvider && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    let newStatus = booking.status;
    let notifyUserId = '';
    let notifyTitle = '';
    let notifyMessage = '';

    if (action === 'ACCEPT' && (isProvider || isAdmin)) {
      newStatus = 'ACCEPTED';
      notifyUserId = booking.customerId;
      notifyTitle = 'Service Request Accepted!';
      notifyMessage = `${booking.provider.name} accepted your booking for "${booking.service.title}". Please proceed with payment.`;
    } else if (action === 'REJECT' && (isProvider || isAdmin)) {
      newStatus = 'REJECTED';
      notifyUserId = booking.customerId;
      notifyTitle = 'Service Request Declined';
      notifyMessage = `${booking.provider.name} could not accept your booking for "${booking.service.title}".`;
    } else if (action === 'MARK_COMPLETED' && (isProvider || isAdmin)) {
      newStatus = 'COMPLETED';
      notifyUserId = booking.customerId;
      notifyTitle = 'Service Completed — Leave a Review!';
      notifyMessage = `The service "${booking.service.title}" has been completed. Please rate the provider.`;
    } else if (action === 'CANCEL' && (isCustomer || isAdmin)) {
      newStatus = 'CANCELLED';
      notifyUserId = booking.providerId;
      notifyTitle = 'Service Booking Cancelled';
      notifyMessage = `${booking.customer.name} cancelled their booking for "${booking.service.title}".`;
    }

    const updated = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    if (notifyUserId && notifyTitle) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          title: notifyTitle,
          message: notifyMessage,
          link: isProvider ? '/dashboard/renter' : '/dashboard/provider',
          type: 'SYSTEM',
        },
      });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update service booking.' }, { status: 500 });
  }
}
