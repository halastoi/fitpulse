import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
}

export function Card({ children, glow = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`backdrop-blur-sm rounded-2xl p-4 ${glow ? 'shadow-lg shadow-primary-500/10' : ''} ${className}`}
      style={{
        backgroundColor: 'var(--surface-bg)',
        borderWidth: '1px',
        borderColor: 'var(--surface-border)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
