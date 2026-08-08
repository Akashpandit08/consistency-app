'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  DAY_NAMES,
  DIET_PRESET_NAMES,
  DietPresetType,
  buildWeeklyDietSchedule,
  getSavedDietSchedule,
  saveWeeklyDietSchedule,
} from '@/lib/diet/dietPrograms'
import { soundFx } from '@/lib/audio/workoutAudio'
import { compressImage } from '@/lib/media/imageCompressor'
import { addOrUpdateAlarm, getNotificationSettings } from '@/lib/notifications/alarmService'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Utensils,
  Flame,
  Clock,
  Bell,
  BellRing,
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  Camera,
  Image as ImageIcon,
  Copy,
  Sparkles,
  ChevronRight,
  PieChart,
  Check,
  AlertCircle,
  X,
  Volume2,
} from 'lucide-react'
import type { DayDietPlan, DayOfWeek, MealType, ScheduledMealDish, WeeklyDietSchedule } from '@/types'

const PRESET_KEYS: DietPresetType[] = [
  'muscle_gain',
  'fat_loss',
  'vegetarian',
  'keto',
  'balanced',
]

const MEAL_TYPE_LABELS: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: '🍳', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  morning_snack: { label: 'Morning Snack', icon: '🥣', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  lunch: { label: 'Lunch', icon: '🥗', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  pre_workout: { label: 'Pre-Workout Fuel', icon: '🍌', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  dinner: { label: 'Dinner', icon: '🥩', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  post_workout: { label: 'Post-Workout', icon: '🥤', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  night_snack: { label: 'Night Recovery', icon: '🌙', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
}

export function DietScheduleManager() {
  const [schedule, setSchedule] = useState<WeeklyDietSchedule>(getSavedDietSchedule)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1)
  const [selectedPreset, setSelectedPreset] = useState<DietPresetType>('muscle_gain')
  const [showAddMealModal, setShowAddMealModal] = useState(false)
  const [editingMeal, setEditingMeal] = useState<ScheduledMealDish | null>(null)
  const [copiedNotification, setCopiedNotification] = useState(false)

  // Add/Edit Meal Form State
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<MealType>('breakfast')
  const [formTime, setFormTime] = useState('08:00')
  const [formCalories, setFormCalories] = useState('')
  const [formProtein, setFormProtein] = useState('')
  const [formCarbs, setFormCarbs] = useState('')
  const [formFats, setFormFats] = useState('')
  const [formPortion, setFormPortion] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formImage, setFormImage] = useState<string | null>(null)
  const [formAlarm, setFormAlarm] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cardFileInputRef = useRef<HTMLInputElement | null>(null)
  const [targetMealForPhoto, setTargetMealForPhoto] = useState<string | null>(null)

  // Initialize from storage or defaults
  useEffect(() => {
    const saved = getSavedDietSchedule()
    setSchedule(saved)

    // Match current day of week
    const nowDay = new Date().getDay()
    const todayDow = (nowDay === 0 ? 7 : nowDay) as DayOfWeek
    setSelectedDay(todayDow)
  }, [])

  const currentDayPlan = useMemo(() => {
    return schedule.days[selectedDay] || schedule.days[1]
  }, [schedule, selectedDay])

  // Calculated macro totals for the selected day
  const dayStats = useMemo(() => {
    let totalCals = 0
    let totalP = 0
    let totalC = 0
    let totalF = 0
    let consumedCals = 0
    let consumedP = 0
    let consumedC = 0
    let consumedF = 0
    let completedCount = 0

    for (const m of currentDayPlan.meals) {
      totalCals += m.calories || 0
      totalP += m.protein_g || 0
      totalC += m.carbs_g || 0
      totalF += m.fats_g || 0

      if (m.completed) {
        consumedCals += m.calories || 0
        consumedP += m.protein_g || 0
        consumedC += m.carbs_g || 0
        consumedF += m.fats_g || 0
        completedCount++
      }
    }

    return {
      totalCals,
      totalP,
      totalC,
      totalF,
      consumedCals,
      consumedP,
      consumedC,
      consumedF,
      completedCount,
      totalMeals: currentDayPlan.meals.length,
      caloriePct: totalCals > 0 ? Math.min(100, Math.round((consumedCals / totalCals) * 100)) : 0,
      proteinPct: totalP > 0 ? Math.min(100, Math.round((consumedP / totalP) * 100)) : 0,
    }
  }, [currentDayPlan])

  // Handle Preset Switching
  function handlePresetChange(preset: DietPresetType) {
    setSelectedPreset(preset)
    const newSchedule = buildWeeklyDietSchedule(preset)
    setSchedule(newSchedule)
    saveWeeklyDietSchedule(newSchedule)
    soundFx.playPRCelebration()
  }

  // Toggle meal completion checkbox
  function toggleMealComplete(mealId: string) {
    const updatedMeals = currentDayPlan.meals.map((m) => {
      if (m.id === mealId) {
        const nextCompleted = !m.completed
        if (nextCompleted) {
          soundFx.playSetCompleted()
        }
        return { ...m, completed: nextCompleted }
      }
      return m
    })

    updateCurrentDayMeals(updatedMeals)
  }

  // Toggle meal alarm
  function toggleMealAlarm(mealId: string) {
    const meal = currentDayPlan.meals.find((m) => m.id === mealId)
    if (!meal) return

    const nextAlarmState = !meal.alarm_enabled
    const updatedMeals = currentDayPlan.meals.map((m) =>
      m.id === mealId ? { ...m, alarm_enabled: nextAlarmState } : m
    )

    updateCurrentDayMeals(updatedMeals)

    // Update in universal alarm service
    if (nextAlarmState) {
      addOrUpdateAlarm({
        id: `meal_alarm_${meal.id}`,
        title: `🥗 Time for ${meal.name}`,
        type: 'meal',
        meal_name: meal.name,
        time: meal.scheduled_time,
        days: [selectedDay],
        enabled: true,
        tone: 'chime',
        message: `${meal.portion || 'Your scheduled meal'} (${meal.calories} kcal • ${meal.protein_g}g P)`,
      })
      soundFx.playTick(1174.66, 0.1)
    }
  }

  // Helper to update current day's meals
  function updateCurrentDayMeals(newMeals: ScheduledMealDish[]) {
    // Sort chronologically by scheduled time
    const sorted = [...newMeals].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))

    const updatedPlan: DayDietPlan = {
      ...currentDayPlan,
      meals: sorted,
    }

    const updatedSchedule: WeeklyDietSchedule = {
      ...schedule,
      updated_at: new Date().toISOString(),
      days: {
        ...schedule.days,
        [selectedDay]: updatedPlan,
      },
    }

    setSchedule(updatedSchedule)
    saveWeeklyDietSchedule(updatedSchedule)
  }

  // Copy current day to all 7 days
  function handleCopyDayToAll() {
    const newDays = { ...schedule.days }
    for (let d = 1; d <= 7; d++) {
      const dow = d as DayOfWeek
      newDays[dow] = {
        ...currentDayPlan,
        day: dow,
        day_name: DAY_NAMES[dow],
        meals: currentDayPlan.meals.map((m, idx) => ({
          ...m,
          id: `dish_${dow}_${idx}_${crypto.randomUUID().slice(0, 4)}`,
        })),
      }
    }

    const updatedSchedule: WeeklyDietSchedule = {
      ...schedule,
      updated_at: new Date().toISOString(),
      days: newDays,
    }

    setSchedule(updatedSchedule)
    saveWeeklyDietSchedule(updatedSchedule)
    soundFx.playPRCelebration()
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 3000)
  }

  // Dish photo upload with client-side WebP compression (0 bandwidth waste!)
  async function handleDishPhotoSelected(e: React.ChangeEvent<HTMLInputElement>, isModal = false) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 })
      if (isModal) {
        setFormImage(compressed.dataUrl)
      } else if (targetMealForPhoto) {
        const updatedMeals = currentDayPlan.meals.map((m) =>
          m.id === targetMealForPhoto ? { ...m, image_url: compressed.dataUrl } : m
        )
        updateCurrentDayMeals(updatedMeals)
        soundFx.playTick(1046.5, 0.1)
      }
    } catch (err) {
      alert((err as Error).message || 'Failed to compress meal image.')
    } finally {
      setUploadingImage(false)
      setTargetMealForPhoto(null)
    }
  }

  // Open add/edit modal
  function openAddModal(mealToEdit?: ScheduledMealDish) {
    if (mealToEdit) {
      setEditingMeal(mealToEdit)
      setFormName(mealToEdit.name)
      setFormType(mealToEdit.meal_type)
      setFormTime(mealToEdit.scheduled_time)
      setFormCalories(String(mealToEdit.calories || ''))
      setFormProtein(String(mealToEdit.protein_g || ''))
      setFormCarbs(String(mealToEdit.carbs_g || ''))
      setFormFats(String(mealToEdit.fats_g || ''))
      setFormPortion(mealToEdit.portion || '')
      setFormNotes(mealToEdit.notes || '')
      setFormImage(mealToEdit.image_url || null)
      setFormAlarm(mealToEdit.alarm_enabled)
    } else {
      setEditingMeal(null)
      setFormName('')
      setFormType('lunch')
      setFormTime('13:00')
      setFormCalories('500')
      setFormProtein('40')
      setFormCarbs('45')
      setFormFats('15')
      setFormPortion('1 serving')
      setFormNotes('')
      setFormImage(null)
      setFormAlarm(true)
    }
    setShowAddMealModal(true)
  }

  // Save Add/Edit meal
  function handleSaveMeal() {
    if (!formName.trim() || !formTime) return

    const newDish: ScheduledMealDish = {
      id: editingMeal ? editingMeal.id : `dish_${selectedDay}_${crypto.randomUUID()}`,
      name: formName.trim(),
      meal_type: formType,
      scheduled_time: formTime,
      icon: MEAL_TYPE_LABELS[formType].icon,
      image_url: formImage || undefined,
      calories: parseInt(formCalories, 10) || 0,
      protein_g: parseInt(formProtein, 10) || 0,
      carbs_g: parseInt(formCarbs, 10) || 0,
      fats_g: parseInt(formFats, 10) || 0,
      portion: formPortion.trim() || '1 serving',
      notes: formNotes.trim() || undefined,
      completed: editingMeal ? editingMeal.completed : false,
      alarm_enabled: formAlarm,
    }

    let updatedMeals: ScheduledMealDish[]
    if (editingMeal) {
      updatedMeals = currentDayPlan.meals.map((m) => (m.id === editingMeal.id ? newDish : m))
    } else {
      updatedMeals = [...currentDayPlan.meals, newDish]
    }

    updateCurrentDayMeals(updatedMeals)

    // Register alarm if enabled
    if (formAlarm) {
      addOrUpdateAlarm({
        id: `meal_alarm_${newDish.id}`,
        title: `🥗 ${newDish.name}`,
        type: 'meal',
        meal_name: newDish.name,
        time: newDish.scheduled_time,
        days: [selectedDay],
        enabled: true,
        tone: 'chime',
        message: `${newDish.portion} (${newDish.calories} kcal • ${newDish.protein_g}g P)`,
      })
    }

    soundFx.playSetCompleted()
    setShowAddMealModal(false)
  }

  // Delete meal
  function handleDeleteMeal(mealId: string) {
    const updatedMeals = currentDayPlan.meals.filter((m) => m.id !== mealId)
    updateCurrentDayMeals(updatedMeals)
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for card photo upload */}
      <input
        type="file"
        ref={cardFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleDishPhotoSelected(e, false)}
      />

      {/* Preset Selector Banner */}
      <div className="card-lg bg-surface-1 border border-border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#b7ff3c]/15 text-accent flex items-center justify-center font-bold">
              <Utensils size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-text-main">Diet & Meal Split Preset</h2>
              <p className="text-xs text-muted">Choose your nutrition protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyDayToAll}
              className="text-xs font-bold text-muted hover:text-text-main flex items-center gap-1.5"
            >
              <Copy size={13} />
              <span>Copy {DAY_NAMES[selectedDay]} to 7 Days</span>
            </Button>
          </div>
        </div>

        {/* 1-Click Preset Switcher Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {PRESET_KEYS.map((key) => {
            const preset = DIET_PRESET_NAMES[key]
            const active = selectedPreset === key
            return (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                className={`px-3 py-2.5 rounded-xl text-left border transition-all cursor-pointer select-none ${
                  active
                    ? 'bg-[#b7ff3c]/15 border-[#b7ff3c] text-text-main shadow-md shadow-[#b7ff3c]/10'
                    : 'bg-surface-2 border-border text-muted hover:border-border-hover hover:text-text-main'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold truncate">
                  <span>{preset.emoji}</span>
                  <span className={active ? 'text-accent' : ''}>{preset.name.split(' (')[0]}</span>
                </div>
                <div className="text-[10px] text-muted truncate mt-0.5">{preset.desc}</div>
              </button>
            )
          })}
        </div>

        {copiedNotification && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={14} />
            <span>Successfully copied {DAY_NAMES[selectedDay]}&apos;s complete meal plan to all 7 days!</span>
          </div>
        )}
      </div>

      {/* 7-Day Day Selector Bar */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {([1, 2, 3, 4, 5, 6, 7] as DayOfWeek[]).map((d) => {
          const isSelected = selectedDay === d
          const plan = schedule.days[d]
          const completedCount = plan ? plan.meals.filter((m) => m.completed).length : 0
          const totalMeals = plan ? plan.meals.length : 0
          const allDone = totalMeals > 0 && completedCount === totalMeals

          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-surface-2 border-[#b7ff3c] text-text-main ring-1 ring-[#b7ff3c]/50'
                  : 'bg-surface-1 border-border text-muted hover:border-border-hover hover:text-text-main'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-0.5">
                {DAY_NAMES[d].slice(0, 3)}
              </div>
              <div className={`text-xs font-black ${isSelected ? 'text-accent' : 'text-text-main'}`}>
                {DAY_NAMES[d].slice(0, 3)}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1">
                {allDone ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                ) : (
                  <span className="text-[9px] text-muted font-mono">{completedCount}/{totalMeals}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Daily Macros & Target Summary Card */}
      <div className="card-lg bg-surface-1 border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-muted uppercase tracking-wider">
              {DAY_NAMES[selectedDay]} Daily Nutrition Target
            </div>
            <div className="text-xl font-black text-text-main flex items-center gap-2 mt-0.5">
              <Flame className="text-orange-400" size={20} />
              <span>{dayStats.consumedCals}</span>
              <span className="text-xs text-muted font-normal">/ {dayStats.totalCals} kcal</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => openAddModal()}
            className="text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus size={14} /> Add Dish / Meal
          </Button>
        </div>

        {/* 3 Macro Progress Bars */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          {/* Protein */}
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-blue-400">Protein</span>
              <span className="text-text-main font-mono">{dayStats.consumedP}g / {dayStats.totalP}g</span>
            </div>
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${dayStats.proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-amber-400">Carbs</span>
              <span className="text-text-main font-mono">{dayStats.consumedC}g / {dayStats.totalC}g</span>
            </div>
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{
                  width: `${dayStats.totalC > 0 ? Math.min(100, Math.round((dayStats.consumedC / dayStats.totalC) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-rose-400">Fats</span>
              <span className="text-text-main font-mono">{dayStats.consumedF}g / {dayStats.totalF}g</span>
            </div>
            <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{
                  width: `${dayStats.totalF > 0 ? Math.min(100, Math.round((dayStats.consumedF / dayStats.totalF) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Hour-by-Hour Meal Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <Clock size={14} className="text-accent" />
            <span>Scheduled Meals & Dishes ({currentDayPlan.meals.length})</span>
          </h3>
          <span className="text-[11px] text-muted">
            {dayStats.completedCount} of {dayStats.totalMeals} eaten
          </span>
        </div>

        {currentDayPlan.meals.length === 0 ? (
          <div className="card-lg bg-surface-1 border border-border p-8 text-center space-y-3">
            <div className="text-4xl">🍽️</div>
            <div className="text-sm font-bold text-text-main">No meals scheduled for {DAY_NAMES[selectedDay]}</div>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Add your first dish or apply a pre-configured macro split above.
            </p>
            <Button size="sm" onClick={() => openAddModal()} className="text-xs">
              <Plus size={14} /> Add First Dish
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayPlan.meals.map((meal) => {
              const typeConfig = MEAL_TYPE_LABELS[meal.meal_type] || MEAL_TYPE_LABELS.lunch

              return (
                <div
                  key={meal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    meal.completed
                      ? 'bg-surface-1/60 border-border/40 opacity-75'
                      : 'bg-surface-1 border-border hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox + Time + Title */}
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleMealComplete(meal.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          meal.completed
                            ? 'bg-[#b7ff3c] border-[#b7ff3c] text-[#080b10]'
                            : 'border-border hover:border-[#b7ff3c] text-transparent hover:text-muted'
                        }`}
                        aria-label="Mark meal completed"
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center flex-wrap gap-2">
                          {/* Time badge */}
                          <div className="inline-flex items-center gap-1 text-xs font-mono font-black text-accent px-2 py-0.5 rounded-md bg-[#b7ff3c]/10 border border-[#b7ff3c]/20">
                            <Clock size={11} />
                            <span>{meal.scheduled_time}</span>
                          </div>

                          {/* Meal type pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeConfig.color}`}
                          >
                            {typeConfig.icon} {typeConfig.label}
                          </span>

                          {/* Alarm status button */}
                          <button
                            onClick={() => toggleMealAlarm(meal.id)}
                            title={meal.alarm_enabled ? 'Alarm Active (click to disable)' : 'Alarm Disabled (click to enable)'}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              meal.alarm_enabled
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                : 'bg-surface-2 border-border text-muted hover:text-text-main'
                            }`}
                          >
                            {meal.alarm_enabled ? <BellRing size={10} /> : <Bell size={10} />}
                            <span>{meal.alarm_enabled ? 'Alarm ON' : 'Alarm OFF'}</span>
                          </button>
                        </div>

                        <div className={`text-sm font-bold text-text-main ${meal.completed ? 'line-through text-muted' : ''}`}>
                          {meal.name}
                        </div>

                        {meal.portion && (
                          <div className="text-xs text-muted">
                            Portion: <span className="text-text-main/80">{meal.portion}</span>
                          </div>
                        )}

                        {meal.notes && (
                          <div className="text-[11px] text-muted italic">
                            💡 {meal.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dish Image preview or upload button */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      {meal.image_url ? (
                        <div
                          onClick={() => {
                            setTargetMealForPhoto(meal.id)
                            cardFileInputRef.current?.click()
                          }}
                          className="w-14 h-14 rounded-xl border border-border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                          title="Click to replace meal photo"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={meal.image_url}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-text-main transition-opacity">
                            <Camera size={14} />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setTargetMealForPhoto(meal.id)
                            cardFileInputRef.current?.click()
                          }}
                          className="w-10 h-10 rounded-xl bg-surface-2 border border-border hover:border-[#b7ff3c]/40 flex items-center justify-center text-muted hover:text-accent transition-colors"
                          title="Upload dish photo (Auto-compressed WebP)"
                        >
                          <Camera size={16} />
                        </button>
                      )}

                      {/* Edit & Delete actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAddModal(meal)}
                          className="p-1 text-muted hover:text-accent rounded hover:bg-surface-2 transition-colors"
                          title="Edit Dish"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="p-1 text-muted hover:text-red-400 rounded hover:bg-surface-2 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nutrients Pills Footer */}
                  <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border/50 text-xs">
                    <span className="font-bold text-text-main flex items-center gap-1">
                      <Flame size={12} className="text-orange-400" />
                      <span>{meal.calories} kcal</span>
                    </span>
                    <span className="text-blue-400 font-bold">
                      {meal.protein_g}g Protein
                    </span>
                    <span className="text-amber-400 font-bold">
                      {meal.carbs_g}g Carbs
                    </span>
                    <span className="text-rose-400 font-bold">
                      {meal.fats_g}g Fats
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Meal Modal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="card-lg bg-[#11161d] border border-[#242d38] max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#b7ff3c]/15 text-accent flex items-center justify-center">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main">
                    {editingMeal ? 'Edit Scheduled Dish' : 'Add Dish to Schedule'}
                  </h3>
                  <p className="text-xs text-muted">
                    {DAY_NAMES[selectedDay]} • Time & Macro details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMealModal(false)}
                className="text-muted hover:text-text-main p-1 rounded-lg hover:bg-surface-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Dish Name */}
              <div>
                <label className="text-xs font-bold text-muted uppercase block mb-1">
                  Dish / Food Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grilled Salmon with Quinoa & Asparagus"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm focus:outline-none focus:border-[#b7ff3c]"
                />
              </div>

              {/* Meal Type & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-1">
                    Meal Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as MealType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm focus:outline-none focus:border-[#b7ff3c]"
                  >
                    <option value="breakfast">🍳 Breakfast</option>
                    <option value="morning_snack">🥣 Morning Snack</option>
                    <option value="lunch">🥗 Lunch</option>
                    <option value="pre_workout">🍌 Pre-Workout Fuel</option>
                    <option value="dinner">🥩 Dinner</option>
                    <option value="post_workout">🥤 Post-Workout</option>
                    <option value="night_snack">🌙 Night Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-1">
                    Scheduled Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-2 border border-border text-accent font-mono font-bold text-sm focus:outline-none focus:border-[#b7ff3c]"
                  />
                </div>
              </div>

              {/* Portion & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-1">
                    Portion / Serving
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 200g chicken, 1 cup rice"
                    value={formPortion}
                    onChange={(e) => setFormPortion(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm focus:outline-none focus:border-[#b7ff3c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase block mb-1">
                    Notes / Recipe tip
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cooked with 5g olive oil"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-2 border border-border text-text-main text-sm focus:outline-none focus:border-[#b7ff3c]"
                  />
                </div>
              </div>

              {/* Macros Breakdown */}
              <div>
                <label className="text-xs font-bold text-muted uppercase block mb-1">
                  Macronutrients Breakdown
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-muted block mb-0.5">Calories</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={formCalories}
                      onChange={(e) => setFormCalories(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-text-main font-mono text-xs focus:outline-none focus:border-[#b7ff3c]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-blue-400 block mb-0.5">Protein (g)</label>
                    <input
                      type="number"
                      placeholder="40"
                      value={formProtein}
                      onChange={(e) => setFormProtein(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-blue-400 font-mono text-xs focus:outline-none focus:border-[#b7ff3c]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-amber-400 block mb-0.5">Carbs (g)</label>
                    <input
                      type="number"
                      placeholder="45"
                      value={formCarbs}
                      onChange={(e) => setFormCarbs(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-amber-400 font-mono text-xs focus:outline-none focus:border-[#b7ff3c]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-400 block mb-0.5">Fats (g)</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={formFats}
                      onChange={(e) => setFormFats(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-surface-2 border border-border text-rose-400 font-mono text-xs focus:outline-none focus:border-[#b7ff3c]"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload & Alarm Toggle */}
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {formImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formImage}
                      alt="Dish preview"
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-1 border border-border flex items-center justify-center text-muted">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-text-main">Dish Photo</div>
                    <div className="text-[10px] text-muted">
                      {formImage ? 'Photo attached ✓' : 'Auto WebP compressed (0 bandwidth)'}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleDishPhotoSelected(e, true)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    <Camera size={14} /> {formImage ? 'Change' : 'Upload Photo'}
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-surface-1 text-accent">
                    <BellRing size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-main">Enable Meal Alarm & Notification</div>
                    <div className="text-[10px] text-muted">Rings audio alarm at scheduled time</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formAlarm}
                  onChange={(e) => setFormAlarm(e.target.checked)}
                  className="w-4 h-4 accent-[#b7ff3c] cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface-1 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddMealModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveMeal} className="text-xs font-bold">
                {editingMeal ? 'Update Dish' : 'Add to Schedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
