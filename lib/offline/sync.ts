'use client'

import {
  getPendingSyncs,
  deletePendingSync,
  incrementSyncRetry,
  getPendingSyncCount,
} from './store'
import type { SyncStatus } from '@/types'

const MAX_RETRIES = 5

/**
 * Sync engine: processes pending sync queue when online.
 * Call startSyncEngine() once at app startup.
 */

let syncStatusListeners: Array<(status: SyncStatus) => void> = []
let currentStatus: SyncStatus = 'online'

export function getSyncStatus(): SyncStatus {
  return currentStatus
}

export function subscribeSyncStatus(cb: (status: SyncStatus) => void): () => void {
  syncStatusListeners.push(cb)
  cb(currentStatus) // immediately call with current status
  return () => {
    syncStatusListeners = syncStatusListeners.filter((l) => l !== cb)
  }
}

function emitStatus(status: SyncStatus): void {
  currentStatus = status
  syncStatusListeners.forEach((l) => l(status))
}

/** Process all items in the pending sync queue */
export async function processSyncQueue(): Promise<void> {
  const pending = await getPendingSyncs()
  if (pending.length === 0) {
    emitStatus('synced')
    return
  }

  emitStatus('syncing')

  // Dynamically import to avoid circular deps
  const { supabase } = await import('@/lib/supabase/client')

  let allSucceeded = true

  for (const item of pending) {
    if (item.retries >= MAX_RETRIES) {
      await deletePendingSync(item.id) // give up after max retries
      continue
    }

    try {
      let error: { message: string } | null = null

      if (item.operation === 'upsert') {
        const result = await (supabase.from(item.table) as ReturnType<typeof supabase.from>)
          .upsert(item.payload as Record<string, unknown>)
        error = result.error
      } else if (item.operation === 'insert') {
        const result = await (supabase.from(item.table) as ReturnType<typeof supabase.from>)
          .insert(item.payload as Record<string, unknown>)
        error = result.error
      } else if (item.operation === 'update') {
        const payload = item.payload as Record<string, unknown>
        const { id, ...rest } = payload
        const result = await (supabase.from(item.table) as ReturnType<typeof supabase.from>)
          .update(rest)
          .eq('id', id as string)
        error = result.error
      }

      if (!error) {
        await deletePendingSync(item.id)
      } else {
        await incrementSyncRetry(item.id)
        allSucceeded = false
      }
    } catch {
      await incrementSyncRetry(item.id)
      allSucceeded = false
    }
  }

  const remaining = await getPendingSyncCount()
  emitStatus(remaining === 0 ? 'synced' : 'error')
}

/** Start the sync engine — sets up online/offline listeners and processes queue */
export function startSyncEngine(): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleOnline = () => {
    emitStatus('online')
    void processSyncQueue()
  }

  const handleOffline = () => {
    emitStatus('offline')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Set initial status
  emitStatus(navigator.onLine ? 'online' : 'offline')

  // Try to sync any pending items on startup
  if (navigator.onLine) {
    void processSyncQueue()
  }

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}
