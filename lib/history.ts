export interface WorkoutSession {
    id: string
    date: string
    exercise: string
    reps: number
    avgScore: number
    duration: number
    side: string
    scores: number[]
}

const STORAGE_KEY = 'gymify-history'

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function saveSession(session: Omit<WorkoutSession, 'id' | 'date'>): WorkoutSession {
    const full: WorkoutSession = {
        ...session,
        id: generateId(),
        date: new Date().toISOString(),
    }
    const history = loadHistory()
    history.unshift(full)
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
    return full
}

export function loadHistory(): WorkoutSession[] {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as WorkoutSession[]
    } catch {
        return []
    }
}

export function clearHistory() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
}

export function getStats(history: WorkoutSession[]) {
    if (history.length === 0) {
        return { totalSessions: 0, totalReps: 0, avgScore: 0, totalTime: 0 }
    }
    const totalSessions = history.length
    const totalReps = history.reduce((sum, s) => sum + s.reps, 0)
    const totalTime = history.reduce((sum, s) => sum + s.duration, 0)
    const avgScore = Math.round(history.reduce((sum, s) => sum + s.avgScore, 0) / totalSessions)
    return { totalSessions, totalReps, avgScore, totalTime }
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(iso: string): string {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
