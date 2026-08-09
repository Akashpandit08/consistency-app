import { z } from 'zod'

// ─── Auth ──────────────────────────────────────────────────────
export const emailSchema = z
  .string()
  .email('Please enter a valid email address.')
  .min(5)
  .max(254)

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters.')
  .max(50)

// ─── Onboarding ────────────────────────────────────────────────
export const onboardingSchema = z.object({
  goal: z.enum([
    'build_muscle',
    'lose_fat',
    'get_stronger',
    'improve_fitness',
    'general_health',
  ]),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  training_days: z.union([
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  equipment: z.enum(['full_gym', 'home_gym', 'dumbbells', 'bodyweight']),
  training_time: z.enum(['morning', 'afternoon', 'evening']),
  motivation: z.enum([
    'strength',
    'appearance',
    'health',
    'consistency',
    'competition',
  ]),
  // Optional body data
  weight_kg: z.number().min(30).max(300).nullable().optional(),
  height_cm: z.number().min(100).max(250).nullable().optional(),
  first_name: z.string().min(1).max(50).optional(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

// ─── Workout Set ────────────────────────────────────────────────
export const exerciseSetSchema = z.object({
  exercise_id: z.string().uuid(),
  exercise_name: z.string().min(1).max(100),
  set_number: z.number().int().min(1).max(20),
  weight_kg: z.number().min(0).max(1000).nullable(),
  reps: z.number().int().min(0).max(200).nullable(),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
})

export type ExerciseSetInput = z.infer<typeof exerciseSetSchema>

// ─── Body Metrics ───────────────────────────────────────────────
export const bodyMetricSchema = z
  .object({
    weight_kg: z.number().min(1).max(500).nullable(),
    chest_cm: z.number().min(1).max(200).nullable(),
    waist_cm: z.number().min(1).max(200).nullable(),
    biceps_cm: z.number().min(1).max(100).nullable(),
    body_fat_pct: z.number().min(1).max(60).nullable(),
  })
  .refine(
    (data) =>
      data.weight_kg !== null ||
      data.chest_cm !== null ||
      data.waist_cm !== null ||
      data.biceps_cm !== null ||
      data.body_fat_pct !== null,
    { message: 'Enter at least one measurement.' }
  )

export type BodyMetricInput = z.infer<typeof bodyMetricSchema>

// ─── Water ──────────────────────────────────────────────────────
export const waterLogSchema = z.object({
  amount_ml: z.number().int().min(50).max(2000),
})

// ─── Sleep ──────────────────────────────────────────────────────
export const sleepLogSchema = z.object({
  bedtime: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  wake_time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  quality: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]).nullable().optional(),
})

// ─── Profile ────────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
})

// ─── Habit ──────────────────────────────────────────────────────
export const habitSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().min(1).max(10),
})
