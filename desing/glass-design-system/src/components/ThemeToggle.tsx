import { useState, useEffect } from 'react'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4"/>
    <line x1="12" y1="2"  x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2"  y1="12" x2="5"  y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="4.93"   x2="6.88"  y2="6.88"/>
    <line x1="17.12" y1="17.12" x2="19.07" y2="19.07"/>
    <line x1="4.93" y1="19.07"  x2="6.88"  y2="17.12"/>
    <line x1="17.12" y1="6.88"  x2="19.07" y2="4.93"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('ds-theme')
      if (saved) return saved === 'dark'
    } catch {}
    return true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try { localStorage.setItem('ds-theme', dark ? 'dark' : 'light') } catch {}
  }, [dark])

  return (
    <button
      aria-label={dark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      onClick={() => setDark(d => !d)}
      style={{
        position: 'fixed', top: '1.375rem', right: '1.5rem', zIndex: 9998,
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.4375rem 0.875rem',
        background: 'var(--c-glass-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: 'var(--c-border)',
        borderRadius: '9999px',
        boxShadow: 'var(--c-shadow-sm)',
        color: 'var(--c-text-2)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        fontWeight: 500,
        transition: 'color 200ms ease, background 350ms ease, border 350ms ease, box-shadow 200ms ease',
        outline: 'none',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-1)'
        ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-2)'
        ;(e.currentTarget as HTMLButtonElement).style.transform = ''
      }}
    >
      {/* Pill track */}
      <span style={{
        position: 'relative',
        width: '2.25rem', height: '1.25rem',
        borderRadius: '9999px',
        background: dark ? 'rgba(26,122,255,0.25)' : 'rgba(255,180,0,0.20)',
        border: dark ? '1px solid rgba(26,122,255,0.35)' : '1px solid rgba(255,180,0,0.35)',
        transition: 'background 350ms ease, border 350ms ease',
        display: 'flex', alignItems: 'center',
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <span style={{
          position: 'absolute',
          width: '0.9375rem', height: '0.9375rem',
          borderRadius: '50%',
          background: dark ? '#1a7aff' : '#f59e0b',
          left: dark ? '0.125rem' : 'calc(100% - 1.0625rem)',
          transition: 'left 300ms var(--ease-spring), background 300ms ease',
          boxShadow: dark
            ? '0 0 8px rgba(26,122,255,0.60)'
            : '0 0 8px rgba(245,158,11,0.60)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
          animation: 'theme-pop 300ms ease forwards',
        }}>
          {dark ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>

      <span style={{ transition: 'color 300ms ease' }}>
        {dark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
