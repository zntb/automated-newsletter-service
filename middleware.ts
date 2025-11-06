// middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export default auth(req => {
  const isLoggedIn = !!req.auth;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/admin/login';

  // Protect admin routes
  if (isAdminRoute && !isLoginPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
