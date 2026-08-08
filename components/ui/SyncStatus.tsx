'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { subscribeSyncStatus } from '@/lib/offline/sync'
import type { SyncStatus } from '@/types'

const CONFIG: Record<
  SyncStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  online: {
    icon: <Wifi size={12} />,
    label: 'Online',
    className: 'text-green-400',
  },
  offline: {
    icon: <WifiOff size={12} />,
    label: 'Offline',
    className: 'text-yellow-400',
  },
  syncing: {
    icon: <RefreshCw size={12} className="animate-spin" />,
    label: 'Syncing…',
    className: 'text-blue-400',
  },
  synced: {
    icon: <CheckCircle size={12} />,
    label: 'Synced',
    className: 'text-green-400',
  },
  error: {
    icon: <AlertCircle size={12} />,
    label: 'Sync error',
    className: 'text-red-400',
  },
}

export function SyncStatus() {
  const [status, setStatus] = useState<SyncStatus>('online')

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus(setStatus)
    return unsubscribe
  }, [])

  const config = CONFIG[status]

  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium ${config.className}`}
      aria-live="polite"
      aria-label={`Sync status: ${config.label}`}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  )
}
