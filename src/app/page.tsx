'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePets } from '@/contexts/PetContext'

export default function Home() {
  const { pets, isLoaded } = usePets()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return
    if (pets.length > 0) {
      router.replace('/dashboard')
    } else {
      router.replace('/onboarding')
    }
  }, [isLoaded, pets, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce [animation-delay:0ms]" />
        <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce [animation-delay:150ms]" />
        <div className="w-3 h-3 bg-[var(--color-fg)] rounded-[2px] animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}
