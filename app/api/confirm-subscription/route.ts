// app/api/confirm-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { confirmSubscription } from '@/app/actions/subscriber';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=missing-token', request.url));
  }

  const result = await confirmSubscription(token);

  if (result.success) {
    return NextResponse.redirect(new URL('/?confirmed=true', request.url));
  } else {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent(result.error || 'confirmation-failed')}`,
        request.url,
      ),
    );
  }
}
