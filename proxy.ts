import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route protection middleware.
 * Redirects unauthenticated users from protected routes to /login.
 * Redirects authenticated users from /login to /dashboard.
 *
 * NOTE: Session verification with @supabase/ssr requires cookies.
 * For simplicity, we use the presence of the Supabase auth cookie as a signal.
 * Full server-side session verification would require @supabase/ssr server client.
 */

const PROTECTED_PATHS = ['/dashboard', '/workout', '/nutrition', '/progress', '/settings', '/onboarding']
const AUTH_PATHS = ['/login']

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p))
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Supabase session cookie (any sb- prefixed cookie indicates a session)
  const hasSession = Array.from(request.cookies.getAll()).some(
    (cookie) => cookie.name.startsWith('sb-')
  )

  // Redirect unauthenticated users away from protected routes
  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (isAuthPath(pathname) && hasSession) {
    const next = request.nextUrl.searchParams.get('next')
    return NextResponse.redirect(new URL(next ?? '/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest|api).*)',
  ],
}
