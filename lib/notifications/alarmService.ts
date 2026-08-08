'use client'

import { soundFx } from '@/lib/audio/workoutAudio'
import type {
  ActiveAlarmTrigger,
  AlarmTone,
  AppAlarmConfig,
  DayOfWeek,
  NotificationSettings,
} from '@/types'

const SETTINGS_KEY = 'consistency_notification_settings_v1'
const LAST_TRIGGERED_KEY = 'consistency_last_triggered_alarms'

export const DEFAULT_APP_ALARMS: AppAlarmConfig[] = [
  {
    id: 'alarm_workout',
    title: '🏋️ Time for Workout!',
    type: 'workout',
    time: '18:00',
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
    tone: 'fanfare',
    message: 'Keep your streak alive. 45-60 min workout session is waiting for you!',
  },
  {
    id: 'alarm_breakfast',
    title: '🍳 Breakfast & Protein Fuel',
    type: 'meal',
    meal_name: 'Breakfast',
    time: '08:00',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    tone: 'chime',
    message: 'Fuel your morning with high protein & clean carbs.',
  },
  {
    id: 'alarm_lunch',
    title: '🥗 Power Lunch Time',
    type: 'meal',
    meal_name: 'Lunch',
    time: '13:30',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    tone: 'chime',
    message: 'Time to recharge with your scheduled lunch meal.',
  },
  {
    id: 'alarm_pre_workout',
    title: '🍌 Pre-Workout Energy',
    type: 'meal',
    meal_name: 'Pre-Workout Snack',
    time: '17:00',
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
    tone: 'energetic',
    message: 'Grab your pre-workout carbs or shake for peak strength!',
  },
  {
    id: 'alarm_dinner',
    title: '🥩 High-Protein Dinner',
    type: 'meal',
    meal_name: 'Dinner',
    time: '20:30',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    tone: 'chime',
    message: 'Hit your remaining daily protein and recovery calories.',
  },
  {
    id: 'alarm_water_midday',
    title: '💧 Hydration Check!',
    type: 'water',
    time: '15:00',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    tone: 'hydration',
    message: 'Drink 250–500ml water to maintain peak performance and metabolism.',
  },
  {
    id: 'alarm_sleep',
    title: '🌙 Sleep & Recovery Wind-down',
    type: 'sleep',
    time: '22:30',
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
    tone: 'gentle',
    message: 'Put screens away. Muscle repair and growth happen while you sleep!',
  },
]

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  browser_permission: 'default',
  sound_enabled: true,
  vibration_enabled: true,
  alarms: DEFAULT_APP_ALARMS,
}

// ─── Settings Storage ──────────────────────────────────────────

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS
    const parsed = JSON.parse(raw) as NotificationSettings
    // Merge any missing default alarms
    const existingIds = new Set(parsed.alarms.map((a) => a.id))
    const missing = DEFAULT_APP_ALARMS.filter((a) => !existingIds.has(a.id))
    return {
      ...parsed,
      alarms: [...parsed.alarms, ...missing],
    }
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.warn('Failed to save notification settings:', err)
  }
}

// ─── Permission Request ────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    const current = getNotificationSettings()
    saveNotificationSettings({
      ...current,
      browser_permission: permission as 'default' | 'granted' | 'denied',
      enabled: permission === 'granted' ? true : current.enabled,
    })
    return permission
  } catch {
    return 'denied'
  }
}

// ─── Alarm Management ─────────────────────────────────────────

export function toggleAlarm(alarmId: string, enabled: boolean): NotificationSettings {
  const current = getNotificationSettings()
  const updatedAlarms = current.alarms.map((a) =>
    a.id === alarmId ? { ...a, enabled } : a
  )
  const updatedSettings = { ...current, alarms: updatedAlarms }
  saveNotificationSettings(updatedSettings)
  return updatedSettings
}

export function addOrUpdateAlarm(alarm: AppAlarmConfig): NotificationSettings {
  const current = getNotificationSettings()
  const existingIdx = current.alarms.findIndex((a) => a.id === alarm.id)
  let updatedAlarms: AppAlarmConfig[]

  if (existingIdx >= 0) {
    updatedAlarms = [...current.alarms]
    updatedAlarms[existingIdx] = alarm
  } else {
    updatedAlarms = [...current.alarms, alarm]
  }

  const updatedSettings = { ...current, alarms: updatedAlarms }
  saveNotificationSettings(updatedSettings)
  return updatedSettings
}

