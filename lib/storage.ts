import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pet, LogEntry } from './types'

const PETS_KEY = 'pawtrack_pets'
const LOGS_KEY = 'pawtrack_logs'

// ── Pets ──────────────────────────────────────────────────────────────────────

export async function getPets(): Promise<Pet[]> {
  try {
    const raw = await AsyncStorage.getItem(PETS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function savePet(pet: Pet): Promise<void> {
  const pets = await getPets()
  const idx = pets.findIndex((p) => p.id === pet.id)
  if (idx >= 0) {
    pets[idx] = pet
  } else {
    pets.push(pet)
  }
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets))
}

export async function deletePet(petId: string): Promise<void> {
  const pets = (await getPets()).filter((p) => p.id !== petId)
  await AsyncStorage.setItem(PETS_KEY, JSON.stringify(pets))
  const logs = (await getLogs()).filter((l) => l.petId !== petId)
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export async function getLogs(): Promise<LogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(LOGS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function getLogsForPet(petId: string): Promise<LogEntry[]> {
  return (await getLogs()).filter((l) => l.petId === petId)
}

export async function saveLog(log: LogEntry): Promise<void> {
  const logs = await getLogs()
  const idx = logs.findIndex((l) => l.id === log.id)
  if (idx >= 0) {
    logs[idx] = log
  } else {
    logs.push(log)
  }
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

export async function deleteLog(logId: string): Promise<void> {
  const logs = (await getLogs()).filter((l) => l.id !== logId)
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}
