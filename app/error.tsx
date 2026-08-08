'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-bg text-text-main flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mb-6 text-danger">
        <AlertCircle size={32} />
      </div>

      <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
      <p className="text-muted max-w-sm mb-6 text-sm">
        An unexpected error occurred. Don&apos;t worry, your offline workout logs are safe in storage.
      </p>

      <Button onClick={reset} className="inline-flex items-center gap-2">
        <RotateCcw size={16} /> Try Again
      </Button>
    </main>
  )
}
