import React from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

/* Variantes que dependem de tema usam CSS variables */
const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #1a7aff 0%, #0062e6 100%)',
    color:      '#ffffff',
    border:     '1px solid rgba(26,122,255,0.60)',
    boxShadow:  '0 4px 16px rgba(26,122,255,0.30), inset 0 1px 0 rgba(255,255,255,0.20)',
  },
  secondary: {
    background:     'var(--c-btn-secondary-bg)',
    backdropFilter: 'blur(16px)',
    color:          'var(--c-btn-secondary-text)',
    border:         '1px solid var(--c-btn-secondary-border, rgba(255,255,255,0.20))',
    boxShadow:      'var(--c-shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color:      'var(--c-btn-ghost-text)',
    border:     '1px solid var(--c-btn-ghost-border, rgba(255,255,255,0.12))',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color:      '#ffffff',
    border:     '1px solid rgba(239,68,68,0.60)',
    boxShadow:  '0 4px 16px rgba(239,68,68,0.30)',
  },
  success: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color:      '#ffffff',
    border:     '1px solid rgba(34,197,94,0.60)',
    boxShadow:  '0 4px 16px rgba(34,197,94,0.30)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.875rem', fontSize: '0.8125rem', borderRadius: '0.5rem' },
  md: { padding: '0.625rem 1.25rem',  fontSize: '0.9375rem', borderRadius: '0.75rem' },
  lg: { padding: '0.875rem 1.75rem',  fontSize: '1.0625rem', borderRadius: '1rem' },
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '0.5rem',
        fontFamily:     'inherit',
        fontWeight:     600,
        letterSpacing:  '0.01em',
        cursor:         isDisabled ? 'not-allowed' : 'pointer',
        opacity:        isDisabled ? 0.5 : 1,
        transition:     'transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease, background 350ms ease, color 350ms ease, border 350ms ease',
        outline:        'none',
        whiteSpace:     'nowrap',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      onMouseEnter={e => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
          if (variant === 'primary') {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 8px 24px rgba(26,122,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'
          }
        }
      }}
      onMouseLeave={e => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = ''
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow =
            (variantStyles[variant].boxShadow as string) ?? ''
        }
      }}
      onMouseDown={e => {
        if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(0.98)'
      }}
      onMouseUp={e => {
        if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
      }}
    >
      {loading && (
        <span style={{
          width: '1em', height: '1em',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {!loading && icon && iconPosition === 'left'  && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}
