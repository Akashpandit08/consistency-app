'use client'

export const dynamic = 'force-dynamic'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics/events'
import {
  User, Settings as SettingsIcon, Share2, Download, Trash2,
  LogOut, Check, Copy, Shield, Bell, Award, Sparkles, ChevronRight
} from 'lucide-react'
import type { Profile, UserPreferences, UserGoal, ExperienceLevel, TrainingDays, EquipmentType } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const [firstName, setFirstName] = useState('')
  const [goal, setGoal] = useState<UserGoal>('build_muscle')
  const [experience, setExperience] = useState<ExperienceLevel>('beginner')
  const [trainingDays, setTrainingDays] = useState<TrainingDays>(3)
  const [equipment, setEquipment] = useState<EquipmentType>('full_gym')
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    // Default fallback profile for preview
    const defaultProfile: Profile = {
      id: 'demo-user',
      first_name: 'Athlete',
      last_name: null,
      avatar_url: null,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      referral_code: 'CONSISTENT7',
      referred_by: null,
      is_pro: false,
    }
    setProfile(defaultProfile)
    setFirstName('Athlete')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, prefsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
      ])

      if (profileRes.data) {
        setProfile(profileRes.data as Profile)
        setFirstName(profileRes.data.first_name || '')
      }

      if (prefsRes.data) {
        const p = prefsRes.data as UserPreferences
        setPrefs(p)
        if (p.goal) setGoal(p.goal)
        if (p.experience) setExperience(p.experience)
        if (p.training_days) setTrainingDays(p.training_days)
        if (p.equipment) setEquipment(p.equipment)
      }
    } catch (err) {
      console.warn('Using offline settings fallback:', err)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        supabase.from('profiles').update({ first_name: firstName.trim() || null }).eq('id', user.id),
        supabase.from('user_preferences').upsert({
          user_id: user.id,
          goal,
          experience,
          training_days: trainingDays,
          equipment,
        }),
      ])

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
      track('profile_updated')
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  function copyReferralLink() {
    if (!profile?.referral_code) return
    const url = `${window.location.origin}/login?ref=${profile.referral_code}`
    navigator.clipboard.writeText(url)
    setCopiedReferral(true)
    setTimeout(() => setCopiedReferral(false), 2500)
    track('referral_link_copied')
  }

  async function handleExportData() {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [pRes, prefRes, wsRes, esRes, prRes, mlRes, wlRes, slRes, bmRes, hbRes] =
        await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
          supabase.from('workout_sessions').select('*').eq('user_id', user.id),
          supabase.from('exercise_sets').select('*').eq('user_id', user.id),
          supabase.from('personal_records').select('*').eq('user_id', user.id),
          supabase.from('meal_logs').select('*').eq('user_id', user.id),
          supabase.from('water_logs').select('*').eq('user_id', user.id),
          supabase.from('sleep_logs').select('*').eq('user_id', user.id),
          supabase.from('body_metrics').select('*').eq('user_id', user.id),
          supabase.from('habits').select('*').eq('user_id', user.id),
        ])

      const backup = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: pRes.data,
        preferences: prefRes.data,
        workout_sessions: wsRes.data,
        exercise_sets: esRes.data,
        personal_records: prRes.data,
        meal_logs: mlRes.data,
        water_logs: wlRes.data,
        sleep_logs: slRes.data,
        body_metrics: bmRes.data,
        habits: hbRes.data,
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `consistency-data-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      track('data_exported')
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Delete profile and related data (cascade takes care of relations)
        await supabase.from('profiles').delete().eq('id', user.id)
        await supabase.auth.signOut()
        router.push('/')
      }
    } catch (err) {
      console.error('Delete account error:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-section">
      <TopBar title="Settings" subtitle="Preferences & Account" />

      <div className="px-4 pt-2 flex flex-col gap-4">
        {/* ─── Profile & Plan Configuration ──────────────────────── */}
        <form onSubmit={handleSaveProfile} className="card-lg flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="text-accent" size={20} />
            <h2 className="font-black text-text-main text-base">Training Profile</h2>
          </div>

          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as UserGoal)}
            >
              <option value="build_muscle">💪 Build Muscle</option>
              <option value="lose_fat">🔥 Lose Fat</option>
              <option value="get_stronger">🏋️ Get Stronger</option>
              <option value="improve_fitness">🏃 Improve Fitness</option>
              <option value="general_health">❤️ General Health</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="form-group">
              <label className="form-label">Experience</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
              >
                <option value="beginner">Beginner (&lt;1y)</option>
                <option value="intermediate">Intermediate (1-3y)</option>
                <option value="advanced">Advanced (3y+)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Schedule</label>
              <select
                value={trainingDays}
                onChange={(e) => setTrainingDays(Number(e.target.value) as TrainingDays)}
              >
                <option value={2}>2 days / week</option>
                <option value={3}>3 days / week</option>
                <option value={4}>4 days / week</option>
                <option value={5}>5 days / week</option>
                <option value={6}>6 days / week</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Available Equipment</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentType)}
            >
              <option value="full_gym">🏋️ Full Gym (Barbells, Cables, Machines)</option>
              <option value="home_gym">🏠 Home Gym (Barbell, Dumbbells, Bench)</option>
              <option value="dumbbells">🪆 Dumbbells Only</option>
              <option value="bodyweight">🤸 Bodyweight / Calisthenics Only</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                <Check size={14} /> Changes saved!
              </span>
            ) : <div />}
            <Button type="submit" loading={saving} size="sm">
              Save Preferences
            </Button>
          </div>
        </form>

        {/* ─── Viral Referral Program ────────────────────────────── */}
        <div className="card-lg bg-surface border-border">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="text-accent" size={20} />
            <h2 className="font-black text-text-main text-base">Invite Friends</h2>
          </div>
          <p className="text-muted text-xs mb-3">
            Share Consistency with workout buddies. Consistency is easier together.
          </p>

          <div className="flex items-center gap-2 bg-surface-2 p-3 rounded-xl border border-border">
            <div className="flex-1 font-mono text-accent text-sm font-bold truncate">
              {profile?.referral_code ? `CODE: ${profile.referral_code}` : 'Generating code...'}
            </div>
            <button
              onClick={copyReferralLink}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shrink-0"
            >
              {copiedReferral ? <Check size={14} /> : <Copy size={14} />}
              {copiedReferral ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* ─── Privacy & Data Management ─────────────────────────── */}
        <div className="card-lg">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="text-accent" size={20} />
            <h2 className="font-black text-text-main text-base">Data & Privacy (GDPR)</h2>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              onClick={handleExportData}
              loading={exporting}
              className="justify-between text-left text-sm py-3"
            >
              <span className="flex items-center gap-2">
                <Download size={16} /> Export all my data (.json)
              </span>
              <ChevronRight size={16} className="text-muted" />
            </Button>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="justify-between text-left text-sm py-3 text-muted hover:text-text-main"
            >
              <span className="flex items-center gap-2">
                <LogOut size={16} /> Sign out
              </span>
              <ChevronRight size={16} className="text-muted" />
            </Button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-danger/80 hover:text-danger text-xs font-semibold text-left py-2 px-1 mt-2 flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete account and wipe data
              </button>
            ) : (
              <div className="card bg-danger/10 border-danger/30 p-3 mt-2 animate-slide-up">
                <p className="text-danger text-xs font-bold mb-2">
                  Are you sure? This will permanently delete your workout history, records, and preferences.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteAccount} loading={deleting}>
                    Yes, delete forever
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
