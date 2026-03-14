import { BreedDetectionResult } from './types'

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? ''

const PLACEHOLDER_PATTERNS = [
  'your-api-key',
  'sk-ant-xxx',
  'your_api_key',
  'replace-me',
  'placeholder',
  'test-key',
]

function isValidApiKey(key: string): boolean {
  if (!key || key.length < 10) return false
  const lower = key.toLowerCase()
  return !PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))
}

export const isApiKeyConfigured = isValidApiKey(API_KEY)

const FALLBACK: BreedDetectionResult = {
  species: 'dog',
  breed: 'Mixed',
  color: 'Brown',
  size: 'medium',
  confidence: 0,
}

export async function detectBreed(
  base64Data: string,
  mimeType: string = 'image/jpeg',
): Promise<BreedDetectionResult> {
  try {
    if (!isApiKeyConfigured) {
      console.warn('[breedDetection] API key not configured or is a placeholder')
      return FALLBACK
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mimeType, data: base64Data },
              },
              {
                type: 'text',
                text: 'Analyze this pet photo. Respond with ONLY a JSON object (no markdown, no explanation):\n{"species":"dog"|"cat"|"rabbit"|"other","breed":"<specific breed>","color":"<primary coat color>","size":"small"|"medium"|"large","confidence":0.0-1.0}\nIf no animal is visible, set confidence to 0.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error(`[breedDetection] API error: ${response.status} ${response.statusText}`)
      return FALLBACK
    }

    const data = await response.json()
    const text = data.content?.[0]?.text ?? ''
    const json = JSON.parse(text)

    return {
      species: ['dog', 'cat', 'rabbit', 'other'].includes(json.species) ? json.species : 'dog',
      breed: json.breed || 'Mixed',
      color: json.color || 'Brown',
      size: ['small', 'medium', 'large'].includes(json.size) ? json.size : 'medium',
      confidence: typeof json.confidence === 'number' ? json.confidence : 0,
    }
  } catch (err) {
    console.error('[breedDetection] Detection failed:', err)
    return FALLBACK
  }
}
