import React from 'react'

type Variant = 'default' | 'sm' | 'lg' | 'blue'

interface GlassCardProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hoverable?: boolean
}

const variantClass: Record<Variant, string> = {
  default: 'glass',
  sm:      'glass-sm',
  lg:      'glass-lg',
  blue:    'glass-blue',
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`${variantClass[variant]} ${className}`}
      style={{
        padding: '1.5rem',
        transition: 'transform 250ms cubic-bezier(0.4,0,0.2,1), box-shadow 250ms cubic-bezier(0.4,0,0.2,1)',
        cursor: onClick ? 'pointer' : undefined,
        ...(hoverable && { cursor: 'pointer' }),
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={e => {
        if (hoverable || onClick) {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) scale(1.01)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.20)'
        }
      }}
      onMouseLeave={e => {
        if (hoverable || onClick) {
          (e.currentTarget as HTMLDivElement).style.transform = ''
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
        }
      }}
    >
      {children}
    </div>
  )
}
