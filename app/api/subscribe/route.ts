// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { subscribeWithPreferences } from '@/app/actions/preferences';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, frequency, categories } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing email' },
        { status: 400 },
      );
    }

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

    // Use subscribeWithPreferences which handles both new and existing subscribers
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
