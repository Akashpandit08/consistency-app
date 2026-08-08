'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { todayKey } from '@/lib/calculations/streak'
import { enqueuePendingSync } from '@/lib/offline/store'
import { processSyncQueue } from '@/lib/offline/sync'
import { track } from '@/lib/analytics/events'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { DietScheduleManager } from '@/components/health/DietScheduleManager'
import { CalorieMacroEngine } from '@/components/health/CalorieMacroEngine'
import { HeartRateTracker } from '@/components/health/HeartRateTracker'
import { StepCounter } from '@/components/health/StepCounter'
import { formatWater } from '@/lib/utils'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Utensils,
  Heart,
  Footprints,
  Droplets,
  Moon,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Flame,
  Check,
  BellRing,
} from 'lucide-react'
import type { Habit, UserPreferences } from '@/types'

type HealthTab = 'diet' | 'calories' | 'heart' | 'steps' | 'water' | 'sleep'

export default function HealthNutritionPage() {
  const [activeTab, setActiveTab] = useState<HealthTab>('diet')
  const [today] = useState(() => todayKey())

  // Water state
  const [waterMl, setWaterMl] = useState(1750)
  const [waterTarget, setWaterTarget] = useState(2500)

  // Sleep state
  const [sleepHours, setSleepHours] = useState<string>('7.5')
  const [sleepQuality, setSleepQuality] = useState<number>(4)
  const [sleepLogged, setSleepLogged] = useState(false)

  // Habits state
  const [habits, setHabits] = useState<Array<Habit & { completed: boolean }>>([
    { id: 'h1', user_id: 'local', name: '10 min morning stretch', emoji: '🧘', active: true, order: 0, created_at: new Date().toISOString(), completed: true },
    { id: 'h2', user_id: 'local', name: 'Post-workout protein shake', emoji: '🥤', active: true, order: 1, created_at: new Date().toISOString(), completed: false },
    { id: 'h3', user_id: 'local', name: 'No screen 30m before sleep', emoji: '📵', active: true, order: 2, created_at: new Date().toISOString(), completed: false },
  ])
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState('⚡')
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [savingSleep, setSavingSleep] = useState(false)

  // Load online sync if available
  useEffect(() => {
    async function loadOnline() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [prefsRes, waterRes, sleepRes] = await Promise.all([
          supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('water_logs').select('amount_ml').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
          supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('log_date', today).maybeSingle(),
        ])

        if (prefsRes.data?.water_target_ml) setWaterTarget(prefsRes.data.water_target_ml)
        if (waterRes.data?.amount_ml) setWaterMl(waterRes.data.amount_ml)
        if (sleepRes.data) {
          setSleepLogged(true)
          if (sleepRes.data.duration_minutes) {
            setSleepHours((sleepRes.data.duration_minutes / 60).toFixed(1))
          }
          if (sleepRes.data.quality) setSleepQuality(sleepRes.data.quality)
        }
      } catch {
        // use local
      }
    }
    void loadOnline()
  }, [today])

  // Water log handlers
  async function logWater(delta: number) {
    const next = Math.max(0, waterMl + delta)
    setWaterMl(next)
    track('water_logged', { amount_ml: next })

    const payload = {
      id: crypto.randomUUID(),
      user_id: 'local',
      log_date: today,
      amount_ml: next,
      updated_at: new Date().toISOString(),
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) payload.user_id = user.id
      if (navigator.onLine && user) {
        await supabase.from('water_logs').upsert(payload, { onConflict: 'user_id,log_date' })
      } else {
        await enqueuePendingSync({ table: 'water_logs', operation: 'upsert', payload })
      }
    } catch {
      await enqueuePendingSync({ table: 'water_logs', operation: 'upsert', payload })
    }
  }

  // Sleep log handler
  async function logSleep(e: React.FormEvent) {
    e.preventDefault()
    setSavingSleep(true)
    const mins = Math.round(parseFloat(sleepHours) * 60)
    const payload = {
      id: crypto.randomUUID(),
      user_id: 'local',
      log_date: today,
      duration_minutes: mins,
      quality: sleepQuality as 1 | 2 | 3 | 4 | 5,
      updated_at: new Date().toISOString(),
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) payload.user_id = user.id
      if (navigator.onLine && user) {
        await supabase.from('sleep_logs').upsert(payload, { onConflict: 'user_id,log_date' })
      } else {
        await enqueuePendingSync({ table: 'sleep_logs', operation: 'upsert', payload })
      }
    } catch {
      await enqueuePendingSync({ table: 'sleep_logs', operation: 'upsert', payload })
    }

    setSleepLogged(true)
    setSavingSleep(false)
    track('sleep_logged', { duration_minutes: mins, quality: sleepQuality })
  }

  // Habit toggle
  function toggleHabit(habitId: string) {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, completed: !h.completed } : h))
    )
    track('habit_toggled')
  }

  // Add habit
  function handleAddHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!newHabitName.trim()) return
    const newH: Habit & { completed: boolean } = {
      id: crypto.randomUUID(),
      user_id: 'local',
      name: newHabitName.trim(),
      emoji: newHabitEmoji,
      order: habits.length,
      active: true,
      created_at: new Date().toISOString(),
      completed: false,
    }
    setHabits((prev) => [...prev, newH])
    setNewHabitName('')
    setShowAddHabit(false)
  }

  function handleOpenAlarms() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('consistency_open_notification_settings'))
    }
  }

  const waterPct = Math.min(100, Math.round((waterMl / waterTarget) * 100))

  return (
    <div className="page-section pb-24 text-text-main">
      <TopBar
        title="Diet & Health Superapp"
        subtitle="7-Day Meal Schedule, Alarms, Heartbeat & Steps"
        right={
          <button
            onClick={handleOpenAlarms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#b7ff3c]/15 border border-[#b7ff3c]/30 text-accent font-bold text-xs hover:bg-[#b7ff3c]/25 transition-colors cursor-pointer"
          >
            <BellRing size={14} />
            <span className="hidden sm:inline">Alarms</span>
          </button>
        }
      />

      <div className="px-4 pt-2 flex flex-col gap-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-6 gap-1 p-1 bg-surface rounded-2xl border border-border">
          {[
            { id: 'diet', label: '7-Day Diet', icon: Calendar, color: 'text-accent' },
            { id: 'calories', label: 'Macros', icon: Utensils, color: 'text-orange-400' },
            { id: 'heart', label: 'Pulse', icon: Heart, color: 'text-rose-400' },
            { id: 'steps', label: 'Steps', icon: Footprints, color: 'text-lime-400' },
            { id: 'water', label: 'Water', icon: Droplets, color: 'text-sky-400' },
            { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-purple-400' },
          ].map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as HealthTab)}
                className={cn(
                  'py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer',
                  isSelected
                    ? 'bg-surface-2 text-text-main border border-border shadow-md scale-[1.02]'
                    : 'text-muted hover:text-text-main'
                )}
              >
                <Icon size={16} className={isSelected ? tab.color : ''} />
                <span className="text-[10px] font-bold truncate max-w-full">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 0: 7-Day Day-Wise & Hour-Wise Diet & Meal Schedule */}
        {activeTab === 'diet' && <DietScheduleManager />}

        {/* Tab 1: Calories & Macros */}
        {activeTab === 'calories' && <CalorieMacroEngine dateStr={today} />}

        {/* Tab 2: Heart Rate & Pulse */}
        {activeTab === 'heart' && <HeartRateTracker />}

        {/* Tab 3: Step Counter & Activity */}
        {activeTab === 'steps' && <StepCounter dateStr={today} />}

        {/* Tab 4: Water Hydration */}
        {activeTab === 'water' && (
          <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Droplets size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main">Hydration Tracker</h3>
                  <p className="text-muted text-[11px]">Daily fluid balance & water intake</p>
                </div>
              </div>
              <span className="badge-surface text-sky-400 text-xs font-bold">
                {waterTarget} ml Goal
              </span>
            </div>

            {/* Hero Water Level */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-2 to-surface border border-border space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-muted text-xs font-bold uppercase tracking-wider block">
                    Water Consumed
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-4xl font-black text-sky-400 tabular-nums">
                      {formatWater(waterMl)}
                    </span>
                    <span className="text-xs text-muted font-bold">
                      / {formatWater(waterTarget)} ({waterPct}%)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-muted text-xs font-semibold block">Remaining</span>
                  <span className="text-text-main text-sm font-bold">
                    {formatWater(Math.max(0, waterTarget - waterMl))}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-surface-3 rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-700 shadow-sm shadow-sky-400/30"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>

            {/* Quick Add Water Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted block">
                Quick Log Water:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '+250ml', icon: '🥛', ml: 250 },
                  { label: '+500ml', icon: '🍶', ml: 500 },
                  { label: '+750ml', icon: '🧃', ml: 750 },
                  { label: '+1000ml', icon: '💧', ml: 1000 },
                ].map((item) => (
                  <button
                    key={item.ml}
                    type="button"
                    onClick={() => logWater(item.ml)}
                    className="p-2.5 rounded-xl bg-surface-2 hover:bg-sky-500/15 border border-border hover:border-sky-400/40 text-center transition-all cursor-pointer"
                  >
                    <span className="text-base block">{item.icon}</span>
                    <span className="text-xs font-bold text-text-main block mt-0.5">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => logWater(-250)}
                  disabled={waterMl <= 0}
                  className="text-xs text-muted hover:text-text-main flex items-center gap-1 cursor-pointer disabled:opacity-30"
                >
                  <Minus size={12} /> Undo 250ml
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Sleep & Habits */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            {/* Sleep Logger Card */}
            <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-main">Sleep & Recovery</h3>
                    <p className="text-muted text-[11px]">Duration, sleep score & readiness</p>
                  </div>
                </div>
                {sleepLogged && (
                  <span className="badge-surface text-purple-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Logged
                  </span>
                )}
              </div>

              <form onSubmit={logSleep} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">
                      Sleep Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-sm text-text-main font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted block mb-1">
                      Quality (1 - 5 Stars)
                    </label>
                    <div className="flex gap-1 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSleepQuality(q)}
                          className={cn(
                            'w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer',
                            sleepQuality >= q
                              ? 'bg-purple-500 text-text-main'
                              : 'bg-surface-2 text-muted border border-border'
                          )}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="sm"
                  loading={savingSleep}
                  className="font-bold text-xs"
                >
                  Save Sleep Log
                </Button>
              </form>
            </div>

            {/* Daily Habits Checklist */}
            <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-text-main">Daily Consistency Habits</h3>
                <button
                  type="button"
                  onClick={() => setShowAddHabit(!showAddHabit)}
                  className="text-accent text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={12} /> New Habit
                </button>
              </div>

              {showAddHabit && (
                <form onSubmit={handleAddHabit} className="p-3 rounded-xl bg-surface-2 border border-border space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={newHabitEmoji}
                      onChange={(e) => setNewHabitEmoji(e.target.value)}
                      className="w-10 bg-surface border border-border rounded-lg text-center text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Habit name (e.g. 50 pushups)"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text-main"
                    />
                  </div>
                  <Button type="submit" size="sm" fullWidth className="text-xs font-bold">
                    Add Habit
                  </Button>
                </form>
              )}

              <div className="space-y-2">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={cn(
                      'p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all',
                      h.completed
                        ? 'bg-accent/10 border-accent/40 text-text-main'
                        : 'bg-surface-2 border-border text-muted hover:text-text-main'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{h.emoji}</span>
                      <span className={cn('text-xs font-bold', h.completed ? 'line-through opacity-80' : '')}>
                        {h.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-md flex items-center justify-center border transition-colors',
                        h.completed
                          ? 'bg-accent border-accent text-accent-dark'
                          : 'border-border bg-surface'
                      )}
                    >
                      {h.completed && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
