import { type NextRequest, NextResponse } from 'next/server'

/**
 * Supabase magic link callback handler.
 * After user clicks the email link, Supabase redirects here with a code.
 * We exchange the code for a session and redirect to the app.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Exchange code for session using dynamic import to avoid build-time issues
    try {
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        // Redirect to the next page (or dashboard)
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (err) {
      console.error('Auth callback error:', err)
    }
  }

  // On error, redirect to login with error message
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_failed', requestUrl.origin)
  )
}
