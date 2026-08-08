import { openDB, type IDBPDatabase } from 'idb'
import type {
  ActiveWorkoutState,
  CustomExercise,
  CustomWeeklySchedule,
  DailyCalorieMacroSummary,
  ExerciseSet,
  HeartRateLog,
  PendingSync,
  StepLog,
} from '@/types'

const DB_NAME = 'consistency_offline'
const DB_VERSION = 2

interface ConsistencyDB {
  pending_syncs: {
    key: string
    value: PendingSync
    indexes: { by_table: string; by_created_at: number }
  }
  active_workout: {
    key: string
    value: ActiveWorkoutState
  }
  workout_drafts: {
    key: string // sessionId
    value: ActiveWorkoutState
    indexes: { by_started_at: string }
  }
  custom_exercises: {
    key: string // id
    value: CustomExercise
    indexes: { by_created_at: string }
  }
}

let db: IDBPDatabase<ConsistencyDB> | null = null

export async function getDB(): Promise<IDBPDatabase<ConsistencyDB>> {
  if (db) return db

  db = await openDB<ConsistencyDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Pending sync queue
      if (!database.objectStoreNames.contains('pending_syncs')) {
        const store = database.createObjectStore('pending_syncs', { keyPath: 'id' })
        store.createIndex('by_table', 'table')
        store.createIndex('by_created_at', 'created_at')
      }

      // Active workout (only one at a time)
      if (!database.objectStoreNames.contains('active_workout')) {
        database.createObjectStore('active_workout', { keyPath: 'sessionId' })
      }

      // Workout drafts (can have multiple saved)
      if (!database.objectStoreNames.contains('workout_drafts')) {
        const drafts = database.createObjectStore('workout_drafts', { keyPath: 'sessionId' })
        drafts.createIndex('by_started_at', 'startedAt')
      }

      // Custom exercises
      if (!database.objectStoreNames.contains('custom_exercises')) {
        const customStore = database.createObjectStore('custom_exercises', { keyPath: 'id' })
        customStore.createIndex('by_created_at', 'created_at')
      }
    },
  })

  return db
}

// ─── Active Workout ────────────────────────────────────────────

export async function saveActiveWorkout(state: ActiveWorkoutState): Promise<void> {
  const database = await getDB()
  await database.put('active_workout', state)
}

export async function getActiveWorkout(): Promise<ActiveWorkoutState | undefined> {
  const database = await getDB()
  const all = await database.getAll('active_workout')
  return all[0] // only one active workout at a time
}

export async function clearActiveWorkout(sessionId: string): Promise<void> {
  const database = await getDB()
  await database.delete('active_workout', sessionId)
}

// ─── Sync Queue ────────────────────────────────────────────────

export async function enqueuePendingSync(
  item: Omit<PendingSync, 'id' | 'created_at' | 'retries'>
): Promise<void> {
  const database = await getDB()
  const pending: PendingSync = {
    ...item,
    id: crypto.randomUUID(),
    created_at: Date.now(),
    retries: 0,
  }
  await database.add('pending_syncs', pending)
}

export async function getPendingSyncs(): Promise<PendingSync[]> {
  const database = await getDB()
  return database.getAll('pending_syncs')
}

export async function deletePendingSync(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('pending_syncs', id)
}

export async function incrementSyncRetry(id: string): Promise<void> {
  const database = await getDB()
  const tx = database.transaction('pending_syncs', 'readwrite')
  const item = await tx.store.get(id)
  if (item) {
    await tx.store.put({ ...item, retries: item.retries + 1 })
  }
  await tx.done
}

export async function getPendingSyncCount(): Promise<number> {
  const database = await getDB()
  return database.count('pending_syncs')
}

// ─── Custom Exercises ──────────────────────────────────────────

export async function saveCustomExercise(exercise: CustomExercise): Promise<void> {
  const database = await getDB()
  await database.put('custom_exercises', exercise)
}

export async function getCustomExercises(): Promise<CustomExercise[]> {
  const database = await getDB()
  return database.getAll('custom_exercises')
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const database = await getDB()
  await database.delete('custom_exercises', id)
}

// ─── Weekly Schedule Persistence ───────────────────────────────
const SCHEDULE_KEY = 'consistency_custom_weekly_schedule'

export function saveWeeklySchedule(scheduleData: CustomWeeklySchedule): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleData))
    }
  } catch (err) {
    console.warn('Failed to save weekly schedule to localStorage:', err)
  }
}

export function getWeeklySchedule(): CustomWeeklySchedule | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(SCHEDULE_KEY)
      if (raw) {
        return JSON.parse(raw) as CustomWeeklySchedule
      }
    }
  } catch (err) {
    console.warn('Failed to read weekly schedule from localStorage:', err)
  }
  return null
}

// ─── Biometrics: Heart Rate Persistence ────────────────────────
const HR_KEY = 'consistency_heart_rate_logs'

export function saveHeartRateLog(log: HeartRateLog): void {
  try {
    if (typeof window !== 'undefined') {
      const existing = getHeartRateLogs()
      const updated = [log, ...existing].slice(0, 100) // retain last 100
      window.localStorage.setItem(HR_KEY, JSON.stringify(updated))
    }
  } catch (err) {
    console.warn('Failed to save heart rate log:', err)
  }
}

export function getHeartRateLogs(): HeartRateLog[] {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(HR_KEY)
      if (raw) return JSON.parse(raw) as HeartRateLog[]
    }
  } catch (err) {
    console.warn('Failed to read heart rate logs:', err)
  }
  return []
}

// ─── Biometrics: Steps & Activity Persistence ──────────────────
const STEPS_PREFIX = 'consistency_steps_'

export function saveStepLog(log: StepLog): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${STEPS_PREFIX}${log.log_date}`, JSON.stringify(log))
    }
  } catch (err) {
    console.warn('Failed to save step log:', err)
  }
}

export function getStepLog(dateStr: string): StepLog | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(`${STEPS_PREFIX}${dateStr}`)
      if (raw) return JSON.parse(raw) as StepLog
    }
  } catch (err) {
    console.warn('Failed to read step log:', err)
  }
  return null
}

// ─── Biometrics: Calorie & Macro Persistence ───────────────────
const CALORIES_PREFIX = 'consistency_calories_'

export function saveCalorieMacroSummary(summary: DailyCalorieMacroSummary): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`${CALORIES_PREFIX}${summary.log_date}`, JSON.stringify(summary))
    }
  } catch (err) {
    console.warn('Failed to save calorie summary:', err)
  }
}

export function getCalorieMacroSummary(dateStr: string): DailyCalorieMacroSummary | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(`${CALORIES_PREFIX}${dateStr}`)
      if (raw) return JSON.parse(raw) as DailyCalorieMacroSummary
    }
  } catch (err) {
    console.warn('Failed to read calorie summary:', err)
  }
  return null
}


