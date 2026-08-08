// ============================================================
// CONSISTENCY — Shared TypeScript Types
// ============================================================

// ─── Auth / User ──────────────────────────────────────────────
export type UserGoal =
  | 'build_muscle'
  | 'lose_fat'
  | 'get_stronger'
  | 'improve_fitness'
  | 'general_health'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type TrainingDays = 2 | 3 | 4 | 5 | 6

export type EquipmentType =
  | 'full_gym'
  | 'home_gym'
  | 'dumbbells'
  | 'bodyweight'

export type TrainingTime = 'morning' | 'afternoon' | 'evening'

export type Motivation =
  | 'strength'
  | 'appearance'
  | 'health'
  | 'consistency'
  | 'competition'

export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  referral_code: string
  referred_by: string | null
  is_pro: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  goal: UserGoal | null
  experience: ExperienceLevel | null
  training_days: TrainingDays | null
  equipment: EquipmentType | null
  training_time: TrainingTime | null
  motivation: Motivation | null
  weight_unit: 'kg' | 'lbs'
  height_unit: 'cm' | 'in'
  calorie_target: number | null
  protein_target: number | null
  water_target_ml: number
  sleep_target_hours: number
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

// ─── Workout ───────────────────────────────────────────────────
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'legs'
  | 'core'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'cardio'
  | 'full_body'

export type EquipmentRequired =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance_band'
  | 'pull_up_bar'
  | 'smith_machine'
  | 'cardio_machine'

export type WorkoutSplitType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'upper'
  | 'lower'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'full_body'
  | 'cardio'
  | 'rest'
  | 'custom'

export interface ExerciseInstruction {
  setup: string
  execution: string
  cues: string[]
}

export interface Exercise {
  id: string
  name: string
  muscle_groups: MuscleGroup[]
  primary_muscle?: MuscleGroup
  secondary_muscles?: MuscleGroup[]
  equipment: EquipmentRequired[]
  is_compound: boolean
  difficulty: ExperienceLevel
  substitutes?: string[] // exercise IDs
  instructions?: string
  instruction_details?: ExerciseInstruction
  video_url?: string
  is_custom?: boolean
}

export interface CustomExercise {
  id: string
  user_id: string
  name: string
  muscle_groups: MuscleGroup[]
  equipment: EquipmentRequired[]
  is_compound: boolean
  difficulty: ExperienceLevel
  instructions?: string
  created_at: string
}

export interface WorkoutDay {
  day: number
  label: string
  type: WorkoutSplitType
  exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  exercise_id: string
  exercise: Exercise
  sets: number
  rep_range: string // e.g. "8-12"
  rest_seconds: number
  notes?: string
  order: number
}

export interface WorkoutSession {
  id: string
  user_id: string
  plan_day: number
  workout_type: string
  started_at: string
  completed_at: string | null
  duration_minutes: number | null
  notes: string | null
  synced: boolean
}

export interface ExerciseSet {
  id: string
  session_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  weight_kg: number | null
  reps: number | null
  rpe: number | null // 1-10
  completed: boolean
  notes: string | null
  logged_at: string
  synced: boolean
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  exercise_name: string
  weight_kg: number
  reps: number
  volume_kg: number // weight * reps
  achieved_at: string
}

// ─── Nutrition ──────────────────────────────────────────────────
export interface MealLog {
  id: string
  user_id: string
  log_date: string
  completed: boolean[]
  created_at: string
  updated_at: string
}

export interface WaterLog {
  id: string
  user_id: string
  log_date: string
  amount_ml: number
  created_at: string
  updated_at: string
}

export interface SleepLog {
  id: string
  user_id: string
  log_date: string
  bedtime: string | null
  wake_time: string | null
  duration_minutes: number | null
  quality: 1 | 2 | 3 | 4 | 5 | null
  created_at: string
}

// ─── Progress ──────────────────────────────────────────────────
export interface BodyMetric {
  id: string
  user_id: string
  weight_kg: number | null
  chest_cm: number | null
  waist_cm: number | null
  biceps_cm: number | null
  body_fat_pct: number | null
  created_at: string
}

// ─── Habits ────────────────────────────────────────────────────
export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  order: number
  active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  log_date: string
  completed: boolean
  created_at: string
}

// ─── Challenges ────────────────────────────────────────────────
export type ChallengeType =
  | 'workout_streak'
  | 'workout_count'
  | 'consistency'
  | 'volume'

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  target_value: number
  duration_days: number | null
  badge_emoji: string
  badge_name: string
  is_active: boolean
  created_at: string
}

export interface ChallengeMember {
  id: string
  user_id: string
  challenge_id: string
  challenge: Challenge
  joined_at: string
  completed_at: string | null
  current_value: number
  is_completed: boolean
}

// ─── Achievements ──────────────────────────────────────────────
export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  emoji: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  achievement: Achievement
  earned_at: string
}

// ─── Referrals ─────────────────────────────────────────────────
export interface Referral {
  id: string
  referrer_id: string
  referee_id: string | null
  code: string
  clicked_at: string
  signup_at: string | null
  activated_at: string | null // first workout completed
  status: 'pending' | 'signed_up' | 'activated'
}

// ─── Offline / Sync ────────────────────────────────────────────
export type SyncStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error'

export interface PendingSync {
  id: string
  table: string
  operation: 'insert' | 'update' | 'upsert'
  payload: Record<string, unknown>
  created_at: number // timestamp ms
  retries: number
}

export interface ActiveWorkoutState {
  sessionId: string
  workoutType: string
  startedAt: string
  sets: ExerciseSet[]
  currentExerciseIndex: number
  isDraft: boolean
}

