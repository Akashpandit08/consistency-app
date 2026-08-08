import { supabase } from '@/lib/supabase/client'
import type { WorkoutSession, ExerciseSet } from '@/types'

export async function fetchUserWorkoutSessions(userId: string, limit = 50): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching workout sessions:', error)
    return []
  }
  return (data as WorkoutSession[]) ?? []
}

export async function fetchSessionSets(sessionId: string): Promise<ExerciseSet[]> {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('session_id', sessionId)
    .order('set_number', { ascending: true })

  if (error) {
    console.error('Error fetching session sets:', error)
    return []
  }
  return (data as ExerciseSet[]) ?? []
}
