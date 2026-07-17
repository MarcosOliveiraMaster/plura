import { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Checkbox } from '../components/Input'
import { ThemeToggle } from '../components/ThemeToggle'
import { supabase } from '../lib/supabase'
import pluraLogo from '../assets/plura.png'
import type { Page } from '../App'

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div
    aria-hidden
    style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
      opacity: 0.032, mixBlendMode: 'overlay',
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`,
      backgroundSize: '180px 180px',
    }}
  />
)

/* ─── Ícones ─────────────────────────────────────────────────────────────── */
const EmailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EyeIcon = ({ off }: { off?: boolean }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

interface LoginPageProps {
  onNavigate: (page: Page) => void
}

/* ─── Modal de recuperação de senha ─────────────────────────────────────── */
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSend = async () => {
    if (!email.trim()) { setError('Informe seu e-mail'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--c-glass-bg)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)', border: 'var(--c-border)',
        borderRadius: '1.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.50)',
        padding: '2rem',
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--c-text-1)', marginBottom: '0.5rem' }}>
          Recuperar senha
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', marginBottom: '1.25rem' }}>
          Enviaremos um link de redefinição para o seu e-mail.
        </p>
        {sent ? (
          <div style={{
            padding: '1rem', borderRadius: '0.875rem',
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#4ade80', fontSize: '0.875rem', textAlign: 'center',
          }}>
            Link enviado! Verifique sua caixa de entrada.
          </div>
        ) : (
          <>
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              error={error}
              leadingIcon={<EmailIcon />}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <Button variant="ghost" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
                Cancelar
              </Button>
              <Button size="sm" loading={loading} style={{ flex: 1, justifyContent: 'center' }} onClick={handleSend}>
                Enviar link
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── LoginPage ─────────────────────────────────────────────────────────── */
export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [email,         setEmail]         = useState('')
  const [password,      setPassword]      = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [remember,      setRemember]      = useState(false)
  const [loading,       setLoading]       = useState(false)

  const [showForgot,    setShowForgot]    = useState(false)
  const [errors,        setErrors]        = useState<{ email?: string; password?: string; general?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!email.trim())    errs.email    = 'Informe seu e-mail'
    if (!password.trim()) errs.password = 'Informe sua senha'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) {
      setErrors({ general: 'E-mail ou senha incorretos' })
    }
    // onAuthStateChange in App.tsx will handle navigation
  }

  return (
    <>
      <Grain />
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div style={{ position: 'fixed', top: '1.25rem', right: '1.5rem', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <div className="r-layout-center" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem', position: 'relative', zIndex: 1,
      }}>
        <GlassCard variant="lg" className="r-form-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '48px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.375rem', transition: 'color 350ms ease' }}>
              Bem-vindo de volta
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.5, transition: 'color 350ms ease' }}>
              Faça login para continuar
            </p>
          </div>

          {errors.general && (
            <div style={{
              marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '0.75rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.875rem', color: '#f87171', textAlign: 'center',
            }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '', general: '' })) }}
                error={errors.email}
                autoComplete="email"
                leadingIcon={<EmailIcon />}
              />
              <Input
                label="Senha"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '', general: '' })) }}
                error={errors.password}
                autoComplete="current-password"
                leadingIcon={<LockIcon />}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }}
                    aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <EyeIcon off={showPass} />
                  </button>
                }
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <Checkbox label="Lembrar de mim" checked={remember} onChange={setRemember} />
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); setShowForgot(true) }}
                  style={{ fontSize: '0.875rem', color: 'var(--c-text-blue)', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity 150ms ease' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Esqueceu a senha?
                </a>
              </div>

              <Button type="submit" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </div>
          </form>

          <div style={{ margin: '1.75rem 0 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
            Não tem uma conta?{' '}
            <a href="#" onClick={e => { e.preventDefault(); onNavigate('signup') }} style={{ color: 'var(--c-text-blue)', fontWeight: 600, textDecoration: 'none', transition: 'opacity 150ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Criar conta →
            </a>
          </p>

        </GlassCard>

        <footer style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-4)', transition: 'color 350ms ease', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <span>© 2026 Plura</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a>
          <span style={{ opacity: 0.4 }}>·</span>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
        </footer>
      </div>

      <style>{`::placeholder{color:var(--c-placeholder);}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
