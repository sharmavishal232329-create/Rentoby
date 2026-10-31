import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    // Compute real database metrics (Zero invented numbers!)
    const [
      totalUsers,
      activeListings,
      totalListings,
      activeServices,
      totalBookings,
      completedBookings,
      financialAggregates,
      paidVolumeAggregates,
      openDisputes,
      pendingReports,
      recentUsers,
      recentListings,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count(),
      prisma.service.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.aggregate({
        _sum: {
          grandTotal: true,
          platformFee: true,
          itemTotal: true,
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isVerified: true, city: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.listing.findMany({
        include: {
          category: { select: { name: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.booking.findMany({
        include: {
          listing: { select: { title: true } },
          renter: { select: { name: true } },
          owner: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const totalGMV = financialAggregates._sum.grandTotal || 0;
    const totalPlatformRevenue = financialAggregates._sum.platformFee || 0;
    const totalVerifiedPayments = paidVolumeAggregates._sum.amount || 0;

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeListings,
        totalListings,
        activeServices,
        totalBookings,
        completedBookings,
        totalGMV,
        totalPlatformRevenue,
        totalVerifiedPayments,
        openDisputes,
        pendingReports,
      },
      recentUsers,
      recentListings,
      recentBookings,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN_NOT_ADMIN') {
      return NextResponse.json({ error: 'Access denied: Admin role required.' }, { status: 403 });
    }
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics.' }, { status: 500 });
  }
}
