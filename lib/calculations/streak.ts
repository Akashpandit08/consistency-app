/**
 * Streak calculation utilities.
 * Uses LOCAL date (not UTC) to correctly handle timezones like UTC+5:30.
 */

/** Returns today's date as YYYY-MM-DD in LOCAL timezone */
export function todayKey(): string {
  const d = new Date()
  return localDateKey(d)
}

/** Returns a date as YYYY-MM-DD in LOCAL timezone */
export function localDateKey(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** 
 * Calculate current streak from a map of { date: { workout: boolean } }
 * Counts consecutive days (ending today) with a logged workout.
 * Includes today if workout is logged, excludes today if not (avoids punishing users mid-day).
 */
export function calculateStreak(
  history: Record<string, { workout?: string | boolean | null }>
): number {
  const today = todayKey()
  const d = new Date()
  let n = 0
  const MAX = 3650 // 10-year safety cap

  // If today is done, count it; otherwise start from yesterday
  const hasTodayWorkout = !!history[today]?.workout
  if (!hasTodayWorkout) {
    // Don't count today, start from yesterday
    d.setDate(d.getDate() - 1)
  }

  while (n < MAX) {
    const k = localDateKey(d)
    if (!history[k]?.workout) break
    n++
    d.setDate(d.getDate() - 1)
  }

  return n
}

/**
 * Calculate best (all-time) streak from workout history.
 */
export function calculateBestStreak(
  history: Record<string, { workout?: string | boolean | null }>
): number {
  const dates = Object.keys(history)
    .filter((d) => !!history[d]?.workout)
    .sort()

  if (dates.length === 0) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diff === 1) {
      current++
      if (current > best) best = current
    } else {
      current = 1
    }
  }

  return best
}

/**
 * Calculate weekly consistency percentage.
 * Counts workout days in the last 7 days vs the user's target training days.
 */
export function calculateWeeklyConsistency(
  history: Record<string, { workout?: string | boolean | null }>,
  targetDays: number = 5
): number {
  const d = new Date()
  let completed = 0

  for (let i = 0; i < 7; i++) {
    const k = localDateKey(d)
    if (history[k]?.workout) completed++
    d.setDate(d.getDate() - 1)
  }

  return Math.round((completed / targetDays) * 100)
}

/**
 * Get the last N days as YYYY-MM-DD strings (local timezone, newest first).
 */
export function getLastNDays(n: number): string[] {
  const days: string[] = []
  const d = new Date()
  for (let i = 0; i < n; i++) {
    days.push(localDateKey(d))
    d.setDate(d.getDate() - 1)
  }
  return days
}
