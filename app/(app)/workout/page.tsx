'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import {
  DEFAULT_7DAY_SCHEDULE,
  DAY_NAMES,
  PUSH_PULL_LEGS_3DAY,
} from '@/lib/plan/programs'
import { EXERCISES } from '@/lib/plan/exercises'
import {
  saveActiveWorkout,
  getActiveWorkout,
  clearActiveWorkout,
  enqueuePendingSync,
  getWeeklySchedule,
} from '@/lib/offline/store'
import { processSyncQueue } from '@/lib/offline/sync'
import { detectNewPRs } from '@/lib/calculations/prs'
import { track } from '@/lib/analytics/events'
import { soundFx } from '@/lib/audio/workoutAudio'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { WeeklyScheduleManager } from '@/components/schedule/WeeklyScheduleManager'
import { EquipmentBadge } from '@/components/exercise/EquipmentBadge'
import { MuscleBadge } from '@/components/exercise/MuscleBadge'
import { ExerciseBrowserModal } from '@/components/exercise/ExerciseBrowserModal'
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Timer,
  Trophy,
  Zap,
  Plus,
  Info,
  RotateCcw,
  Flame,
  Calendar,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { DayOfWeek, Exercise, WorkoutDay, WorkoutExercise } from '@/types'

interface SetState {
  exerciseId: string
  exerciseName: string
  setNum: number
  weight: string
  reps: string
  completed: boolean
}

type WorkoutPhase = 'schedule' | 'active' | 'complete'

