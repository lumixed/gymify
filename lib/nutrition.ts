export interface FoodItem {
    food: string
    portion: string
    calories: number
    protein: number
    carbs: number
    fat: number
}

export interface Meal {
    name: string
    time: string
    items: FoodItem[]
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    tip: string
}

export interface NutritionPlan {
    overview: string
    meals: Meal[]
    dailyTip: string
    generatedAt: string
}

const STORAGE_KEY = 'gymify-nutrition'

export function saveNutrition(plan: NutritionPlan) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

export function loadNutrition(): NutritionPlan | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as NutritionPlan
    } catch {
        return null
    }
}

export function clearNutrition() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}
