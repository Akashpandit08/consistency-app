'use client'

import { useState, useEffect, useMemo } from 'react'
import { CalorieMealLog, DailyCalorieMacroSummary, MealFoodItem } from '@/types'
import { getCalorieMacroSummary, saveCalorieMacroSummary } from '@/lib/offline/store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Utensils,
  Flame,
  Plus,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Apple,
  Sparkles,
  PieChart,
} from 'lucide-react'

interface CalorieMacroEngineProps {
  dateStr?: string
  onSummaryUpdated?: (summary: DailyCalorieMacroSummary) => void
}

const DEFAULT_MEALS_CONFIG: CalorieMealLog[] = [
  {
    id: 'm_breakfast',
    meal_key: 'breakfast',
    name: 'Breakfast',
    icon: '🍳',
    completed: true,
    target_calories: 550,
    target_protein: 35,
    items: [
      { id: 'f_1', name: 'Eggs (3) & Whole Wheat Toast', calories: 380, protein_g: 24, carbs_g: 30, fats_g: 15 },
      { id: 'f_2', name: 'Black Coffee with Honey', calories: 45, protein_g: 0, carbs_g: 11, fats_g: 0 },
    ],
  },
  {
    id: 'm_lunch',
    meal_key: 'lunch',
    name: 'Lunch',
    icon: '🥗',
    completed: true,
    target_calories: 700,
    target_protein: 45,
    items: [
      { id: 'f_3', name: 'Grilled Chicken Breast & Jasmine Rice', calories: 560, protein_g: 48, carbs_g: 65, fats_g: 8 },
      { id: 'f_4', name: 'Steamed Broccoli with Olive Oil', calories: 85, protein_g: 3, carbs_g: 8, fats_g: 5 },
    ],
  },
  {
    id: 'm_snack',
    meal_key: 'snack',
    name: 'Pre-Workout Snack',
    icon: '🍌',
    completed: false,
    target_calories: 350,
    target_protein: 25,
    items: [
      { id: 'f_5', name: 'Whey Protein Shake & Banana', calories: 280, protein_g: 27, carbs_g: 32, fats_g: 3 },
    ],
  },
  {
    id: 'm_dinner',
    meal_key: 'dinner',
    name: 'Dinner',
    icon: '🥩',
    completed: false,
    target_calories: 750,
    target_protein: 50,
    items: [
      { id: 'f_6', name: 'Lean Beef / Salmon with Sweet Potato', calories: 620, protein_g: 45, carbs_g: 50, fats_g: 16 },
    ],
  },
]

