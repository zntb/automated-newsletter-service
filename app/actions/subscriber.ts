/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from '@/lib/prisma';

interface SubscriberFilter {
  search?: string;
  status?: string;
}

export async function getSubscribers(filters: SubscriberFilter) {
  try {
    const filter: any = {};
    if (filters.search) {
      filter.email = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }
    if (filters.status && filters.status !== 'all') {
      filter.status = filters.status;
    }

    const subscribers = await prisma.subscriber.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        lastOpenedAt: true,
        name: true,
      },
    });

    // Format for frontend
    const formatted = subscribers.map(
      (sub: {
        id: string;
        email: string;
        status: string;
        createdAt: string | number | Date;
        lastOpenedAt: string | number | Date;
      }) => ({
        id: sub.id,
        email: sub.email,
        status: sub.status,
        joinedDate: new Date(sub.createdAt).toISOString().split('T')[0],
        lastOpened: sub.lastOpenedAt
          ? new Date(sub.lastOpenedAt).toISOString().split('T')[0]
          : null,
      }),
    );

    return { success: true, subscribers: formatted };
  } catch (error) {
    console.error('[getSubscribers Error]', error);
    return { success: false, error: 'Failed to fetch subscribers' };
  }
}

export async function deleteSubscribers(ids: string[]) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: 'Invalid subscriber IDs' };
    }

    await prisma.subscriber.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return {
      success: true,
      message: `Deleted ${ids.length} subscriber(s)`,
    };
  } catch (error) {
    console.error('[deleteSubscribers Error]', error);
    return { success: false, error: 'Failed to delete subscribers' };
  }
}

export async function addSubscriber(email: string, name?: string) {
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'confirmed') {
        return { success: false, error: 'Already subscribed' };
      }
    }

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: { status: 'pending' },
      create: {
        email,
        name: name || email.split('@')[0],
        status: 'pending',
      },
    });

    return {
      success: true,
      message: 'Successfully subscribed!',
      email: subscriber.email,
    };
  } catch (error) {
    console.error('[addSubscriber Error]', error);
    return { success: false, error: 'Failed to subscribe' };
  }
}
