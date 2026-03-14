import { Pet, LogEntry } from './types'

const PETS_KEY = 'pawtrack_pets'
const LOGS_KEY = 'pawtrack_logs'

function isServer() {
  return typeof window === 'undefined'
}

// ── Pets ──────────────────────────────────────────────────────────────────────

export function getPets(): Pet[] {
  if (isServer()) return []
  try {
    const raw = localStorage.getItem(PETS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePet(pet: Pet): void {
  if (isServer()) return
  const pets = getPets()
  const idx = pets.findIndex((p) => p.id === pet.id)
  if (idx >= 0) {
    pets[idx] = pet
  } else {
    pets.push(pet)
  }
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
}

export function deletePet(petId: string): void {
  if (isServer()) return
  const pets = getPets().filter((p) => p.id !== petId)
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
  // Also remove associated logs
  const logs = getLogs().filter((l) => l.petId !== petId)
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export function getLogs(): LogEntry[] {
  if (isServer()) return []
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getLogsForPet(petId: string): LogEntry[] {
  return getLogs().filter((l) => l.petId === petId)
}

export function saveLog(log: LogEntry): void {
  if (isServer()) return
  const logs = getLogs()
  const idx = logs.findIndex((l) => l.id === log.id)
  if (idx >= 0) {
    logs[idx] = log
  } else {
    logs.push(log)
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export function deleteLog(logId: string): void {
  if (isServer()) return
  const logs = getLogs().filter((l) => l.id !== logId)
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}
