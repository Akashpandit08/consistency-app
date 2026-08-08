import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Dumbbell, Zap, Shield, Wifi, TrendingUp, Target, Trophy,
  CheckCircle2, Star, ArrowRight, Flame
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Consistency — Free Fitness Tracker | Win Today, Repeat Tomorrow',
  description:
    'Track your workouts, nutrition, water, sleep and progress — completely free. Works offline in the gym. Push/Pull/Legs, personalized plans, streak tracking. No subscription required.',
  openGraph: {
    title: 'Consistency — Free Fitness Tracker',
    description:
      'Track workouts, nutrition, and progress. Build habits that stick. Free forever.',
  },
}

const FEATURES = [
  {
    icon: <Dumbbell size={24} />,
    title: 'Professional Workout Tracking',
    desc: 'Set-by-set logging with weight, reps, and rest timer. Previous performance shown so you know when to increase the weight.',
  },
  {
    icon: <Flame size={24} />,
    title: 'Streak & Consistency Engine',
    desc: 'Build a habit loop that keeps you coming back. See your streak grow day by day. Miss a day? No punishment — just start again.',
  },
  {
    icon: <Wifi size={24} />,
    title: 'Works Offline in the Gym',
    desc: "No Wi-Fi? No problem. Log your workout without internet. It syncs automatically when you reconnect.",
  },
  {
    icon: <Target size={24} />,
    title: 'Personalized Workout Plans',
    desc: 'Push/Pull/Legs, Upper/Lower, or Bodyweight. Your plan adapts to your goal, experience level, and available equipment.',
  },
  {
    icon: <Trophy size={24} />,
    title: 'Personal Records',
    desc: 'Automatically detects when you set a new PR. Bench press PR? Squat PR? We celebrate it.',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Progress Tracking',
    desc: 'Track your weight, measurements, strength, and consistency over time. See how far you\'ve come.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Your Data, Private',
    desc: 'Your health data belongs to you. Stored securely, never sold. You can export or delete it any time.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Built for Real Life',
    desc: 'Bad day? 10-minute workout option keeps your streak alive. No judgment. Just progress.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Sign up free',
    desc: 'Email only. No password needed. No credit card. No trial period.',
  },
  {
    step: '2',
    title: 'Set your goal',
    desc: 'Build muscle, lose fat, get stronger, or just stay consistent. We build your plan.',
  },
  {
    step: '3',
    title: 'Start your first workout',
    desc: 'Follow your plan. Log your sets. Watch your progress.',
  },
  {
    step: '4',
    title: 'Build your streak',
    desc: 'Show up. Repeat. That\'s how real results happen.',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-bg text-text-main min-h-screen">
      {/* ─── Nav ─────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
            <span className="text-accent-dark font-black text-xl">C</span>
          </div>
          <span className="font-black text-lg text-text-main">Consistency</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-muted hover:text-text-main text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="btn-primary text-sm px-4 py-2"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="px-6 py-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 text-accent text-sm font-semibold mb-6">
          <Star size={14} /> Free forever. No credit card.
        </div>

        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6 text-text-main">
          BUILD YOUR BODY.
          <br />
          <span className="text-accent">BUILD YOUR CONSISTENCY.</span>
        </h1>

        <p className="text-xl text-muted mb-8 max-w-xl mx-auto leading-relaxed">
          A free fitness tracker designed to help you actually stay consistent.
          Track workouts, nutrition, and progress — even without internet.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Start free — no card needed
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="btn-ghost text-base px-6 py-4 w-full sm:w-auto justify-center"
          >
            Sign in
          </Link>
        </div>

        <p className="text-muted text-sm mt-4">
          Email only. No password. Takes 30 seconds.
        </p>
      </section>

      {/* ─── Stats ────────────────────────────────────── */}
      <section className="py-8 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: '100%', label: 'Free forever' },
            { value: 'Offline', label: 'Works in the gym' },
            { value: 'Secure', label: 'Your data is private' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-black text-accent">{value}</div>
              <div className="text-muted text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────── */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-12">
          Simple as it gets
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-accent-dark font-black text-xl">{step}</span>
              </div>
              <h3 className="font-bold text-text-main mb-2">{title}</h3>
              <p className="text-muted text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-black text-center mb-4">
          Everything you need. Nothing you don&apos;t.
        </h2>
        <p className="text-muted text-center mb-12 max-w-xl mx-auto">
          Built for real people with real lives — not competitive bodybuilders
          with 4 hours a day.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card hover:border-accent/30 transition-colors">
              <div className="text-accent mb-3">{icon}</div>
              <h3 className="font-bold text-text-main mb-2 text-sm">{title}</h3>
              <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Workout Types ────────────────────────────── */}
      <section className="py-16 px-6 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">
            Personalized for your goal
          </h2>
          <p className="text-muted mb-10">
            Your plan adapts to your experience, equipment, and schedule.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              {
                title: 'Push / Pull / Legs',
                desc: 'The most popular 3–6 day split for building muscle.',
                tag: 'Beginner–Advanced',
              },
              {
                title: 'Upper / Lower',
                desc: 'Train each muscle group twice a week for faster progress.',
                tag: 'Intermediate–Advanced',
              },
              {
                title: 'Bodyweight',
                desc: 'No equipment? No problem. Train anywhere, any time.',
                tag: 'All levels',
              },
            ].map(({ title, desc, tag }) => (
              <div key={title} className="card">
                <span className="badge-muted mb-3 inline-block">{tag}</span>
                <h3 className="font-bold text-text-main mb-2">{title}</h3>
                <p className="text-muted text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Free CTA ──────────────────────────────────── */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">🔥</div>
          <h2 className="text-4xl font-black mb-4">
            START YOUR FREE JOURNEY
          </h2>
          <p className="text-muted mb-8">
            Join thousands of people building real, lasting consistency.
            No subscription. No credit card. Free forever.
          </p>
          <Link
            href="/login"
            className="btn-primary text-lg px-10 py-5 inline-flex items-center gap-3"
          >
            Get started free
            <ArrowRight size={22} />
          </Link>
          <div className="flex items-center justify-center gap-4 mt-6 text-muted text-sm">
            {['Free forever', 'No credit card', 'Cancel anytime'].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-green-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                  <span className="text-accent-dark font-black text-sm">C</span>
                </div>
                <span className="font-black text-text-main">Consistency</span>
              </div>
              <p className="text-muted text-sm max-w-xs">
                A free fitness tracker built around one idea: show up.
              </p>
            </div>

            <div className="flex gap-12 text-sm">
              <div className="flex flex-col gap-2">
                <span className="text-text-main font-semibold">App</span>
                <Link href="/login" className="text-muted hover:text-text-main">Start free</Link>
                <Link href="/dashboard" className="text-muted hover:text-text-main">Dashboard</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-text-main font-semibold">Legal</span>
                <Link href="/privacy" className="text-muted hover:text-text-main">Privacy</Link>
                <Link href="/terms" className="text-muted hover:text-text-main">Terms</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-center text-muted text-xs">
            © {new Date().getFullYear()} Consistency. Free forever. Your data belongs to you.
          </div>
        </div>
      </footer>
    </div>
  )
}
