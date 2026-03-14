export type Species = 'dog' | 'cat' | 'rabbit' | 'other'
export type PetSize = 'small' | 'medium' | 'large'
export type Sex = 'male' | 'female'
export type LogType =
  | 'weight'
  | 'vaccination'
  | 'deworming'
  | 'flea_tick'
  | 'vet_visit'
  | 'medication'
  | 'symptom'
  | 'note'

export interface Pet {
  id: string
  name: string
  species: Species
  breed: string
  birthday: string // ISO date
  sex: Sex
  size: PetSize
  color: string
  photoUrl?: string
  vetClinic?: string
  trackingConfig: {
    vaccinations: boolean
    deworming: boolean
    fleaTick: boolean
    weight: boolean
    symptoms: boolean
  }
  createdAt: string
}

export interface LogEntry {
  id: string
  petId: string
  type: LogType
  date: string // ISO date
  title: string
  notes?: string
  data?: {
    weight?: number // kg
    weightUnit?: 'kg' | 'lbs'
    vaccineName?: string
    medicationName?: string
    dosage?: string
    duration?: string
    severity?: 'mild' | 'moderate' | 'severe'
    vetName?: string
    cost?: number
  }
  createdAt: string
}
