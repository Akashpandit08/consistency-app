import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Consistency',
  description: 'Consistency Fitness Privacy Policy — How we protect and respect your data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg text-text-main py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-text-main text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-dark font-black">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Privacy Policy</h1>
            <p className="text-muted text-xs">Last updated: August 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed card">
          <section>
            <h2 className="text-text-main font-bold text-base mb-2">1. Our Core Principle</h2>
            <p>
              Your health and fitness data belongs to you. We do not sell your personal data to third parties or advertising brokers. Period.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">2. Information We Collect</h2>
            <p>
              We collect your email address for passwordless authentication, your workout logs, body metrics, and preference data that you voluntarily submit to customize your training experience.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">3. Local Storage & Offline Use</h2>
            <p>
              Workouts logged while offline are stored on your local device (using IndexedDB) and synced to encrypted cloud databases once internet connectivity is restored.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">4. Your Rights (GDPR / CCPA)</h2>
            <p>
              You have the right to export all your data in standard JSON format anytime from the Settings page. You may also delete your account and all associated data permanently with one click.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">5. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, you can reach out to our team at privacy@consistency.app.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
