/* eslint-disable @typescript-eslint/no-explicit-any */
// app/actions/subscriber.ts
'use server';

import { prisma } from '@/lib/prisma';

export interface Subscriber {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  lastOpenedAt: Date | null;
  name: string | null;
  joinedAt: Date | null;
}

interface SubscriberFilter {
  search?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export async function getSubscribers(filters: SubscriberFilter): Promise<{
  success: boolean;
  subscribers?: Subscriber[];
  total?: number;
  page?: number;
  perPage?: number;
  totalPages?: number;
  error?: string;
}> {
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

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 10;

    const [subscribers, total] = await Promise.all([
      prisma.subscriber.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          lastOpenedAt: true,
          name: true,
        },
      }),
      prisma.subscriber.count({ where: filter }),
    ]);

    const formatted = subscribers.map(sub => ({
      id: sub.id,
      email: sub.email,
      status: sub.status,
      createdAt: sub.createdAt,
      lastOpenedAt: sub.lastOpenedAt,
      joinedAt: sub.createdAt,
      name: sub.name,
    }));

    return {
      success: true,
      subscribers: formatted,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
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
      where: { id: { in: ids } },
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

    if (existingSubscriber?.status === 'CONFIRMED') {
      return { success: false, error: 'Already subscribed' };
    }

    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: { status: 'PENDING' },
      create: {
        email,
        name: name || email.split('@')[0],
        status: 'PENDING',
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
