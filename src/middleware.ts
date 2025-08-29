import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zido_admin_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Check if we can find token in localStorage via client-side check
  // For server-side, we'll rely on cookie or header
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isRootPage = request.nextUrl.pathname === '/';

  // Redirect unauthenticated users to login for protected pages
  if (!token && isProtectedPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard/users', request.url));
  }

  // Redirect root page to dashboard if authenticated, login if not
  if (isRootPage) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/users', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For all other requests, set token in cookie if it's in header
  const response = NextResponse.next();
  
  // If we have a token in Authorization header but not in cookie, set the cookie
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ') && !request.cookies.get('zido_admin_token')) {
    const tokenFromHeader = authHeader.replace('Bearer ', '');
    response.cookies.set('zido_admin_token', tokenFromHeader, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
