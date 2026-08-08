'use client'

import { Bell } from 'lucide-react'
import { SyncStatus } from '@/components/ui/SyncStatus'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { cn } from '@/lib/utils'

interface TopBarProps {
  title?: string
  subtitle?: string
  right?: React.ReactNode
  className?: string
  hideAlarmBell?: boolean
}

export function TopBar({ title, subtitle, right, className, hideAlarmBell }: TopBarProps) {
  function handleOpenAlarms() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('consistency_open_notification_settings'))
    }
  }

  return (
    <header
      className={cn(
        'flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 z-40',
        'bg-bg/90 backdrop-blur-md border-b border-border/50',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-lg font-black text-text-main truncate leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-muted truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5 ml-3 shrink-0">
        <ThemeToggle />

        {!hideAlarmBell && (
          <button
            onClick={handleOpenAlarms}
            title="Alarms & Reminders"
            className="p-1.5 rounded-lg bg-surface-2 border border-border/70 text-muted hover:text-accent hover:border-border-hover transition-colors cursor-pointer"
          >
            <Bell size={16} />
          </button>
        )}
        <SyncStatus />
        {right}
      </div>
    </header>
  )
}

