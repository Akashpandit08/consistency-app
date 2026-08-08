'use client'

import { useEffect, useMemo, useState } from 'react'
import { Exercise, MuscleGroup, EquipmentRequired } from '@/types'
import { EXERCISES, searchExercises } from '@/lib/plan/exercises'
import { getCustomExercises } from '@/lib/offline/store'
import { ExerciseDetailModal } from './ExerciseDetailModal'
import { CustomExerciseModal } from './CustomExerciseModal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Search,
  Plus,
  Info,
  X,
  Dumbbell,
  Sparkles,
  Check,
} from 'lucide-react'

interface ExerciseBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
  title?: string
  actionLabel?: string
}

const MUSCLE_TABS: { label: string; value: MuscleGroup | 'all' }[] = [
  { label: 'All Muscles', value: 'all' },
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

const EQUIPMENT_FILTERS: { label: string; value: EquipmentRequired | 'all' }[] = [
  { label: 'All Equipment', value: 'all' },
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbell', value: 'dumbbell' },
  { label: 'Cable', value: 'cable' },
  { label: 'Machine', value: 'machine' },
  { label: 'Bodyweight', value: 'bodyweight' },
  { label: 'Kettlebell', value: 'kettlebell' },
  { label: 'Smith Machine', value: 'smith_machine' },
]

export function ExerciseBrowserModal({
  isOpen,
  onClose,
  onSelectExercise,
  title = 'Exercise Library',
  actionLabel = '+ Add to Workout',
}: ExerciseBrowserModalProps) {
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'all'>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentRequired | 'all'>('all')
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Load custom exercises from IndexedDB
  useEffect(() => {
    async function loadCustom() {
      try {
        const saved = await getCustomExercises()
        if (saved && saved.length > 0) {
          setCustomExercises(
            saved.map((s) => ({
              id: s.id,
              name: s.name,
              muscle_groups: s.muscle_groups,
              primary_muscle: s.muscle_groups[0],
              equipment: s.equipment,
              is_compound: s.is_compound,
              difficulty: s.difficulty,
              instructions: s.instructions,
              is_custom: true,
            }))
          )
        }
      } catch {
        // ignore
      }
    }
    if (isOpen) void loadCustom()
  }, [isOpen])

  // Filtered list
  const filteredList = useMemo(() => {
    let list = searchExercises(query, customExercises)

    if (selectedMuscle !== 'all') {
      list = list.filter(
        (e) =>
          e.primary_muscle === selectedMuscle ||
          e.muscle_groups.includes(selectedMuscle as MuscleGroup)
      )
    }

    if (selectedEquipment !== 'all') {
      list = list.filter((e) =>
        e.equipment.includes(selectedEquipment as EquipmentRequired)
      )
    }

    return list
  }, [query, selectedMuscle, selectedEquipment, customExercises])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in text-text-main">
        <div
          className="bg-[#0b0e14] border border-[#1f2937] rounded-3xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1f2937] bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <Dumbbell size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-text-main">{title}</h2>
                <p className="text-muted text-xs">
                  {filteredList.length} movements available • Pick any to add
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-accent/20 text-accent border border-accent/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} /> Create Custom
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-[#0f141c] border-b border-[#1f2937] flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search by name, muscle (Chest, Back, Quads...), or equipment..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface border border-border text-text-main placeholder-muted focus:border-accent text-xs font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-main"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips (Muscle Category) */}
          <div className="px-3 py-2 bg-surface/50 border-b border-[#1f2937] overflow-x-auto flex gap-1.5 scrollbar-none">
            {MUSCLE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedMuscle(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer',
                  selectedMuscle === tab.value
                    ? 'bg-accent text-accent-dark shadow-sm'
                    : 'bg-surface-2 text-muted hover:text-text-main hover:bg-surface-3'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Equipment Filter Chips */}
          <div className="px-3 py-1.5 bg-[#0a0d13] border-b border-[#1f2937] overflow-x-auto flex gap-1.5 scrollbar-none">
            {EQUIPMENT_FILTERS.map((eq) => (
              <button
                key={eq.value}
                type="button"
                onClick={() => setSelectedEquipment(eq.value)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors cursor-pointer',
                  selectedEquipment === eq.value
                    ? 'bg-white text-black'
                    : 'bg-surface text-muted hover:text-text-main'
                )}
              >
                {eq.label}
              </button>
            ))}
          </div>

          {/* Exercise List */}
          <div className="p-3 overflow-y-auto flex-1 space-y-2">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <Dumbbell className="mx-auto mb-2 opacity-40" size={32} />
                <p className="font-bold text-sm text-text-main">No exercises found</p>
                <p className="text-xs mt-1">Try another search or create your own custom exercise!</p>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="mt-4"
                >
                  <Plus size={14} /> Create Custom Exercise
                </Button>
              </div>
            ) : (
              filteredList.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-2xl bg-surface hover:bg-surface-2 border border-border/80 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="badge-accent uppercase text-[9px] font-black tracking-wider">
                        {ex.primary_muscle || ex.muscle_groups[0]}
                      </span>
                      <span className="text-[10px] font-semibold text-muted bg-surface-2 px-1.5 py-0.5 rounded">
                        {ex.equipment[0]}
                      </span>
                      {ex.is_compound && (
                        <span className="text-[9px] text-accent font-bold">Compound</span>
                      )}
                      {ex.is_custom && (
                        <span className="badge-surface text-[9px] text-accent font-bold flex items-center gap-0.5">
                          <Sparkles size={10} /> Custom
                        </span>
                      )}
                    </div>
                    <h3 className="text-text-main font-bold text-sm truncate">{ex.name}</h3>
                    <p className="text-muted text-[11px] line-clamp-1 mt-0.5">
                      {ex.instruction_details?.cues?.[0] || ex.instructions || 'Target muscle hypertrophy & strength'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectingExercise(ex)}
                      className="w-8 h-8 rounded-xl bg-surface-2 hover:bg-surface-3 text-muted hover:text-text-main flex items-center justify-center transition-colors"
                      title="View form guide & cues"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectExercise(ex)
                        onClose()
                      }}
                      className="px-3 py-1.5 bg-accent text-accent-dark font-black text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={14} /> Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#1f2937] bg-surface flex items-center justify-between text-xs text-muted">
            <span>Showing {filteredList.length} movements</span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-text-main hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Detail Guide Modal */}
      <ExerciseDetailModal
        exercise={inspectingExercise}
        isOpen={Boolean(inspectingExercise)}
        onClose={() => setInspectingExercise(null)}
        onSelect={(ex) => {
          onSelectExercise(ex)
          onClose()
        }}
        selectLabel={actionLabel}
      />

      {/* Custom Exercise Creator Modal */}
      <CustomExerciseModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onCreated={(newEx) => {
          setCustomExercises((prev) => [newEx, ...prev])
          onSelectExercise(newEx)
          onClose()
        }}
      />
    </>
  )
}
