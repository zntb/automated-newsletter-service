'use server';

import { prisma } from '@/lib/prisma';
import { sendNewsletter } from '@/lib/email';
import { auth } from '@/auth';

interface SendNewsletterRequest {
  subject: string;
  content: string;
  audience: 'all' | 'active' | 'new' | 'engaged';
}

export async function sendNewsletterAction(data: SendNewsletterRequest) {
  try {
    console.log('[sendNewsletterAction] Starting with data:', data);

    if (!data.subject || !data.content) {
      return {
        success: false,
        error: 'Missing required fields: subject, content',
      };
    }

    // Get authenticated user
    const session = await auth();
    console.log('[sendNewsletterAction] Session:', session);

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    let subscribers: Array<{ id: string; email: string }> = [];

    if (data.audience === 'all') {
      subscribers = await prisma.subscriber.findMany({
        where: { status: 'CONFIRMED' },
        select: { id: true, email: true },
      });
    } else if (data.audience === 'active') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          lastOpenedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, email: true },
      });
    } else if (data.audience === 'new') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true, email: true },
      });
    } else if (data.audience === 'engaged') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          openCount: { gte: 5 },
        },
        select: { id: true, email: true },
      });
    }

    console.log(
      '[sendNewsletterAction] Found subscribers:',
      subscribers.length,
    );
    console.log('[sendNewsletterAction] Subscribers:', subscribers);

    if (subscribers.length === 0) {
      return { success: false, error: 'No subscribers to send to' };
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        title: data.subject,
        subject: data.subject,
        content: data.content,
        status: 'SENDING',
        recipientCount: subscribers.length,
        authorId: session.user.id,
      },
    });

    console.log('[sendNewsletterAction] Newsletter created:', newsletter.id);

    // Send newsletter
    const result = await sendNewsletter({
      subject: data.subject,
      content: data.content,
      audience: data.audience,
      subscribers: subscribers,
      newsletterId: newsletter.id,
    });

    console.log('[sendNewsletterAction] Send result:', result);

    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      newsletterId: newsletter.id,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[sendNewsletterAction Error]', error);
    return { success: false, error: 'Failed to send newsletter' };
  }
}
