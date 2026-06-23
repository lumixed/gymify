export interface Exercise {
    name: string
    sets: number
    reps: string
    rest: string
    notes: string
}

export interface TrainingDay {
    day: number
    name: string
    focus: string
    exercises: Exercise[]
}

export interface WorkoutPlan {
    split: string
    days: TrainingDay[]
    generatedAt: string
}

const STORAGE_KEY = 'gymify-plan'

export function savePlan(plan: WorkoutPlan) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
}

export function loadPlan(): WorkoutPlan | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw) as WorkoutPlan
    } catch {
        return null
    }
}

export function clearPlan() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

export function hasPlan(): boolean {
    return loadPlan() !== null
}
