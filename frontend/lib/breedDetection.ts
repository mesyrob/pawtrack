import { BreedDetectionResult } from './types'
import * as api from './api'

const FALLBACK: BreedDetectionResult = {
  species: 'dog',
  breed: 'Mixed',
  color: 'Brown',
  size: 'medium',
  confidence: 0,
}

export const isBreedDetectionAvailable = api.isApiConfigured()

/**
 * Upload a photo to S3 via presigned URL, then call the backend
 * to detect breed via Rekognition. Keeps the API key server-side.
 */
export async function detectBreed(
  base64Data: string,
  mimeType: string = 'image/jpeg',
): Promise<BreedDetectionResult> {
  try {
    if (!isBreedDetectionAvailable) {
      console.warn('[breedDetection] API URL not configured')
      return FALLBACK
    }

    // 1. Get a presigned upload URL from the backend
    const { url, s3Key } = await api.getUploadUrl(mimeType)

    // 2. Decode base64 and upload the image to S3
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const uploadRes = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: bytes,
    })

    if (!uploadRes.ok) {
      console.error(`[breedDetection] S3 upload failed: ${uploadRes.status}`)
      return FALLBACK
    }

    // 3. Ask the backend to detect breed from the uploaded image
    const result = await api.detectBreedRemote(s3Key)

    return {
      species: ['dog', 'cat', 'rabbit', 'other'].includes(result.species)
        ? (result.species as BreedDetectionResult['species'])
        : 'dog',
      breed: result.breed || 'Mixed',
      color: result.color || 'Brown',
      size: ['small', 'medium', 'large'].includes(result.size)
        ? (result.size as BreedDetectionResult['size'])
        : 'medium',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0,
    }
  } catch (err) {
    console.error('[breedDetection] Detection failed:', err)
    return FALLBACK
  }
}
