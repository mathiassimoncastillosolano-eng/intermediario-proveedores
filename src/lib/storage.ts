import { STORAGE_KEYS, STORAGE_PREFIX } from '../config'

/** Almacenamiento local resiliente: si localStorage falla, se conserva en memoria durante la sesión. */
const memory = new Map<string, string>()
let healthy = true

export const storageHealthy = () => healthy

export function read<T>(key: string, fallback: T): T {
  const k = STORAGE_PREFIX + key
  try {
    const raw = window.localStorage.getItem(k)
    if (raw !== null) return JSON.parse(raw) as T
  } catch {
    healthy = false
  }
  try {
    const m = memory.get(k)
    return m !== undefined ? (JSON.parse(m) as T) : fallback
  } catch {
    return fallback
  }
}

export function write(key: string, value: unknown) {
  const k = STORAGE_PREFIX + key
  const raw = JSON.stringify(value)
  memory.set(k, raw)
  try {
    window.localStorage.setItem(k, raw)
  } catch {
    healthy = false
  }
}

export function remove(key: string) {
  const k = STORAGE_PREFIX + key
  memory.delete(k)
  try {
    window.localStorage.removeItem(k)
  } catch {
    healthy = false
  }
}

export function clearDemoData() {
  Object.values(STORAGE_KEYS).forEach(remove)
  remove('profiles')
}
