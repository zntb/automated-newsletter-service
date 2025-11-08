// app/api/confirm-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmSubscription } from '@/app/actions/subscriber';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/confirmation?error=missing-token', request.url),
    );
  }

  const result = await confirmSubscription(token);

  if (result.success) {
    // Include subscriber details in the redirect if available
    const params = new URLSearchParams({
      confirmed: 'true',
      ...(result.subscriber?.email && { email: result.subscriber.email }),
      ...(result.subscriber?.name && { name: result.subscriber.name }),
    });
    return NextResponse.redirect(
      new URL(`/confirmation?${params.toString()}`, request.url),
    );
  } else {
    return NextResponse.redirect(
      new URL(
        `/confirmation?error=${encodeURIComponent(
          result.error || 'confirmation-failed',
        )}`,
        request.url,
      ),
    );
  }
}