export function deleteAlarm(alarmId: string): NotificationSettings {
  const current = getNotificationSettings()
  const updatedAlarms = current.alarms.filter((a) => a.id !== alarmId)
  const updatedSettings = { ...current, alarms: updatedAlarms }
  saveNotificationSettings(updatedSettings)
  return updatedSettings
}

// ─── Alarm Trigger Engine ──────────────────────────────────────

let tickerInterval: NodeJS.Timeout | null = null

export function startAlarmEngine(): void {
  if (typeof window === 'undefined') return
  if (tickerInterval) return

  // Check immediately, then tick every 20 seconds
  checkAndTriggerAlarms()
  tickerInterval = setInterval(checkAndTriggerAlarms, 20_000)
}

export function stopAlarmEngine(): void {
  if (tickerInterval) {
    clearInterval(tickerInterval)
    tickerInterval = null
  }
}

/** Check if any configured alarms match current time */
function checkAndTriggerAlarms(): void {
  const settings = getNotificationSettings()
  if (!settings.enabled) return

  const now = new Date()
  const dayOfWeek = (now.getDay() === 0 ? 7 : now.getDay()) as DayOfWeek // 1=Mon .. 7=Sun
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const currentTimeStr = `${hours}:${minutes}`
  const dateKey = now.toISOString().split('T')[0]

  // Track already triggered alarms for this minute
  const triggeredKey = `${dateKey}_${currentTimeStr}`
  let triggeredHistory: Record<string, boolean> = {}
  try {
    triggeredHistory = JSON.parse(sessionStorage.getItem(LAST_TRIGGERED_KEY) || '{}')
  } catch {
    triggeredHistory = {}
  }

  for (const alarm of settings.alarms) {
    if (!alarm.enabled) continue
    if (!alarm.days.includes(dayOfWeek)) continue
    if (alarm.time !== currentTimeStr) continue

    const uniqueTriggerId = `${alarm.id}_${triggeredKey}`
    if (triggeredHistory[uniqueTriggerId]) {
      continue // Already fired this exact minute
    }

    // Mark as fired
    triggeredHistory[uniqueTriggerId] = true
    try {
      sessionStorage.setItem(LAST_TRIGGERED_KEY, JSON.stringify(triggeredHistory))
    } catch {
      // Ignore
    }

    // Fire alarm
    fireAlarm(alarm)
  }
}

/** Fire an active alarm with sound + notification + in-app event */
export function fireAlarm(alarm: AppAlarmConfig): void {
  const settings = getNotificationSettings()

  // 1. Play Synthesized Web Audio Sound
  if (settings.sound_enabled) {
    soundFx.playAlarmByTone(alarm.tone || 'chime')
  }

  // 2. Vibrate mobile device (if supported)
  if (settings.vibration_enabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400])
    } catch {
      // Ignore
    }
  }

  // 3. Dispatch Native Browser Notification
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(alarm.title, {
        body: alarm.message,
        icon: '/icons/icon-192.png',
        tag: `alarm_${alarm.id}`,
      })
    } catch {
      // Ignore notification creation errors
    }
  }

  // 4. Dispatch Custom In-App Event for UI Modal / Toast
  if (typeof window !== 'undefined') {
    const triggerData: ActiveAlarmTrigger = {
      id: crypto.randomUUID(),
      alarm,
      triggered_at: new Date().toISOString(),
    }
    const event = new CustomEvent('consistency_alarm_fired', { detail: triggerData })
    window.dispatchEvent(event)
  }
}

/** Manually test an alarm sound & notification */
export function testAlarm(alarm: AppAlarmConfig): void {
  fireAlarm({
    ...alarm,
    title: `[TEST] ${alarm.title}`,
    message: `${alarm.message} (Test alarm preview)`,
  })
}

/** Snooze an alarm for N minutes */
export function snoozeAlarm(alarm: AppAlarmConfig, snoozeMinutes = 5): void {
  if (typeof window === 'undefined') return

  setTimeout(() => {
    fireAlarm({
      ...alarm,
      title: `⏰ (Snoozed) ${alarm.title}`,
    })
  }, snoozeMinutes * 60 * 1000)
}
