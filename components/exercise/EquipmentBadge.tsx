'use client'

import { EquipmentRequired } from '@/types'
import { cn } from '@/lib/utils'

interface EquipmentBadgeProps {
  equipment: EquipmentRequired | string
  size?: 'sm' | 'md' | 'lg'
  showIconOnly?: boolean
  className?: string
}

export const EQUIPMENT_META: Record<
  string,
  { name: string; icon: string; label: string; bg: string; text: string; border: string }
> = {
  barbell: {
    name: 'Barbell',
    icon: '🏋️',
    label: 'Olympic Barbell',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  dumbbell: {
    name: 'Dumbbell',
    icon: '🦾',
    label: 'Free Weights',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  cable: {
    name: 'Cable Machine',
    icon: '🪢',
    label: 'Cable Station',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  machine: {
    name: 'Gym Machine',
    icon: '⚙️',
    label: 'Resistance Machine',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  bodyweight: {
    name: 'Bodyweight',
    icon: '🧘',
    label: 'No Equipment Needed',
    bg: 'bg-lime-500/10',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
  },
  smith_machine: {
    name: 'Smith Machine',
    icon: '🏗️',
    label: 'Guided Barbell',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  kettlebell: {
    name: 'Kettlebell',
    icon: '🔔',
    label: 'Cast Iron Kettlebell',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  resistance_band: {
    name: 'Resistance Band',
    icon: '🎗️',
    label: 'Elastic Loop / Band',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
  },
  cardio_machine: {
    name: 'Cardio Station',
    icon: '🏃',
    label: 'Treadmill / Bike / Rower',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
  },
}

export function EquipmentBadge({
  equipment,
  size = 'md',
  showIconOnly = false,
  className,
}: EquipmentBadgeProps) {
  const meta = EQUIPMENT_META[equipment] || {
    name: equipment,
    icon: '🏋️',
    label: equipment,
    bg: 'bg-surface-2',
    text: 'text-muted',
    border: 'border-border',
  }

  if (showIconOnly) {
    return (
      <span
        title={`${meta.name} (${meta.label})`}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border px-1.5 py-0.5 text-xs',
          meta.bg,
          meta.border,
          meta.text,
          className
        )}
      >
        <span>{meta.icon}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-semibold tracking-wide transition-colors',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
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
