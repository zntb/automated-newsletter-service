// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';
import { addSubscriber } from '@/app/actions/subscriber';

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

    // call your existing server action
    const result = await addSubscriber(email, name);

    // NOTE: addSubscriber currently only creates the subscriber & sends confirmation email.
    // If you want to store frequency/categories in SubscriberPreference, add code here
    // to create subscriber preferences (using prisma) after addSubscriber returns successfully.

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /subscribe] Error', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
