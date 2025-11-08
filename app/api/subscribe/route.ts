// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import {
  subscribeWithPreferences,
  getManagePreferencesToken,
} from '@/app/actions/preferences';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, frequency, categories, checkExisting } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email' },
        { status: 400 },
      );
    }

    // If this is just a check for existing subscriber
    if (checkExisting) {
      const subscriber = await prisma.subscriber.findUnique({
        where: { email },
        select: { status: true, id: true },
      });

      if (subscriber && subscriber.status === 'CONFIRMED') {
        // Generate token and redirect to manage preferences
        const tokenResult = await getManagePreferencesToken(email);

        if (tokenResult.success) {
          return NextResponse.json({
            success: true,
            isExisting: true,
            token: tokenResult.token,
            redirectUrl: `/manage-preferences?email=${encodeURIComponent(
              email,
            )}&token=${tokenResult.token}`,
          });
        }
      }

      return NextResponse.json({
        success: true,
        isExisting: false,
      });
    }

    // Original subscription logic
    if (!frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing frequency preference' },
        { status: 400 },
      );
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one category' },
        { status: 400 },
      );
    }

    const result = await subscribeWithPreferences({
      email,
      name,
      frequency,
      categories,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /subscribe] Error', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
