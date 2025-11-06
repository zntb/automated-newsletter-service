// app/actions/dashboard.ts
'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const subscriberCount = await prisma.subscriber.count();
    const activeSubscribers = await prisma.subscriber.count({
      where: { status: 'CONFIRMED' },
    });

    // Calculate open and click rates from email logs
    const emailStats = await prisma.emailLog.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalEmails = emailStats.reduce(
      (sum: number, stat: { _count: number }) => sum + stat._count,
      0,
    );
    const openedCount =
      emailStats.find((s: { status: string }) => s.status === 'opened')
        ?._count || 0;
    const clickedCount =
      emailStats.find((s: { status: string }) => s.status === 'clicked')
        ?._count || 0;

    const openRate =
      totalEmails > 0 ? Math.round((openedCount / totalEmails) * 100) : 0;
    const clickRate =
      totalEmails > 0 ? Math.round((clickedCount / totalEmails) * 100) : 0;

    // Get weekly stats for chart
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);

    const weeklyNewsletters = await prisma.newsletter.findMany({
      where: {
        sentAt: {
          gte: fourWeeksAgo,
        },
      },
      select: {
        sentAt: true,
        recipientCount: true,
        openCount: true,
        clickCount: true,
      },
    });

    // Group by week
    const weeklyStats = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(
        now.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000,
      );
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const weekData = weeklyNewsletters.filter(
        (n: { sentAt: Date | null }) => {
          if (!n.sentAt) return false;
          const date = new Date(n.sentAt);
          return date >= weekStart && date < weekEnd;
        },
      );

      return {
        name: `Week ${i + 1}`,
        subscribers: weekData.reduce(
          (sum: number, n: { recipientCount: number }) =>
            sum + n.recipientCount,
          0,
        ),
        opens: weekData.reduce(
          (sum: number, n: { openCount: number }) => sum + n.openCount,
          0,
        ),
        clicks: weekData.reduce(
          (sum: number, n: { clickCount: number }) => sum + n.clickCount,
          0,
        ),
      };
    });

    return {
      success: true,
      subscriberCount,
      activeSubscribers,
      openRate,
      clickRate,
      weeklyStats,
    };
  } catch (error) {
    console.error('[getDashboardStats Error]', error);
    return {
      success: false,
      error: 'Failed to fetch stats',
      subscriberCount: 0,
      activeSubscribers: 0,
      openRate: 0,
      clickRate: 0,
      weeklyStats: [],
    };
  }
}
