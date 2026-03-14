import { Pet, LogEntry } from './types'
import { getDeviceId } from './deviceId'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? ''

export function isApiConfigured(): boolean {
  return BASE_URL.length > 0 && BASE_URL !== 'undefined'
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const deviceId = await getDeviceId()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

// ── Pets ────────────────────────────────────────────────────────────────────

export async function listPets(): Promise<Pet[]> {
  return request<Pet[]>('/pets')
}

export async function getPet(petId: string): Promise<Pet> {
  return request<Pet>(`/pets/${petId}`)
}

export async function createPet(pet: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
  return request<Pet>('/pets', {
    method: 'POST',
    body: JSON.stringify(pet),
  })
}

export async function updatePet(pet: Pet): Promise<Pet> {
  return request<Pet>(`/pets/${pet.id}`, {
    method: 'PUT',
    body: JSON.stringify(pet),
  })
}

export async function deletePet(petId: string): Promise<void> {
  await request(`/pets/${petId}`, { method: 'DELETE' })
}

// ── Logs ────────────────────────────────────────────────────────────────────

export async function listLogs(petId: string): Promise<LogEntry[]> {
  return request<LogEntry[]>(`/pets/${petId}/logs`)
}

export async function createLog(
  petId: string,
  log: Omit<LogEntry, 'id' | 'petId' | 'createdAt'>,
): Promise<LogEntry> {
  return request<LogEntry>(`/pets/${petId}/logs`, {
    method: 'POST',
    body: JSON.stringify(log),
  })
}

// ── Breed detection (via backend Rekognition) ───────────────────────────────

export interface UploadURLResponse {
  url: string
  s3Key: string
}

export async function getUploadUrl(contentType = 'image/jpeg'): Promise<UploadURLResponse> {
  return request<UploadURLResponse>('/upload-url', {
    method: 'POST',
    body: JSON.stringify({ contentType }),
  })
}

export async function detectBreedRemote(s3Key: string) {
  return request<{ species: string; breed: string; color: string; size: string; confidence: number }>(
    '/detect-breed',
    {
      method: 'POST',
      body: JSON.stringify({ s3Key }),
    },
  )
}

// ── Health ───────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>('/health')
}
