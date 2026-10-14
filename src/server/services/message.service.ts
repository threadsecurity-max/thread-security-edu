import { prisma } from '../database/prisma';

// Fallback in-memory messages if database is disconnected
interface MemoryMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

interface MemoryConversation {
  id: string;
  participantAId: string;
  participantBId: string;
  updatedAt: Date;
  createdAt: Date;
  participantA: { id: string; name: string | null; email: string; role: string };
  participantB: { id: string; name: string | null; email: string; role: string };
  messages: MemoryMessage[];
}

const memoryConversations: Map<string, MemoryConversation> = new Map();

export async function getAdminConversationsService(adminId: string) {
  try {
    const conversations = await (prisma as any).adminConversation.findMany({
      where: {
        OR: [{ participantAId: adminId }, { participantBId: adminId }],
      },
      include: {
        participantA: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tsIdentity: { select: { tsId: true } },
            studentProfile: {
              select: { batch: { select: { batchCode: true, title: true } } },
            },
          },
        },
        participantB: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            tsIdentity: { select: { tsId: true } },
            studentProfile: {
              select: { batch: { select: { batchCode: true, title: true } } },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations;
  } catch (error) {
    console.warn('Prisma conversation fetch failed, using fallback:', error);
    return Array.from(memoryConversations.values()).filter(
      (c) => c.participantAId === adminId || c.participantBId === adminId
    );
  }
}

export async function getConversationMessagesService(conversationId: string) {
  try {
    const messages = await (prisma as any).adminMessage.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return messages;
  } catch (error) {
    console.warn('Prisma message fetch failed, using fallback:', error);
    const conv = memoryConversations.get(conversationId);
    return conv ? conv.messages : [];
  }
}

export async function sendAdminMessageService(
  senderId: string,
  recipientId: string,
  content: string
) {
  try {
    // Find or create conversation
    let conv = await (prisma as any).adminConversation.findFirst({
      where: {
        OR: [
          { participantAId: senderId, participantBId: recipientId },
          { participantAId: recipientId, participantBId: senderId },
        ],
      },
    });

    if (!conv) {
      conv = await (prisma as any).adminConversation.create({
        data: {
          participantAId: senderId,
          participantBId: recipientId,
        },
      });
    }

    const message = await (prisma as any).adminMessage.create({
      data: {
        conversationId: conv.id,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await (prisma as any).adminConversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    try {
      await (prisma as any).notification.create({
        data: {
          userId: recipientId,
          title: 'Direct Directive from Academic Admin',
          message: content.length > 120 ? content.slice(0, 117) + '...' : content,
          type: 'DIRECT_MESSAGE',
          linkUrl: '/messages',
        },
      });
    } catch (notifErr) {
      console.warn('[Message Service] Notification creation ignored:', notifErr);
    }

    return { conversationId: conv.id, message };
  } catch (error) {
    console.warn('Prisma send message failed, using fallback:', error);
    const convKey = [senderId, recipientId].sort().join('_');
    let conv = memoryConversations.get(convKey);

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        participantAId: senderId,
        participantBId: recipientId,
        createdAt: new Date(),
        updatedAt: new Date(),
        participantA: { id: senderId, name: 'Admin', email: 'admin@threadsecurity.com', role: 'ADMIN' },
        participantB: { id: recipientId, name: 'Faculty Member', email: 'faculty@threadsecurity.com', role: 'MENTOR' },
        messages: [],
      };
      memoryConversations.set(convKey, conv);
      memoryConversations.set(conv.id, conv);
    }

    const message: MemoryMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conv.id,
      senderId,
      content,
      isRead: false,
      createdAt: new Date(),
      sender: { id: senderId, name: 'Admin', email: 'admin@threadsecurity.com', role: 'ADMIN' },
    };

    conv.messages.push(message);
    conv.updatedAt = new Date();

    return { conversationId: conv.id, message };
  }
}
