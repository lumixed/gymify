export interface UserProfile {
    name: string
    age: number
    gender: 'male' | 'female' | 'other'
    height: number
    weight: number
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    goal: 'lose-fat' | 'build-muscle' | 'stay-healthy' | 'get-stronger'
    daysPerWeek: number
    equipment: 'bodyweight' | 'dumbbells' | 'full-gym'
    injuries: string
}

const STORAGE_KEY = 'gymify-profile'

export function saveProfile(profile: UserProfile) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function loadProfile(): UserProfile | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as UserProfile
    } catch {
        return null
    }
}

export function clearProfile() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

export function hasProfile(): boolean {
    return loadProfile() !== null
}

export function calculateBMR(profile: UserProfile): number {
    if (profile.gender === 'male') {
        return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    }
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
}

export function calculateTDEE(profile: UserProfile): number {
    const bmr = calculateBMR(profile)
    const multipliers: Record<number, number> = {
        3: 1.375,
        4: 1.46,
        5: 1.55,
        6: 1.64,
    }
    return Math.round(bmr * (multipliers[profile.daysPerWeek] || 1.55))
}

export function calculateTargetCalories(profile: UserProfile): number {
    const tdee = calculateTDEE(profile)
    switch (profile.goal) {
        case 'lose-fat': return Math.round(tdee * 0.8)
        case 'build-muscle': return Math.round(tdee * 1.1)
        case 'get-stronger': return Math.round(tdee * 1.05)
        default: return tdee
    }
}

export function calculateMacros(profile: UserProfile) {
    const calories = calculateTargetCalories(profile)
    const proteinG = Math.round(profile.weight * (profile.goal === 'build-muscle' ? 2.2 : 1.8))
    const fatG = Math.round(profile.weight * 0.9)
    const proteinCals = proteinG * 4
    const fatCals = fatG * 9
    const carbCals = Math.max(0, calories - proteinCals - fatCals)
    const carbG = Math.round(carbCals / 4)

    return { calories, protein: proteinG, fat: fatG, carbs: carbG }
}
