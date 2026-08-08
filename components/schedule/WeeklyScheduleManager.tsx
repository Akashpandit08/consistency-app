'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { DayOfWeek, Exercise, WorkoutDay, WorkoutExercise, CustomWeeklySchedule, EquipmentType } from '@/types'
import {
  DEFAULT_7DAY_SCHEDULE,
  DAY_NAMES,
  PUSH_PULL_LEGS_3DAY,
  UPPER_LOWER_4DAY,
  CLASSIC_SPLIT_5DAY,
  FULL_BODY_3DAY,
  get7DaySchedule,
} from '@/lib/plan/programs'
import { EXERCISES } from '@/lib/plan/exercises'
import { getWeeklySchedule, saveWeeklySchedule } from '@/lib/offline/store'
import { EquipmentBadge } from '@/components/exercise/EquipmentBadge'
import { MuscleBadge } from '@/components/exercise/MuscleBadge'
import { ExerciseBrowserModal } from '@/components/exercise/ExerciseBrowserModal'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Info,
  Zap,
  Moon,
  RotateCcw,
  Check,
  Flame,
  Layers,
  Dumbbell,
  Home,
  Shield,
  Activity,
} from 'lucide-react'

interface WeeklyScheduleManagerProps {
  onStartWorkout: (day: WorkoutDay) => void
  onScheduleChange?: (schedule: Record<number, WorkoutDay>) => void
}

const EQUIPMENT_PRESETS: { id: EquipmentType; name: string; icon: string; desc: string }[] = [
  { id: 'full_gym', name: 'Full Gym', icon: '🏋️', desc: 'Barbells, Cables & Machines' },
  { id: 'home_gym', name: 'Home Gym', icon: '🏠', desc: 'Barbell, DBs, Bench & Bar' },
  { id: 'dumbbells', name: 'Dumbbells', icon: '🧘', desc: '100% Free Weights' },
  { id: 'bodyweight', name: 'Calisthenics', icon: '🤸', desc: 'Zero Equipment Bodyweight' },
]

const PRESETS = [
  {
    id: 'classic_7day',
    name: 'Classic 7-Day Routine',
    desc: 'Chest/Tri (Mon) • Back/Bi (Tue) • Legs/Abs (Wed) • Shoulders (Thu) • Arms (Fri) • Full Body (Sat) • Rest (Sun)',
    badge: 'Recommended',
  },
  {
    id: 'ppl_3day',
    name: '3-Day Push / Pull / Legs',
    desc: 'Mon (Push) • Wed (Pull) • Fri (Legs) • Other days Rest',
    badge: 'Popular',
  },
  {
    id: 'upper_lower_4day',
    name: '4-Day Upper / Lower',
    desc: 'Mon (Upper A) • Tue (Lower A) • Thu (Upper B) • Fri (Lower B)',
    badge: 'Strength',
  },
  {
    id: 'bro_split_5day',
    name: '5-Day Muscle Split',
    desc: 'Mon (Chest) • Tue (Back) • Wed (Shoulders) • Thu (Arms) • Fri (Legs)',
    badge: 'Hypertrophy',
  },
]

