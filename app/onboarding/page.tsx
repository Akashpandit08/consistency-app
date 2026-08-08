'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { track } from '@/lib/analytics/events'
import { Button } from '@/components/ui/Button'
import { generateReferralCode } from '@/lib/utils'
import { saveWeeklySchedule } from '@/lib/offline/store'
import { get7DaySchedule } from '@/lib/plan/programs'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type {
  UserGoal, ExperienceLevel, TrainingDays, EquipmentType, TrainingTime, Motivation
} from '@/types'

// ─── Step Definitions ─────────────────────────────────────────
const STEPS = [
  {
    id: 'goal',
    title: "What's your main goal?",
    subtitle: "We'll personalize your plan around this.",
  },
  {
    id: 'experience',
    title: 'How experienced are you?',
    subtitle: "Be honest — we'll set the right intensity.",
  },
  {
    id: 'days',
    title: 'How many days can you train?',
    subtitle: "We'll build a realistic schedule.",
  },
  {
    id: 'equipment',
    title: 'What equipment do you have?',
    subtitle: "We'll choose exercises that work for you.",
  },
  {
    id: 'body',
    title: 'Optional: body data',
    subtitle: 'Used only to track your progress. Skip if you prefer.',
  },
  {
    id: 'time',
    title: 'When do you usually train?',
    subtitle: "We'll remind you at the right time.",
  },
  {
    id: 'motivation',
    title: 'What drives you?',
    subtitle: "This shapes how we encourage you.",
  },
]

const TOTAL_STEPS = STEPS.length

interface OnboardingState {
  goal: UserGoal | null
  experience: ExperienceLevel | null
  training_days: TrainingDays | null
  equipment: EquipmentType | null
  weight_kg: string
  height_cm: string
  first_name: string
  training_time: TrainingTime | null
  motivation: Motivation | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingState>({
    goal: null,
    experience: null,
    training_days: null,
    equipment: null,
    weight_kg: '',
    height_cm: '',
    first_name: '',
    training_time: null,
    motivation: null,
  })

  track('onboarding_started')

  function canProceed(): boolean {
    const s = STEPS[step].id
    if (s === 'goal') return data.goal !== null
    if (s === 'experience') return data.experience !== null
    if (s === 'days') return data.training_days !== null
    if (s === 'equipment') return data.equipment !== null
    if (s === 'body') return true // optional
    if (s === 'time') return data.training_time !== null
    if (s === 'motivation') return data.motivation !== null
    return false
  }

