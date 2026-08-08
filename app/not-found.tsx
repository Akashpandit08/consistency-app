import Link from 'next/link'
import { Dumbbell, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg text-text-main flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 text-accent-dark shadow-lg shadow-accent/20">
        <Dumbbell size={32} />
      </div>

      <h1 className="text-4xl font-black mb-2">404 — Page Not Found</h1>
      <p className="text-muted max-w-sm mb-6 text-sm">
        Looks like this page skipped gym day. Let&apos;s get you back on track.
      </p>

      <Link
        href="/dashboard"
        className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3"
      >
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </main>
  )
}
