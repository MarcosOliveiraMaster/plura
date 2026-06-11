import React from 'react'

type BadgeVariant = 'blue' | 'white' | 'success' | 'warning' | 'error' | 'outline'
type BadgeSize    = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  style?: React.CSSProperties
}

/* Variantes com cores fixas (success/warning/error/blue) ficam hardcoded.
   Variantes que dependem de contraste de tema (white/outline) usam variáveis. */
const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  blue: {
    background: 'rgba(26,122,255,0.20)',
    border:     '1px solid rgba(26,122,255,0.45)',
    color:      '#6aadff',
  },
  white: {
    background: 'var(--c-badge-white-bg)',
    border:     '1px solid var(--c-badge-white-border, rgba(255,255,255,0.20))',
    color:      'var(--c-badge-white-text)',
  },
  success: {
    background: 'rgba(34,197,94,0.15)',
    border:     '1px solid rgba(34,197,94,0.35)',
    color:      '#4ade80',
  },
  warning: {
    background: 'rgba(245,158,11,0.15)',
    border:     '1px solid rgba(245,158,11,0.35)',
    color:      '#fbbf24',
  },
  error: {
    background: 'rgba(239,68,68,0.15)',
    border:     '1px solid rgba(239,68,68,0.35)',
    color:      '#f87171',
  },
  outline: {
    background: 'transparent',
    border:     '1px solid var(--c-badge-outline-border, rgba(255,255,255,0.25))',
    color:      'var(--c-badge-outline-text)',
  },
}

const dotColors: Record<BadgeVariant, string> = {
  blue:    '#3d94ff',
  white:   'var(--c-badge-dot-white)',
  success: '#22c55e',
  warning: '#f59e0b',
  error:   '#ef4444',
  outline: 'var(--c-badge-dot-outline)',
}

export const Badge: React.FC<BadgeProps> = ({
  children, variant = 'blue', size = 'md', dot = false, style,
}) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
    padding: size === 'sm' ? '0.1875rem 0.5rem' : '0.3125rem 0.75rem',
    borderRadius: '9999px',
    fontSize: size === 'sm' ? '0.6875rem' : '0.8125rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    backdropFilter: 'blur(8px)',
    transition: 'background 350ms ease, border 350ms ease, color 350ms ease',
    ...badgeStyles[variant],
    ...style,
  }}>
    {dot && (
      <span style={{
        width: '0.4375rem', height: '0.4375rem',
        borderRadius: '50%',
        background: dotColors[variant],
        flexShrink: 0,
      }} />
    )}
    {children}
  </span>
)
