import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Pet, LogEntry } from '@/lib/types'
import * as storage from '@/lib/storage'

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
      setPets(storedPets)
      setLogs(storedLogs)
      if (storedPets.length > 0) {
        setActivePet(storedPets[0])
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
