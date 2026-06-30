export interface MeasurementEntry {
    id: string
    date: string
    weight: number // kg
    bodyFat?: number // %
    chest?: number // cm
    waist?: number // cm
    arms?: number // cm
    thighs?: number // cm
}

const STORAGE_KEY = 'gymify-measurements'

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function saveMeasurement(entry: Omit<MeasurementEntry, 'id'>): MeasurementEntry {
    const full: MeasurementEntry = {
        ...entry,
        id: generateId(),
    }
    const history = loadMeasurements()
    history.unshift(full)
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
    // Also persist to database (fire-and-forget)
    fetch('/api/db/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    }).catch(() => {})

    return full
}

export function loadMeasurements(): MeasurementEntry[] {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw) as MeasurementEntry[]
    } catch {
        return []
    }
}

export function deleteMeasurement(id: string) {
    if (typeof window === 'undefined') return
    const history = loadMeasurements()
    const filtered = history.filter(m => m.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    // Also delete from database
    fetch(`/api/db/measurements?id=${id}`, { method: 'DELETE' }).catch(() => {})
}

export function getLatestMeasurement(): MeasurementEntry | null {
    const history = loadMeasurements()
    return history.length > 0 ? history[0] : null
}

// ── Sync: pull from DB into localStorage on first load ──

export async function syncMeasurementsFromDB(): Promise<MeasurementEntry[]> {
    try {
        const res = await fetch('/api/db/measurements')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
            }
            return data as MeasurementEntry[]
        }
    } catch {
        // DB unavailable
    }
    return loadMeasurements()
}
