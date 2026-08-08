'use client'

import { useState, useEffect, useMemo } from 'react'
import { StepLog } from '@/types'
import { getStepLog, saveStepLog } from '@/lib/offline/store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Footprints, Flame, MapPin, Plus, Check, Trophy, Sparkles, Target } from 'lucide-react'

interface StepCounterProps {
  dateStr?: string
  onStepsUpdated?: (steps: number) => void
}

export function StepCounter({
  dateStr = new Date().toISOString().split('T')[0],
  onStepsUpdated,
}: StepCounterProps) {
  const [stepCount, setStepCount] = useState<number>(6420)
  const [targetSteps, setTargetSteps] = useState<number>(10000)
  const [manualInput, setManualInput] = useState<string>('')
  const [justAdded, setJustAdded] = useState<number | null>(null)

  // Load from local storage
  useEffect(() => {
    const saved = getStepLog(dateStr)
    if (saved) {
      setStepCount(saved.step_count)
      setTargetSteps(saved.target_steps || 10000)
    }
  }, [dateStr])

  // Calculated metrics
  const distanceKm = useMemo(() => (stepCount * 0.00078).toFixed(2), [stepCount])
  const burnedKcal = useMemo(() => Math.round(stepCount * 0.04), [stepCount])
  const activeMins = useMemo(() => Math.round(stepCount / 100), [stepCount])
  const progressPct = useMemo(
    () => Math.min(100, Math.round((stepCount / targetSteps) * 100)),
    [stepCount, targetSteps]
  )
  const isGoalAchieved = stepCount >= targetSteps

  // Persist steps
  function persist(newCount: number, newTarget = targetSteps) {
    setStepCount(newCount)
    const log: StepLog = {
      id: `step_${dateStr}`,
      user_id: 'local',
      log_date: dateStr,
      step_count: newCount,
      target_steps: newTarget,
      distance_km: parseFloat((newCount * 0.00078).toFixed(2)),
      calories_burned: Math.round(newCount * 0.04),
      updated_at: new Date().toISOString(),
    }
    saveStepLog(log)
    if (onStepsUpdated) onStepsUpdated(newCount)
  }

  function handleAddSteps(delta: number) {
    const next = Math.max(0, stepCount + delta)
    persist(next)
    setJustAdded(delta)
    setTimeout(() => setJustAdded(null), 1500)
  }

  function handleSetManualSteps() {
    const val = parseInt(manualInput, 10)
    if (isNaN(val) || val < 0) return
    persist(val)
    setManualInput('')
  }

  return (
    <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Footprints size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main">Daily Step Counter</h3>
            <p className="text-muted text-[11px]">Walking activity, distance & active calories</p>
          </div>
        </div>

        <span className="badge-surface text-accent text-xs font-bold flex items-center gap-1">
          <Target size={12} /> {targetSteps.toLocaleString()} Goal
        </span>
      </div>

      {/* Hero Step Metric Display */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-2 to-surface border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-muted text-xs font-bold uppercase tracking-wider block">
              Today&apos;s Steps
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-text-main tabular-nums">
                {stepCount.toLocaleString()}
              </span>
              <span className="text-xs text-accent font-bold">
                / {targetSteps.toLocaleString()} ({progressPct}%)
              </span>
            </div>
          </div>

          {isGoalAchieved ? (
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center text-xl animate-bounce">
              🏆
            </div>
          ) : (
            <div className="text-right">
              <span className="text-muted text-xs font-semibold block">Remaining</span>
              <span className="text-text-main text-sm font-bold">
                {Math.max(0, targetSteps - stepCount).toLocaleString()} steps
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-3 bg-surface-3 rounded-full overflow-hidden p-0.5 border border-border">
            <div
              className="h-full bg-gradient-to-r from-[#b7ff3c] to-emerald-400 rounded-full transition-all duration-700 shadow-sm shadow-accent/40"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Computed metrics: Distance, Calories, Active Time */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70 text-center">
          <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-sky-400 text-xs mb-0.5 font-bold">
              <MapPin size={12} /> Distance
            </div>
            <span className="text-text-main font-black text-sm">{distanceKm}</span>
            <span className="text-[10px] text-muted ml-0.5">km</span>
          </div>

          <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-rose-400 text-xs mb-0.5 font-bold">
              <Flame size={12} /> Active Burn
            </div>
            <span className="text-text-main font-black text-sm">{burnedKcal}</span>
            <span className="text-[10px] text-muted ml-0.5">kcal</span>
          </div>

          <div className="p-2 rounded-xl bg-surface/60 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-0.5 font-bold">
              <Footprints size={12} /> Active Time
            </div>
            <span className="text-text-main font-black text-sm">{activeMins}</span>
            <span className="text-[10px] text-muted ml-0.5">min</span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons & Custom Logger */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted">
          <span>Quick Log Activity:</span>
          {justAdded && (
            <span className="text-accent flex items-center gap-1 animate-scale-up text-xs font-bold">
              <Check size={12} /> +{justAdded.toLocaleString()} steps added!
            </span>
          )}
        </div>

        {/* Quick Add Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: '+500', val: 500 },
            { label: '+1,000', val: 1000 },
            { label: '+2,500', val: 2500 },
            { label: '+5,000', val: 5000 },
          ].map((btn) => (
            <button
              key={btn.val}
              type="button"
              onClick={() => handleAddSteps(btn.val)}
              className="py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border hover:border-accent/40 text-text-main font-bold text-xs transition-all cursor-pointer text-center"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Manual Custom Input */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            min="0"
            step="100"
            placeholder="Set exact step count..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text-main font-bold placeholder:text-muted/60 focus:border-accent"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSetManualSteps}
            disabled={!manualInput}
            className="font-bold text-xs shrink-0"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}
