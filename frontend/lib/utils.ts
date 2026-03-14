export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function calcAge(birthday: string): string {
  const born = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - born.getFullYear()
  let months = now.getMonth() - born.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (years === 0) return `${months}mo`
  if (months === 0) return `${years}yr`
  return `${years}yr ${months}mo`
}

export function daysSince(iso: string): number {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function slugToLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
