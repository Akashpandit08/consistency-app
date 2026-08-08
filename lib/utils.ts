/**
 * Utility: cn() - merge class names (like clsx/twMerge but minimal)
 * Avoids adding a full clsx dependency for simple use.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Format a local date YYYY-MM-DD to a human-readable string */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00') // force local timezone
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

/** Format duration in minutes to "Xh Ym" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Format water in ml to human-readable */
export function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)}L`
  return `${ml}ml`
}

/** Get greeting based on current hour */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** Generate a random referral code */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Safe number parse with fallback */
export function safeNum(val: string | null | undefined, fallback: number = 0): number {
  if (!val) return fallback
  const n = Number(val)
  return isNaN(n) ? fallback : n
}