export function CalorieMacroEngine({
  dateStr = new Date().toISOString().split('T')[0],
  onSummaryUpdated,
}: CalorieMacroEngineProps) {
  const [meals, setMeals] = useState<CalorieMealLog[]>(DEFAULT_MEALS_CONFIG)
  const [targetCalories, setTargetCalories] = useState<number>(2400)
  const [targetProtein, setTargetProtein] = useState<number>(165)
  const [targetCarbs, setTargetCarbs] = useState<number>(240)
  const [targetFats, setTargetFats] = useState<number>(65)

  const [expandedMeal, setExpandedMeal] = useState<string | null>('m_breakfast')
  const [showAddFoodForMeal, setShowAddFoodForMeal] = useState<string | null>(null)

  // Add food form state
  const [foodName, setFoodName] = useState('')
  const [foodCalories, setFoodCalories] = useState('')
  const [foodProtein, setFoodProtein] = useState('')
  const [foodCarbs, setFoodCarbs] = useState('')
  const [foodFats, setFoodFats] = useState('')

  // Load from local storage
  useEffect(() => {
    const saved = getCalorieMacroSummary(dateStr)
    if (saved && saved.meals && saved.meals.length > 0) {
      setMeals(saved.meals)
      if (saved.target_calories) setTargetCalories(saved.target_calories)
      if (saved.target_protein_g) setTargetProtein(saved.target_protein_g)
      if (saved.target_carbs_g) setTargetCarbs(saved.target_carbs_g)
      if (saved.target_fats_g) setTargetFats(saved.target_fats_g)
    }
  }, [dateStr])

  // Compute totals
  const consumedTotals = useMemo(() => {
    let cals = 0
    let protein = 0
    let carbs = 0
    let fats = 0

    for (const m of meals) {
      if (m.completed) {
        for (const item of m.items) {
          cals += item.calories || 0
          protein += item.protein_g || 0
          carbs += item.carbs_g || 0
          fats += item.fats_g || 0
        }
      }
    }

    return { cals, protein, carbs, fats }
  }, [meals])

  const remainingCalories = Math.max(0, targetCalories - consumedTotals.cals)
  const caloriePct = Math.min(100, Math.round((consumedTotals.cals / targetCalories) * 100))
  const proteinPct = Math.min(100, Math.round((consumedTotals.protein / targetProtein) * 100))
  const carbsPct = Math.min(100, Math.round((consumedTotals.carbs / targetCarbs) * 100))
  const fatsPct = Math.min(100, Math.round((consumedTotals.fats / targetFats) * 100))

  // Persist
  function persistMeals(newMeals: CalorieMealLog[]) {
    setMeals(newMeals)
    const summary: DailyCalorieMacroSummary = {
      log_date: dateStr,
      target_calories: targetCalories,
      consumed_calories: consumedTotals.cals,
      target_protein_g: targetProtein,
      consumed_protein_g: consumedTotals.protein,
      target_carbs_g: targetCarbs,
      consumed_carbs_g: consumedTotals.carbs,
      target_fats_g: targetFats,
      consumed_fats_g: consumedTotals.fats,
      meals: newMeals,
    }
    saveCalorieMacroSummary(summary)
    if (onSummaryUpdated) onSummaryUpdated(summary)
  }

  // Toggle meal completion
  function toggleMealComplete(mealId: string) {
    const updated = meals.map((m) =>
      m.id === mealId ? { ...m, completed: !m.completed } : m
    )
    persistMeals(updated)
  }

  // Add food item to meal
  function handleAddFoodItem(mealId: string) {
    if (!foodName.trim() || !foodCalories) return

    const newItem: MealFoodItem = {
      id: crypto.randomUUID(),
      name: foodName.trim(),
      calories: parseInt(foodCalories, 10) || 0,
      protein_g: parseInt(foodProtein, 10) || 0,
      carbs_g: parseInt(foodCarbs, 10) || 0,
      fats_g: parseInt(foodFats, 10) || 0,
    }

    const updated = meals.map((m) => {
      if (m.id === mealId) {
        return {
          ...m,
          completed: true,
          items: [...m.items, newItem],
        }
      }
      return m
    })

    persistMeals(updated)
    setFoodName('')
    setFoodCalories('')
    setFoodProtein('')
    setFoodCarbs('')
    setFoodFats('')
    setShowAddFoodForMeal(null)
  }

  // Remove food item
  function handleRemoveFoodItem(mealId: string, itemId: string) {
    const updated = meals.map((m) => {
      if (m.id === mealId) {
        return {
          ...m,
          items: m.items.filter((i) => i.id !== itemId),
        }
      }
      return m
    })
    persistMeals(updated)
  }

  return (
    <div className="card-lg bg-surface border border-[#222b3a] shadow-xl text-text-main space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-main">Calorie & Macro Tracker</h3>
            <p className="text-muted text-[11px]">Energy balance, protein synthesis & meal logs</p>
          </div>
        </div>

        <span className="badge-surface text-accent text-xs font-bold flex items-center gap-1">
          <Flame size={12} /> {targetCalories.toLocaleString()} kcal Goal
        </span>
      </div>

      {/* Hero Calorie Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-2 to-surface border border-border space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-muted text-xs font-bold uppercase tracking-wider block">
              Calories Consumed
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-black text-text-main tabular-nums">
                {consumedTotals.cals.toLocaleString()}
              </span>
              <span className="text-xs text-muted font-bold">
                / {targetCalories.toLocaleString()} kcal ({caloriePct}%)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-muted text-xs font-semibold block">Remaining</span>
            <span className="text-accent text-lg font-black tabular-nums">
              {remainingCalories.toLocaleString()} <span className="text-xs">kcal</span>
            </span>
          </div>
        </div>

        {/* Calorie Progress Bar */}
        <div className="h-3 bg-surface-3 rounded-full overflow-hidden p-0.5 border border-border">
          <div
            className="h-full bg-gradient-to-r from-[#b7ff3c] to-emerald-400 rounded-full transition-all duration-700 shadow-sm shadow-accent/30"
            style={{ width: `${caloriePct}%` }}
          />
        </div>

        {/* Macros Breakdown Bars */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70">
          {/* Protein */}
          <div className="p-2.5 rounded-xl bg-surface/60 border border-border/60 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-emerald-400">Protein</span>
              <span className="font-bold text-text-main text-[11px]">
                {consumedTotals.protein}g / {targetProtein}g
              </span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-2.5 rounded-xl bg-surface/60 border border-border/60 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-amber-400">Carbs</span>
              <span className="font-bold text-text-main text-[11px]">
                {consumedTotals.carbs}g / {targetCarbs}g
              </span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          {/* Fats */}
          <div className="p-2.5 rounded-xl bg-surface/60 border border-border/60 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-rose-400">Fats</span>
              <span className="font-bold text-text-main text-[11px]">
                {consumedTotals.fats}g / {targetFats}g
              </span>
            </div>
            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${fatsPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Meals Accordion List */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted block">
          Today&apos;s Meal Logs
        </span>

        {meals.map((meal) => {
          const mealCals = meal.items.reduce((s, i) => s + i.calories, 0)
          const mealProtein = meal.items.reduce((s, i) => s + i.protein_g, 0)
          const isExpanded = expandedMeal === meal.id

          return (
            <div
              key={meal.id}
              className={cn(
                'rounded-2xl border transition-all overflow-hidden',
                meal.completed
                  ? 'bg-surface-2 border-accent/30'
                  : 'bg-surface border-border'
              )}
            >
              {/* Meal Summary Row */}
              <div className="p-3 flex items-center justify-between gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => toggleMealComplete(meal.id)}
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer',
                    meal.completed
                      ? 'bg-accent text-accent-dark'
                      : 'bg-surface-3 text-muted hover:text-text-main border border-border'
                  )}
                  title={meal.completed ? 'Mark incomplete' : 'Mark meal completed'}
                >
                  <CheckCircle2 size={18} />
                </button>

                <div
                  className="flex-1 min-w-0"
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{meal.icon}</span>
                    <h4 className="text-sm font-black text-text-main truncate">{meal.name}</h4>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    {mealCals} kcal • {mealProtein}g protein • {meal.items.length} items
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedMeal(meal.id)
                      setShowAddFoodForMeal(meal.id)
                    }}
                    className="p-1.5 rounded-lg bg-surface hover:bg-surface-3 text-muted hover:text-accent transition-colors"
                    title="Add food item"
                  >
                    <Plus size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                    className="p-1.5 rounded-lg bg-surface text-muted hover:text-text-main transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Meal Expanded Items */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2 bg-surface/50">
                  {meal.items.length === 0 ? (
                    <p className="text-xs text-muted text-center py-2">No food logged yet for this meal.</p>
                  ) : (
                    meal.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-text-main block">{item.name}</span>
                          <span className="text-muted text-[10px]">
                            {item.calories} kcal • {item.protein_g}g P • {item.carbs_g}g C • {item.fats_g}g F
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFoodItem(meal.id, item.id)}
                          className="p-1 rounded text-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}

                  {/* Add Food Form */}
                  {showAddFoodForMeal === meal.id ? (
                    <div className="p-3 rounded-xl bg-surface-2 border border-accent/40 space-y-2 animate-slide-up">
                      <span className="text-xs font-bold text-accent block">Add Food to {meal.name}</span>
                      <input
                        type="text"
                        placeholder="Food name (e.g. 2 Boiled Eggs)"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-main placeholder:text-muted/60"
                      />
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[9px] text-muted uppercase font-bold block mb-0.5">Calories</label>
                          <input
                            type="number"
                            placeholder="kcal"
                            value={foodCalories}
                            onChange={(e) => setFoodCalories(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-muted uppercase font-bold block mb-0.5">Protein (g)</label>
                          <input
                            type="number"
                            placeholder="g"
                            value={foodProtein}
                            onChange={(e) => setFoodProtein(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-muted uppercase font-bold block mb-0.5">Carbs (g)</label>
                          <input
                            type="number"
                            placeholder="g"
                            value={foodCarbs}
                            onChange={(e) => setFoodCarbs(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-muted uppercase font-bold block mb-0.5">Fats (g)</label>
                          <input
                            type="number"
                            placeholder="g"
                            value={foodFats}
                            onChange={(e) => setFoodFats(e.target.value)}
                            className="w-full bg-surface border border-border rounded-lg px-2 py-1 text-xs text-text-main text-center"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handleAddFoodItem(meal.id)}
                          className="font-bold text-xs"
                        >
                          Save Food
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddFoodForMeal(null)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddFoodForMeal(meal.id)}
                      className="w-full py-1.5 rounded-lg border border-dashed border-border hover:border-accent/40 text-muted hover:text-accent text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Food Item
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
