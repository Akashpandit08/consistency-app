'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { startSyncEngine } from '@/lib/offline/sync'
import { BottomNav } from '@/components/layout/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const syncCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Start sync engine
    syncCleanupRef.current = startSyncEngine()

    // If Supabase is not configured or demo mode is active, allow local testing
    if (typeof document !== 'undefined' && document.cookie.includes('sb-demo-auth-token')) {
      return
    }

    // Auth guard: redirect to login if no session
    supabase.auth.getSession().then((res: { data: { session: unknown } }) => {
      const session = res.data?.session as { user: { id: string } } | null
      if (!session) {
        if (typeof document !== 'undefined' && !document.cookie.includes('sb-demo-auth-token')) {
          router.push('/login')
        }
        return
      }

      // Check onboarding completion
      supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single()
        .then((profileRes: { data: { onboarding_completed: boolean } | null }) => {
          if (profileRes.data && !profileRes.data.onboarding_completed) {
            router.push('/onboarding')
          }
        })
    }).catch(() => {
      // Ignore network errors in demo/local mode
    })

    // Listen for sign-out
    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: unknown) => {
      if (!session && typeof document !== 'undefined' && !document.cookie.includes('sb-demo-auth-token')) {
        router.push('/login')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
      syncCleanupRef.current?.()
    }
  }, [router])

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-lg mx-auto">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
