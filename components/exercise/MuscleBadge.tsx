'use client'

import { MuscleGroup } from '@/types'
import { cn } from '@/lib/utils'

interface MuscleBadgeProps {
  muscle: MuscleGroup | string
  isPrimary?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const MUSCLE_META: Record<
  string,
  { name: string; icon: string; bg: string; text: string; border: string }
> = {
  chest: {
    name: 'Chest',
    icon: '🔴',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  back: {
    name: 'Back & Lats',
    icon: '🔵',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  shoulders: {
    name: 'Shoulders',
    icon: '🟠',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  biceps: {
    name: 'Biceps',
    icon: '🟢',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  triceps: {
    name: 'Triceps',
    icon: '🟣',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  quads: {
    name: 'Quads',
    icon: '🦵',
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
  },
  hamstrings: {
    name: 'Hamstrings',
    icon: '🍗',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  glutes: {
    name: 'Glutes',
    icon: '🍑',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  calves: {
    name: 'Calves',
    icon: '🦿',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  core: {
    name: 'Abs & Core',
    icon: '⚡',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  traps: {
    name: 'Traps',
    icon: '🛡️',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
  forearms: {
    name: 'Forearms',
    icon: '🦾',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
  },
  cardio: {
    name: 'Cardio',
    icon: '🫀',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
  full_body: {
    name: 'Full Body',
    icon: '💥',
    bg: 'bg-accent/15',
    text: 'text-accent',
    border: 'border-accent/30',
  },
}

export function MuscleBadge({
  muscle,
  isPrimary = false,
  size = 'md',
  className,
}: MuscleBadgeProps) {
  const key = muscle.toLowerCase().trim()
  const meta = MUSCLE_META[key] || {
    name: muscle,
    icon: '🎯',
    bg: 'bg-surface-2',
    text: 'text-muted',
    border: 'border-border',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border font-bold uppercase tracking-wider transition-colors',
        size === 'sm' && 'px-1.5 py-0.5 text-[9px]',
        size === 'md' && 'px-2 py-0.5 text-[10px]',
        size === 'lg' && 'px-2.5 py-1 text-xs',
        isPrimary ? 'ring-1 ring-accent/40 shadow-sm' : '',
        meta.bg,
        meta.border,
        meta.text,
        className
      )}
    >
      <span className="shrink-0">{meta.icon}</span>
      <span>{meta.name}</span>
    </span>
  )
}