export default function WorkoutPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<WorkoutPhase>('schedule')
  const [selectedDay, setSelectedDay] = useState<WorkoutDay | null>(null)
  const [sets, setSets] = useState<SetState[]>([])
  const [sessionId] = useState(() => crypto.randomUUID())
  const [startedAt] = useState(() => new Date().toISOString())
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [restActive, setRestActive] = useState(false)
  const [prAchieved, setPrAchieved] = useState<string[]>([])
  const [existingPRs, setExistingPRs] = useState<Array<{ exercise_id: string; weight_kg: number; volume_kg: number }>>([])
  const [saving, setSaving] = useState(false)

  // Modals state
  const [showBrowserModal, setShowBrowserModal] = useState(false)
  const [browserMode, setBrowserMode] = useState<'add_to_active' | 'swap_current'>('add_to_active')
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null)

  const restTimerRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Initial check for active drafts or PRs ─────────────────
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const prsRes = await supabase.from('personal_records').select('exercise_id, weight_kg, volume_kg').eq('user_id', user.id)
          if (prsRes.data) {
            setExistingPRs(prsRes.data as Array<{ exercise_id: string; weight_kg: number; volume_kg: number }>)
          }
        }
      } catch (err) {
        console.warn('Using offline PRs:', err)
      }

      // Check for active draft in local IndexedDB
      try {
        const draft = await getActiveWorkout()
        if (draft && draft.sets && draft.sets.length > 0) {
          setSets(draft.sets.map((s) => ({
            exerciseId: s.exercise_id,
            exerciseName: s.exercise_name,
            setNum: s.set_number,
            weight: s.weight_kg?.toString() ?? '',
            reps: s.reps?.toString() ?? '',
            completed: s.completed,
          })))

          const dow = (new Date().getDay() || 7) as DayOfWeek
          const savedSched = getWeeklySchedule()?.schedule
          const todayWorkout = savedSched?.[dow] || DEFAULT_7DAY_SCHEDULE[dow] || DEFAULT_7DAY_SCHEDULE[1]

          setSelectedDay(todayWorkout)
          setPhase('active')
        }
      } catch (err) {
        console.warn('Draft check error:', err)
      }
    }
    void init()
  }, [])

  // ─── Rest timer (with zero-cost Web Audio synthesized cues) ──
  useEffect(() => {
    if (restActive && restSeconds > 0) {
      if (restSeconds <= 3 && restSeconds >= 1) {
        soundFx.playTick(880 + (4 - restSeconds) * 110, 0.08)
      }
      restTimerRef.current = setTimeout(() => setRestSeconds((s) => s - 1), 1000)
    } else if (restSeconds === 0 && restActive) {
      soundFx.playRestFinished()
      setRestActive(false)
    }
    return () => { if (restTimerRef.current) clearTimeout(restTimerRef.current) }
  }, [restActive, restSeconds])

  // ─── Auto-save draft ────────────────────────────────────────
  const saveDraft = useCallback(() => {
    if (phase !== 'active' || !selectedDay) return
    const state = {
      sessionId,
      workoutType: selectedDay.type,
      startedAt,
      sets: sets.map((s) => ({
        id: crypto.randomUUID(),
        session_id: sessionId,
        exercise_id: s.exerciseId,
        exercise_name: s.exerciseName,
        set_number: s.setNum,
        weight_kg: s.weight ? parseFloat(s.weight) : null,
        reps: s.reps ? parseInt(s.reps) : null,
        rpe: null,
        completed: s.completed,
        notes: null,
        logged_at: new Date().toISOString(),
        synced: false,
      })),
      currentExerciseIndex: currentExIdx,
      isDraft: true,
    }
    void saveActiveWorkout(state)
  }, [phase, selectedDay, sets, currentExIdx, sessionId, startedAt])

  useEffect(() => { saveDraft() }, [sets, saveDraft])

  // ─── Start Workout ───────────────────────────────────────────
  function startWorkout(day: WorkoutDay) {
    if (!day || !day.exercises || day.exercises.length === 0) return
    setSelectedDay(day)
    setCurrentExIdx(0)
    const initialSets: SetState[] = []
    for (const ex of day.exercises) {
      for (let i = 1; i <= ex.sets; i++) {
        initialSets.push({
          exerciseId: ex.exercise_id,
          exerciseName: ex.exercise.name,
          setNum: i,
          weight: '',
          reps: '',
          completed: false,
        })
      }
    }
    setSets(initialSets)
    setPhase('active')
    track('workout_started', { workout_type: day.type })
  }

  // ─── Add Exercise to Active Workout ──────────────────────────
  function handleAddExerciseToActive(exercise: Exercise) {
    if (!selectedDay) return
    const newWorkoutEx: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      sets: 3,
      rep_range: '10–12',
      rest_seconds: 90,
      order: selectedDay.exercises.length + 1,
    }

    const updatedDay: WorkoutDay = {
      ...selectedDay,
      exercises: [...selectedDay.exercises, newWorkoutEx],
    }
    setSelectedDay(updatedDay)

    const newSets: SetState[] = [1, 2, 3].map((num) => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setNum: num,
      weight: '',
      reps: '',
      completed: false,
    }))
    setSets((prev) => [...prev, ...newSets])
    setCurrentExIdx(updatedDay.exercises.length - 1)
  }

  // ─── Swap Current Active Exercise ────────────────────────────
  function handleSwapCurrentExercise(newEx: Exercise) {
    if (!selectedDay) return
    const currentEx = selectedDay.exercises[currentExIdx]
    if (!currentEx) return

    const oldId = currentEx.exercise_id
    const updatedExercises = [...selectedDay.exercises]
    updatedExercises[currentExIdx] = {
      ...currentEx,
      exercise_id: newEx.id,
      exercise: newEx,
    }
    setSelectedDay({ ...selectedDay, exercises: updatedExercises })

    setSets((prev) =>
      prev.map((s) =>
        s.exerciseId === oldId
          ? { ...s, exerciseId: newEx.id, exerciseName: newEx.name }
          : s
      )
    )
  }

  // ─── Add Extra Set to Current Exercise ───────────────────────
  function handleAddSet(exerciseId: string, exerciseName: string) {
    const existingSets = sets.filter((s) => s.exerciseId === exerciseId)
    const nextSetNum = existingSets.length + 1
    const newSet: SetState = {
      exerciseId,
      exerciseName,
      setNum: nextSetNum,
      weight: '',
      reps: '',
      completed: false,
    }
    setSets((prev) => [...prev, newSet])
  }

  // ─── Update set field ────────────────────────────────────────
  function updateSet(idx: number, field: 'weight' | 'reps', value: string) {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)))
  }

  // ─── Mark set complete + start rest timer ───────────────────
  function completeSet(idx: number) {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, completed: true } : s)))
    track('set_logged')
    soundFx.playSetCompleted()

    const set = sets[idx]
    if (selectedDay) {
      const ex = selectedDay.exercises.find((e) => e.exercise_id === set.exerciseId)
      if (ex) {
        setRestSeconds(ex.rest_seconds || 90)
        setRestActive(true)
      }
    }
  }

  // ─── Finish workout ──────────────────────────────────────────
  async function finishWorkout() {
    if (!selectedDay) return
    setSaving(true)
    setRestActive(false)
    soundFx.playWorkoutComplete()

    let userId = 'demo-user'
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    } catch {
      // offline
    }

    const completedAt = new Date().toISOString()
    const durationMs = new Date(completedAt).getTime() - new Date(startedAt).getTime()
    const durationMins = Math.max(1, Math.round(durationMs / 60000))

    const completedSets = sets.filter((s) => s.completed || s.weight || s.reps)
    const setsPayload = completedSets.map((s) => ({
      id: crypto.randomUUID(),
      session_id: sessionId,
      user_id: userId,
      exercise_id: s.exerciseId,
      exercise_name: s.exerciseName,
      set_number: s.setNum,
      weight_kg: s.weight ? parseFloat(s.weight) : 0,
      reps: s.reps ? parseInt(s.reps) : 10,
      completed: true,
      logged_at: new Date().toISOString(),
    }))

    const sessionPayload = {
      id: sessionId,
      user_id: userId,
      plan_day: selectedDay.day,
      workout_type: selectedDay.type,
      started_at: startedAt,
      completed_at: completedAt,
      duration_minutes: durationMins,
    }

    if (navigator.onLine && userId !== 'demo-user') {
      try {
        await supabase.from('workout_sessions').upsert(sessionPayload)
        if (setsPayload.length > 0) {
          await supabase.from('exercise_sets').insert(setsPayload)
        }
        await processSyncQueue()
      } catch {
        await enqueuePendingSync({ table: 'workout_sessions', operation: 'upsert', payload: sessionPayload })
        for (const sp of setsPayload) {
          await enqueuePendingSync({ table: 'exercise_sets', operation: 'insert', payload: sp })
        }
      }
    } else {
      await enqueuePendingSync({ table: 'workout_sessions', operation: 'upsert', payload: sessionPayload })
      for (const sp of setsPayload) {
        await enqueuePendingSync({ table: 'exercise_sets', operation: 'insert', payload: sp })
      }
    }

    const newPRs = detectNewPRs(
      setsPayload.map((s) => ({ ...s, rpe: null, notes: null, synced: false })),
      existingPRs.map((pr) => ({
        ...pr,
        id: '',
        user_id: userId,
        exercise_name: '',
        reps: 0,
        achieved_at: '',
      }))
    )

    if (newPRs.length > 0) {
      setPrAchieved(newPRs.map((pr) => pr.exercise_name))
    }

    await clearActiveWorkout(sessionId)
    track('workout_completed', {
      workout_type: selectedDay.type,
      duration_minutes: durationMins,
      sets_completed: completedSets.length,
    })

    setSaving(false)
    setPhase('complete')
  }

  // ─── Render: Workout Complete ────────────────────────────────
  if (phase === 'complete') {
    return <WorkoutComplete prNames={prAchieved} onDone={() => router.push('/dashboard')} />
  }

  // ─── Render: Active Workout ──────────────────────────────────
  if (phase === 'active' && selectedDay) {
    const exercises = selectedDay.exercises
    const currentEx = exercises[currentExIdx] || exercises[0]
    const currentExSets = sets.filter((s) => s.exerciseId === currentEx?.exercise_id)
    const totalCompleted = sets.filter((s) => s.completed).length
    const totalSets = sets.length

    return (
      <div className="page-section pb-24">
        <TopBar
          title={selectedDay.label}
          subtitle={`${totalCompleted}/${totalSets} sets completed`}
          right={
            <button
              type="button"
              onClick={() => { setPhase('schedule'); setSelectedDay(null) }}
              className="text-muted hover:text-text-main p-2"
            >
              <ChevronLeft size={20} />
            </button>
          }
        />

        <div className="px-4 flex flex-col gap-4 pt-2">
          {/* Rest Timer Banner */}
          {restActive && (
            <div className="card text-center animate-slide-up border border-accent/40 bg-surface-2">
              <div className="flex items-center justify-center gap-2 text-accent text-xs font-bold mb-1">
                <Timer size={16} /> REST TIMER
              </div>
              <div className="text-4xl font-black text-accent tabular-nums">
                {Math.floor(restSeconds / 60)}:{String(restSeconds % 60).padStart(2, '0')}
              </div>
              <button
                type="button"
                onClick={() => { setRestActive(false); setRestSeconds(0) }}
                className="text-muted hover:text-text-main text-xs mt-2 underline cursor-pointer"
              >
                Skip rest
              </button>
            </div>
          )}

          {/* Exercise Card & Navigator */}
          <div className="card bg-surface border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5 overflow-x-auto max-w-[70%]">
                {exercises.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentExIdx(i)}
                    className={cn(
                      'h-2 rounded-full transition-all cursor-pointer shrink-0',
                      i === currentExIdx ? 'bg-accent w-7' : 'bg-border w-3.5 hover:bg-muted'
                    )}
                  />
                ))}
              </div>
              <span className="text-muted text-xs font-bold shrink-0">
                {currentExIdx + 1} of {exercises.length}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <MuscleBadge
                    muscle={currentEx?.exercise.primary_muscle || currentEx?.exercise.muscle_groups[0] || 'chest'}
                    isPrimary
                    size="sm"
                  />
                  {currentEx?.exercise.equipment[0] && (
                    <EquipmentBadge equipment={currentEx.exercise.equipment[0]} size="sm" />
                  )}
                </div>
                <h2 className="text-xl font-black text-text-main">{currentEx?.exercise.name}</h2>
                <p className="text-muted text-xs mt-0.5">
                  Target: {currentEx?.rep_range} reps • {currentEx?.rest_seconds}s rest
                </p>
              </div>

              {/* Action Buttons: Form Guide & Swap */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectingExercise(currentEx?.exercise || null)}
                  className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-text-main transition-colors"
                  title="View step-by-step form cues"
                >
                  <Info size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrowserMode('swap_current')
                    setShowBrowserModal(true)
                  }}
                  className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-accent transition-colors"
                  title="Swap with another exercise"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Sets List */}
          <div className="flex flex-col gap-2.5">
            {currentExSets.map((set) => {
              const globalIdx = sets.findIndex(
                (s) => s.exerciseId === set.exerciseId && s.setNum === set.setNum
              )
              return (
                <div
                  key={set.setNum}
                  className={cn(
                    'card flex items-center gap-3 transition-all',
                    set.completed ? 'border-accent/40 bg-accent/5' : 'bg-surface'
                  )}
                >
                  <div className="text-text-main text-sm font-black w-8 text-center bg-surface-2 py-1.5 rounded-lg">
                    #{set.setNum}
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-muted text-[10px] font-bold block mb-1">KG</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) => updateSet(globalIdx, 'weight', e.target.value)}
                        disabled={set.completed}
                        className="text-center font-black text-text-main bg-surface-2 border-border"
                      />
                    </div>
                    <div>
                      <label className="text-muted text-[10px] font-bold block mb-1">REPS</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="10"
                        value={set.reps}
                        onChange={(e) => updateSet(globalIdx, 'reps', e.target.value)}
                        disabled={set.completed}
                        className="text-center font-black text-text-main bg-surface-2 border-border"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => completeSet(globalIdx)}
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md',
                      set.completed
                        ? 'bg-[#b7ff3c] text-[#080b10]'
                        : 'bg-surface-2 text-muted hover:bg-accent/20 hover:text-accent border border-border'
                    )}
                    aria-label={set.completed ? 'Set completed' : 'Mark set complete'}
                  >
                    <CheckCircle2 size={22} className={set.completed ? 'text-[#080b10]' : ''} />
                  </button>
                </div>
              )
            })}

            {/* Add Set Button */}
            {currentEx && (
              <button
                type="button"
                onClick={() => handleAddSet(currentEx.exercise_id, currentEx.exercise.name)}
                className="py-2.5 rounded-xl border border-dashed border-border hover:border-accent/50 text-muted hover:text-accent text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-surface/50"
              >
                <Plus size={14} /> Add Set
              </button>
            )}
          </div>

          {/* Add What to Do Next (Add Exercise) Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setBrowserMode('add_to_active')
                setShowBrowserModal(true)
              }}
              className="w-full py-3 rounded-2xl bg-surface-2 hover:bg-accent/15 border border-accent/30 text-accent font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Plus size={16} /> + Add Exercise to Workout
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setCurrentExIdx((i) => Math.max(0, i - 1))}
              disabled={currentExIdx === 0}
              className="px-4"
            >
              <ChevronLeft size={18} />
            </Button>

            {currentExIdx < exercises.length - 1 ? (
              <Button
                variant="primary"
                type="button"
                onClick={() => setCurrentExIdx((i) => i + 1)}
                fullWidth
                className="flex-1 font-black"
              >
                Next Exercise <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={finishWorkout}
                loading={saving}
                disabled={saving}
                fullWidth
                className="flex-1 font-black text-base"
                size="lg"
              >
                ✓ Complete Workout
              </Button>
            )}
          </div>
        </div>

        {/* Browser Modal */}
        <ExerciseBrowserModal
          isOpen={showBrowserModal}
          onClose={() => setShowBrowserModal(false)}
          title={browserMode === 'swap_current' ? 'Swap Exercise' : 'Add Exercise to Workout'}
          actionLabel={browserMode === 'swap_current' ? 'Swap Now' : '+ Add to Session'}
          onSelectExercise={(ex) => {
            if (browserMode === 'swap_current') {
              handleSwapCurrentExercise(ex)
            } else {
              handleAddExerciseToActive(ex)
            }
          }}
        />

        {/* Detail Modal */}
        <ExerciseDetailModal
          exercise={inspectingExercise}
          isOpen={Boolean(inspectingExercise)}
          onClose={() => setInspectingExercise(null)}
        />
      </div>
    )
  }

  // ─── Render: Weekly Schedule & Split Customizer ──────────────
  return (
    <div className="page-section pb-24">
      <TopBar title="Workout Plan" subtitle="Monday to Sunday Routine Planner" />

      <div className="px-4 pt-2 flex flex-col gap-5">
        {/* 7-Day Weekly Schedule Component */}
        <WeeklyScheduleManager
          onStartWorkout={(day) => startWorkout(day)}
        />

        {/* 10-min Express option */}
        <div className="card text-center bg-gradient-to-b from-surface to-surface-2 border border-[#b7ff3c]/20 p-5">
          <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-2">
            <Flame size={22} />
          </div>
          <p className="text-text-main font-black text-base mb-1">Short on time today?</p>
          <p className="text-muted text-xs mb-4">
            A quick 10-minute express session still counts and keeps your monthly consistency streak alive.
          </p>
          <Button
            type="button"
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => {
              const dow = (new Date().getDay() || 7) as DayOfWeek
              const sched = getWeeklySchedule()?.schedule || DEFAULT_7DAY_SCHEDULE
              const baseDay = sched[dow] && sched[dow].type !== 'rest' ? sched[dow] : DEFAULT_7DAY_SCHEDULE[1]

              const shortDay: WorkoutDay = {
                ...baseDay,
                label: `${baseDay.label} (Express 10-min)`,
                exercises: baseDay.exercises.slice(0, 3).map((e: WorkoutExercise) => ({
                  ...e,
                  sets: 2,
                })),
              }
              startWorkout(shortDay)
            }}
          >
            <Zap size={18} /> Start 10-min Express ⚡
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Workout Complete Screen ───────────────────────────────────
function WorkoutComplete({ prNames, onDone }: { prNames: string[]; onDone: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 text-text-main">
      <div className="text-center max-w-sm w-full animate-bounce-in">
        <div className="text-7xl mb-4">🔥</div>
        <h1 className="text-3xl font-black text-text-main mb-2">Workout Complete!</h1>
        <p className="text-muted mb-6 text-sm">
          Consistency is built one session at a time. Great work!
        </p>

        {prNames.length > 0 && (
          <div className="card mb-6 text-left border border-accent/40 bg-accent/5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="text-accent" size={20} />
              <h3 className="text-text-main font-bold">New Personal Records 🎉</h3>
            </div>
            {prNames.map((name) => (
              <div key={name} className="flex items-center gap-2 py-1">
                <span className="text-accent font-black">✓</span>
                <span className="text-text-main text-sm font-semibold">{name}</span>
              </div>
            ))}
          </div>
        )}

        <Button fullWidth size="lg" onClick={onDone} className="font-black">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
