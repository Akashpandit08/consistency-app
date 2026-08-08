'use client'

import type { DayDietPlan, DayOfWeek, ScheduledMealDish, WeeklyDietSchedule } from '@/types'

export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

// ─── Preset 1: High-Protein Muscle Gain (2600 kcal / 190g P) ──
function makeMuscleGainDay(day: DayOfWeek): DayDietPlan {
  const dayName = DAY_NAMES[day]
  return {
    day,
    day_name: dayName,
    target_calories: 2600,
    target_protein_g: 190,
    target_carbs_g: 270,
    target_fats_g: 70,
    meals: [
      {
        id: `mg_${day}_1`,
        name: 'Eggs (3 Whole + 2 Whites) & Whole Grain Toast with Avocado',
        meal_type: 'breakfast',
        scheduled_time: '08:00',
        icon: '🍳',
        calories: 580,
        protein_g: 38,
        carbs_g: 42,
        fats_g: 22,
        portion: '3 eggs, 2 toast slices, 40g avocado',
        notes: 'Rich in choline and healthy monounsaturated fats.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `mg_${day}_2`,
        name: 'Greek Yogurt (0% Fat) with Blueberries, Honey & Almonds',
        meal_type: 'morning_snack',
        scheduled_time: '11:00',
        icon: '🥣',
        calories: 320,
        protein_g: 26,
        carbs_g: 35,
        fats_g: 8,
        portion: '200g yogurt, 50g berries, 15g almonds',
        notes: 'Probiotic boost and slow-digesting casein protein.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `mg_${day}_3`,
        name: 'Grilled Chicken Breast, Steamed Jasmine Rice & Garlic Broccoli',
        meal_type: 'lunch',
        scheduled_time: '13:30',
        icon: '🍗',
        calories: 680,
        protein_g: 52,
        carbs_g: 78,
        fats_g: 12,
        portion: '200g chicken breast, 1.5 cups rice, 100g broccoli',
        notes: 'Clean post-workout muscle glycogen replenishment.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `mg_${day}_4`,
        name: 'Whey Protein Isolate Shake, Banana & 1 tbsp Peanut Butter',
        meal_type: 'pre_workout',
        scheduled_time: '17:00',
        icon: '🥤',
        calories: 360,
        protein_g: 30,
        carbs_g: 38,
        fats_g: 9,
        portion: '1 scoop whey (30g), 1 medium banana, 16g PB',
        notes: 'Fast-digesting carbs and amino acids for training.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `mg_${day}_5`,
        name: 'Pan-Seared Atlantic Salmon, Roasted Sweet Potato & Asparagus',
        meal_type: 'dinner',
        scheduled_time: '20:30',
        icon: '🍣',
        calories: 660,
        protein_g: 44,
        carbs_g: 52,
        fats_g: 24,
        portion: '180g salmon fillet, 200g sweet potato, 100g asparagus',
        notes: 'Omega-3 EPA/DHA for joint recovery and inflammation reduction.',
        completed: false,
        alarm_enabled: true,
      },
    ],
  }
}

