'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Dumbbell, Apple, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Today' },
  { href: '/workout', icon: Dumbbell, label: 'Workout' },
  { href: '/nutrition', icon: Apple, label: 'Nutrition' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border pb-safe"
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'tab-btn',
                isActive && 'active'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
