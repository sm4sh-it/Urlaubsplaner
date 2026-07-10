import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const authEnabled = process.env.AUTH_ENABLED !== 'false'

  // If auth is explicitly disabled, the app is completely open
  if (!authEnabled) {
    return NextResponse.next()
  }

  // Allow access to login page and public assets
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') || // We protect APIs separately if needed, or allow them internally
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for the auth cookie
  const authCookie = request.cookies.get('sm4sh_auth')
  
  if (authCookie?.value !== 'authenticated') {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Only run middleware on app routes, skip static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
