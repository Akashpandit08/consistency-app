import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    !url.includes('your-project-ref') &&
    key &&
    !key.includes('your-anon-key')
  )
}

/**
 * Returns a singleton Supabase browser client.
 * Lazy-initialized to prevent module-evaluation errors during SSR/build.
 */
export function getSupabaseClient() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  _client = createBrowserClient(url, key)
  return _client
}

// Proxy export so all imports can use `supabase.from(...)` etc. directly
// without changing call sites, while keeping lazy initialization.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop: string) {
    return (getSupabaseClient() as Record<string, unknown>)[prop]
  },
})