  async function handleComplete() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // In local/demo mode, proceed to dashboard
        router.push('/dashboard')
        return
      }

      const referralCode = generateReferralCode()

      // Save profile
      await supabase.from('profiles').upsert({
        id: user.id,
        first_name: data.first_name || null,
        onboarding_completed: true,
        referral_code: referralCode,
      })

      // Save preferences
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        goal: data.goal,
        experience: data.experience,
        training_days: data.training_days,
        equipment: data.equipment,
        training_time: data.training_time,
        motivation: data.motivation,
        water_target_ml: 2500,
        sleep_target_hours: 8,
        notifications_enabled: false,
      })

      // Save initial body metrics if provided
      const w = data.weight_kg ? parseFloat(data.weight_kg) : null
      if (w && !isNaN(w)) {
        await supabase.from('body_metrics').insert({
          user_id: user.id,
          weight_kg: w,
        })
      }

      // Save tailored 7-day schedule for the user's selected equipment
      try {
        const initialSchedule = get7DaySchedule((data.equipment as EquipmentType) || 'full_gym')
        saveWeeklySchedule({
          userId: user.id,
          splitName: (data.equipment as string) || 'full_gym',
          updatedAt: new Date().toISOString(),
          schedule: initialSchedule,
        })
      } catch (e) {
        console.warn('Failed to seed initial weekly schedule:', e)
      }

      track('onboarding_completed', {
        goal: data.goal,
        experience: data.experience,
        training_days: data.training_days,
        equipment: data.equipment,
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding save error:', err)
      setSaving(false)
    }
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100
  const currentStep = STEPS[step]

  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-2">
        <div
          className="h-1 bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full px-5 pt-6 pb-8">
        {/* Step counter */}
        <div className="text-muted text-xs font-semibold mb-6">
          STEP {step + 1} OF {TOTAL_STEPS}
        </div>

        {/* Question */}
        <div className="mb-8 animate-slide-up" key={step}>
          <h2 className="text-2xl font-black text-text-main mb-2 leading-tight text-balance">
            {currentStep.title}
          </h2>
          <p className="text-muted text-sm">{currentStep.subtitle}</p>
        </div>

        {/* Answers */}
        <div className="flex-1">
          {currentStep.id === 'goal' && (
            <OptionGrid
              options={[
                { value: 'build_muscle', label: '💪 Build Muscle' },
                { value: 'lose_fat', label: '🔥 Lose Fat' },
                { value: 'get_stronger', label: '🏋️ Get Stronger' },
                { value: 'improve_fitness', label: '🏃 Improve Fitness' },
                { value: 'general_health', label: '❤️ General Health' },
              ]}
              value={data.goal}
              onSelect={(v) => setData({ ...data, goal: v as UserGoal })}
            />
          )}

          {currentStep.id === 'experience' && (
            <OptionGrid
              options={[
                { value: 'beginner', label: '🌱 Beginner', desc: 'Less than 1 year' },
                { value: 'intermediate', label: '💪 Intermediate', desc: '1–3 years' },
                { value: 'advanced', label: '🏆 Advanced', desc: '3+ years' },
              ]}
              value={data.experience}
              onSelect={(v) => setData({ ...data, experience: v as ExperienceLevel })}
            />
          )}

          {currentStep.id === 'days' && (
            <OptionGrid
              options={[2, 3, 4, 5, 6].map((n) => ({
                value: String(n),
                label: `${n} days/week`,
              }))}
              value={data.training_days ? String(data.training_days) : null}
              onSelect={(v) => setData({ ...data, training_days: Number(v) as TrainingDays })}
            />
          )}

          {currentStep.id === 'equipment' && (
            <OptionGrid
              options={[
                { value: 'full_gym', label: '🏋️ Full Gym', desc: 'Barbells, machines, cables' },
                { value: 'home_gym', label: '🏠 Home Gym', desc: 'Barbells and dumbbells' },
                { value: 'dumbbells', label: '🪆 Dumbbells Only' },
                { value: 'bodyweight', label: '🤸 Bodyweight', desc: 'No equipment' },
              ]}
              value={data.equipment}
              onSelect={(v) => setData({ ...data, equipment: v as EquipmentType })}
            />
          )}

          {currentStep.id === 'body' && (
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">First name (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={data.first_name}
                  onChange={(e) => setData({ ...data, first_name: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg, optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  min="30"
                  max="300"
                  step="0.1"
                  value={data.weight_kg}
                  onChange={(e) => setData({ ...data, weight_kg: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm, optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  min="100"
                  max="250"
                  step="1"
                  value={data.height_cm}
                  onChange={(e) => setData({ ...data, height_cm: e.target.value })}
                />
              </div>
              <p className="text-muted text-xs">
                This data stays private and is only used to track your progress.
              </p>
            </div>
          )}

          {currentStep.id === 'time' && (
            <OptionGrid
              options={[
                { value: 'morning', label: '🌅 Morning', desc: 'Before noon' },
                { value: 'afternoon', label: '☀️ Afternoon', desc: '12pm – 5pm' },
                { value: 'evening', label: '🌙 Evening', desc: 'After 5pm' },
              ]}
              value={data.training_time}
              onSelect={(v) => setData({ ...data, training_time: v as TrainingTime })}
            />
          )}

          {currentStep.id === 'motivation' && (
            <OptionGrid
              options={[
                { value: 'strength', label: '⚡️ Strength' },
                { value: 'appearance', label: '✨ Appearance' },
                { value: 'health', label: '❤️ Health' },
                { value: 'consistency', label: '🔥 Consistency' },
                { value: 'competition', label: '🏆 Competition' },
              ]}
              value={data.motivation}
              onSelect={(v) => setData({ ...data, motivation: v as Motivation })}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              className="px-3"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </Button>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button
              fullWidth
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex-1"
            >
              Continue
              <ChevronRight size={18} />
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={handleComplete}
              disabled={!canProceed() || saving}
              loading={saving}
              className="flex-1"
            >
              Start my journey 🚀
            </Button>
          )}
        </div>

        {/* Skip body data */}
        {currentStep.id === 'body' && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="text-center text-muted text-sm mt-3 w-full hover:text-text-main transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </main>
  )
}

// ─── Option Grid Component ─────────────────────────────────────
interface OptionItem {
  value: string
  label: string
  desc?: string
}

function OptionGrid({
  options,
  value,
  onSelect,
}: {
  options: OptionItem[]
  value: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`
            w-full text-left p-4 rounded-2xl border transition-all duration-150
            ${
              value === opt.value
                ? 'bg-accent/10 border-accent text-text-main'
                : 'bg-surface border-border text-text-main hover:border-accent/50'
            }
          `}
          aria-pressed={value === opt.value}
        >
          <div className="font-bold">{opt.label}</div>
          {opt.desc && (
            <div className="text-muted text-sm mt-0.5">{opt.desc}</div>
          )}
        </button>
      ))}
    </div>
  )
}
