import { supabase } from '@/lib/supabase/client'
import type { Profile, UserPreferences } from '@/types'

export async function fetchUserProfile(userId: string) {
  const [profileRes, prefsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
  ])

  return {
    profile: (profileRes.data as Profile) ?? null,
    preferences: (prefsRes.data as UserPreferences) ?? null,
  }
}
