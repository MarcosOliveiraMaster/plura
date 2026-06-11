import { useState } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { supabase } from '../lib/supabase'
import pluraLogo from '../assets/plura.png'
import type { Page } from '../App'
import type { Database } from '../lib/database.types'

type A11yNeed = Database['public']['Enums']['user_accessibility_need']

interface SignUpPageProps {
  onNavigate: (page: Page) => void
}

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999,
    opacity: 0.032, mixBlendMode: 'overlay',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`,
    backgroundSize: '180px 180px',
  }} />
)

const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 350ms ease' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
  </div>
)

/* ─── Acessibilidade ─────────────────────────────────────────────────────── */
const ACCESSIBILITY_OPTIONS: { id: A11yNeed; label: string }[] = [
  { id: 'visual',         label: 'Deficiência visual' },
  { id: 'auditiva',       label: 'Deficiência auditiva' },
  { id: 'motora',         label: 'Deficiência motora' },
  { id: 'intelectual',    label: 'Deficiência intelectual' },
  { id: 'tea',            label: 'TEA (Autismo)' },
  { id: 'neurodivergencia', label: 'Neurodivergência' },
  { id: 'nenhuma',        label: 'Nenhuma' },
]

const AccessibilitySelect = ({ selected, onChange }: { selected: A11yNeed[]; onChange: (ids: A11yNeed[]) => void }) => {
  const toggle = (id: A11yNeed) => {
    if (id === 'nenhuma') { onChange(selected.includes('nenhuma') ? [] : ['nenhuma']); return }
    const without = selected.filter(s => s !== 'nenhuma')
    onChange(without.includes(id) ? without.filter(s => s !== id) : [...without, id])
  }
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {ACCESSIBILITY_OPTIONS.map(opt => {
          const active = selected.includes(opt.id)
          return (
            <button key={opt.id} type="button" onClick={() => toggle(opt.id)} style={{
              padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all 200ms ease', outline: 'none',
              background: active ? 'linear-gradient(135deg,rgba(26,122,255,0.25),rgba(0,98,230,0.18))' : 'var(--c-glass-bg-sm)',
              border: active ? '1px solid rgba(26,122,255,0.55)' : '1px solid var(--c-input-border)',
              color: active ? '#6aadff' : 'var(--c-text-2)',
              boxShadow: active ? '0 0 12px rgba(26,122,255,0.18)' : 'none',
            }}>
              {active && <span style={{ marginRight: '0.3rem', fontSize: '0.625rem' }}>✓</span>}
              {opt.label}
            </button>
          )
        })}
      </div>
      <p style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>
        Mais opções serão adicionadas em breve · múltipla escolha
      </p>
    </div>
  )
}

/* ─── Força da senha ─────────────────────────────────────────────────────── */
function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8)  score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++
  return score as 0 | 1 | 2 | 3
}
const strengthLabel = ['', 'Fraca', 'Média', 'Forte']
const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e']

const PasswordStrength = ({ password }: { password: string }) => {
  const score = passwordStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.3rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i <= score ? strengthColor[score] : 'var(--c-divider)', transition: 'background 300ms ease' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: score > 0 ? strengthColor[score] : 'var(--c-text-3)', transition: 'color 300ms ease' }}>
        {password ? `Senha ${strengthLabel[score]}` : ''}
      </span>
    </div>
  )
}

/* ─── Ícones ─────────────────────────────────────────────────────────────── */
const UserIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const SmileIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const EmailIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
const MapPinIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const LockIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const EyeIcon = ({ off }: { off?: boolean }) => off ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
)

function maskCep(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

/* ─── Modal de sucesso ───────────────────────────────────────────────────── */
const SuccessModal = ({ onClose }: { onClose: () => void }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-title"
    style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(4,4,15,0.72)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: 'modal-fade-in 220ms ease',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose() }}
  >
    <div style={{
      width: '100%', maxWidth: '400px',
      background: 'var(--c-glass-bg-lg)',
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      border: 'var(--c-border-lg)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--c-shadow-lg)',
      padding: '2.25rem 2rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
      animation: 'modal-scale-in 280ms cubic-bezier(0.34,1.56,0.64,1)',
      textAlign: 'center',
    }}>
      {/* ícone */}
      <div style={{
        width: '3.5rem', height: '3.5rem', borderRadius: '50%', marginBottom: '1.25rem',
        background: 'linear-gradient(135deg,rgba(34,197,94,0.22),rgba(34,197,94,0.10))',
        border: '1px solid rgba(34,197,94,0.40)',
        boxShadow: '0 0 24px rgba(34,197,94,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 id="success-title" style={{
        fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em',
        color: 'var(--c-text-1)', marginBottom: '0.5rem',
        transition: 'color 350ms ease',
      }}>
        Conta criada com sucesso!
      </h2>

      <p style={{
        fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.6,
        marginBottom: '1.75rem', transition: 'color 350ms ease',
      }}>
        Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
      </p>

      <button
        onClick={onClose}
        style={{
          width: '100%', padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg,#1a7aff,#0062e6)',
          border: 'none', borderRadius: 'var(--radius-lg)',
          color: '#fff', fontSize: '0.9375rem', fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(26,122,255,0.38)',
          transition: 'opacity 150ms ease, transform 150ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
      >
        Ir para o login
      </button>
    </div>

    <style>{`
      @keyframes modal-fade-in  { from { opacity:0 } to { opacity:1 } }
      @keyframes modal-scale-in { from { opacity:0; transform:scale(0.88) } to { opacity:1; transform:scale(1) } }
    `}</style>
  </div>
)

/* ─── Spinner inline ─────────────────────────────────────────────────────── */
const CepSpinner = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin 0.7s linear infinite', display: 'block' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
)

const CepCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ─── SignUpPage ─────────────────────────────────────────────────────────── */
export default function SignUpPage({ onNavigate }: SignUpPageProps) {
  const [nome,           setNome]           = useState('')
  const [nomeSocial,     setNomeSocial]     = useState('')
  const [email,          setEmail]          = useState('')
  const [cep,            setCep]            = useState('')
  const [endereco,       setEndereco]       = useState('')
  const [complemento,    setComplemento]    = useState('')
  const [acessibilidade, setAcessibilidade] = useState<A11yNeed[]>([])
  const [senha,          setSenha]          = useState('')
  const [confirma,       setConfirma]       = useState('')
  const [showSenha,      setShowSenha]      = useState(false)
  const [showConfirma,   setShowConfirma]   = useState(false)
  const [loading,           setLoading]           = useState(false)
  const [cepLoading,        setCepLoading]        = useState(false)
  const [cepFound,          setCepFound]          = useState(false)
  const [showSuccessModal,  setShowSuccessModal]  = useState(false)
  const [errors,            setErrors]            = useState<Record<string, string>>({})
  const [generalError,      setGeneralError]      = useState('')

  const fetchCep = async (digits: string) => {
    setCepLoading(true)
    setCepFound(false)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setErrors(p => ({ ...p, cep: 'CEP não encontrado' }))
      } else {
        const partes = [
          data.logradouro,
          data.bairro,
          data.localidade && data.uf ? `${data.localidade}/${data.uf}` : '',
        ].filter(Boolean)
        setEndereco(partes.join(', '))
        setErrors(p => ({ ...p, cep: '', endereco: '' }))
        setCepFound(true)
      }
    } catch {
      setErrors(p => ({ ...p, cep: 'Erro ao buscar CEP' }))
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (raw: string) => {
    const masked  = maskCep(raw)
    const digits  = masked.replace(/\D/g, '')
    setCep(masked)
    setCepFound(false)
    setErrors(p => ({ ...p, cep: '' }))
    if (digits.length === 8) fetchCep(digits)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nome.trim())                              e.nome     = 'Nome é obrigatório'
    if (!email.trim() || !email.includes('@'))     e.email    = 'E-mail inválido'
    if (!cep.replace(/\D/g, '').match(/^\d{8}$/)) e.cep      = 'CEP inválido'
    if (!endereco.trim())                          e.endereco = 'Endereço é obrigatório'
    if (senha.length < 6)                          e.senha    = 'Mínimo 6 caracteres'
    if (senha !== confirma)                        e.confirma = 'As senhas não coincidem'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setGeneralError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email:    email.trim(),
      password: senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: nome.trim(),
          name:      nomeSocial.trim() || nome.trim(),
        },
      },
    })

    if (error) {
      setLoading(false)
      if (error.message.includes('already registered')) {
        setGeneralError('Este e-mail já está cadastrado. Faça login.')
      } else {
        setGeneralError(error.message)
      }
      return
    }

    // Update profile with accessibility needs + address
    if (data.user) {
      await supabase.from('profiles').update({
        name: nomeSocial.trim() || nome.trim(),
        accessibility_needs: acessibilidade,
      }).eq('id', data.user.id)
    }

    setLoading(false)
    // onAuthStateChange will navigate to myarea if session is set
    // Otherwise show success and redirect to login
    if (!data.session) {
      setGeneralError('')
      setShowSuccessModal(true)
    }
  }

  return (
    <>
      {showSuccessModal && (
        <SuccessModal onClose={() => { setShowSuccessModal(false); onNavigate('login') }} />
      )}
      <Grain />
      <ThemeToggle />

      <div className="r-layout-center" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '5rem 1rem 3rem', position: 'relative', zIndex: 1,
      }}>
        <GlassCard variant="lg" className="r-form-card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem 2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '44px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.375rem', transition: 'color 350ms ease' }}>
              Criar conta
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
              Preencha as informações abaixo
            </p>
          </div>

          {generalError && (
            <div style={{
              margin: '1rem 0 0', padding: '0.75rem 1rem', borderRadius: '0.75rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '0.875rem', color: '#f87171', textAlign: 'center',
            }}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── IDENTIFICAÇÃO ── */}
            <SectionLabel label="Identificação" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Nome completo"
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => { setNome(e.target.value); setErrors(p => ({ ...p, nome: '' })) }}
                error={errors.nome}
                autoComplete="name"
                leadingIcon={<UserIcon />}
              />
              <Input
                label="Nome social ou apelido"
                placeholder="Como prefere ser chamado(a)? (opcional)"
                value={nomeSocial}
                onChange={e => setNomeSocial(e.target.value)}
                autoComplete="nickname"
                leadingIcon={<SmileIcon />}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                error={errors.email}
                autoComplete="email"
                leadingIcon={<EmailIcon />}
              />
            </div>

            {/* ── ENDEREÇO ── */}
            <SectionLabel label="Endereço" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="r-addr-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="r-cep-field" style={{ width: '140px', flexShrink: 0 }}>
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={cep}
                    onChange={e => handleCepChange(e.target.value)}
                    error={errors.cep}
                    inputMode="numeric"
                    maxLength={9}
                    leadingIcon={<MapPinIcon />}
                    trailingIcon={
                      cepLoading ? <CepSpinner /> :
                      cepFound   ? <CepCheck />   :
                      undefined
                    }
                    disabled={cepLoading}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Endereço"
                    placeholder="Rua, número"
                    value={endereco}
                    onChange={e => { setEndereco(e.target.value); setErrors(p => ({ ...p, endereco: '' })) }}
                    error={errors.endereco}
                    autoComplete="street-address"
                    disabled={cepLoading}
                  />
                </div>
              </div>
              <Input
                label="Complemento"
                placeholder="Apto, bloco, referência… (opcional)"
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
                autoComplete="address-line2"
              />
            </div>

            {/* ── ACESSIBILIDADE ── */}
            <SectionLabel label="Acessibilidade" />
            <AccessibilitySelect selected={acessibilidade} onChange={setAcessibilidade} />

            {/* ── ACESSO ── */}
            <SectionLabel label="Acesso" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <Input
                  label="Senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErrors(p => ({ ...p, senha: '' })) }}
                  error={errors.senha}
                  autoComplete="new-password"
                  leadingIcon={<LockIcon />}
                  trailingIcon={
                    <button type="button" onClick={() => setShowSenha(v => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }} aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                      <EyeIcon off={showSenha} />
                    </button>
                  }
                />
                <PasswordStrength password={senha} />
              </div>
              <Input
                label="Confirmar senha"
                type={showConfirma ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirma}
                onChange={e => { setConfirma(e.target.value); setErrors(p => ({ ...p, confirma: '' })) }}
                error={errors.confirma}
                autoComplete="new-password"
                leadingIcon={<LockIcon />}
                trailingIcon={
                  <button type="button" onClick={() => setShowConfirma(v => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: 'inherit' }} aria-label={showConfirma ? 'Ocultar senha' : 'Mostrar senha'}>
                    <EyeIcon off={showConfirma} />
                  </button>
                }
              />
            </div>

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1.75rem' }}>
              {loading ? 'Criando conta…' : 'Criar conta'}
            </Button>

          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', transition: 'color 350ms ease' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.9375rem', color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
            Já tem uma conta?{' '}
            <a href="#" onClick={e => { e.preventDefault(); onNavigate('login') }}
              style={{ color: 'var(--c-text-blue)', fontWeight: 600, textDecoration: 'none', transition: 'opacity 150ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              Entrar →
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

      <style>{`::placeholder{color:var(--c-placeholder);}`}</style>
    </>
  )
}
