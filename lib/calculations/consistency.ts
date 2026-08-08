/**
 * Consistency calculations engine
 */

export interface ConsistencyScoreInput {
  workoutDaysCompleted: number
  workoutDaysTarget: number
  mealsLoggedDays: number
  totalDays: number
  waterDaysMet: number
}

/**
 * Calculates an overall consistency index (0-100) based on workout adherence,
 * meal tracking adherence, and hydration targets over a given period.
 */
export function calculateConsistencyScore(input: ConsistencyScoreInput): number {
  const {
    workoutDaysCompleted,
    workoutDaysTarget,
    mealsLoggedDays,
    totalDays,
    waterDaysMet,
  } = input

  if (totalDays <= 0) return 0

  const workoutScore = Math.min(1, workoutDaysCompleted / Math.max(1, workoutDaysTarget))
  const mealScore = Math.min(1, mealsLoggedDays / totalDays)
  const waterScore = Math.min(1, waterDaysMet / totalDays)

  // Weighted composite score: 50% workouts, 30% nutrition, 20% water
  const weighted = workoutScore * 0.5 + mealScore * 0.3 + waterScore * 0.2
  return Math.round(weighted * 100)
}

/**
 * Returns an evaluation tier and motivational message based on consistency score.
 */
export function getConsistencyTier(score: number): {
  tier: 'elite' | 'great' | 'building' | 'starting'
  label: string
  message: string
} {
  if (score >= 90) {
    return {
      tier: 'elite',
      label: 'Elite Consistency 🔥',
      message: 'Unstoppable. You are in the top 1% of disciplined athletes.',
    }
  }
  if (score >= 75) {
    return {
      tier: 'great',
      label: 'Strong Rhythm 💪',
      message: 'Great momentum. Keep stacking wins every day.',
    }
  }
  if (score >= 50) {
    return {
      tier: 'building',
      label: 'Building Momentum ⚡',
      message: 'Good foundation. Focus on winning one day at a time.',
    }
  }
  return {
    tier: 'starting',
    label: 'Getting Started 🌱',
    message: 'Every champion started here. Just show up today.',
  }
}