// ─── Preset 2: Clean Fat Loss / Cut (1800 kcal / 170g P) ───────
function makeFatLossDay(day: DayOfWeek): DayDietPlan {
  const dayName = DAY_NAMES[day]
  return {
    day,
    day_name: dayName,
    target_calories: 1800,
    target_protein_g: 170,
    target_carbs_g: 135,
    target_fats_g: 48,
    meals: [
      {
        id: `fl_${day}_1`,
        name: 'Spinach & Egg White Omelet (4 whites, 1 whole) + 1 Ezekiel Toast',
        meal_type: 'breakfast',
        scheduled_time: '08:30',
        icon: '🍳',
        calories: 360,
        protein_g: 34,
        carbs_g: 22,
        fats_g: 9,
        portion: '4 whites + 1 egg, 50g spinach, 1 toast',
        notes: 'High volume, low calorie density to maximize morning satiety.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `fl_${day}_2`,
        name: 'Air-Fried Chicken Tenderloins with Mixed Greens & Balsamic Vinaigrette',
        meal_type: 'lunch',
        scheduled_time: '13:00',
        icon: '🥗',
        calories: 480,
        protein_g: 48,
        carbs_g: 25,
        fats_g: 14,
        portion: '180g chicken, 150g greens, 10g olive oil dressing',
        notes: 'Zero added sugar, nutrient-rich micronutrient salad.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `fl_${day}_3`,
        name: 'Whey Isolate in Cold Water with 1 Green Crisp Apple',
        meal_type: 'pre_workout',
        scheduled_time: '16:45',
        icon: '🍏',
        calories: 220,
        protein_g: 27,
        carbs_g: 24,
        fats_g: 1,
        portion: '1 scoop isolate, 1 green apple',
        notes: 'Pectin and fast amino acids with minimal insulin spike.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `fl_${day}_4`,
        name: 'Baked White Cod / Tilapia, Steamed Green Beans & 100g Sweet Potato',
        meal_type: 'dinner',
        scheduled_time: '20:00',
        icon: '🐟',
        calories: 520,
        protein_g: 45,
        carbs_g: 38,
        fats_g: 12,
        portion: '200g white fish, 120g green beans, 100g sweet potato',
        notes: 'Ultra lean protein source for overnight fat-burning recovery.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `fl_${day}_5`,
        name: 'Low-Fat Cottage Cheese with Cinnamon & Stevia',
        meal_type: 'night_snack',
        scheduled_time: '22:15',
        icon: '🧀',
        calories: 160,
        protein_g: 20,
        carbs_g: 6,
        fats_g: 3,
        portion: '150g cottage cheese',
        notes: 'Slow-release casein prevents midnight cravings.',
        completed: false,
        alarm_enabled: true,
      },
    ],
  }
}

// ─── Preset 3: High-Protein Vegetarian (2200 kcal / 150g P) ────
function makeVegetarianDay(day: DayOfWeek): DayDietPlan {
  const dayName = DAY_NAMES[day]
  return {
    day,
    day_name: dayName,
    target_calories: 2200,
    target_protein_g: 150,
    target_carbs_g: 250,
    target_fats_g: 60,
    meals: [
      {
        id: `veg_${day}_1`,
        name: 'Overnight Rolled Oats with Soy Milk, Chia Seeds, Plant Protein & Berries',
        meal_type: 'breakfast',
        scheduled_time: '08:00',
        icon: '🥣',
        calories: 490,
        protein_g: 34,
        carbs_g: 65,
        fats_g: 12,
        portion: '60g oats, 200ml soy milk, 1 scoop pea/rice protein, 10g chia',
        notes: 'Complete amino acid profile + beta-glucan fiber.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `veg_${day}_2`,
        name: 'Sprouted Moong & Roasted Spiced Chickpeas Chaat',
        meal_type: 'morning_snack',
        scheduled_time: '11:30',
        icon: '🥗',
        calories: 280,
        protein_g: 18,
        carbs_g: 40,
        fats_g: 5,
        portion: '100g sprouted moong, 40g roasted chickpeas, lemon & spices',
        notes: 'Enzyme-rich bioavailable plant protein and zinc.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `veg_${day}_3`,
        name: 'Pan-Tossed Low-Fat Paneer / Organic Tofu with Brown Rice & Yellow Dal',
        meal_type: 'lunch',
        scheduled_time: '13:30',
        icon: '🍛',
        calories: 640,
        protein_g: 42,
        carbs_g: 75,
        fats_g: 16,
        portion: '150g paneer/tofu, 1 cup cooked brown rice, 1 cup yellow dal',
        notes: 'High leucine plant/dairy synergy for muscle synthesis.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `veg_${day}_4`,
        name: 'Peanut Butter Rice Cakes & Cold Almond-Soy Shake',
        meal_type: 'pre_workout',
        scheduled_time: '17:00',
        icon: '🥜',
        calories: 310,
        protein_g: 18,
        carbs_g: 36,
        fats_g: 11,
        portion: '2 brown rice cakes, 20g natural PB, 150ml soy milk',
        notes: 'Sustained energy release without GI distress.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `veg_${day}_5`,
        name: 'Soya Chunks & Quinoa Power Bowl with Tahini Lime Dressing',
        meal_type: 'dinner',
        scheduled_time: '20:30',
        icon: '🍲',
        calories: 520,
        protein_g: 40,
        carbs_g: 56,
        fats_g: 14,
        portion: '50g dry soya chunks (hydrated), 1 cup cooked quinoa, mixed veg',
        notes: 'Soya chunks contain over 52g protein per 100g raw.',
        completed: false,
        alarm_enabled: true,
      },
    ],
  }
}

