'use client'

import { useState, useEffect } from 'react'
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  testAlarm,
  DEFAULT_APP_ALARMS,
} from '@/lib/notifications/alarmService'
import { soundFx } from '@/lib/audio/workoutAudio'
import { Button } from '@/components/ui/Button'
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Utensils,
  Dumbbell,
  Droplets,
  Moon,
  X,
  Play,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type { AlarmTone, AppAlarmConfig, DayOfWeek, NotificationSettings } from '@/types'

const DAYS_OF_WEEK: { id: DayOfWeek; label: string }[] = [
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
  { id: 7, label: 'S' },
]

const TONE_OPTIONS: { id: AlarmTone; name: string; desc: string }[] = [
  { id: 'chime', name: 'Dual Chime', desc: 'Melodic Ding-Dong' },
  { id: 'energetic', name: 'Energetic Pulse', desc: 'High-energy beeps' },
  { id: 'gentle', name: 'Gentle Gong', desc: 'Soothing resonance' },
  { id: 'hydration', name: 'Water Drop', desc: 'FM bubble pop' },
  { id: 'fanfare', name: 'Victory Fanfare', desc: 'Triumphant chords' },
]

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showAddAlarm, setShowAddAlarm] = useState(false)

  // New Alarm state
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<AppAlarmConfig['type']>('meal')
  const [newTime, setNewTime] = useState('12:00')
  const [newDays, setNewDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5, 6, 7])
  const [newTone, setNewTone] = useState<AlarmTone>('chime')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
    }
    setSettings(getNotificationSettings())
  }, [isOpen])

  if (!isOpen) return null

  function handleRequestPermission() {
    void requestNotificationPermission().then((res) => {
      setPermission(res)
      setSettings(getNotificationSettings())
    })
  }

  function handleToggleMaster(enabled: boolean) {
    const updated = { ...settings, enabled }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleToggleSound(sound_enabled: boolean) {
    const updated = { ...settings, sound_enabled }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleToggleAlarm(alarmId: string, enabled: boolean) {
    const updatedAlarms = settings.alarms.map((a) =>
      a.id === alarmId ? { ...a, enabled } : a
    )
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleTimeChange(alarmId: string, time: string) {
    const updatedAlarms = settings.alarms.map((a) =>
      a.id === alarmId ? { ...a, time } : a
    )
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleToneChange(alarmId: string, tone: AlarmTone) {
    const updatedAlarms = settings.alarms.map((a) =>
      a.id === alarmId ? { ...a, tone } : a
    )
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)
    soundFx.playAlarmByTone(tone)
  }

  function handleDayToggle(alarmId: string, day: DayOfWeek) {
    const updatedAlarms = settings.alarms.map((a) => {
      if (a.id !== alarmId) return a
      const hasDay = a.days.includes(day)
      const nextDays = hasDay ? a.days.filter((d) => d !== day) : [...a.days, day]
      return { ...a, days: nextDays.sort((a, b) => a - b) }
    })
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleDeleteAlarm(alarmId: string) {
    const updatedAlarms = settings.alarms.filter((a) => a.id !== alarmId)
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)
  }

  function handleAddAlarmSubmit() {
    if (!newTitle.trim() || !newTime) return
    const newAlarm: AppAlarmConfig = {
      id: `custom_${crypto.randomUUID()}`,
      title: newTitle.trim(),
      type: newType,
      time: newTime,
      days: newDays.length > 0 ? newDays : [1, 2, 3, 4, 5, 6, 7],
      enabled: true,
      tone: newTone,
      message: `Time for ${newTitle.trim()}!`,
    }

    const updatedAlarms = [...settings.alarms, newAlarm]
    const updated = { ...settings, alarms: updatedAlarms }
    setSettings(updated)
    saveNotificationSettings(updated)

    setNewTitle('')
    setShowAddAlarm(false)
  }

  const getTypeIcon = (type: AppAlarmConfig['type']) => {
    switch (type) {
      case 'workout':
        return <Dumbbell className="text-[var(--accent)]" size={16} />
      case 'meal':
        return <Utensils className="text-orange-400" size={16} />
      case 'water':
        return <Droplets className="text-cyan-400" size={16} />
      case 'sleep':
        return <Moon className="text-purple-400" size={16} />
      default:
        return <Bell className="text-yellow-400" size={16} />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card-lg bg-[var(--surface)] border border-[var(--border)] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/30 flex items-center justify-center text-accent">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-text-main flex items-center gap-2">
                Alarms & Reminders
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-accent font-bold border border-[var(--accent)]/30">
                  Superapp
                </span>
              </h2>
              <p className="text-xs text-muted">
                Audio synthesized cues + browser alerts for meals & workouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text-main p-1 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Permission Card */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-text-main">
                <ShieldCheck size={16} className={permission === 'granted' ? 'text-accent' : 'text-yellow-400'} />
                <span>Browser Push Notifications</span>
              </div>
              <p className="text-xs text-muted">
                {permission === 'granted'
                  ? 'Active • Desktop & mobile system notifications enabled'
                  : 'Enable system alerts so you never miss a meal or workout'}
              </p>
            </div>
            {permission !== 'granted' ? (
              <Button size="sm" onClick={handleRequestPermission} className="text-xs shrink-0">
                Enable Alerts
              </Button>
            ) : (
              <span className="text-xs font-bold text-accent px-2.5 py-1 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30">
                Enabled ✓
              </span>
            )}
          </div>

          {/* Master Sound & Tone Bar */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-surface-1 text-accent">
                  {settings.sound_enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-text-main">Audio Synthesizer</div>
                  <div className="text-[10px] text-muted">0-Byte synthesized alarm</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sound_enabled}
                onChange={(e) => handleToggleSound(e.target.checked)}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-surface-1 text-accent">
                  <Play size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-text-main">Test Tone Preview</div>
                  <div className="text-[10px] text-muted">Click to audition</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => soundFx.playAlarmChime()}
                className="text-xs px-2.5 py-1"
              >
                Play 🔔
              </Button>
            </div>
          </div>

          {/* Alarms List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                Configured Alarms ({settings.alarms.length})
              </h3>
              <button
                onClick={() => setShowAddAlarm(!showAddAlarm)}
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Custom Alarm
              </button>
            </div>

            {/* Add Custom Alarm Form */}
            {showAddAlarm && (
              <div className="p-4 rounded-xl bg-surface-3 border border-[var(--accent)]/40 space-y-3 animate-fade-in">
                <div className="text-xs font-bold text-text-main">Create New Alarm</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold block mb-1">Alarm Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Afternoon Protein Snack"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-1 border border-border text-text-main focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold block mb-1">Alarm Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as AppAlarmConfig['type'])}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-1 border border-border text-text-main focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="meal">Meal / Diet</option>
                      <option value="workout">Workout Session</option>
                      <option value="water">Water Hydration</option>
                      <option value="sleep">Sleep Wind-down</option>
                      <option value="habit">Habit / Task</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold block mb-1">Time (24h)</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-1 border border-border text-text-main focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted uppercase font-bold block mb-1">Sound Tone</label>
                    <select
                      value={newTone}
                      onChange={(e) => {
                        const tone = e.target.value as AlarmTone
                        setNewTone(tone)
                        soundFx.playAlarmByTone(tone)
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-surface-1 border border-border text-text-main focus:outline-none focus:border-[var(--accent)]"
                    >
                      {TONE_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddAlarm(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddAlarmSubmit} className="text-xs font-bold">
                    Save Alarm
                  </Button>
                </div>
              </div>
            )}

            {/* List of existing alarms */}
            <div className="space-y-2.5">
              {settings.alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    alarm.enabled
                      ? 'bg-surface-2 border-border hover:border-border-hover'
                      : 'bg-surface-1/50 border-border/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-surface-1 shrink-0">
                        {getTypeIcon(alarm.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-text-main truncate">{alarm.title}</div>
                        <div className="text-[10px] text-muted truncate">{alarm.message}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Time input */}
                      <input
                        type="time"
                        value={alarm.time}
                        onChange={(e) => handleTimeChange(alarm.id, e.target.value)}
                        className="px-2 py-1 text-xs font-mono font-bold bg-surface-1 border border-border rounded-md text-accent focus:outline-none focus:border-[var(--accent)]"
                      />

                      {/* Test trigger */}
                      <button
                        onClick={() => testAlarm(alarm)}
                        title="Test Alarm Sound"
                        className="p-1.5 rounded-md hover:bg-surface-3 text-muted hover:text-accent transition-colors"
                      >
                        <Play size={13} />
                      </button>

                      {/* Toggle */}
                      <input
                        type="checkbox"
                        checked={alarm.enabled}
                        onChange={(e) => handleToggleAlarm(alarm.id, e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Day Pills & Tone Selector */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px]">
                    <div className="flex items-center gap-1">
                      {DAYS_OF_WEEK.map((d) => {
                        const active = alarm.days.includes(d.id)
                        return (
                          <button
                            key={d.id}
                            onClick={() => handleDayToggle(alarm.id, d.id)}
                            className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                              active
                                ? 'bg-[var(--accent)]/20 text-accent border border-[var(--accent)]/40'
                                : 'bg-surface-1 text-muted hover:text-text-main'
                            }`}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={alarm.tone || 'chime'}
                        onChange={(e) => handleToneChange(alarm.id, e.target.value as AlarmTone)}
                        className="bg-surface-1 border border-border rounded px-1.5 py-0.5 text-[10px] text-muted focus:outline-none focus:text-text-main"
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>

                      {alarm.id.startsWith('custom_') && (
                        <button
                          onClick={() => handleDeleteAlarm(alarm.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete Custom Alarm"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-1 flex justify-between items-center">
          <span className="text-xs text-muted">
            ⚡ Runs 100% locally in browser • $0 server cost
          </span>
          <Button size="sm" onClick={onClose} className="text-xs font-bold">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
