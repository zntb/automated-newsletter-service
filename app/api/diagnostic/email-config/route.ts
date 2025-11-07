// Create this file: app/api/diagnostic/email-config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    service: process.env.EMAIL_SERVICE || null,
    user: process.env.EMAIL_USER || null,
    from: process.env.EMAIL_FROM || null,
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || null,
    port: process.env.SMTP_PORT || process.env.EMAIL_PORT || null,
    configured: !!(
      process.env.EMAIL_USER &&
      (process.env.EMAIL_SERVICE ||
        process.env.SMTP_HOST ||
        process.env.EMAIL_HOST)
    ),
  };

  return NextResponse.json(config);
}
