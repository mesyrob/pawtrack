import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Pet, LogEntry } from '@/lib/types'
import * as storage from '@/lib/storage'

const DEFAULT_PET: Pet = {
  id: 'yamato-default',
  name: 'Yamato',
  species: 'dog',
  breed: 'Miniature Dachshund',
  birthday: '2023-06-15',
  sex: 'male',
  size: 'small',
  color: 'Red',
  vetClinic: 'Paws & Claws Veterinary',
  trackingConfig: {
    vaccinations: true,
    deworming: true,
    fleaTick: true,
    weight: true,
    symptoms: true,
  },
  createdAt: '2024-01-01T00:00:00Z',
}

const DEFAULT_LOGS: LogEntry[] = [
  {
    id: 'seed-1',
    petId: 'yamato-default',
    type: 'vaccination',
    date: '2025-12-15',
    title: 'DHPP Booster',
    notes: 'Annual booster, no adverse reaction',
    data: { vaccineName: 'DHPP' },
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'seed-2',
    petId: 'yamato-default',
    type: 'vaccination',
    date: '2025-12-15',
    title: 'Rabies Vaccine',
    data: { vaccineName: 'Rabies' },
    createdAt: '2025-12-15T10:30:00Z',
  },
  {
    id: 'seed-3',
    petId: 'yamato-default',
    type: 'weight',
    date: '2026-01-10',
    title: 'Weight Check',
    data: { weight: 4.5, weightUnit: 'kg' },
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'seed-4',
    petId: 'yamato-default',
    type: 'vet_visit',
    date: '2026-01-10',
    title: 'Annual Checkup',
    notes: 'All clear! Healthy and happy.',
    data: { vetName: 'Dr. Tanaka', cost: 85 },
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'seed-5',
    petId: 'yamato-default',
    type: 'deworming',
    date: '2026-02-01',
    title: 'Deworming Treatment',
    data: { medicationName: 'Drontal', dosage: '1 tablet' },
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'seed-6',
    petId: 'yamato-default',
    type: 'flea_tick',
    date: '2026-02-20',
    title: 'Flea & Tick Prevention',
    data: { medicationName: 'Frontline Plus', dosage: '0.67ml' },
    createdAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'seed-7',
    petId: 'yamato-default',
    type: 'weight',
    date: '2026-03-01',
    title: 'Weight Check',
    data: { weight: 4.8, weightUnit: 'kg' },
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'seed-8',
    petId: 'yamato-default',
    type: 'note',
    date: '2026-03-10',
    title: 'Extra playful today',
    notes: 'Yamato had a great day at the park, made friends with a golden retriever!',
    createdAt: '2026-03-10T18:00:00Z',
  },
]

interface PetContextValue {
  pets: Pet[]
  logs: LogEntry[]
  activePet: Pet | null
  setActivePet: (pet: Pet | null) => void
  addPet: (pet: Pet) => void
  updatePet: (pet: Pet) => void
  removePet: (petId: string) => void
  addLog: (log: LogEntry) => void
  updateLog: (log: LogEntry) => void
  removeLog: (logId: string) => void
  getLogsFor: (petId: string) => LogEntry[]
  isLoaded: boolean
}

const PetContext = createContext<PetContextValue | null>(null)

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [activePet, setActivePet] = useState<Pet | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const storedPets = await storage.getPets()
      const storedLogs = await storage.getLogs()

      if (storedPets.length > 0) {
        setPets(storedPets)
        setLogs(storedLogs)
        setActivePet(storedPets[0])
      } else {
        // Seed Yamato as the default pet
        await storage.savePet(DEFAULT_PET)
        for (const log of DEFAULT_LOGS) {
          await storage.saveLog(log)
        }
        setPets([DEFAULT_PET])
        setLogs(DEFAULT_LOGS)
        setActivePet(DEFAULT_PET)
      }

      setIsLoaded(true)
    }
    load()
  }, [])

  const addPet = useCallback((pet: Pet) => {
    storage.savePet(pet)
    setPets((prev) => [...prev, pet])
    setActivePet(pet)
  }, [])

  const updatePet = useCallback((pet: Pet) => {
    storage.savePet(pet)
    setPets((prev) => prev.map((p) => (p.id === pet.id ? pet : p)))
    setActivePet((prev) => (prev?.id === pet.id ? pet : prev))
  }, [])

  const removePet = useCallback((petId: string) => {
    storage.deletePet(petId)
    setPets((prev) => prev.filter((p) => p.id !== petId))
    setLogs((prev) => prev.filter((l) => l.petId !== petId))
    setActivePet((prev) => (prev?.id === petId ? null : prev))
  }, [])

  const addLog = useCallback((log: LogEntry) => {
    storage.saveLog(log)
    setLogs((prev) => [...prev, log])
  }, [])

  const updateLog = useCallback((log: LogEntry) => {
    storage.saveLog(log)
    setLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)))
  }, [])

  const removeLog = useCallback((logId: string) => {
    storage.deleteLog(logId)
    setLogs((prev) => prev.filter((l) => l.id !== logId))
  }, [])

  const getLogsFor = useCallback(
    (petId: string) => logs.filter((l) => l.petId === petId),
    [logs]
  )

  return (
    <PetContext.Provider
      value={{
        pets,
        logs,
        activePet,
        setActivePet,
        addPet,
        updatePet,
        removePet,
        addLog,
        updateLog,
        removeLog,
        getLogsFor,
        isLoaded,
      }}
    >
      {children}
    </PetContext.Provider>
  )
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets must be used within PetProvider')
  return ctx
}
