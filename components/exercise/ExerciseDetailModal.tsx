'use client'

import { Exercise } from '@/types'
import { EXERCISES } from '@/lib/plan/exercises'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Dumbbell,
  Target,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  X,
  BookOpen,
} from 'lucide-react'

interface ExerciseDetailModalProps {
  exercise: Exercise | null
  isOpen: boolean
  onClose: () => void
  onSelect?: (exercise: Exercise) => void
  selectLabel?: string
}

export function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
  onSelect,
  selectLabel = 'Add to Workout',
}: ExerciseDetailModalProps) {
  if (!isOpen || !exercise) return null

  const details = exercise.instruction_details
  const substitutes = (exercise.substitutes || [])
    .map((id) => EXERCISES[id])
    .filter((s): s is Exercise => Boolean(s))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#0e121a] border border-[#222b3a] rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up text-text-main"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#222b3a] flex items-start justify-between bg-surface relative">
          <div className="pr-6">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="badge-accent font-black uppercase text-[10px] tracking-wider">
                {exercise.primary_muscle ?? exercise.muscle_groups[0] ?? 'general'}
              </span>
              <span className="badge-surface text-[10px] uppercase font-bold text-muted">
                {exercise.equipment.join(' • ')}
              </span>
              <span className="badge-surface text-[10px] capitalize text-muted">
                {exercise.difficulty}
              </span>
              {exercise.is_compound && (
                <span className="badge-surface text-[10px] text-accent font-bold">
                  Compound
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-text-main leading-tight">{exercise.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-text-main transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Target Muscles */}
          <div className="bg-surface p-3.5 rounded-2xl border border-border">
            <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase mb-2">
              <Target size={15} /> Target Muscles
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent font-bold text-xs capitalize">
                🎯 {exercise.primary_muscle || exercise.muscle_groups[0]} (Primary)
              </span>
              {(exercise.secondary_muscles || exercise.muscle_groups.slice(1)).map((m) => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-lg bg-surface-2 border border-border text-muted font-medium text-xs capitalize"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Setup & Execution Guide */}
          {details ? (
            <div className="space-y-3">
              <div className="bg-surface p-4 rounded-2xl border border-border">
                <h4 className="text-text-main font-bold text-xs uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <BookOpen size={14} className="text-accent" /> 1. Setup & Stance
                </h4>
                <p className="text-[#a0aec0] text-xs leading-relaxed">{details.setup}</p>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border">
                <h4 className="text-text-main font-bold text-xs uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Zap size={14} className="text-accent" /> 2. Motion Execution
                </h4>
                <p className="text-[#a0aec0] text-xs leading-relaxed">{details.execution}</p>
              </div>

              {details.cues && details.cues.length > 0 && (
                <div className="bg-accent/5 p-4 rounded-2xl border border-accent/20">
                  <h4 className="text-accent font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Key Form Cues
                  </h4>
                  <ul className="space-y-1.5">
                    {details.cues.map((cue, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-main">
                        <Check size={14} className="text-accent shrink-0 mt-0.5" />
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface p-4 rounded-2xl border border-border">
              <p className="text-text-main text-xs leading-relaxed">
                {exercise.instructions || 'Perform with controlled tempo, full range of motion, and focused muscle contraction.'}
              </p>
            </div>
          )}

          {/* Substitutes */}
          {substitutes.length > 0 && (
            <div className="bg-surface p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-2 text-muted font-bold text-xs uppercase mb-2.5">
                <RotateCcw size={14} /> Smart Substitutes (If Equipment Busy)
              </div>
              <div className="space-y-1.5">
                {substitutes.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors text-xs"
                  >
                    <div>
                      <p className="text-text-main font-semibold">{sub.name}</p>
                      <p className="text-muted text-[10px]">{sub.equipment.join(', ')}</p>
                    </div>
                    {onSelect && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(sub)
                          onClose()
                        }}
                        className="px-2.5 py-1 bg-accent/15 text-accent hover:bg-accent hover:text-accent-dark rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Swap
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#222b3a] bg-surface flex gap-2">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onSelect && (
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                onSelect(exercise)
                onClose()
              }}
              className="flex-1 font-black"
            >
              <Check size={16} /> {selectLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
