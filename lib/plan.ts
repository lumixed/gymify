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
    // Also persist to database (fire-and-forget)
    fetch('/api/db/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
    }).catch(() => {})
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
    // Also clear from database
    fetch('/api/db/plan', { method: 'DELETE' }).catch(() => {})
}

export function hasPlan(): boolean {
    return loadPlan() !== null
}

// ── Sync: pull from DB into localStorage on first load ──

export async function syncPlanFromDB(): Promise<WorkoutPlan | null> {
    try {
        const res = await fetch('/api/db/plan')
        const data = await res.json()
        if (data && data.split) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            }
            return data as WorkoutPlan
        }
    } catch {
        // DB unavailable
    }
    return loadPlan()
}
