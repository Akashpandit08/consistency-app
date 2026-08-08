'use client'

import { useState } from 'react'
import { Exercise, MuscleGroup, EquipmentRequired, ExperienceLevel } from '@/types'
import { saveCustomExercise } from '@/lib/offline/store'
import { Button } from '@/components/ui/Button'
import { Plus, X, Sparkles } from 'lucide-react'

interface CustomExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (exercise: Exercise) => void
}

const MUSCLES: { label: string; value: MuscleGroup }[] = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Shoulders', value: 'shoulders' },
  { label: 'Biceps', value: 'biceps' },
  { label: 'Triceps', value: 'triceps' },
  { label: 'Quads', value: 'quads' },
  { label: 'Hamstrings', value: 'hamstrings' },
  { label: 'Glutes', value: 'glutes' },
  { label: 'Calves', value: 'calves' },
  { label: 'Core / Abs', value: 'core' },
  { label: 'Forearms', value: 'forearms' },
  { label: 'Traps', value: 'traps' },
  { label: 'Cardio', value: 'cardio' },
]

const EQUIPMENTS: { label: string; value: EquipmentRequired }[] = [
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbell', value: 'dumbbell' },
  { label: 'Cable', value: 'cable' },
  { label: 'Machine', value: 'machine' },
  { label: 'Bodyweight', value: 'bodyweight' },
  { label: 'Kettlebell', value: 'kettlebell' },
  { label: 'Smith Machine', value: 'smith_machine' },
  { label: 'Band', value: 'resistance_band' },
  { label: 'Cardio Machine', value: 'cardio_machine' },
]

export function CustomExerciseModal({ isOpen, onClose, onCreated }: CustomExerciseModalProps) {
  const [name, setName] = useState('')
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('chest')
  const [equipment, setEquipment] = useState<EquipmentRequired>('dumbbell')
  const [isCompound, setIsCompound] = useState(true)
  const [difficulty, setDifficulty] = useState<ExperienceLevel>('beginner')
  const [instructions, setInstructions] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter an exercise name')
      return
    }

    setSaving(true)
    setError('')

    const id = `custom_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`
    const newEx: Exercise = {
      id,
      name: name.trim(),
      muscle_groups: [primaryMuscle],
      primary_muscle: primaryMuscle,
      equipment: [equipment],
      is_compound: isCompound,
      difficulty,
      instructions: instructions.trim() || 'Perform with strict form and full range of motion.',
      is_custom: true,
      instruction_details: {
        setup: 'Get into position with stable core and controlled posture.',
        execution: instructions.trim() || 'Perform the reps with smooth tempo and peak contraction.',
        cues: ['Keep core braced', 'Focus on mind-muscle connection'],
      },
    }

    try {
      await saveCustomExercise({
        id,
        user_id: 'local_user',
        name: newEx.name,
        muscle_groups: newEx.muscle_groups,
        equipment: newEx.equipment,
        is_compound: newEx.is_compound,
        difficulty: newEx.difficulty,
        instructions: newEx.instructions,
        created_at: new Date().toISOString(),
      })
      onCreated(newEx)
      onClose()
    } catch (err) {
      console.error('Failed to save custom exercise:', err)
      onCreated(newEx) // still supply to session
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-text-main">
      <div className="bg-[#0e121a] border border-[#222b3a] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-[#222b3a] flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main">Create Custom Exercise</h2>
              <p className="text-muted text-xs">Add your own exercise to any workout</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-text-main"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Exercise Name */}
          <div>
            <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Landmine Bulgarian Squat"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main placeholder-muted focus:border-accent text-sm"
            />
          </div>

          {/* Primary Muscle */}
          <div>
            <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
              Target Muscle Group
            </label>
            <select
              value={primaryMuscle}
              onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm"
            >
              {MUSCLES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div>
            <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
              Equipment Required
            </label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentRequired)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm"
            >
              {EQUIPMENTS.map((eq) => (
                <option key={eq.value} value={eq.value}>
                  {eq.label}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
                Movement Type
              </label>
              <select
                value={isCompound ? 'compound' : 'isolation'}
                onChange={(e) => setIsCompound(e.target.value === 'compound')}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-text-main text-xs"
              >
                <option value="compound">Compound (Multi-Joint)</option>
                <option value="isolation">Isolation (Single-Joint)</option>
              </select>
            </div>

            <div>
              <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExperienceLevel)}
                className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-border text-text-main text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div>
            <label className="text-text-main font-bold block mb-1 uppercase tracking-wider text-[11px]">
              Form Cues & Instructions (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Keep spine neutral, pause 1 second at the bottom stretch..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main placeholder-muted focus:border-accent text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button variant="ghost" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={saving}
              className="flex-1 font-black"
            >
              <Plus size={16} /> Save Exercise
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
