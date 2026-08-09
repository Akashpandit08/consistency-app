'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { soundFx } from '@/lib/audio/workoutAudio'
import { snoozeAlarm } from '@/lib/notifications/alarmService'
import { Button } from '@/components/ui/Button'
import {
  Bell,
  BellRing,
  Clock,
  Utensils,
  Dumbbell,
  Droplets,
  Moon,
  Volume2,
  X,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import type { ActiveAlarmTrigger } from '@/types'

export function ActiveAlarmModal() {
  const router = useRouter()
  const [activeTrigger, setActiveTrigger] = useState<ActiveAlarmTrigger | null>(null)
  const [ringingInterval, setRingingInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    function handleAlarmFired(e: Event) {
      const customEvent = e as CustomEvent<ActiveAlarmTrigger>
      if (customEvent.detail) {
        setActiveTrigger(customEvent.detail)

        // Repeat subtle chime every 4 seconds until dismissed
        const interval = setInterval(() => {
          soundFx.playAlarmByTone(customEvent.detail.alarm.tone || 'chime')
        }, 4000)
        setRingingInterval(interval)
      }
    }

    window.addEventListener('consistency_alarm_fired', handleAlarmFired)
    return () => {
      window.removeEventListener('consistency_alarm_fired', handleAlarmFired)
      if (ringingInterval) clearInterval(ringingInterval)
    }
  }, [ringingInterval])

  function stopRinging() {
    if (ringingInterval) {
      clearInterval(ringingInterval)
      setRingingInterval(null)
    }
  }

  function handleDismiss() {
    stopRinging()
    setActiveTrigger(null)
  }

  function handleSnooze() {
    if (activeTrigger) {
      stopRinging()
      snoozeAlarm(activeTrigger.alarm, 5)
      setActiveTrigger(null)
    }
  }

  function handleAction() {
    if (!activeTrigger) return
    stopRinging()
    const type = activeTrigger.alarm.type
    setActiveTrigger(null)

    if (type === 'workout') {
      router.push('/workout')
    } else if (type === 'meal' || type === 'water') {
      router.push('/nutrition')
    } else {
      router.push('/dashboard')
    }
  }

  if (!activeTrigger) return null

  const { alarm } = activeTrigger

  const getIcon = () => {
    switch (alarm.type) {
      case 'workout':
        return <Dumbbell className="text-[var(--accent)]" size={28} />
      case 'meal':
        return <Utensils className="text-orange-400" size={28} />
      case 'water':
        return <Droplets className="text-cyan-400" size={28} />
      case 'sleep':
        return <Moon className="text-purple-400" size={28} />
      default:
        return <Bell className="text-yellow-400" size={28} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card-lg bg-[var(--surface)] border-2 border-[var(--accent)]/60 max-w-md w-full p-6 text-center shadow-2xl shadow-[var(--accent)]/20 animate-scale-up relative">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted hover:text-text-main p-1 rounded-lg hover:bg-surface-2 transition-colors"
          aria-label="Dismiss Alarm"
        >
          <X size={20} />
        </button>

        {/* Pulsating Alarm Icon */}
        <div className="relative mx-auto mb-4 w-16 h-16 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping opacity-75" />
          <div className="relative z-10 animate-bounce">{getIcon()}</div>
        </div>

        {/* Time Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-bold text-accent mb-2">
          <Clock size={12} />
          <span>{alarm.time}</span>
          <span className="text-muted">• Scheduled Alarm</span>
        </div>

        {/* Title & Message */}
        <h2 className="text-xl font-black text-text-main mb-1.5 tracking-tight">
          {alarm.title}
        </h2>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          {alarm.message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            size="lg"
            fullWidth
            onClick={handleAction}
            className="flex items-center justify-center gap-2 font-black text-base shadow-lg shadow-[var(--accent)]/30"
          >
            <span>
              {alarm.type === 'workout'
                ? 'Start Workout Now 🚀'
                : alarm.type === 'meal'
                ? 'View & Log Meal 🥗'
                : 'Take Action Now ⚡'}
            </span>
            <ArrowRight size={16} />
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={handleSnooze}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted hover:text-text-main"
            >
              <RotateCcw size={14} /> Snooze 5 min
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={handleDismiss}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted hover:text-text-main"
            >
              <CheckCircle2 size={14} /> Done / Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
