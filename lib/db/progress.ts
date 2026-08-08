import { supabase } from '@/lib/supabase/client'
import type { PersonalRecord, BodyMetrics } from '@/types'

export async function fetchPersonalRecords(userId: string): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (error) {
    console.error('Error fetching PRs:', error)
    return []
  }
  return (data as PersonalRecord[]) ?? []
}

export async function fetchBodyMetricsHistory(userId: string, limit = 30): Promise<BodyMetrics[]> {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching body metrics:', error)
    return []
  }
  return (data as BodyMetrics[]) ?? []
}
