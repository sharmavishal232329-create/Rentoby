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

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Fetch messages for a specific conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            include: {
              sender: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
      }

      const isParticipant =
        conversation.participantOneId === user.id ||
        conversation.participantTwoId === user.id;

      if (!isParticipant) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }

      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          recipientId: user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ conversation });
    }

    // List all conversations for current user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participantOneId: user.id },
          { participantTwoId: user.id },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Populate participant details
    const populated = await Promise.all(
      conversations.map(async (c) => {
        const otherUserId = c.participantOneId === user.id ? c.participantTwoId : c.participantOneId;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, name: true, city: true, localArea: true, avatarUrl: true },
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            recipientId: user.id,
            isRead: false,
          },
        });

        return {
          ...c,
          otherUser,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ conversations: populated });
  } catch (error: any) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, content, conversationId: existingConvId, listingId, serviceId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty.' }, { status: 400 });
    }

    let conversationId = existingConvId;

    if (!conversationId) {
      if (!recipientId) {
        return NextResponse.json({ error: 'Recipient ID is required.' }, { status: 400 });
      }

      // Find or create conversation between participantOne and participantTwo
      let conv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participantOneId: user.id, participantTwoId: recipientId },
            { participantOneId: recipientId, participantTwoId: user.id },
          ],
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            participantOneId: user.id,
            participantTwoId: recipientId,
            listingId,
            serviceId,
            lastMessage: content.trim(),
            lastMessageAt: new Date(),
          },
        });
      }
      conversationId = conv.id;
    }

    // Verify user is in conversation
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const actualRecipientId =
      conv.participantOneId === user.id ? conv.participantTwoId : conv.participantOneId;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        recipientId: actualRecipientId,
        content: content.trim(),
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: actualRecipientId,
        title: `New message from ${user.name}`,
        message: content.trim().substring(0, 80),
        link: `/dashboard/messages?conversationId=${conversationId}`,
        type: 'MESSAGE',
      },
    });

    return NextResponse.json({ success: true, message, conversationId });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
