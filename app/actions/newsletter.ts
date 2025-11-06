/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';
import { sendNewsletter } from '@/lib/email';

interface SendNewsletterRequest {
  subject: string;
  content: string;
  audience: 'all' | 'active' | 'new' | 'engaged';
}

export async function sendNewsletterAction(data: SendNewsletterRequest) {
  try {
    if (!data.subject || !data.content) {
      return {
        success: false,
        error: 'Missing required fields: subject, content',
      };
    }

    let subscribers: any[] = [];
    if (data.audience === 'all') {
      subscribers = await prisma.subscriber.findMany({
        where: { status: 'CONFIRMED' },
        select: { email: true },
      });
    } else if (data.audience === 'active') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          lastOpenedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: { email: true },
      });
    } else if (data.audience === 'new') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: { email: true },
      });
    } else if (data.audience === 'engaged') {
      subscribers = await prisma.subscriber.findMany({
        where: {
          status: 'CONFIRMED',
          openCount: { gte: 5 },
        },
        select: { email: true },
      });
    }

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
        authorId: 'system',
      },
    });

    // Send newsletter and create email logs
    const result = await sendNewsletter({
      subject: data.subject,
      content: data.content,
      audience: data.audience,
      subscribers: subscribers.map(s => s.email),
    });

    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        openCount: 0,
        clickCount: 0,
      },
    });

    // Create email logs for tracking
    for (const subscriber of subscribers) {
      const sub = await prisma.subscriber.findUnique({
        where: { email: subscriber.email },
      });

      if (sub) {
        await prisma.emailLog.create({
          data: {
            recipientEmail: subscriber.email,
            subscriberId: sub.id,
            newsletterId: newsletter.id,
            status: 'SENT',
          },
        });
      }
    }

    return {
      success: true,
      newsletterId: newsletter.id,
      ...result,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[sendNewsletterAction Error]', error);
    return { success: false, error: 'Failed to send newsletter' };
  }
}
