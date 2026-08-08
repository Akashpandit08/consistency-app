'use client'

import { useEffect, useState } from 'react'
import { startAlarmEngine, stopAlarmEngine } from '@/lib/notifications/alarmService'
import { ActiveAlarmModal } from './ActiveAlarmModal'
import { NotificationSettingsModal } from './NotificationSettingsModal'

export function NotificationAlarmProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    startAlarmEngine()

    function handleOpenSettings() {
      setSettingsOpen(true)
    }

    window.addEventListener('consistency_open_notification_settings', handleOpenSettings)
    return () => {
      stopAlarmEngine()
      window.removeEventListener('consistency_open_notification_settings', handleOpenSettings)
    }
  }, [])

  return (
    <>
      {children}
      <ActiveAlarmModal />
      <NotificationSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
