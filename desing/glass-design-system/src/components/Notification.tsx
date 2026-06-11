import React, { useState } from 'react'

type NotifVariant = 'info' | 'success' | 'warning' | 'error'

interface NotificationProps {
  variant?: NotifVariant
  title: string
  message?: string
  onClose?: () => void
}

const config: Record<NotifVariant, { color: string; label: string }> = {
  info:    { color: '#3d94ff', label: 'INFO' },
  success: { color: '#22c55e', label: 'OK' },
  warning: { color: '#f59e0b', label: 'WARN' },
  error:   { color: '#ef4444', label: 'ERR' },
}

export const Notification: React.FC<NotificationProps> = ({
  variant = 'info', title, message, onClose,
}) => {
  const [visible, setVisible] = useState(true)
  const c = config[variant]
  if (!visible) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '1.25rem',
      padding: '1rem 1.25rem',
      background:     'var(--c-notif-bg)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      border:         'var(--c-border-sm)',
      borderLeft:     `2.5px solid ${c.color}`,
      borderRadius:   '0 0.875rem 0.875rem 0',
      boxShadow:      'var(--c-shadow-sm)',
      animation:      'slide-in-left 280ms cubic-bezier(0.34,1.56,0.64,1)',
      transition:     'background 350ms ease, box-shadow 350ms ease',
    }}>
      <span style={{
        fontFamily:    'var(--font-mono)',
        fontSize:      '0.5625rem',
        letterSpacing: '0.12em',
        color:         c.color,
        fontWeight:    600,
        paddingTop:    '0.1875rem',
        flexShrink:    0,
        minWidth:      '2.75rem',
      }}>
        [{c.label}]
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 600, fontSize: '0.9375rem',
          color: 'var(--c-notif-title)',
          marginBottom: message ? '0.25rem' : 0,
          transition: 'color 350ms ease',
        }}>
          {title}
        </p>
        {message && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--c-notif-message)',
            lineHeight: 1.55,
            transition: 'color 350ms ease',
          }}>
            {message}
          </p>
        )}
      </div>

      {onClose && (
        <button
          onClick={() => { setVisible(false); onClose() }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--c-notif-close)',
            fontSize: '0.875rem', padding: '0.125rem',
            display: 'flex', alignItems: 'center', flexShrink: 0,
            transition: 'color 150ms ease',
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--c-text-1)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--c-notif-close)')}
        >
          ✕
        </button>
      )}
    </div>
  )
}
