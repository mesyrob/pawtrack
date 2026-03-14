import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  onClick?: () => void
}

export default function Card({ children, className = '', size = 'md', onClick }: CardProps) {
  return (
    <div
      className={[
        size === 'md' ? 'brut-card' : 'brut-card-sm',
        'p-5',
        onClick ? 'cursor-pointer transition-transform active:translate-x-[2px] active:translate-y-[2px]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
