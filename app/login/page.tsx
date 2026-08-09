'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { emailSchema, passwordSchema } from '@/lib/validation/schemas'
import { track } from '@/lib/analytics/events'
import { Button } from '@/components/ui/Button'
import { Mail, Lock, ArrowLeft, CheckCircle, Dumbbell, Zap, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

type LoginState = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState<LoginState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleDemoLogin() {
    setState('sending')
    // Set mock demo session cookie for local preview
    document.cookie = 'sb-demo-auth-token=demo-user-active; path=/; max-age=604800; SameSite=Lax'
    track('signup_completed', { method: 'demo_mode' })
    setTimeout(() => {
      router.push('/onboarding')
    }, 400)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    const emailResult = emailSchema.safeParse(email.trim())
    if (!emailResult.success) {
      setErrorMsg(emailResult.error.issues[0]?.message ?? 'Invalid email address')
      return
    }

    const passwordResult = passwordSchema.safeParse(password)
    if (!passwordResult.success) {
      setErrorMsg(passwordResult.error.issues[0]?.message ?? 'Invalid password')
      return
    }

    setState('sending')
    track(mode === 'signup' ? 'signup_started' : 'login_started', { method: 'email_password' })

    // Check if real Supabase credentials are wired
    if (!isSupabaseConfigured()) {
      // Local demo fallback: allow instant sign-in without breaking
      document.cookie = 'sb-demo-auth-token=demo-user-active; path=/; max-age=604800; SameSite=Lax'
      track('signup_completed', { method: 'email_password_demo' })
      setTimeout(() => {
        router.push('/onboarding')
      }, 500)
      return
    }

    try {
      let error = null
      
      if (mode === 'signup') {
        const res = await supabase.auth.signUp({
          email: emailResult.data,
          password: passwordResult.data,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        })
        error = res.error
      } else {
        const res = await supabase.auth.signInWithPassword({
          email: emailResult.data,
          password: passwordResult.data,
        })
        error = res.error
      }

      if (error) {
        setErrorMsg(error.message)
        setState('error')
        return
      }

      if (mode === 'signup') {
        setState('sent')
        track('signup_completed', { method: 'email_password' })
      } else {
        track('login_completed', { method: 'email_password' })
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setErrorMsg(message)
      setState('error')
    }
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col text-text-main">
      {/* Back to home */}
      <div className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-text-main transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#b7ff3c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#b7ff3c]/25">
              <span className="text-[#080b10] font-black text-3xl">C</span>
            </div>
            <h1 className="text-3xl font-black text-text-main">Consistency</h1>
            <p className="text-muted mt-1 text-sm">Win today. Repeat tomorrow.</p>
          </div>

          {state === 'sent' ? (
            // ─── Success State ─────────────────────────────────────
            <div className="card text-center animate-slide-up">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={28} />
              </div>
              <h2 className="text-lg font-bold text-text-main mb-2">Check your email</h2>
              <p className="text-muted text-sm mb-4">
                We sent a confirmation link to{' '}
                <span className="text-text-main font-medium">{email}</span>.
                Click it to verify your account.
              </p>
              <p className="text-muted text-xs">
                No email? Check your spam folder or{' '}
                <button
                  onClick={() => setState('idle')}
                  className="text-[#b7ff3c] underline underline-offset-2 font-bold"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            // ─── Form State ─────────────────────────────────────────
            <>
              <div className="card animate-slide-up">
                <h2 className="text-xl font-bold text-text-main mb-1">
                  {mode === 'login' ? 'Welcome back' : 'Start for free'}
                </h2>
                <p className="text-muted text-sm mb-5">
                  {mode === 'login' ? 'Enter your details to log in.' : 'Create an account to save your progress.'}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        disabled={state === 'sending'}
                        className="pl-9 bg-[#111720] border-[#242d38] text-text-main"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                      />
                      <input
                        id="password"
                        type="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={state === 'sending'}
                        className="pl-9 bg-[#111720] border-[#242d38] text-text-main"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {(state === 'error' || errorMsg) && (
                    <p className="text-danger text-xs font-semibold bg-danger/10 p-2.5 rounded-lg border border-danger/20" role="alert">
                      {errorMsg}
                    </p>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    loading={state === 'sending'}
                    disabled={state === 'sending'}
                    className="mt-1 font-black text-base"
                  >
                    {mode === 'login' ? 'Log in' : 'Create account'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'signup' : 'login')
                      setErrorMsg('')
                    }}
                    className="text-sm text-muted hover:text-text-main transition-colors"
                  >
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>

                {/* Instant Demo Access Button */}
                <div className="mt-4 pt-4 border-t border-[#242d38] flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full bg-[#1a2332] hover:bg-[#242d38] text-[#b7ff3c] text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-[#b7ff3c]/30"
                  >
                    <Sparkles size={14} /> Instant Preview / Demo Mode
                  </button>
                </div>

                <p className="text-center text-muted text-xs mt-4">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-text-main">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-text-main">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Trust signals */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: <Dumbbell size={18} />, label: 'Free forever' },
                  { icon: <Zap size={18} />, label: 'Works offline' },
                  { icon: <Shield size={18} />, label: 'Your data, private' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 text-muted">
                    <div className="text-[#b7ff3c]">{icon}</div>
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
