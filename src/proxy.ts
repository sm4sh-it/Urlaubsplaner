import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function proxy(request: NextRequest) {
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
  const correctPassword = process.env.APP_PASSWORD || ""
  
  const expectedHash = await sha256(correctPassword + '_sm4sh_salt')
  
  if (authCookie?.value !== expectedHash) {
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
