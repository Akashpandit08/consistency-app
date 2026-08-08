import { supabase } from '@/lib/supabase/client'
import type { MealLog, WaterLog, SleepLog } from '@/types'

export async function fetchDailyNutrition(userId: string, dateStr: string) {
  const [meals, water, sleep] = await Promise.all([
    supabase
      .from('meal_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateStr)
      .maybeSingle(),
    supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateStr)
      .maybeSingle(),
    supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', dateStr)
      .maybeSingle(),
  ])

  return {
    mealLog: (meals.data as MealLog) ?? null,
    waterLog: (water.data as WaterLog) ?? null,
    sleepLog: (sleep.data as SleepLog) ?? null,
  }
}
