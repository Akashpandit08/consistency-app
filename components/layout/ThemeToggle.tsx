'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted border border-border bg-surface hover:bg-surface-2 transition-colors">
        <div className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 rounded-full flex items-center justify-center text-muted border border-border bg-surface hover:bg-surface-2 transition-colors relative overflow-hidden focus-visible"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <div className={`transition-transform duration-500 flex items-center justify-center absolute inset-0 ${isDark ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <Moon size={14} className="text-text-main" />
      </div>
      
      <div className={`transition-transform duration-500 flex items-center justify-center absolute inset-0 ${isDark ? '-translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <Sun size={15} className="text-black" />
      </div>
    </button>
  )
}