// ─── Preset 4: Low-Carb / Keto Athlete (2200 kcal / 155g P / 30g Net C) ──
function makeKetoDay(day: DayOfWeek): DayDietPlan {
  const dayName = DAY_NAMES[day]
  return {
    day,
    day_name: dayName,
    target_calories: 2200,
    target_protein_g: 155,
    target_carbs_g: 32,
    target_fats_g: 160,
    meals: [
      {
        id: `kt_${day}_1`,
        name: '3 Whole Farm Eggs Fried in Grass-Fed Butter, 1 Whole Hass Avocado',
        meal_type: 'breakfast',
        scheduled_time: '08:30',
        icon: '🥑',
        calories: 580,
        protein_g: 26,
        carbs_g: 9,
        fats_g: 50,
        portion: '3 eggs, 10g butter, 1 medium avocado',
        notes: 'High potassium and healthy fats to initiate morning ketosis.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `kt_${day}_2`,
        name: 'Grilled Atlantic Salmon Fillet over Garlic Sautéed Spinach & Walnuts',
        meal_type: 'lunch',
        scheduled_time: '13:30',
        icon: '🍣',
        calories: 680,
        protein_g: 48,
        carbs_g: 6,
        fats_g: 52,
        portion: '200g salmon, 150g spinach, 20g walnuts',
        notes: 'Ultra clean marine omega-3s with virtually zero insulin response.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `kt_${day}_3`,
        name: 'Raw Macadamia Nuts & Sharp Cheddar Cheese Cubes',
        meal_type: 'pre_workout',
        scheduled_time: '17:00',
        icon: '🧀',
        calories: 340,
        protein_g: 14,
        carbs_g: 4,
        fats_g: 30,
        portion: '30g macadamia nuts, 40g cheddar cheese',
        notes: 'Dense ketone energy fuel for heavy training.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `kt_${day}_4`,
        name: 'Bunless Angus Beef Patties with Melted Swiss, Bacon & Grilled Mushrooms',
        meal_type: 'dinner',
        scheduled_time: '20:30',
        icon: '🥩',
        calories: 620,
        protein_g: 54,
        carbs_g: 6,
        fats_g: 42,
        portion: '200g 85/15 beef patty, 30g cheese, 2 bacon strips, 80g mushrooms',
        notes: 'Rich in zinc, iron, and carnosine for deep muscular recovery.',
        completed: false,
        alarm_enabled: true,
      },
    ],
  }
}

// ─── Preset 5: Balanced Everyday Fitness (2200 kcal / 140g P) ─
function makeBalancedDay(day: DayOfWeek): DayDietPlan {
  const dayName = DAY_NAMES[day]
  return {
    day,
    day_name: dayName,
    target_calories: 2200,
    target_protein_g: 140,
    target_carbs_g: 240,
    target_fats_g: 65,
    meals: [
      {
        id: `bal_${day}_1`,
        name: 'Scrambled Eggs (2) with Whole Wheat Toast & Orange Juice',
        meal_type: 'breakfast',
        scheduled_time: '08:00',
        icon: '🍳',
        calories: 450,
        protein_g: 22,
        carbs_g: 48,
        fats_g: 16,
        portion: '2 eggs, 2 toast, 150ml fresh orange juice',
        notes: 'Classic balanced breakfast with vitamin C and quality protein.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `bal_${day}_2`,
        name: 'Grilled Turkey or Chicken Wrap with Hummus, Tomato & Cucumber',
        meal_type: 'lunch',
        scheduled_time: '13:00',
        icon: '🌯',
        calories: 580,
        protein_g: 42,
        carbs_g: 58,
        fats_g: 18,
        portion: '1 large whole wheat tortilla, 150g turkey/chicken, 30g hummus',
        notes: 'Portable, nutrient-dense lunch for sustained afternoon focus.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `bal_${day}_3`,
        name: 'Mixed Nuts & Dried Fruit with a Protein Bar',
        meal_type: 'pre_workout',
        scheduled_time: '16:30',
        icon: '🍫',
        calories: 320,
        protein_g: 20,
        carbs_g: 34,
        fats_g: 12,
        portion: '1 protein bar (20g P), 20g trail mix',
        notes: 'Convenient pre-gym glycogen and amino acids.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `bal_${day}_4`,
        name: 'Lean Beef Stir-Fry with Soba Noodles & Asian Vegetables',
        meal_type: 'dinner',
        scheduled_time: '20:00',
        icon: '🍜',
        calories: 620,
        protein_g: 44,
        carbs_g: 68,
        fats_g: 16,
        portion: '160g lean beef strips, 100g soba noodles, 150g mixed bell peppers/bok choy',
        notes: 'High antioxidant and mineral blend for overnight repair.',
        completed: false,
        alarm_enabled: true,
      },
      {
        id: `bal_${day}_5`,
        name: 'Warm Chamomile Tea with 1 tbsp Raw Honey',
        meal_type: 'night_snack',
        scheduled_time: '22:00',
        icon: '🍵',
        calories: 60,
        protein_g: 0,
        carbs_g: 16,
        fats_g: 0,
        portion: '1 cup herbal tea, 1 tbsp honey',
        notes: 'Calming apigenin flavonoid promotes deep REM sleep.',
        completed: false,
        alarm_enabled: true,
      },
    ],
  }
}

