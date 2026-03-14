import type { Metadata } from 'next'
import './globals.css'
import { PetProvider } from '@/contexts/PetContext'

export const metadata: Metadata = {
  title: 'PawTrack — Pet Health Tracker',
  description: 'Track vaccinations, weight, vet visits and more for your pet.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PetProvider>{children}</PetProvider>
      </body>
    </html>
  )
}
