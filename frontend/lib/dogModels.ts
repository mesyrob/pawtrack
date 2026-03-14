export interface DogModelConfig {
  bodyLength: number
  bodyHeight: number
  legLength: number
  headSize: number
  earType: 'floppy' | 'pointy'
  tailType: 'long' | 'short' | 'curly'
  snoutLength: number
}

const breedConfigs: Record<string, DogModelConfig> = {
  Labrador: {
    bodyLength: 1.4, bodyHeight: 0.7, legLength: 0.7,
    headSize: 0.55, earType: 'floppy', tailType: 'long', snoutLength: 0.4,
  },
  'Golden Retriever': {
    bodyLength: 1.5, bodyHeight: 0.7, legLength: 0.75,
    headSize: 0.55, earType: 'floppy', tailType: 'long', snoutLength: 0.38,
  },
  Bulldog: {
    bodyLength: 1.1, bodyHeight: 0.65, legLength: 0.4,
    headSize: 0.6, earType: 'floppy', tailType: 'short', snoutLength: 0.2,
  },
  Poodle: {
    bodyLength: 1.2, bodyHeight: 0.6, legLength: 0.7,
    headSize: 0.5, earType: 'floppy', tailType: 'curly', snoutLength: 0.4,
  },
  Beagle: {
    bodyLength: 1.2, bodyHeight: 0.55, legLength: 0.5,
    headSize: 0.5, earType: 'floppy', tailType: 'long', snoutLength: 0.35,
  },
  'German Shepherd': {
    bodyLength: 1.5, bodyHeight: 0.75, legLength: 0.8,
    headSize: 0.55, earType: 'pointy', tailType: 'long', snoutLength: 0.45,
  },
  Dachshund: {
    bodyLength: 1.6, bodyHeight: 0.45, legLength: 0.25,
    headSize: 0.45, earType: 'floppy', tailType: 'long', snoutLength: 0.35,
  },
  Mixed: {
    bodyLength: 1.3, bodyHeight: 0.65, legLength: 0.6,
    headSize: 0.5, earType: 'floppy', tailType: 'long', snoutLength: 0.35,
  },
}

const sizeScale: Record<string, number> = {
  small: 0.75,
  medium: 1.0,
  large: 1.2,
}

export function getModelConfig(breed: string, size: string): DogModelConfig {
  const base = breedConfigs[breed] ?? breedConfigs.Mixed
  const scale = sizeScale[size] ?? 1.0
  return {
    ...base,
    bodyLength: base.bodyLength * scale,
    bodyHeight: base.bodyHeight * scale,
    legLength: base.legLength * scale,
    headSize: base.headSize * scale,
    snoutLength: base.snoutLength * scale,
  }
}

const colorMap: Record<string, string> = {
  golden: '#D4A843',
  gold: '#D4A843',
  yellow: '#D4A843',
  brown: '#8B5E3C',
  chocolate: '#5C3317',
  black: '#2A2A2A',
  white: '#F0EDE0',
  cream: '#F5E6C8',
  red: '#A0522D',
  tan: '#C4A882',
  fawn: '#C8A96E',
  gray: '#7A7A7A',
  grey: '#7A7A7A',
  brindle: '#6B4226',
  merle: '#708090',
  sable: '#8B6914',
  tricolor: '#5C3317',
}

export function parseColor(colorString: string): { primary: string; secondary: string } {
  const lower = colorString.toLowerCase()

  // Handle "X & Y" or "X and Y" patterns
  const parts = lower.split(/\s*[&+]\s*|\s+and\s+/)
  if (parts.length >= 2) {
    return {
      primary: colorMap[parts[0].trim()] ?? '#8B5E3C',
      secondary: colorMap[parts[1].trim()] ?? '#F0EDE0',
    }
  }

  // Single color - find match
  for (const [key, hex] of Object.entries(colorMap)) {
    if (lower.includes(key)) {
      return { primary: hex, secondary: darken(hex, 0.2) }
    }
  }

  return { primary: '#8B5E3C', secondary: '#6B4226' }
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * (1 - amount))
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * (1 - amount))
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * (1 - amount))
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}