// ─── Dashboard ─────────────────────────────────────────────────
export interface DailyStats {
  date: string
  workoutCompleted: boolean
  workoutType: string | null
  mealsCompleted: number
  totalMeals: number
  waterMl: number
  waterTargetMl: number
  sleepMinutes: number | null
  habitsCompleted: number
  totalHabits: number
}

// ─── Analytics ────────────────────────────────────────────────
export type AnalyticsEvent =
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'workout_started'
  | 'workout_completed'
  | 'workout_abandoned'
  | 'set_logged'
  | 'pr_achieved'
  | 'meal_logged'
  | 'meal_completed'
  | 'water_logged'
  | 'sleep_logged'
  | 'habit_toggled'
  | 'habit_created'
  | 'body_metrics_logged'
  | 'profile_updated'
  | 'referral_link_copied'
  | 'data_exported'
  | 'challenge_started'
  | 'challenge_completed'
  | 'share_clicked'
  | 'referral_clicked'
  | 'referral_signup'
  | 'pwa_installed'
  | 'notification_enabled'
  | 'account_deleted'
  | 'progress_photo_uploaded'

export interface AnalyticsEventPayload {
  event: AnalyticsEvent
  user_id?: string
  properties?: Record<string, unknown>
  timestamp?: string
}

export type BodyMetrics = BodyMetric

// ─── 7-Day Weekly Routine Schedule ────────────────────────────
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7 // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun

export interface CustomWeeklySchedule {
  userId: string
  splitName: string
  updatedAt: string
  schedule: Record<DayOfWeek, WorkoutDay>
}

// ─── Heart Rate & Pulse Tracking ──────────────────────────────
export type HeartRateZone = 'recovery' | 'fat_burn' | 'cardio' | 'peak'

export interface HeartRateLog {
  id: string
  user_id: string
  bpm: number
  type: 'resting' | 'workout' | 'current' | 'walking'
  zone: HeartRateZone
  notes?: string
  logged_at: string
}

// ─── Step Counter & Activity Tracking ─────────────────────────
export interface StepLog {
  id: string
  user_id: string
  log_date: string
  step_count: number
  target_steps: number
  distance_km: number
  calories_burned: number
  updated_at: string
}

// ─── Calorie & Macro Nutrition Engine ─────────────────────────
export interface MealFoodItem {
  id: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  portion?: string
}

export interface CalorieMealLog {
  id: string
  meal_key: string
  name: string
  icon: string
  completed: boolean
  target_calories: number
  target_protein: number
  items: MealFoodItem[]
}

export interface DailyCalorieMacroSummary {
  log_date: string
  target_calories: number
  consumed_calories: number
  target_protein_g: number
  consumed_protein_g: number
  target_carbs_g: number
  consumed_carbs_g: number
  target_fats_g: number
  consumed_fats_g: number
  meals: CalorieMealLog[]
}

// ─── Day-Wise & Hour-Wise Diet & Meal Planner ─────────────────
export type MealType =
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'pre_workout'
  | 'dinner'
  | 'post_workout'
  | 'night_snack'

export interface ScheduledMealDish {
  id: string
  name: string
  meal_type: MealType
  scheduled_time: string // e.g. "08:00", "13:30", "20:00"
  icon: string
  image_url?: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  portion: string
  notes?: string
  completed: boolean
  alarm_enabled: boolean
}

export interface DayDietPlan {
  day: DayOfWeek
  day_name: string
  target_calories: number
  target_protein_g: number
  target_carbs_g: number
  target_fats_g: number
  meals: ScheduledMealDish[]
}

export interface WeeklyDietSchedule {
  id: string
  preset_name: string
  updated_at: string
  days: Record<DayOfWeek, DayDietPlan>
}

// ─── Universal Notification & Alarm System ────────────────────
export type AlarmTone = 'chime' | 'energetic' | 'gentle' | 'hydration' | 'fanfare'

export interface AppAlarmConfig {
  id: string
  title: string
  type: 'workout' | 'meal' | 'water' | 'sleep' | 'habit'
  time: string // "HH:MM" 24-hr format e.g. "08:00", "18:30"
  days: DayOfWeek[] // 1=Mon .. 7=Sun
  enabled: boolean
  tone: AlarmTone
  meal_name?: string
  message: string
}

export interface ActiveAlarmTrigger {
  id: string
  alarm: AppAlarmConfig
  triggered_at: string
  is_snoozed?: boolean
}

export interface NotificationSettings {
  enabled: boolean
  browser_permission: 'default' | 'granted' | 'denied'
  sound_enabled: boolean
  vibration_enabled: boolean
  alarms: AppAlarmConfig[]
}

// ─── Progress Photos & Calendar Progress ──────────────────────
export type PhotoPoseTag = 'front' | 'side' | 'back' | 'flexed' | 'other'

export interface ProgressPhotoEntry {
  id: string
  user_id: string
  date: string // "YYYY-MM-DD"
  url: string // Data URL or remote URL (WebP compressed)
  pose: PhotoPoseTag
  weight_kg?: number
  body_fat_pct?: number
  notes?: string
  compressed_size_kb: number
  compression_ratio: number
  created_at: string
}

export interface DayProgressSummary {
  date: string // "YYYY-MM-DD"
  workout_done: boolean
  workout_name?: string
  workout_duration_min?: number
  weight_kg?: number
  body_fat_pct?: number
  calories_consumed?: number
  calories_target?: number
  water_ml?: number
  photos: ProgressPhotoEntry[]
}



