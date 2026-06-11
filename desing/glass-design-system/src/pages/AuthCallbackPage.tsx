import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '../components/Button'
import { GlassCard } from '../components/GlassCard'
import { ThemeToggle } from '../components/ThemeToggle'
import pluraLogo from '../assets/plura.png'
import type { Page } from '../App'

interface Props {
  user: User | null
  onNavigate: (page: Page) => void
}

const Grain = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
    opacity: 0.032, mixBlendMode: 'overlay',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`,
    backgroundSize: '180px 180px',
  }} />
)

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ErrorIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
    stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export default function AuthCallbackPage({ user, onNavigate }: Props) {
  const [countdown, setCountdown] = useState(5)
  const isSuccess = !!user

  const name = user?.user_metadata?.name
    || user?.user_metadata?.full_name
    || null

  // Auto-redireciona após 5s em caso de sucesso
  useEffect(() => {
    if (!isSuccess) return
    if (countdown <= 0) { onNavigate('myarea'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [isSuccess, countdown, onNavigate])

  return (
    <>
      <Grain />
      <ThemeToggle />

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem', position: 'relative', zIndex: 1,
      }}>
        <GlassCard variant="lg" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', textAlign: 'center' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '40px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
          </div>

          {/* Ícone */}
          <div style={{
            width: '5rem', height: '5rem', borderRadius: '50%',
            margin: '0 auto 1.5rem',
            background: isSuccess
              ? 'linear-gradient(135deg,rgba(34,197,94,0.20),rgba(34,197,94,0.08))'
              : 'linear-gradient(135deg,rgba(239,68,68,0.20),rgba(239,68,68,0.08))',
            border: isSuccess
              ? '1px solid rgba(34,197,94,0.40)'
              : '1px solid rgba(239,68,68,0.40)',
            boxShadow: isSuccess
              ? '0 0 32px rgba(34,197,94,0.22)'
              : '0 0 32px rgba(239,68,68,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'icon-pop 420ms cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {isSuccess ? <CheckIcon /> : <ErrorIcon />}
          </div>

          {isSuccess ? (
            <>
              <h1 style={{
                fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em',
                color: 'var(--c-text-1)', marginBottom: '0.625rem',
                transition: 'color 350ms ease',
              }}>
                Parabéns pela autenticação!
              </h1>
              <p style={{
                fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.65,
                marginBottom: '0.5rem', transition: 'color 350ms ease',
              }}>
                {name ? <>Bem-vindo(a), <strong style={{ color: 'var(--c-text-1)' }}>{name}</strong>!</> : 'Sua conta foi confirmada com sucesso.'}
              </p>
              <p style={{
                fontSize: '0.8125rem', fontFamily: 'var(--font-mono)',
                color: 'var(--c-text-blue)', marginBottom: '2rem',
                transition: 'color 350ms ease',
              }}>
                Redirecionando em {countdown}s…
              </p>
              <Button size="lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigate('myarea')}>
                Entrar no Plura →
              </Button>
            </>
          ) : (
            <>
              <h1 style={{
                fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em',
                color: 'var(--c-text-1)', marginBottom: '0.625rem',
                transition: 'color 350ms ease',
              }}>
                Link expirado ou inválido
              </h1>
              <p style={{
                fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.65,
                marginBottom: '2rem', transition: 'color 350ms ease',
              }}>
                O link de confirmação expirou ou já foi utilizado. Faça login e solicite um novo e-mail de confirmação.
              </p>
              <Button size="lg" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onNavigate('login')}>
                Ir para o login
              </Button>
            </>
          )}

        </GlassCard>
      </div>

      <style>{`
        @keyframes icon-pop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}
