'use client'

import { useState, useEffect } from 'react'
import { HeartRateLog, HeartRateZone } from '@/types'
import { getHeartRateLogs, saveHeartRateLog } from '@/lib/offline/store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Heart, Activity, Plus, Clock, Zap, Flame, ShieldAlert, Check } from 'lucide-react'

export function getHeartRateZone(bpm: number): HeartRateZone {
  if (bpm < 110) return 'recovery'
  if (bpm <= 140) return 'fat_burn'
  if (bpm <= 165) return 'cardio'
  return 'peak'
}

export const ZONE_META: Record<
  HeartRateZone,
  { label: string; range: string; color: string; bg: string; text: string; border: string; desc: string }
> = {
  recovery: {
    label: 'Recovery & Rest',
    range: '< 110 BPM',
    color: '#38bdf8',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    desc: 'Active recovery, resting baseline, and muscle repair.',
  },
  fat_burn: {
    label: 'Fat Burn Zone',
    range: '110–140 BPM',
    color: '#34d399',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'Optimal aerobic fat oxidation and cardiovascular base building.',
  },
  cardio: {
    label: 'Cardio & Stamina',
    range: '141–165 BPM',
    color: '#fbbf24',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    desc: 'High-intensity endurance and aerobic capacity conditioning.',
  },
  peak: {
    label: 'Peak Anaerobic',
    range: '165+ BPM',
    color: '#f87171',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    desc: 'Maximum exertion, hypertrophy pump, and sprint performance.',
  },
}

