import type { ExerciseSet, PersonalRecord } from '@/types'

/**
 * PR detection engine.
 * Compares new sets against existing PRs and returns newly achieved PRs.
 */

export interface PRCandidate {
  exercise_id: string
  exercise_name: string
  weight_kg: number
  reps: number
  volume_kg: number
  type: 'weight' | 'reps' | 'volume'
}

/**
 * Detect new PRs from a completed workout's sets.
 * Returns any PRs that beat existing records.
 */
export function detectNewPRs(
  newSets: ExerciseSet[],
  existingPRs: PersonalRecord[]
): PRCandidate[] {
  const newPRs: PRCandidate[] = []

  // Group new sets by exercise
  const byExercise = new Map<string, ExerciseSet[]>()
  for (const set of newSets) {
    if (!set.completed || !set.weight_kg || !set.reps) continue
    const existing = byExercise.get(set.exercise_id) ?? []
    existing.push(set)
    byExercise.set(set.exercise_id, existing)
  }

  for (const [exerciseId, sets] of byExercise) {
    // Best single-set weight × reps (1RM proxy = best weight with any reps)
    const bestWeight = Math.max(...sets.map((s) => s.weight_kg ?? 0))
    const bestReps = Math.max(
      ...sets.filter((s) => s.weight_kg === bestWeight).map((s) => s.reps ?? 0)
    )
    // Total volume in this session for this exercise
    const totalVolume = sets.reduce(
      (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
      0
    )

    const existingPR = existingPRs.find((pr) => pr.exercise_id === exerciseId)
    const exerciseName = sets[0].exercise_name

    if (!existingPR) {
      // First time ever — it's a PR by definition
      if (bestWeight > 0 && bestReps > 0) {
        newPRs.push({
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          weight_kg: bestWeight,
          reps: bestReps,
          volume_kg: totalVolume,
          type: 'weight',
        })
      }
    } else {
      // Weight PR
      if (bestWeight > existingPR.weight_kg) {
        newPRs.push({
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          weight_kg: bestWeight,
          reps: bestReps,
          volume_kg: totalVolume,
          type: 'weight',
        })
      }
      // Volume PR (even if weight not higher, total volume is)
      else if (totalVolume > existingPR.volume_kg * 1.05) {
        // 5% threshold to avoid noise
        newPRs.push({
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          weight_kg: bestWeight,
          reps: bestReps,
          volume_kg: totalVolume,
          type: 'volume',
        })
      }
    }
  }

  return newPRs
}

/**
 * Estimate 1RM using Epley formula: weight * (1 + reps/30)
 */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps === 1) return weightKg
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

/**
 * Format a PR for display.
 */
export function formatPR(pr: PRCandidate): string {
  if (pr.type === 'volume') {
    return `${pr.exercise_name} — Volume PR: ${pr.volume_kg}kg total`
  }
  return `${pr.exercise_name} — ${pr.weight_kg}kg × ${pr.reps}`
}
