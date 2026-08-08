'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { calculateStreak, todayKey } from '@/lib/calculations/streak'
import { generatePlan, getWeekSchedule, DEFAULT_MEALS, DEFAULT_7DAY_SCHEDULE, DAY_NAMES } from '@/lib/plan/programs'
import {
  getWeeklySchedule,
  getHeartRateLogs,
  getStepLog,
  getCalorieMacroSummary,
} from '@/lib/offline/store'
import { MuscleBadge } from '@/components/exercise/MuscleBadge'
import { EquipmentBadge } from '@/components/exercise/EquipmentBadge'
import { getGreeting, formatWater } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { getSavedDietSchedule } from '@/lib/diet/dietPrograms'
import {
  Zap,
  ChevronRight,
  Droplets,
  Moon,
  CheckCircle2,
  Calendar,
  Heart,
  Footprints,
  Utensils,
  Flame,
  Activity,
  Clock,
  BellRing,
} from 'lucide-react'
import type { DayOfWeek, Profile, UserPreferences, WorkoutDay } from '@/types'


interface DashboardData {
  profile: Profile | null
  prefs: UserPreferences | null
  workoutHistory: Record<string, { workout: string }>
  todayMeals: boolean[]
  waterMl: number
  sleepMinutes: number | null
  habits: Array<{ id: string; name: string; emoji: string; completed: boolean }>
}

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  profile: {
    id: 'demo-user',
    first_name: 'Athlete',
    last_name: null,
    avatar_url: null,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    referral_code: 'CONSISTENT7',
    referred_by: null,
    is_pro: false,
  },
  prefs: {
    id: 'demo-prefs',
    user_id: 'demo-user',
    goal: 'build_muscle',
    experience: 'beginner',
    training_days: 3,
    equipment: 'full_gym',
    training_time: 'evening',
    motivation: 'consistency',
    weight_unit: 'kg',
    height_unit: 'cm',
    calorie_target: null,
    protein_target: null,
    water_target_ml: 2500,
    sleep_target_hours: 8,
    notifications_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  workoutHistory: {},
  todayMeals: [true, false, false, false],
  waterMl: 1250,
  sleepMinutes: 450,
  habits: [
    { id: 'h1', name: '10 min morning stretch', emoji: '🧘', completed: true },
    { id: 'h2', name: 'Post-workout protein shake', emoji: '🥤', completed: false },
    { id: 'h3', name: 'No screen 30m before sleep', emoji: '📵', completed: false },
  ],
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = todayKey()

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Fallback to default demo data
        setData(DEFAULT_DASHBOARD_DATA)
        setLoading(false)
        return
      }

      const [profileRes, prefsRes, logsRes, mealRes, waterRes, sleepRes, habitsRes, habitLogsRes] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
          supabase
            .from('workout_sessions')
            .select('started_at, workout_type, completed_at')
            .eq('user_id', user.id)
            .not('completed_at', 'is', null)
            .order('started_at', { ascending: false })
            .limit(60),
          supabase
            .from('meal_logs')
            .select('completed')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .maybeSingle(),
          supabase
            .from('water_logs')
            .select('amount_ml')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .maybeSingle(),
          supabase
            .from('sleep_logs')
            .select('duration_minutes')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .maybeSingle(),
          supabase
            .from('habits')
            .select('id, name, emoji')
            .eq('user_id', user.id)
            .eq('active', true)
            .order('order'),
          supabase
            .from('habit_logs')
            .select('habit_id, completed')
            .eq('user_id', user.id)
            .eq('log_date', today),
        ])

      // Build workout history map
      const history: Record<string, { workout: string }> = {}
      const logs = (logsRes.data ?? []) as Array<{ started_at: string; workout_type: string }>
      for (const log of logs) {
        const dateStr = log.started_at.slice(0, 10)
        history[dateStr] = { workout: log.workout_type }
      }

      // Build habit completion map
      const habitCompletionMap = new Map<string, boolean>()
      const habitLogs = (habitLogsRes.data ?? []) as Array<{ habit_id: string; completed: boolean }>
      for (const hl of habitLogs) {
        habitCompletionMap.set(hl.habit_id, hl.completed)
      }

      const habitRows = (habitsRes.data ?? []) as Array<{ id: string; name: string; emoji: string }>
      const habits = habitRows.length > 0
        ? habitRows.map((h) => ({
            ...h,
            completed: habitCompletionMap.get(h.id) ?? false,
          }))
        : DEFAULT_DASHBOARD_DATA.habits

      setData({
        profile: (profileRes.data as Profile | null) ?? DEFAULT_DASHBOARD_DATA.profile,
        prefs: (prefsRes.data as UserPreferences | null) ?? DEFAULT_DASHBOARD_DATA.prefs,
        workoutHistory: history,
        todayMeals: (mealRes.data as { completed?: boolean[] } | null)?.completed ?? DEFAULT_DASHBOARD_DATA.todayMeals,
        waterMl: (waterRes.data as { amount_ml?: number } | null)?.amount_ml ?? DEFAULT_DASHBOARD_DATA.waterMl,
        sleepMinutes: (sleepRes.data as { duration_minutes?: number } | null)?.duration_minutes ?? DEFAULT_DASHBOARD_DATA.sleepMinutes,
        habits,
      })
    } catch (err) {
      console.warn('Using offline/demo data for dashboard:', err)
      setData(DEFAULT_DASHBOARD_DATA)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (loading) return <DashboardSkeleton />
  if (error) {
    return (
      <div className="p-4">
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => { setLoading(true); setError(null); void loadData() }} className="text-accent underline text-xs">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { profile, prefs, workoutHistory, todayMeals, waterMl, sleepMinutes, habits } = data
  const streak = calculateStreak(workoutHistory)
  const greeting = getGreeting()
  const firstName = profile?.first_name ?? ''

  // Today's plan from custom 7-day weekly schedule or default
  const dow = (new Date().getDay() || 7) as DayOfWeek
  const dayMeta = DAY_NAMES[dow]
  const savedSched = getWeeklySchedule()?.schedule
  const todayPlan: WorkoutDay = savedSched?.[dow] || DEFAULT_7DAY_SCHEDULE[dow] || DEFAULT_7DAY_SCHEDULE[1]


  const waterTarget = prefs?.water_target_ml ?? 2500
  const waterPct = Math.min(100, Math.round((waterMl / waterTarget) * 100))
  const mealsCompleted = todayMeals.filter(Boolean).length
  const totalMeals = DEFAULT_MEALS.length
  const habitsCompleted = habits.filter((h) => h.completed).length
  const workoutDone = !!workoutHistory[today]

  // Biometrics from local storage
  const stepLog = getStepLog(today)
  const todaySteps = stepLog?.step_count ?? 6420
  const targetSteps = stepLog?.target_steps ?? 10000
  const stepPct = Math.min(100, Math.round((todaySteps / targetSteps) * 100))

  const hrLogs = getHeartRateLogs()
  const latestHr = hrLogs[0]?.bpm ?? 72

  const calSummary = getCalorieMacroSummary(today)
  const consumedCals = calSummary?.consumed_calories ?? 1650
  const targetCals = calSummary?.target_calories ?? 2400
  const calPct = Math.min(100, Math.round((consumedCals / targetCals) * 100))

  // Overall daily completion %
  const components = [
    workoutDone ? 1 : 0,
    mealsCompleted / Math.max(totalMeals, 1),
    waterPct / 100,
    habitsCompleted / Math.max(habits.length, 1),
  ]
  const dailyPct = Math.round(
    (components.reduce((a, b) => a + b, 0) / components.length) * 100
  )

  return (
    <div className="page-section">
      <TopBar
        title="Consistency"
        subtitle="Win today. Repeat tomorrow."
      />

      <div className="px-4 pt-2 flex flex-col gap-4">
        {/* Greeting */}
        <div>
          <p className="text-muted text-sm">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </p>
        </div>

        {/* Streak Hero */}
        <div className="hero-card animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-on-accent text-xs font-black tracking-widest uppercase opacity-80">
                Current Streak
              </p>
              <div className="text-6xl font-black text-on-accent leading-none mt-1">
                {streak}
              </div>
              <p className="text-on-accent font-bold mt-1 text-sm opacity-90">
                {streak === 0
                  ? 'Start your streak today.'
                  : streak === 1
                  ? 'Day 1 — keep going!'
                  : `${streak} days — keep the chain alive!`}
              </p>
            </div>
            <div className="text-5xl">🔥</div>
          </div>

          {/* Daily progress */}
          <div className="mt-4">
            <div className="flex justify-between text-on-accent text-xs font-semibold mb-1.5 opacity-80">
              <span>TODAY&apos;S PROGRESS</span>
              <span>{dailyPct}%</span>
            </div>
            <div className="h-2 bg-on-accent/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-on-accent rounded-full transition-all duration-700 opacity-90"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Workout Mission */}
        <div className="card-lg bg-surface border border-[#222b3a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="badge-accent font-black text-[10px] uppercase tracking-wider">
                {dayMeta?.full}
              </span>
              <h2 className="font-black text-text-main text-base">
                Today&apos;s Mission
              </h2>
            </div>
            {workoutDone && (
              <span className="badge-accent">
                <CheckCircle2 size={12} /> Done
              </span>
            )}
          </div>

          {todayPlan && todayPlan.type !== 'rest' ? (
            <>
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <MuscleBadge
                  muscle={todayPlan.exercises[0]?.exercise.primary_muscle || todayPlan.type}
                  isPrimary
                  size="sm"
                />
                {todayPlan.exercises[0]?.exercise.equipment[0] && (
                  <EquipmentBadge
                    equipment={todayPlan.exercises[0]?.exercise.equipment[0]}
                    size="sm"
                  />
                )}
              </div>

              <h3 className="text-text-main font-black text-xl">{todayPlan.label}</h3>
              <p className="text-muted text-xs mb-3 mt-1">
                {todayPlan.exercises.length} movements •{' '}
                {todayPlan.exercises.reduce((s, ex) => s + ex.sets, 0)} total sets
              </p>

              {/* Quick Exercise Preview Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {todayPlan.exercises.slice(0, 4).map((ex) => (
                  <span
                    key={ex.exercise_id}
                    className="px-2 py-0.5 rounded-lg bg-surface-2 text-[10px] text-text-main/90 font-medium"
                  >
                    {ex.exercise.name}
                  </span>
                ))}
                {todayPlan.exercises.length > 4 && (
                  <span className="text-[10px] text-muted font-bold self-center">
                    +{todayPlan.exercises.length - 4} more
                  </span>
                )}
              </div>

              {!workoutDone ? (
                <Link href="/workout" className="w-full block">
                  <Button fullWidth size="lg" className="font-black">
                    <Zap size={18} />
                    Start {dayMeta?.short} Workout ⚡
                  </Button>
                </Link>
              ) : (
                <Link href="/workout" className="w-full block">
                  <Button variant="outline" fullWidth size="sm">
                    View / Edit Today&apos;s Routine
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💤</span>
                <div>
                  <p className="text-text-main font-bold text-lg">Active Recovery Day</p>
                  <p className="text-muted text-xs">
                    Walk, stretch, and let your body recover for optimal growth.
                  </p>
                </div>
              </div>
              <Link href="/workout" className="w-full block mt-3">
                <Button variant="outline" fullWidth size="sm">
                  Customize Weekly Routine <ChevronRight size={14} />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Today's Scheduled Meals & Hour-Wise Alarms */}
        {(() => {
          const nowDow = (new Date().getDay() === 0 ? 7 : new Date().getDay()) as DayOfWeek
          const dietSchedule = getSavedDietSchedule()
          const dietPlan = dietSchedule.days[nowDow]
          const meals = dietPlan ? dietPlan.meals : []
          const doneMeals = meals.filter((m) => m.completed).length

          return (
            <div className="card-lg bg-surface border border-[#222b3a]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Utensils size={14} />
                  </div>
                  <div>
                    <h2 className="font-black text-text-main text-sm">
                      Today&apos;s Diet Schedule & Alarms
                    </h2>
                    <p className="text-[10px] text-muted">
                      {doneMeals}/{meals.length} meals completed • {dietPlan?.target_calories || 2400} kcal
                    </p>
                  </div>
                </div>

                <Link
                  href="/nutrition"
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-0.5"
                >
                  Manage <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-2">
                {meals.slice(0, 4).map((meal) => (
                  <Link
                    key={meal.id}
                    href="/nutrition"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/70 border border-border/60 hover:border-border-hover transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded-md border border-border flex items-center justify-center text-[10px] shrink-0">
                        {meal.completed ? <span className="text-accent font-bold">✓</span> : <span className="text-muted">{meal.icon || '🥗'}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold text-text-main truncate ${meal.completed ? 'line-through text-muted' : ''}`}>
                          {meal.name}
                        </p>
                        <p className="text-[10px] text-muted truncate">
                          {meal.portion || `${meal.calories} kcal`} • {meal.protein_g}g Protein
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-surface-1 border border-border">
                        {meal.scheduled_time}
                      </span>
                      {meal.alarm_enabled && (
                        <span title="Alarm Active" className="text-amber-400">
                          <BellRing size={11} />
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Comprehensive Health & Fitness Biometrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Steps */}
          <Link href="/nutrition" className="stat-tile hover:border-lime-500/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-lime-400">
                <Footprints size={13} /> Steps
              </span>
              <span className="text-[10px] text-muted">{stepPct}%</span>
            </div>
            <div className="text-xl font-black text-text-main">
              {todaySteps.toLocaleString()}
            </div>
            <div className="text-muted text-[11px]">of {targetSteps.toLocaleString()} goal</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill bg-gradient-to-r from-lime-400 to-emerald-400" style={{ width: `${stepPct}%` }} />
            </div>
          </Link>

          {/* Heart Rate / Pulse */}
          <Link href="/nutrition" className="stat-tile hover:border-rose-500/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart size={13} className="animate-pulse" /> Heart Rate
              </span>
              <span className="text-[10px] text-rose-400/80 font-bold">BPM</span>
            </div>
            <div className="text-xl font-black text-text-main flex items-baseline gap-1">
              {latestHr} <span className="text-xs text-muted font-normal">bpm</span>
            </div>
            <div className="text-muted text-[11px]">Resting & Active pulse</div>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill bg-gradient-to-r from-rose-500 to-amber-400"
                style={{ width: `${Math.min(100, Math.round((latestHr / 180) * 100))}%` }}
              />
            </div>
          </Link>

          {/* Calories */}
          <Link href="/nutrition" className="stat-tile hover:border-accent/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-accent">
                <Flame size={13} /> Calories
              </span>
              <span className="text-[10px] text-muted">{calPct}%</span>
            </div>
            <div className="text-xl font-black text-text-main">
              {consumedCals.toLocaleString()}
            </div>
            <div className="text-muted text-[11px]">of {targetCals.toLocaleString()} kcal</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill bg-gradient-to-r from-accent to-emerald-400" style={{ width: `${calPct}%` }} />
            </div>
          </Link>

          {/* Water */}
          <Link href="/nutrition" className="stat-tile hover:border-sky-500/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Droplets size={13} /> Water
              </span>
              <span className="text-[10px] text-muted">{waterPct}%</span>
            </div>
            <div className="text-xl font-black text-text-main">
              {formatWater(waterMl)}
            </div>
            <div className="text-muted text-[11px]">of {formatWater(waterTarget)}</div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill bg-gradient-to-r from-sky-400 to-cyan-300" style={{ width: `${waterPct}%` }} />
            </div>
          </Link>

          {/* Sleep */}
          <Link href="/nutrition" className="stat-tile hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Moon size={13} /> Sleep
              </span>
            </div>
            <div className="text-xl font-black text-text-main">
              {sleepMinutes
                ? `${Math.floor(sleepMinutes / 60)}h ${sleepMinutes % 60}m`
                : '7.5h'}
            </div>
            <div className="text-muted text-[11px]">
              {sleepMinutes ? 'Recovery logged' : 'Optimal rest'}
            </div>
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill bg-gradient-to-r from-purple-400 to-indigo-400" style={{ width: '92%' }} />
            </div>
          </Link>

          {/* Habits */}
          <Link href="/nutrition" className="stat-tile hover:border-accent/40 transition-colors">
            <div className="flex items-center justify-between text-muted text-xs font-semibold uppercase mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} /> Habits
              </span>
              <span className="text-[10px] text-muted">
                {habitsCompleted}/{Math.max(habits.length, 1)}
              </span>
            </div>
            <div className="text-xl font-black text-text-main">
              {habitsCompleted} Done
            </div>
            <div className="text-muted text-[11px]">Daily consistency</div>
            <div className="progress-bar mt-2">
              <div
                className="progress-bar-fill bg-gradient-to-r from-emerald-400 to-accent"
                style={{
                  width: habits.length > 0
                    ? `${Math.round((habitsCompleted / habits.length) * 100)}%`
                    : '0%',
                }}
              />
            </div>
          </Link>
        </div>

        {/* Habits quick view */}
        {habits.length > 0 && (
          <div className="card">
            <h3 className="font-bold text-text-main mb-3 text-sm uppercase tracking-wide">
              Today&apos;s Habits
            </h3>
            <div className="flex flex-col gap-2">
              {habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <div className={`check-box ${habit.completed ? 'done' : ''}`}>
                    {habit.completed ? '✓' : ''}
                  </div>
                  <span className="text-text-main text-sm">
                    {habit.emoji} {habit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed yesterday message */}
        {streak === 0 && Object.keys(workoutHistory).length > 0 && (
          <div className="card text-center">
            <p className="text-muted text-sm">
              You missed yesterday.{' '}
              <span className="text-text-main font-bold">Today is a new start. 💪</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="page-section px-4 pt-4 flex flex-col gap-4">
      <div className="loading-shimmer h-6 w-40 rounded-lg" />
      <div className="loading-shimmer h-36 rounded-3xl" />
      <div className="loading-shimmer h-40 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="loading-shimmer h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
