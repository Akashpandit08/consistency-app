'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics/events'
import { enqueuePendingSync } from '@/lib/offline/store'
import { processSyncQueue } from '@/lib/offline/sync'
import { compressImage, type CompressedImageResult } from '@/lib/media/imageCompressor'
import { checkRateLimit } from '@/lib/security/rateLimit'
import {
  Trophy, TrendingUp, Scale, Plus, Calendar,
  Flame, Award, CheckCircle2, Camera, ShieldCheck, Zap, Sparkles
} from 'lucide-react'
import { ProgressCalendar } from '@/components/progress/ProgressCalendar'
import type { PersonalRecord, BodyMetrics } from '@/types'

export default function ProgressPage() {
  const [prs, setPrs] = useState<PersonalRecord[]>([])
  const [weightLogs, setWeightLogs] = useState<BodyMetrics[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [newWaist, setNewWaist] = useState('')
  const [newChest, setNewChest] = useState('')
  const [newBiceps, setNewBiceps] = useState('')
  const [showLogModal, setShowLogModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [workoutCount, setWorkoutCount] = useState(0)



  const [workoutDates, setWorkoutDates] = useState<string[]>([])

  const loadData = useCallback(async () => {
    // Default fallback PRs & metrics for preview
    const defaultPrs: PersonalRecord[] = [
      { id: 'pr1', user_id: 'demo', exercise_id: 'bench_press', exercise_name: 'Bench Press', weight_kg: 80, reps: 6, volume_kg: 480, achieved_at: new Date().toISOString() },
      { id: 'pr2', user_id: 'demo', exercise_id: 'squat', exercise_name: 'Barbell Squat', weight_kg: 110, reps: 5, volume_kg: 550, achieved_at: new Date().toISOString() },
      { id: 'pr3', user_id: 'demo', exercise_id: 'deadlift', exercise_name: 'Deadlift', weight_kg: 140, reps: 5, volume_kg: 700, achieved_at: new Date().toISOString() },
    ]
    const defaultMetrics: BodyMetrics[] = [
      { id: 'bm1', user_id: 'demo', weight_kg: 76.5, waist_cm: 82, chest_cm: 101, biceps_cm: 36, body_fat_pct: 15, created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
      { id: 'bm2', user_id: 'demo', weight_kg: 77.2, waist_cm: 81.5, chest_cm: 102, biceps_cm: 36.5, body_fat_pct: 14.8, created_at: new Date().toISOString() },
    ]
    setPrs(defaultPrs)
    setWeightLogs(defaultMetrics)
    setWorkoutCount(12)
    setWorkoutDates([new Date().toISOString().split('T')[0]])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [prsRes, metricsRes, sessionsRes, fullSessionsRes] = await Promise.all([
        supabase
          .from('personal_records')
          .select('*')
          .eq('user_id', user.id)
          .order('achieved_at', { ascending: false }),
        supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(30),
        supabase
          .from('workout_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .not('completed_at', 'is', null),
        supabase
          .from('workout_sessions')
          .select('started_at')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null),
      ])

      if (prsRes.data && prsRes.data.length > 0) setPrs(prsRes.data as PersonalRecord[])
      if (metricsRes.data && metricsRes.data.length > 0) setWeightLogs(metricsRes.data as BodyMetrics[])
      if (sessionsRes.count !== null && sessionsRes.count !== undefined) setWorkoutCount(sessionsRes.count)
      if (fullSessionsRes.data) {
        setWorkoutDates(fullSessionsRes.data.map((s: { started_at: string }) => s.started_at.split('T')[0]))
      }
    } catch (err) {
      console.warn('Using offline progress fallback:', err)
    }
  }, [])


  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleLogMetrics(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const w = newWeight ? parseFloat(newWeight) : null
    const waist = newWaist ? parseFloat(newWaist) : null
    const chest = newChest ? parseFloat(newChest) : null
    const biceps = newBiceps ? parseFloat(newBiceps) : null

    const payload = {
      id: crypto.randomUUID(),
      user_id: user.id,
      weight_kg: w,
      waist_cm: waist,
      chest_cm: chest,
      biceps_cm: biceps,
      created_at: new Date().toISOString(),
    }

    if (navigator.onLine) {
      await supabase.from('body_metrics').insert(payload)
      void processSyncQueue()
    } else {
      await enqueuePendingSync({ table: 'body_metrics', operation: 'insert', payload })
    }

    setWeightLogs((prev) => [...prev, payload as BodyMetrics])
    setNewWeight('')
    setNewWaist('')
    setNewChest('')
    setNewBiceps('')
    setShowLogModal(false)
    setSaving(false)
    track('body_metrics_logged', { weight_kg: w })
  }

  const latestMetric = weightLogs[weightLogs.length - 1]
  const firstMetric = weightLogs[0]
  const weightChange = latestMetric?.weight_kg && firstMetric?.weight_kg
    ? (latestMetric.weight_kg - firstMetric.weight_kg).toFixed(1)
    : null

  return (
    <div className="page-section">
      <TopBar title="Your Progress" subtitle="Numbers don't lie" />

      <div className="px-4 pt-2 flex flex-col gap-4">
        {/* ─── Highlights ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-tile">
            <div className="flex items-center gap-1.5 text-muted text-xs font-semibold uppercase mb-1">
              <Flame size={13} className="text-accent" />
              Total Workouts
            </div>
            <div className="text-2xl font-black text-text-main">{workoutCount}</div>
            <div className="text-muted text-xs">completed sessions</div>
          </div>

          <div className="stat-tile">
            <div className="flex items-center gap-1.5 text-muted text-xs font-semibold uppercase mb-1">
              <Trophy size={13} className="text-yellow-400" />
              PRs Broken
            </div>
            <div className="text-2xl font-black text-text-main">{prs.length}</div>
            <div className="text-muted text-xs">all-time records</div>
          </div>
        </div>

        {/* ─── Body Weight & Measurements ───────────────────────── */}
        <div className="card-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale className="text-accent" size={20} />
              <h2 className="font-black text-text-main text-base">Body Metrics</h2>
            </div>
            <button
              onClick={() => setShowLogModal(!showLogModal)}
              className="text-accent text-xs font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Log weigh-in
            </button>
          </div>

          {showLogModal && (
            <form onSubmit={handleLogMetrics} className="card bg-surface-2 mb-4 animate-slide-up flex flex-col gap-3">
              <h3 className="font-bold text-text-main text-sm">New Weigh-in / Measurement</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="82.0"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Chest (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="100.0"
                    value={newChest}
                    onChange={(e) => setNewChest(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Arms/Biceps (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="36.5"
                    value={newBiceps}
                    onChange={(e) => setNewBiceps(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowLogModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" loading={saving}>
                  Save Entry
                </Button>
              </div>
            </form>
          )}

          {latestMetric ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-text-main">
                    {latestMetric.weight_kg ? `${latestMetric.weight_kg} kg` : '—'}
                  </span>
                  <span className="text-muted text-xs ml-2">Latest weight</span>
                </div>
                {weightChange && (
                  <span className={`text-xs font-bold ${parseFloat(weightChange) <= 0 ? 'text-green-400' : 'text-blue-400'}`}>
                    {parseFloat(weightChange) > 0 ? `+${weightChange}` : weightChange} kg total
                  </span>
                )}
              </div>

              {/* Measurement items */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                <div className="bg-surface-2 p-2 rounded-xl">
                  <div className="text-muted text-[10px] uppercase font-bold">Waist</div>
                  <div className="text-text-main font-black text-sm">{latestMetric.waist_cm ? `${latestMetric.waist_cm}cm` : '—'}</div>
                </div>
                <div className="bg-surface-2 p-2 rounded-xl">
                  <div className="text-muted text-[10px] uppercase font-bold">Chest</div>
                  <div className="text-text-main font-black text-sm">{latestMetric.chest_cm ? `${latestMetric.chest_cm}cm` : '—'}</div>
                </div>
                <div className="bg-surface-2 p-2 rounded-xl">
                  <div className="text-muted text-[10px] uppercase font-bold">Arms</div>
                  <div className="text-text-main font-black text-sm">{latestMetric.biceps_cm ? `${latestMetric.biceps_cm}cm` : '—'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted text-sm">
              No body metrics logged yet. Tap &ldquo;Log weigh-in&rdquo; to track your body changes!
            </div>
          )}
        </div>

        {/* ─── Visual Progress Calendar (Photos & Metrics) ────────────── */}
        <ProgressCalendar weightLogs={weightLogs} workoutDates={workoutDates} />

        {/* ─── Personal Records (PRs) ────────────────────────────── */}
        <div className="card-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              <h2 className="font-black text-text-main text-base">Personal Records</h2>
            </div>
            <span className="badge-accent">{prs.length} Records</span>
          </div>

          {prs.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">
              <Award className="mx-auto mb-2 opacity-40" size={32} />
              No PRs recorded yet. Complete workouts to automatically set your personal bests!
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {prs.map((pr) => (
                <div
                  key={pr.id || pr.exercise_id}
                  className="card flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-xs">
                      PR
                    </div>
                    <div>
                      <h3 className="text-text-main font-bold text-sm">{pr.exercise_name}</h3>
                      <div className="text-muted text-xs">
                        {new Date(pr.achieved_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-accent font-black text-base">
                      {pr.weight_kg} kg
                    </div>
                    <div className="text-muted text-xs">
                      {pr.reps} {pr.reps === 1 ? 'rep' : 'reps'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
