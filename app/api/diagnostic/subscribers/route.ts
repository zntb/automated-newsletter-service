// Create this file: app/api/diagnostic/subscribers/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      select: {
        id: true,
        email: true,
        status: true,
        confirmedAt: true,
        subscribedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('[Diagnostic API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 },
    );
  }
}