// ─── Master 7-Day Diet Schedules ──────────────────────────────

export type DietPresetType = 'muscle_gain' | 'fat_loss' | 'vegetarian' | 'keto' | 'balanced'

export const DIET_PRESET_NAMES: Record<DietPresetType, { name: string; desc: string; emoji: string }> = {
  muscle_gain: { name: 'Muscle Gain (Hypertrophy)', desc: 'High Protein (2600 kcal • 190g P)', emoji: '🥩' },
  fat_loss: { name: 'Clean Fat Loss (Cut)', desc: 'Lean & Satiating (1800 kcal • 170g P)', emoji: '🔥' },
  vegetarian: { name: 'High-Protein Vegetarian', desc: 'Plant & Dairy Powered (2200 kcal • 150g P)', emoji: '🥗' },
  keto: { name: 'Low-Carb / Keto Athlete', desc: 'High Healthy Fats (2200 kcal • 155g P)', emoji: '🥑' },
  balanced: { name: 'Balanced Everyday Fitness', desc: 'Steady Energy & Health (2200 kcal • 140g P)', emoji: '⚖️' },
}

export function buildWeeklyDietSchedule(preset: DietPresetType): WeeklyDietSchedule {
  const days: Record<DayOfWeek, DayDietPlan> = {
    1: getPresetDay(preset, 1),
    2: getPresetDay(preset, 2),
    3: getPresetDay(preset, 3),
    4: getPresetDay(preset, 4),
    5: getPresetDay(preset, 5),
    6: getPresetDay(preset, 6),
    7: getPresetDay(preset, 7),
  }

  return {
    id: `diet_schedule_${preset}`,
    preset_name: DIET_PRESET_NAMES[preset].name,
    updated_at: new Date().toISOString(),
    days,
  }
}

function getPresetDay(preset: DietPresetType, day: DayOfWeek): DayDietPlan {
  switch (preset) {
    case 'fat_loss':
      return makeFatLossDay(day)
    case 'vegetarian':
      return makeVegetarianDay(day)
    case 'keto':
      return makeKetoDay(day)
    case 'balanced':
      return makeBalancedDay(day)
    case 'muscle_gain':
    default:
      return makeMuscleGainDay(day)
  }
}

// ─── Local Storage & Offline Persistence ──────────────────────

const DIET_STORAGE_KEY = 'consistency_custom_diet_schedule_v1'

export function getSavedDietSchedule(): WeeklyDietSchedule {
  if (typeof window === 'undefined') return buildWeeklyDietSchedule('muscle_gain')
  try {
    const raw = localStorage.getItem(DIET_STORAGE_KEY)
    if (!raw) {
      const def = buildWeeklyDietSchedule('muscle_gain')
      localStorage.setItem(DIET_STORAGE_KEY, JSON.stringify(def))
      return def
    }
    return JSON.parse(raw) as WeeklyDietSchedule
  } catch {
    return buildWeeklyDietSchedule('muscle_gain')
  }
}

export function saveWeeklyDietSchedule(schedule: WeeklyDietSchedule): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DIET_STORAGE_KEY, JSON.stringify(schedule))
  } catch (err) {
    console.warn('Failed to save diet schedule:', err)
  }
}
