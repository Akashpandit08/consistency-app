import type { WorkoutDay, EquipmentType, ExperienceLevel, UserGoal } from '@/types'
import { EXERCISES, getBestSubstitute } from './exercises'

/**
 * Workout programs database.
 * Equipment-adaptive: exercises auto-substitute based on user's equipment.
 */

export interface Program {
  id: string
  name: string
  description: string
  days_per_week: number
  goal: UserGoal[]
  suitable_for: ExperienceLevel[]
  days: WorkoutDay[]
}

// ─── 1. 3-Day Push / Pull / Legs ──────────────────────────────
export const PUSH_PULL_LEGS_3DAY: Program = {
  id: '3day_ppl',
  name: '3-Day Push / Pull / Legs',
  description: 'The premier balanced routine. Each muscle group gets dedicated focused training once per week.',
  days_per_week: 3,
  goal: ['build_muscle', 'get_stronger', 'improve_fitness', 'general_health'],
  suitable_for: ['beginner', 'intermediate', 'advanced'],
  days: [
    {
      day: 1,
      label: 'Push (Chest, Shoulders & Triceps)',
      type: 'push',
      exercises: [
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 3, rep_range: '8–10', rest_seconds: 90, order: 3 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'tricep_pushdown', exercise: EXERCISES.tricep_pushdown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 2,
      label: 'Pull (Back, Biceps & Rear Delts)',
      type: 'pull',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'lat_pulldown_wide', exercise: EXERCISES.lat_pulldown_wide, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'seated_cable_row', exercise: EXERCISES.seated_cable_row, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'face_pulls', exercise: EXERCISES.face_pulls, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 3,
      label: 'Legs (Quads, Hamstrings, Glutes & Calves)',
      type: 'legs',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 4, rep_range: '6–10', rest_seconds: 120, order: 1 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'leg_press', exercise: EXERCISES.leg_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'lying_leg_curl', exercise: EXERCISES.lying_leg_curl, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
  ],
}

// ─── 2. 4-Day Upper / Lower Split ─────────────────────────────
export const UPPER_LOWER_4DAY: Program = {
  id: '4day_upper_lower',
  name: '4-Day Upper / Lower Split',
  description: 'High frequency routine hitting upper and lower body twice per week with optimal recovery.',
  days_per_week: 4,
  goal: ['build_muscle', 'get_stronger', 'lose_fat'],
  suitable_for: ['intermediate', 'advanced'],
  days: [
    {
      day: 1,
      label: 'Upper Body A (Power & Strength)',
      type: 'upper',
      exercises: [
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 4, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'barbell_bent_over_row', exercise: EXERCISES.barbell_bent_over_row, sets: 4, rep_range: '6–8', rest_seconds: 120, order: 2 },
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 3, rep_range: '6–8', rest_seconds: 90, order: 3 },
        { exercise_id: 'pull_up', exercise: EXERCISES.pull_up, sets: 3, rep_range: '6–10', rest_seconds: 90, order: 4 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '8–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 3, rep_range: '8–12', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 2,
      label: 'Lower Body A (Quad & Glute Power)',
      type: 'lower',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 4, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 4, rep_range: '6–8', rest_seconds: 90, order: 2 },
        { exercise_id: 'leg_press', exercise: EXERCISES.leg_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'lying_leg_curl', exercise: EXERCISES.lying_leg_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'cable_crunch', exercise: EXERCISES.cable_crunch, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 3,
      label: 'Upper Body B (Hypertrophy & Pump)',
      type: 'upper',
      exercises: [
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'lat_pulldown_wide', exercise: EXERCISES.lat_pulldown_wide, sets: 4, rep_range: '10–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'pec_deck_flyes', exercise: EXERCISES.pec_deck_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'seated_cable_row', exercise: EXERCISES.seated_cable_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'face_pulls', exercise: EXERCISES.face_pulls, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 6 },
        { exercise_id: 'incline_dumbbell_curl', exercise: EXERCISES.incline_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 7 },
        { exercise_id: 'tricep_pushdown', exercise: EXERCISES.tricep_pushdown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 8 },
      ],
    },
    {
      day: 4,
      label: 'Lower Body B (Hamstring & Posterior Focus)',
      type: 'lower',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–6', rest_seconds: 120, order: 1 },
        { exercise_id: 'barbell_front_squat', exercise: EXERCISES.barbell_front_squat, sets: 3, rep_range: '8–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'bulgarian_split_squat', exercise: EXERCISES.bulgarian_split_squat, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'seated_leg_curl', exercise: EXERCISES.seated_leg_curl, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'hip_thrust', exercise: EXERCISES.hip_thrust, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
  ],
}

// ─── 3. 5-Day Classic Muscle Split (Bro Split) ────────────────
export const CLASSIC_SPLIT_5DAY: Program = {
  id: '5day_muscle_split',
  name: '5-Day Classic Muscle Split',
  description: 'Dedicated focus on individual muscle groups per workout (Chest, Back, Shoulders, Arms, Legs).',
  days_per_week: 5,
  goal: ['build_muscle', 'improve_fitness'],
  suitable_for: ['beginner', 'intermediate', 'advanced'],
  days: [
    {
      day: 1,
      label: 'Chest Day',
      type: 'chest',
      exercises: [
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'chest_dips', exercise: EXERCISES.chest_dips, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'cable_crossover_mid', exercise: EXERCISES.cable_crossover_mid, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'cable_flyes_low_to_high', exercise: EXERCISES.cable_flyes_low_to_high, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 2, rep_range: 'To Failure', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 2,
      label: 'Back Day',
      type: 'back',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'pull_up', exercise: EXERCISES.pull_up, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'barbell_bent_over_row', exercise: EXERCISES.barbell_bent_over_row, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 3 },
        { exercise_id: 'lat_pulldown_wide', exercise: EXERCISES.lat_pulldown_wide, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'seated_cable_row', exercise: EXERCISES.seated_cable_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'straight_arm_pulldown', exercise: EXERCISES.straight_arm_pulldown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 3,
      label: 'Shoulders & Traps Day',
      type: 'shoulders',
      exercises: [
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'arnold_press', exercise: EXERCISES.arnold_press, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'face_pulls', exercise: EXERCISES.face_pulls, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 4 },
        { exercise_id: 'reverse_pec_deck', exercise: EXERCISES.reverse_pec_deck, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'barbell_shrugs', exercise: EXERCISES.barbell_shrugs, sets: 4, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 4,
      label: 'Arms Day (Biceps & Triceps)',
      type: 'arms',
      exercises: [
        { exercise_id: 'close_grip_bench_press', exercise: EXERCISES.close_grip_bench_press, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'incline_dumbbell_curl', exercise: EXERCISES.incline_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'rope_pushdown', exercise: EXERCISES.rope_pushdown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
        { exercise_id: 'wrist_curls', exercise: EXERCISES.wrist_curls, sets: 3, rep_range: '15–20', rest_seconds: 45, order: 7 },
      ],
    },
    {
      day: 5,
      label: 'Legs & Core Day',
      type: 'legs',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 4, rep_range: '6–10', rest_seconds: 120, order: 1 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'leg_press', exercise: EXERCISES.leg_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'lying_leg_curl', exercise: EXERCISES.lying_leg_curl, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
  ],
}

// ─── 4. 3-Day Full Body ────────────────────────────────────────
export const FULL_BODY_3DAY: Program = {
  id: '3day_full_body',
  name: '3-Day Full Body Workout',
  description: 'Full body stimulation 3 days per week. Maximum muscle protein synthesis frequency.',
  days_per_week: 3,
  goal: ['build_muscle', 'lose_fat', 'general_health'],
  suitable_for: ['beginner', 'intermediate'],
  days: [
    {
      day: 1,
      label: 'Full Body A',
      type: 'full_body',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 3, rep_range: '6–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 3, rep_range: '8–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'lat_pulldown_wide', exercise: EXERCISES.lat_pulldown_wide, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 3, rep_range: '8–10', rest_seconds: 90, order: 4 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 2, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'tricep_pushdown', exercise: EXERCISES.tricep_pushdown, sets: 2, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 2,
      label: 'Full Body B',
      type: 'full_body',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–6', rest_seconds: 120, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'seated_cable_row', exercise: EXERCISES.seated_cable_row, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 2, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    {
      day: 3,
      label: 'Full Body C',
      type: 'full_body',
      exercises: [
        { exercise_id: 'leg_press', exercise: EXERCISES.leg_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'chest_dips', exercise: EXERCISES.chest_dips, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'pull_up', exercise: EXERCISES.pull_up, sets: 3, rep_range: '6–10', rest_seconds: 90, order: 4 },
        { exercise_id: 'face_pulls', exercise: EXERCISES.face_pulls, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'cable_crunch', exercise: EXERCISES.cable_crunch, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 6 },
      ],
    },
  ],
}

export const ALL_PROGRAMS: Record<string, Program> = {
  '3day_ppl': PUSH_PULL_LEGS_3DAY,
  '4day_upper_lower': UPPER_LOWER_4DAY,
  '5day_muscle_split': CLASSIC_SPLIT_5DAY,
  '3day_full_body': FULL_BODY_3DAY,
}

// ─── Plan Generator ───────────────────────────────────────────
interface GeneratePlanParams {
  training_days: number
  equipment: EquipmentType
  goal: UserGoal
  experience: ExperienceLevel
  program_id?: string
}

export function generatePlan(params: GeneratePlanParams): Program {
  let base: Program = PUSH_PULL_LEGS_3DAY

  if (params.program_id && ALL_PROGRAMS[params.program_id]) {
    base = ALL_PROGRAMS[params.program_id]
  } else if (params.training_days >= 5) {
    base = CLASSIC_SPLIT_5DAY
  } else if (params.training_days === 4) {
    base = UPPER_LOWER_4DAY
  } else if (params.training_days <= 3) {
    base = PUSH_PULL_LEGS_3DAY
  }

  // Deep clone and substitute exercises based on available equipment
  const adaptedDays: WorkoutDay[] = base.days.map((d) => ({
    ...d,
    exercises: d.exercises.map((e) => {
      const sub = getBestSubstitute(e.exercise, params.equipment)
      return {
        ...e,
        exercise_id: sub.id,
        exercise: sub,
      }
    }),
  }))

  return {
    ...base,
    days: adaptedDays,
  }
}

// ─── Week Schedule Helper ──────────────────────────────────────
export function getWeekSchedule(program: Program): Record<number, WorkoutDay | null> {
  const schedule: Record<number, WorkoutDay | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
  }

  if (program.days.length === 3) {
    // Mon, Wed, Fri
    schedule[1] = program.days[0]
    schedule[3] = program.days[1]
    schedule[5] = program.days[2]
  } else if (program.days.length === 4) {
    // Mon, Tue, Thu, Fri
    schedule[1] = program.days[0]
    schedule[2] = program.days[1]
    schedule[4] = program.days[2]
    schedule[5] = program.days[3]
  } else if (program.days.length === 5) {
    // Mon - Fri
    schedule[1] = program.days[0]
    schedule[2] = program.days[1]
    schedule[3] = program.days[2]
    schedule[4] = program.days[3]
    schedule[5] = program.days[4]
  } else {
    program.days.forEach((d, i) => {
      if (i < 7) schedule[i + 1] = d
    })
  }

  return schedule
}

// ─── Default Nutrition Structure ──────────────────────────────
export const DEFAULT_MEALS = [
  { name: 'Breakfast', icon: '🍳', target_protein: 35, target_cals: 550 },
  { name: 'Lunch', icon: '🥗', target_protein: 45, target_cals: 700 },
  { name: 'Dinner', icon: '🥩', target_protein: 50, target_cals: 750 },
  { name: 'Snack / Shake', icon: '🥤', target_protein: 25, target_cals: 300 },
]

// ─── Day-Wise Monday to Sunday Meta ───────────────────────────
export const DAY_NAMES: Record<number, { short: string; full: string; emoji: string }> = {
  1: { short: 'Mon', full: 'Monday', emoji: '💥' },
  2: { short: 'Tue', full: 'Tuesday', emoji: '🦅' },
  3: { short: 'Wed', full: 'Wednesday', emoji: '🦵' },
  4: { short: 'Thu', full: 'Thursday', emoji: '🛡️' },
  5: { short: 'Fri', full: 'Friday', emoji: '🦾' },
  6: { short: 'Sat', full: 'Saturday', emoji: '⚡' },
  7: { short: 'Sun', full: 'Sunday', emoji: '🧘' },
}

// ─── Default 7-Day Complete Weekly Routine by Equipment ────────
export const EQUIPMENT_7DAY_SCHEDULES: Record<EquipmentType, Record<number, WorkoutDay>> = {
  full_gym: {
    1: {
      day: 1,
      label: 'Monday — Chest & Triceps Blast (Full Gym)',
      type: 'chest',
      exercises: [
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'pec_deck_flyes', exercise: EXERCISES.pec_deck_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'tricep_pushdown', exercise: EXERCISES.tricep_pushdown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    2: {
      day: 2,
      label: 'Tuesday — Back & Biceps Power (Full Gym)',
      type: 'back',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'lat_pulldown_wide', exercise: EXERCISES.lat_pulldown_wide, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'seated_cable_row', exercise: EXERCISES.seated_cable_row, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'face_pulls', exercise: EXERCISES.face_pulls, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    3: {
      day: 3,
      label: 'Wednesday — Legs & Abs Hypertrophy (Full Gym)',
      type: 'legs',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 4, rep_range: '6–10', rest_seconds: 120, order: 1 },
        { exercise_id: 'leg_press', exercise: EXERCISES.leg_press, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'lying_leg_curl', exercise: EXERCISES.lying_leg_curl, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    4: {
      day: 4,
      label: 'Thursday — Shoulders & Traps (Full Gym)',
      type: 'shoulders',
      exercises: [
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'arnold_press', exercise: EXERCISES.arnold_press, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'reverse_pec_deck', exercise: EXERCISES.reverse_pec_deck, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'barbell_shrugs', exercise: EXERCISES.barbell_shrugs, sets: 4, rep_range: '10–12', rest_seconds: 60, order: 5 },
      ],
    },
    5: {
      day: 5,
      label: 'Friday — Arms & Core Superblast (Full Gym)',
      type: 'arms',
      exercises: [
        { exercise_id: 'close_grip_bench_press', exercise: EXERCISES.close_grip_bench_press, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'incline_dumbbell_curl', exercise: EXERCISES.incline_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'rope_pushdown', exercise: EXERCISES.rope_pushdown, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'cable_crunch', exercise: EXERCISES.cable_crunch, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 6 },
      ],
    },
    6: {
      day: 6,
      label: 'Saturday — Full Body & Conditioning (Full Gym)',
      type: 'full_body',
      exercises: [
        { exercise_id: 'goblet_squat', exercise: EXERCISES.goblet_squat, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 2 },
        { exercise_id: 'single_arm_dumbbell_row', exercise: EXERCISES.single_arm_dumbbell_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'incline_treadmill', exercise: EXERCISES.incline_treadmill, sets: 1, rep_range: '20 min', rest_seconds: 0, order: 4 },
      ],
    },
    7: {
      day: 7,
      label: 'Sunday — Active Recovery & Rest 💤',
      type: 'rest',
      exercises: [],
    },
  },

  home_gym: {
    1: {
      day: 1,
      label: 'Monday — Chest & Triceps (Home Gym)',
      type: 'chest',
      exercises: [
        { exercise_id: 'flat_bench_press', exercise: EXERCISES.flat_bench_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'dumbbell_flyes', exercise: EXERCISES.dumbbell_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'bench_dips', exercise: EXERCISES.bench_dips, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    2: {
      day: 2,
      label: 'Tuesday — Back & Biceps (Home Gym)',
      type: 'back',
      exercises: [
        { exercise_id: 'conventional_deadlift', exercise: EXERCISES.conventional_deadlift, sets: 3, rep_range: '5–8', rest_seconds: 120, order: 1 },
        { exercise_id: 'pull_up', exercise: EXERCISES.pull_up, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'barbell_bent_over_row', exercise: EXERCISES.barbell_bent_over_row, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 3 },
        { exercise_id: 'single_arm_dumbbell_row', exercise: EXERCISES.single_arm_dumbbell_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'incline_dumbbell_curl', exercise: EXERCISES.incline_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 6 },
      ],
    },
    3: {
      day: 3,
      label: 'Wednesday — Legs & Core (Home Gym)',
      type: 'legs',
      exercises: [
        { exercise_id: 'barbell_back_squat', exercise: EXERCISES.barbell_back_squat, sets: 4, rep_range: '6–10', rest_seconds: 120, order: 1 },
        { exercise_id: 'romanian_deadlift', exercise: EXERCISES.romanian_deadlift, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'bulgarian_split_squat', exercise: EXERCISES.bulgarian_split_squat, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'walking_lunges', exercise: EXERCISES.walking_lunges, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    4: {
      day: 4,
      label: 'Thursday — Shoulders & Traps (Home Gym)',
      type: 'shoulders',
      exercises: [
        { exercise_id: 'overhead_press', exercise: EXERCISES.overhead_press, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'arnold_press', exercise: EXERCISES.arnold_press, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'bent_over_rear_delt_flyes', exercise: EXERCISES.bent_over_rear_delt_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'barbell_shrugs', exercise: EXERCISES.barbell_shrugs, sets: 4, rep_range: '10–12', rest_seconds: 60, order: 5 },
      ],
    },
    5: {
      day: 5,
      label: 'Friday — Arms & Core (Home Gym)',
      type: 'arms',
      exercises: [
        { exercise_id: 'close_grip_bench_press', exercise: EXERCISES.close_grip_bench_press, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'standing_barbell_curl', exercise: EXERCISES.standing_barbell_curl, sets: 4, rep_range: '8–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'skull_crushers', exercise: EXERCISES.skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'ab_wheel_rollout', exercise: EXERCISES.ab_wheel_rollout, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    6: {
      day: 6,
      label: 'Saturday — Full Body & Conditioning (Home Gym)',
      type: 'full_body',
      exercises: [
        { exercise_id: 'goblet_squat', exercise: EXERCISES.goblet_squat, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 2 },
        { exercise_id: 'single_arm_dumbbell_row', exercise: EXERCISES.single_arm_dumbbell_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'burpees', exercise: EXERCISES.burpees, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
      ],
    },
    7: {
      day: 7,
      label: 'Sunday — Active Recovery & Rest 💤',
      type: 'rest',
      exercises: [],
    },
  },

  dumbbells: {
    1: {
      day: 1,
      label: 'Monday — Chest & Triceps (Dumbbells Only)',
      type: 'chest',
      exercises: [
        { exercise_id: 'dumbbell_bench_press', exercise: EXERCISES.dumbbell_bench_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'dumbbell_flyes', exercise: EXERCISES.dumbbell_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'dumbbell_skull_crushers', exercise: EXERCISES.dumbbell_skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    2: {
      day: 2,
      label: 'Tuesday — Back & Biceps (Dumbbells Only)',
      type: 'back',
      exercises: [
        { exercise_id: 'single_arm_dumbbell_row', exercise: EXERCISES.single_arm_dumbbell_row, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'dumbbell_rdl', exercise: EXERCISES.dumbbell_rdl, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'standing_dumbbell_curl', exercise: EXERCISES.standing_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'incline_dumbbell_curl', exercise: EXERCISES.incline_dumbbell_curl, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 5 },
        { exercise_id: 'dumbbell_shrugs', exercise: EXERCISES.dumbbell_shrugs, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 6 },
      ],
    },
    3: {
      day: 3,
      label: 'Wednesday — Legs & Lower Body (Dumbbells Only)',
      type: 'legs',
      exercises: [
        { exercise_id: 'goblet_squat', exercise: EXERCISES.goblet_squat, sets: 4, rep_range: '10–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'dumbbell_rdl', exercise: EXERCISES.dumbbell_rdl, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'bulgarian_split_squat', exercise: EXERCISES.bulgarian_split_squat, sets: 3, rep_range: '10–12', rest_seconds: 90, order: 3 },
        { exercise_id: 'walking_lunges', exercise: EXERCISES.walking_lunges, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'russian_twists', exercise: EXERCISES.russian_twists, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 6 },
      ],
    },
    4: {
      day: 4,
      label: 'Thursday — Shoulders & Traps (Dumbbells Only)',
      type: 'shoulders',
      exercises: [
        { exercise_id: 'seated_dumbbell_shoulder_press', exercise: EXERCISES.seated_dumbbell_shoulder_press, sets: 4, rep_range: '8–12', rest_seconds: 90, order: 1 },
        { exercise_id: 'arnold_press', exercise: EXERCISES.arnold_press, sets: 3, rep_range: '8–12', rest_seconds: 90, order: 2 },
        { exercise_id: 'lateral_raise', exercise: EXERCISES.lateral_raise, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'bent_over_rear_delt_flyes', exercise: EXERCISES.bent_over_rear_delt_flyes, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'dumbbell_shrugs', exercise: EXERCISES.dumbbell_shrugs, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 5 },
      ],
    },
    5: {
      day: 5,
      label: 'Friday — Arms & Core (Dumbbells Only)',
      type: 'arms',
      exercises: [
        { exercise_id: 'standing_dumbbell_curl', exercise: EXERCISES.standing_dumbbell_curl, sets: 4, rep_range: '8–12', rest_seconds: 60, order: 1 },
        { exercise_id: 'overhead_tricep_extension', exercise: EXERCISES.overhead_tricep_extension, sets: 4, rep_range: '8–12', rest_seconds: 60, order: 2 },
        { exercise_id: 'hammer_curls', exercise: EXERCISES.hammer_curls, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'dumbbell_skull_crushers', exercise: EXERCISES.dumbbell_skull_crushers, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'russian_twists', exercise: EXERCISES.russian_twists, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 5 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '45–60 sec', rest_seconds: 60, order: 6 },
      ],
    },
    6: {
      day: 6,
      label: 'Saturday — Full Body Dumbbell Burn',
      type: 'full_body',
      exercises: [
        { exercise_id: 'goblet_squat', exercise: EXERCISES.goblet_squat, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 1 },
        { exercise_id: 'single_arm_dumbbell_row', exercise: EXERCISES.single_arm_dumbbell_row, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 2 },
        { exercise_id: 'incline_dumbbell_press', exercise: EXERCISES.incline_dumbbell_press, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 3 },
        { exercise_id: 'walking_lunges', exercise: EXERCISES.walking_lunges, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'burpees', exercise: EXERCISES.burpees, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 5 },
      ],
    },
    7: {
      day: 7,
      label: 'Sunday — Active Recovery & Rest 💤',
      type: 'rest',
      exercises: [],
    },
  },

  bodyweight: {
    1: {
      day: 1,
      label: 'Monday — Push Calisthenics (Bodyweight)',
      type: 'chest',
      exercises: [
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 1 },
        { exercise_id: 'incline_push_up', exercise: EXERCISES.incline_push_up, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 2 },
        { exercise_id: 'decline_push_up', exercise: EXERCISES.decline_push_up, sets: 3, rep_range: '10–15', rest_seconds: 60, order: 3 },
        { exercise_id: 'diamond_push_up', exercise: EXERCISES.diamond_push_up, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'bench_dips', exercise: EXERCISES.bench_dips, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 5 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '45–60 sec', rest_seconds: 60, order: 6 },
      ],
    },
    2: {
      day: 2,
      label: 'Tuesday — Pull Calisthenics (Bodyweight)',
      type: 'back',
      exercises: [
        { exercise_id: 'pull_up', exercise: EXERCISES.pull_up, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'chin_up', exercise: EXERCISES.chin_up, sets: 3, rep_range: '6–10', rest_seconds: 90, order: 2 },
        { exercise_id: 'pull_up_neutral', exercise: EXERCISES.pull_up_neutral, sets: 3, rep_range: '6–10', rest_seconds: 90, order: 3 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '45–60 sec', rest_seconds: 60, order: 5 },
      ],
    },
    3: {
      day: 3,
      label: 'Wednesday — Lower Body Calisthenics (Bodyweight)',
      type: 'legs',
      exercises: [
        { exercise_id: 'bulgarian_split_squat', exercise: EXERCISES.bulgarian_split_squat, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 1 },
        { exercise_id: 'walking_lunges', exercise: EXERCISES.walking_lunges, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 2 },
        { exercise_id: 'standing_calf_raise', exercise: EXERCISES.standing_calf_raise, sets: 4, rep_range: '20–25', rest_seconds: 45, order: 3 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '60 sec', rest_seconds: 60, order: 5 },
      ],
    },
    4: {
      day: 4,
      label: 'Thursday — Upper Body Calisthenics (Bodyweight)',
      type: 'shoulders',
      exercises: [
        { exercise_id: 'decline_push_up', exercise: EXERCISES.decline_push_up, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 1 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 2 },
        { exercise_id: 'bench_dips', exercise: EXERCISES.bench_dips, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 3 },
        { exercise_id: 'diamond_push_up', exercise: EXERCISES.diamond_push_up, sets: 3, rep_range: '10–12', rest_seconds: 60, order: 4 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '60 sec', rest_seconds: 60, order: 5 },
      ],
    },
    5: {
      day: 5,
      label: 'Friday — Arms & Core Calisthenics (Bodyweight)',
      type: 'arms',
      exercises: [
        { exercise_id: 'chin_up', exercise: EXERCISES.chin_up, sets: 4, rep_range: '6–10', rest_seconds: 90, order: 1 },
        { exercise_id: 'diamond_push_up', exercise: EXERCISES.diamond_push_up, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 2 },
        { exercise_id: 'bench_dips', exercise: EXERCISES.bench_dips, sets: 4, rep_range: '15–20', rest_seconds: 60, order: 3 },
        { exercise_id: 'hanging_leg_raise', exercise: EXERCISES.hanging_leg_raise, sets: 3, rep_range: '12–15', rest_seconds: 60, order: 4 },
        { exercise_id: 'russian_twists', exercise: EXERCISES.russian_twists, sets: 3, rep_range: '20–25', rest_seconds: 45, order: 5 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '60 sec', rest_seconds: 60, order: 6 },
      ],
    },
    6: {
      day: 6,
      label: 'Saturday — Full Body Calisthenics HIIT (Bodyweight)',
      type: 'full_body',
      exercises: [
        { exercise_id: 'burpees', exercise: EXERCISES.burpees, sets: 4, rep_range: '12–15', rest_seconds: 60, order: 1 },
        { exercise_id: 'jump_rope', exercise: EXERCISES.jump_rope, sets: 3, rep_range: '60 sec', rest_seconds: 45, order: 2 },
        { exercise_id: 'push_up', exercise: EXERCISES.push_up, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 3 },
        { exercise_id: 'walking_lunges', exercise: EXERCISES.walking_lunges, sets: 3, rep_range: '15–20', rest_seconds: 60, order: 4 },
        { exercise_id: 'plank', exercise: EXERCISES.plank, sets: 3, rep_range: '60 sec', rest_seconds: 60, order: 5 },
      ],
    },
    7: {
      day: 7,
      label: 'Sunday — Active Recovery & Rest 💤',
      type: 'rest',
      exercises: [],
    },
  },
}

export function get7DaySchedule(equipment: EquipmentType = 'full_gym'): Record<number, WorkoutDay> {
  return EQUIPMENT_7DAY_SCHEDULES[equipment] || EQUIPMENT_7DAY_SCHEDULES.full_gym
}

export const DEFAULT_7DAY_SCHEDULE: Record<number, WorkoutDay> = EQUIPMENT_7DAY_SCHEDULES.full_gym


