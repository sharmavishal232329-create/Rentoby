import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const { action, targetId, value, note } = body;

    if (!action || !targetId) {
      return NextResponse.json({ error: 'Action and Target ID are required.' }, { status: 400 });
    }

    if (action === 'TOGGLE_USER_VERIFY') {
      const user = await prisma.user.findUnique({ where: { id: targetId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: targetId },
        data: { isVerified: !user.isVerified },
      });
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'SET_LISTING_STATUS') {
      const updated = await prisma.listing.update({
        where: { id: targetId },
        data: { status: value },
      });
      return NextResponse.json({ success: true, listing: updated });
    }

    if (action === 'RESOLVE_DISPUTE') {
      const updated = await prisma.dispute.update({
        where: { id: targetId },
        data: {
          status: 'RESOLVED',
          resolution: note || 'Resolved by Administrator',
          resolvedById: admin.id,
        },
      });
      return NextResponse.json({ success: true, dispute: updated });
    }

    return NextResponse.json({ error: 'Unsupported admin action' }, { status: 400 });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN_NOT_ADMIN') {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Admin action failed.' }, { status: 500 });
  }
}
