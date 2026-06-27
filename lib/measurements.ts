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
}

export function getLatestMeasurement(): MeasurementEntry | null {
    const history = loadMeasurements()
    return history.length > 0 ? history[0] : null
}