export function WeeklyScheduleManager({
  onStartWorkout,
  onScheduleChange,
}: WeeklyScheduleManagerProps) {
  // Determine today's day of week: Mon=1, Tue=2, ..., Sun=7
  const todayDow = useMemo<number>(() => {
    const d = new Date().getDay()
    return d === 0 ? 7 : d
  }, [])

  const [activeDow, setActiveDow] = useState<number>(todayDow)
  const [schedule, setSchedule] = useState<Record<number, WorkoutDay>>(DEFAULT_7DAY_SCHEDULE)
  const [activePreset, setActivePreset] = useState<string>('classic_7day')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType>('full_gym')
  const [showBrowserModal, setShowBrowserModal] = useState(false)
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null)
  const [showPresetMenu, setShowPresetMenu] = useState(false)

  // Load saved custom schedule from localStorage / IndexedDB
  useEffect(() => {
    try {
      const saved = getWeeklySchedule()
      if (saved && saved.schedule) {
        setSchedule(saved.schedule as Record<number, WorkoutDay>)
        if (saved.splitName) {
          setActivePreset(saved.splitName)
          if (['full_gym', 'home_gym', 'dumbbells', 'bodyweight'].includes(saved.splitName)) {
            setSelectedEquipment(saved.splitName as EquipmentType)
          }
        }
        if (onScheduleChange) onScheduleChange(saved.schedule as Record<number, WorkoutDay>)
      }
    } catch {
      // ignore
    }
  }, [onScheduleChange])

  // Save changes permanently
  const persistSchedule = useCallback(
    (newSchedule: Record<number, WorkoutDay>, splitName = activePreset) => {
      setSchedule(newSchedule)
      saveWeeklySchedule({
        userId: 'local_user',
        splitName,
        updatedAt: new Date().toISOString(),
        schedule: newSchedule as Record<DayOfWeek, WorkoutDay>,
      })
      if (onScheduleChange) onScheduleChange(newSchedule)
    },
    [activePreset, onScheduleChange]
  )

  // Apply an equipment preset
  function applyEquipmentPreset(eqKey: EquipmentType) {
    const newSched = get7DaySchedule(eqKey)
    setSelectedEquipment(eqKey)
    setActivePreset(eqKey)
    persistSchedule(newSched, eqKey)
  }

  // Apply a preset
  function applyPreset(presetId: string) {
    let newSched: Record<number, WorkoutDay> = { ...DEFAULT_7DAY_SCHEDULE }

    if (presetId === 'classic_7day') {
      newSched = get7DaySchedule(selectedEquipment)
    } else if (['full_gym', 'home_gym', 'dumbbells', 'bodyweight'].includes(presetId)) {
      newSched = get7DaySchedule(presetId as EquipmentType)
      setSelectedEquipment(presetId as EquipmentType)
    } else if (presetId === 'ppl_3day') {
      newSched = {
        1: { ...PUSH_PULL_LEGS_3DAY.days[0], day: 1, label: 'Monday — Push (Chest, Shoulders & Triceps)' },
        2: { day: 2, label: 'Tuesday — Rest & Recovery 💤', type: 'rest', exercises: [] },
        3: { ...PUSH_PULL_LEGS_3DAY.days[1], day: 3, label: 'Wednesday — Pull (Back & Biceps)' },
        4: { day: 4, label: 'Thursday — Rest & Recovery 💤', type: 'rest', exercises: [] },
        5: { ...PUSH_PULL_LEGS_3DAY.days[2], day: 5, label: 'Friday — Legs & Core' },
        6: { day: 6, label: 'Saturday — Rest / Light Cardio 💤', type: 'rest', exercises: [] },
        7: { day: 7, label: 'Sunday — Rest & Recovery 💤', type: 'rest', exercises: [] },
      }
    } else if (presetId === 'upper_lower_4day') {
      newSched = {
        1: { ...UPPER_LOWER_4DAY.days[0], day: 1, label: 'Monday — Upper Body Power' },
        2: { ...UPPER_LOWER_4DAY.days[1], day: 2, label: 'Tuesday — Lower Body Power' },
        3: { day: 3, label: 'Wednesday — Rest & Mobility 💤', type: 'rest', exercises: [] },
        4: { ...UPPER_LOWER_4DAY.days[2], day: 4, label: 'Thursday — Upper Hypertrophy' },
        5: { ...UPPER_LOWER_4DAY.days[3], day: 5, label: 'Friday — Lower Hypertrophy' },
        6: { day: 6, label: 'Saturday — Rest / Cardio 💤', type: 'rest', exercises: [] },
        7: { day: 7, label: 'Sunday — Rest & Recovery 💤', type: 'rest', exercises: [] },
      }
    } else if (presetId === 'bro_split_5day') {
      newSched = {
        1: { ...CLASSIC_SPLIT_5DAY.days[0], day: 1, label: 'Monday — Chest Day' },
        2: { ...CLASSIC_SPLIT_5DAY.days[1], day: 2, label: 'Tuesday — Back Day' },
        3: { ...CLASSIC_SPLIT_5DAY.days[2], day: 3, label: 'Wednesday — Shoulders & Traps' },
        4: { ...CLASSIC_SPLIT_5DAY.days[3], day: 4, label: 'Thursday — Arms (Bi & Tri)' },
        5: { ...CLASSIC_SPLIT_5DAY.days[4], day: 5, label: 'Friday — Legs & Abs' },
        6: { day: 6, label: 'Saturday — Active Recovery / Cardio 💤', type: 'rest', exercises: [] },
        7: { day: 7, label: 'Sunday — Rest & Recovery 💤', type: 'rest', exercises: [] },
      }
    }

    setActivePreset(presetId)
    setShowPresetMenu(false)
    persistSchedule(newSched, presetId)
  }

  // Toggle Rest Day for active day
  function toggleRestDay(dow: number) {
    const current = schedule[dow]
    if (!current) return

    const isRest = current.type === 'rest'
    let updated: WorkoutDay
    if (isRest) {
      // Revert to default workout
      updated = DEFAULT_7DAY_SCHEDULE[dow] || {
        day: dow,
        label: `${DAY_NAMES[dow]?.full || 'Day'} Workout`,
        type: 'full_body',
        exercises: [],
      }
    } else {
      updated = {
        day: dow,
        label: `${DAY_NAMES[dow]?.full || 'Day'} — Rest & Recovery 💤`,
        type: 'rest',
        exercises: [],
      }
    }

    const nextSched = { ...schedule, [dow]: updated }
    persistSchedule(nextSched)
  }

  // Add exercise to active day
  function handleAddExercise(exercise: Exercise) {
    const current = schedule[activeDow]
    if (!current) return

    const newEx: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise,
      sets: 3,
      rep_range: '10–12',
      rest_seconds: 90,
      order: current.exercises.length + 1,
    }

    const updated: WorkoutDay = {
      ...current,
      type: current.type === 'rest' ? (exercise.primary_muscle as any) || 'full_body' : current.type,
      label:
        current.type === 'rest'
          ? `${DAY_NAMES[activeDow]?.full} — Custom Training`
          : current.label,
      exercises: [...current.exercises, newEx],
    }

    const nextSched = { ...schedule, [activeDow]: updated }
    persistSchedule(nextSched)
  }

  // Remove exercise from active day
  function handleRemoveExercise(exerciseId: string) {
    const current = schedule[activeDow]
    if (!current) return

    const updated: WorkoutDay = {
      ...current,
      exercises: current.exercises.filter((e) => e.exercise_id !== exerciseId),
    }

    const nextSched = { ...schedule, [activeDow]: updated }
    persistSchedule(nextSched)
  }

  // Reorder exercise
  function handleMoveExercise(idx: number, direction: 'up' | 'down') {
    const current = schedule[activeDow]
    if (!current) return
    const list = [...current.exercises]
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= list.length) return

    const temp = list[idx]
    list[idx] = list[targetIdx]
    list[targetIdx] = temp

    const updated: WorkoutDay = { ...current, exercises: list }
    const nextSched = { ...schedule, [activeDow]: updated }
    persistSchedule(nextSched)
  }

  const selectedDay = schedule[activeDow] || DEFAULT_7DAY_SCHEDULE[1]
  const isToday = activeDow === todayDow
  const isRest = selectedDay.type === 'rest'

  // Extract unique equipment in active day
  const dayEquipment = useMemo(() => {
    const set = new Set<string>()
    for (const ex of selectedDay.exercises) {
      for (const eq of ex.exercise.equipment) {
        set.add(eq)
      }
    }
    return Array.from(set)
  }, [selectedDay])

  return (
    <div className="space-y-4">
      {/* Top Controls: Preset Picker & Schedule Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
            <Calendar size={14} /> Weekly Schedule (Mon – Sun)
          </div>
          <p className="text-muted text-[11px]">
            Saved every month • Automatically loads for each day
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetMenu(!showPresetMenu)}
            className="px-2.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-main text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers size={13} className="text-accent" />
            <span>Presets & Splits</span>
          </button>

          {showPresetMenu && (
            <div className="absolute right-0 top-10 w-80 p-2.5 bg-[#0c1017] border border-[#222b3a] rounded-2xl shadow-2xl z-30 space-y-2 animate-scale-up text-text-main">
              <div>
                <p className="text-muted text-[10px] uppercase font-bold px-2 py-0.5">
                  1-Tap Equipment Setup:
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {EQUIPMENT_PRESETS.map((eq) => (
                    <button
                      key={eq.id}
                      type="button"
                      onClick={() => applyEquipmentPreset(eq.id)}
                      className={cn(
                        'p-2 rounded-xl text-left border text-xs transition-all flex flex-col gap-0.5 cursor-pointer',
                        selectedEquipment === eq.id
                          ? 'bg-accent/15 border-accent text-text-main'
                          : 'border-border/60 hover:bg-surface-2 text-muted hover:text-text-main'
                      )}
                    >
                      <span className="font-bold text-[11px] text-text-main flex items-center gap-1">
                        <span>{eq.icon}</span> {eq.name}
                      </span>
                      <span className="text-[9px] text-muted line-clamp-1">{eq.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/40 pt-2 space-y-1">
                <p className="text-muted text-[10px] uppercase font-bold px-2 py-0.5">
                  Popular Workout Splits:
                </p>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={cn(
                      'w-full text-left p-2 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer',
                      activePreset === p.id
                        ? 'bg-accent/15 border border-accent/40 text-text-main'
                        : 'hover:bg-surface-2 text-muted hover:text-text-main'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-main text-xs">{p.name}</span>
                      <span className="badge-surface text-[9px] text-accent font-bold">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted line-clamp-1">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Quick Switch Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider mr-1 whitespace-nowrap">
          Gear:
        </span>
        {EQUIPMENT_PRESETS.map((eq) => {
          const isActive = selectedEquipment === eq.id
          return (
            <button
              key={eq.id}
              type="button"
              onClick={() => applyEquipmentPreset(eq.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer',
                isActive
                  ? 'bg-accent text-text-main border-accent shadow-sm shadow-accent/20'
                  : 'bg-surface-2 text-muted hover:text-text-main border-border hover:border-border-hover'
              )}
            >
              <span>{eq.icon}</span>
              <span>{eq.name}</span>
            </button>
          )
        })}
      </div>

      {/* Monday to Sunday Day Ribbon */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {([1, 2, 3, 4, 5, 6, 7] as DayOfWeek[]).map((dow) => {
          const dayMeta = DAY_NAMES[dow]
          const dayData = schedule[dow]
          const isCurrentToday = dow === todayDow
          const isSelected = dow === activeDow
          const dayIsRest = dayData?.type === 'rest'

          return (
            <button
              key={dow}
              type="button"
              onClick={() => setActiveDow(dow)}
              className={cn(
                'p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-between relative overflow-hidden cursor-pointer min-h-[74px]',
                isSelected
                  ? 'bg-accent/15 border-accent shadow-md shadow-accent/10 text-text-main scale-[1.03]'
                  : 'bg-surface border-border/80 text-muted hover:text-text-main hover:bg-surface-2',
                isCurrentToday && !isSelected && 'border-accent/40 bg-accent/5'
              )}
            >
              {/* Today Pill */}
              {isCurrentToday && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}

              <span className="text-[10px] uppercase font-black tracking-wider text-muted">
                {dayMeta?.short}
              </span>

              <span className="text-base my-0.5">{dayMeta?.emoji}</span>

              <span
                className={cn(
                  'text-[9px] font-bold truncate max-w-full px-1 rounded',
                  dayIsRest ? 'text-blue-300/70' : 'text-accent'
                )}
              >
                {dayIsRest ? 'Rest' : dayData?.type || 'Gym'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Day Main Card */}
      <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main">
        {/* Day Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="badge-accent font-black text-[10px] uppercase tracking-wider">
                {DAY_NAMES[activeDow]?.full}
              </span>
              {isToday && (
                <span className="px-2 py-0.5 rounded-full bg-accent text-accent-dark font-black text-[10px] uppercase tracking-wider animate-pulse">
                  ⚡ TODAY
                </span>
              )}
              <span className="text-muted text-xs font-semibold">
                {isRest
                  ? 'Recovery Day'
                  : `${selectedDay.exercises.length} movements • ${selectedDay.exercises.reduce((s, e) => s + e.sets, 0)} sets`}
              </span>
            </div>
            <h3 className="text-xl font-black text-text-main">{selectedDay.label}</h3>
          </div>

          {/* Rest Day Switcher */}
          <button
            type="button"
            onClick={() => toggleRestDay(activeDow)}
            className={cn(
              'px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0',
              isRest
                ? 'bg-accent/15 border-accent/40 text-accent hover:bg-accent/25'
                : 'bg-surface-2 border-border text-muted hover:text-text-main'
            )}
            title={isRest ? 'Switch to Training Day' : 'Set as Rest Day'}
          >
            <Moon size={14} />
            <span>{isRest ? 'Make Workout Day' : 'Set as Rest Day'}</span>
          </button>
        </div>

        {/* Required Equipment Bar */}
        {!isRest && dayEquipment.length > 0 && (
          <div className="py-2.5 border-b border-border/60 flex items-center gap-1.5 flex-wrap">
            <span className="text-muted text-[10px] font-bold uppercase tracking-wider mr-1">
              Required Machines & Gear:
            </span>
            {dayEquipment.map((eq) => (
              <EquipmentBadge key={eq} equipment={eq} size="sm" />
            ))}
          </div>
        )}

        {/* Exercises List */}
        {isRest ? (
          <div className="py-8 text-center text-muted">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center text-2xl mb-2">
              💤
            </div>
            <h4 className="text-text-main font-bold text-sm">Active Recovery & Rest</h4>
            <p className="text-xs max-w-xs mx-auto mt-1">
              Hydrate, stretch, get 8 hours of quality sleep, and let your muscle fibers repair for maximum hypertrophy.
            </p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => toggleRestDay(activeDow)}
              className="mt-4 text-xs font-bold"
            >
              <Plus size={13} /> Add Workout to {DAY_NAMES[activeDow]?.short}
            </Button>
          </div>
        ) : (
          <div className="py-3 space-y-2">
            {selectedDay.exercises.length === 0 ? (
              <div className="py-6 text-center text-muted">
                <Dumbbell className="mx-auto mb-2 opacity-40" size={28} />
                <p className="text-text-main font-bold text-xs">No exercises scheduled for {DAY_NAMES[activeDow]?.full}</p>
                <p className="text-[11px] mt-0.5">Click below to add movements from the 150+ library</p>
              </div>
            ) : (
              selectedDay.exercises.map((ex, idx) => (
                <div
                  key={ex.exercise_id}
                  className="p-3 rounded-2xl bg-surface-2 border border-border flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 text-center text-muted text-xs font-bold shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <MuscleBadge
                          muscle={ex.exercise.primary_muscle || ex.exercise.muscle_groups[0]}
                          size="sm"
                        />
                        <EquipmentBadge equipment={ex.exercise.equipment[0]} size="sm" />
                      </div>
                      <h4 className="text-text-main font-bold text-sm truncate">
                        {ex.exercise.name}
                      </h4>
                      <p className="text-muted text-[11px] mt-0.5">
                        {ex.sets} sets × {ex.rep_range} reps • {ex.rest_seconds}s rest
                      </p>
                    </div>
                  </div>

                  {/* Actions: Info, Up/Down Reorder, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectingExercise(ex.exercise)}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-3 text-muted hover:text-text-main transition-colors"
                      title="View form cues"
                    >
                      <Info size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveExercise(idx, 'up')}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-3 text-muted hover:text-text-main disabled:opacity-30 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === selectedDay.exercises.length - 1}
                      onClick={() => handleMoveExercise(idx, 'down')}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-3 text-muted hover:text-text-main disabled:opacity-30 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(ex.exercise_id)}
                      className="p-1.5 rounded-lg bg-surface hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
                      title="Remove exercise"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* + Add Exercise Button */}
            <button
              type="button"
              onClick={() => setShowBrowserModal(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-accent/50 text-muted hover:text-accent text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-surface/40 mt-2"
            >
              <Plus size={14} /> + Add Exercise to {DAY_NAMES[activeDow]?.full}
            </button>
          </div>
        )}

        {/* Start Workout Primary CTA */}
        {!isRest && selectedDay.exercises.length > 0 && (
          <div className="pt-3 border-t border-border/70 mt-2">
            <Button
              type="button"
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => onStartWorkout(selectedDay)}
              className="font-black text-base shadow-lg shadow-accent/15"
            >
              <Zap size={18} />
              <span>
                {isToday
                  ? `Start Today's ${DAY_NAMES[activeDow]?.short} Workout ⚡`
                  : `Start ${DAY_NAMES[activeDow]?.full} Workout ⚡`}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Exercise Browser Modal */}
      <ExerciseBrowserModal
        isOpen={showBrowserModal}
        onClose={() => setShowBrowserModal(false)}
        title={`Add Exercise to ${DAY_NAMES[activeDow]?.full}`}
        actionLabel={`+ Add to ${DAY_NAMES[activeDow]?.short}`}
        onSelectExercise={(ex) => {
          handleAddExercise(ex)
        }}
      />

      {/* Exercise Detail Guide Modal */}
      <ExerciseDetailModal
        exercise={inspectingExercise}
        isOpen={Boolean(inspectingExercise)}
        onClose={() => setInspectingExercise(null)}
      />
    </div>
  )
}
