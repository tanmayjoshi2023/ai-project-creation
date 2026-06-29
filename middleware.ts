import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Protected paths
  const isProtectedPath =
    path.startsWith('/research') ||
    path.startsWith('/compare') ||
    path.startsWith('/analyze') ||
    path.startsWith('/analysis')

  const isAuthPath = path.startsWith('/sign-in') || path.startsWith('/sign-up')

  // Check for session token cookie
  const token =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token')

  if (isProtectedPath && !token) {
    const signInUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }

  if (isAuthPath && token) {
    const homeUrl = new URL('/', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