export function HeartRateTracker() {
  const [logs, setLogs] = useState<HeartRateLog[]>([])
  const [bpmInput, setBpmInput] = useState<string>('')
  const [logType, setLogType] = useState<HeartRateLog['type']>('current')
  const [justLogged, setJustLogged] = useState(false)

  useEffect(() => {
    const saved = getHeartRateLogs()
    if (saved && saved.length > 0) {
      setLogs(saved)
    } else {
      // Default demo readings for immediate delight
      const initial: HeartRateLog[] = [
        {
          id: 'hr_1',
          user_id: 'local',
          bpm: 68,
          type: 'resting',
          zone: 'recovery',
          logged_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'hr_2',
          user_id: 'local',
          bpm: 142,
          type: 'workout',
          zone: 'cardio',
          logged_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ]
      setLogs(initial)
    }
  }, [])

  const latestReading = logs[0] || { bpm: 72, zone: 'recovery' as HeartRateZone, type: 'resting' as const }
  const currentZone = ZONE_META[latestReading.zone] || ZONE_META.recovery

  function handleLogBpm(customBpm?: number, customType?: HeartRateLog['type']) {
    const targetBpm = customBpm || parseInt(bpmInput, 10)
    if (!targetBpm || targetBpm < 40 || targetBpm > 240) return

    const newLog: HeartRateLog = {
      id: crypto.randomUUID(),
      user_id: 'local',
      bpm: targetBpm,
      type: customType || logType,
      zone: getHeartRateZone(targetBpm),
      logged_at: new Date().toISOString(),
    }

    saveHeartRateLog(newLog)
    setLogs((prev) => [newLog, ...prev])
    setBpmInput('')
    setJustLogged(true)
    setTimeout(() => setJustLogged(false), 2000)
  }

  return (
    <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart size={18} className="animate-pulse fill-rose-500/30 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main">Heart Rate & Pulse</h3>
            <p className="text-muted text-[11px]">Real-time cardiovascular biometrics & zones</p>
          </div>
        </div>

        <span className={cn('badge font-bold text-xs', currentZone.bg, currentZone.text, currentZone.border)}>
          {currentZone.label}
        </span>
      </div>

      {/* Hero Live BPM Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-2 to-surface border border-border flex items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-center">
              <Heart
                size={32}
                className="text-rose-400 fill-rose-500 animate-pulse"
                style={{
                  animationDuration: `${Math.max(0.4, 60 / (latestReading.bpm || 72))}s`,
                }}
              />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-text-main tabular-nums tracking-tight">
                {latestReading.bpm}
              </span>
              <span className="text-xs text-muted font-bold uppercase tracking-wider">BPM</span>
            </div>
            <p className="text-muted text-xs capitalize mt-0.5">
              Latest reading • {latestReading.type} pulse
            </p>
          </div>
        </div>

        {/* Zone indicator pill */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-text-main">{currentZone.range}</p>
          <p className="text-[10px] text-muted max-w-[140px]">{currentZone.desc}</p>
        </div>
      </div>

      {/* Heart Rate Zones Visual Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-muted">
          <span>Heart Rate Zones</span>
          <span className="text-accent">{currentZone.label} ({latestReading.bpm} BPM)</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-2.5 rounded-full overflow-hidden bg-surface-2 p-0.5 border border-border">
          {(['recovery', 'fat_burn', 'cardio', 'peak'] as HeartRateZone[]).map((z) => {
            const isMatch = latestReading.zone === z
            const zMeta = ZONE_META[z]
            return (
              <div
                key={z}
                title={`${zMeta.label} (${zMeta.range})`}
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isMatch ? 'opacity-100 ring-2 ring-white/50 scale-y-125' : 'opacity-40'
                )}
                style={{ backgroundColor: zMeta.color }}
              />
            )
          })}
        </div>
        <div className="flex justify-between text-[9px] text-muted uppercase font-semibold px-1">
          <span>Rest &lt;110</span>
          <span>Fat Burn 110-140</span>
          <span>Cardio 140-165</span>
          <span>Peak 165+</span>
        </div>
      </div>

      {/* Quick Log Presets & Custom Input */}
      <div className="p-3.5 rounded-2xl bg-surface-2 border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
            <Activity size={14} className="text-accent" /> Log Pulse Reading
          </span>
          {justLogged && (
            <span className="text-accent text-xs font-bold flex items-center gap-1 animate-scale-up">
              <Check size={13} /> Logged!
            </span>
          )}
        </div>

        {/* Type selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['current', 'resting', 'workout', 'walking'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLogType(t)}
              className={cn(
                'py-1 text-[11px] font-bold rounded-lg border capitalize transition-all cursor-pointer text-center',
                logType === t
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-surface border-border text-muted hover:text-text-main'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Input & Quick Presets */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="40"
            max="240"
            placeholder="e.g. 135"
            value={bpmInput}
            onChange={(e) => setBpmInput(e.target.value)}
            className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-main font-bold placeholder:text-muted/60 focus:border-accent"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleLogBpm()}
            disabled={!bpmInput}
            className="font-bold shrink-0"
          >
            <Plus size={14} /> Log BPM
          </Button>
        </div>

        {/* Fast 1-Tap Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted font-bold mr-1">Quick:</span>
          {[
            { label: '🧘 Rest 65', bpm: 65, type: 'resting' as const },
            { label: '🚶 Walk 105', bpm: 105, type: 'walking' as const },
            { label: '🔥 Cardio 145', bpm: 145, type: 'workout' as const },
            { label: '⚡ Peak 175', bpm: 175, type: 'workout' as const },
          ].map((preset) => (
            <button
              key={preset.bpm}
              type="button"
              onClick={() => handleLogBpm(preset.bpm, preset.type)}
              className="px-2 py-1 rounded-lg bg-surface hover:bg-surface-3 border border-border text-[10px] font-bold text-text-main transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Heart Rate History */}
      {logs.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Recent Pulse Readings
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {logs.slice(0, 5).map((item) => {
              const zMeta = ZONE_META[item.zone] || ZONE_META.recovery
              const timeStr = new Date(item.logged_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <div
                  key={item.id}
                  className="p-2 rounded-xl bg-surface-2 border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2 h-2 rounded-full shrink-0', zMeta.bg)} style={{ backgroundColor: zMeta.color }} />
                    <span className="font-black text-text-main">{item.bpm} BPM</span>
                    <span className="text-muted capitalize text-[11px]">({item.type})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase', zMeta.bg, zMeta.text)}>
                      {zMeta.label}
                    </span>
                    <span className="text-muted text-[10px]">{timeStr}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
