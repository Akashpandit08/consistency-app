import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | Consistency',
  description: 'Consistency Fitness Terms of Service.',
}

export default function TermsPage() {
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
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Terms of Service</h1>
            <p className="text-muted text-xs">Last updated: August 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300 leading-relaxed card">
          <section>
            <h2 className="text-text-main font-bold text-base mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Consistency (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">2. Medical & Exercise Disclaimer</h2>
            <p>
              Consistency provides workout tracking and habit tooling for informational and fitness purposes only. It is not medical advice. Consult a healthcare professional before beginning any new intense physical exercise routine.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">3. User Conduct & Accounts</h2>
            <p>
              You agree to use the service in compliance with all applicable laws. You are responsible for safeguarding your email access and keeping your session secure.
            </p>
          </section>

          <section>
            <h2 className="text-text-main font-bold text-base mb-2">4. Service Availability & Modifications</h2>
            <p>
              We strive for 99.9% uptime and offline-first availability. We reserve the right to modify or discontinue features to improve the platform experience.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
