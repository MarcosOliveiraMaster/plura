import { useState, useRef } from 'react'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { ThemeToggle } from '../components/ThemeToggle'
import pluraLogo from '../assets/plura.png'
import type { Page, Notification, Company } from '../App'

interface MyAreaPageProps {
  onNavigate:               (page: Page) => void
  notifications:            Notification[]
  collaboratingCompanies:   Company[]
  onAcceptInvite:           (notificationId: string) => void
  onDeclineInvite:          (notificationId: string) => void
  onViewCompany:            (companyId: string) => void
}

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

/* ─── Chips de acessibilidade (reutilizável) ────────────────────────────── */
const ACCESSIBILITY_OPTIONS = [
  { id: 'visual',      label: 'Deficiência visual' },
  { id: 'auditiva',    label: 'Deficiência auditiva' },
  { id: 'motora',      label: 'Deficiência motora' },
  { id: 'intelectual', label: 'Deficiência intelectual' },
  { id: 'tea',         label: 'TEA (Autismo)' },
  { id: 'neurodiv',    label: 'Neurodivergência' },
  { id: 'nenhuma',     label: 'Nenhuma' },
]

const AccessibilityChips = ({
  selected, onChange,
}: { selected: string[]; onChange: (ids: string[]) => void }) => {
  const toggle = (id: string) => {
    if (id === 'nenhuma') {
      onChange(selected.includes('nenhuma') ? [] : ['nenhuma'])
      return
    }
    const without = selected.filter(s => s !== 'nenhuma')
    onChange(without.includes(id) ? without.filter(s => s !== id) : [...without, id])
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {ACCESSIBILITY_OPTIONS.map(opt => {
        const active = selected.includes(opt.id)
        return (
          <button
            key={opt.id} type="button" onClick={() => toggle(opt.id)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '9999px',
              fontSize: '0.8125rem', fontWeight: 500,
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'all 200ms ease', outline: 'none',
              background: active
                ? 'linear-gradient(135deg, rgba(26,122,255,0.25), rgba(0,98,230,0.18))'
                : 'var(--c-glass-bg-sm)',
              border: active ? '1px solid rgba(26,122,255,0.55)' : '1px solid var(--c-input-border)',
              color: active ? '#6aadff' : 'var(--c-text-2)',
              boxShadow: active ? '0 0 12px rgba(26,122,255,0.18)' : 'none',
            }}
          >
            {active && <span style={{ marginRight: '0.3rem', fontSize: '0.625rem' }}>✓</span>}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Ícones ────────────────────────────────────────────────────────────── */
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const BuildingPlusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
    <line x1="19" y1="5" x2="19" y2="11"/>
    <line x1="16" y1="8" x2="22" y2="8"/>
  </svg>
)

const BuildingListIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const HeartIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

/* ─── Initials extractor ─────────────────────────────────────────────────── */
function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

/* ─── Stat item ─────────────────────────────────────────────────────────── */
const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <div style={{ textAlign: 'center', padding: '0 1.25rem' }}>
    <p style={{
      fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.04em',
      color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)',
      transition: 'color 350ms ease',
    }}>{value}</p>
    <p style={{
      fontSize: '0.75rem', color: 'var(--c-text-3)',
      transition: 'color 350ms ease',
    }}>{label}</p>
  </div>
)

/* ─── Action card (empresas) ─────────────────────────────────────────────── */
const ActionCard = ({
  icon, title, description, variant = 'default', onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  variant?: 'default' | 'blue'
  onClick?: () => void
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={e => e.key === 'Enter' && onClick?.()}
    style={{
      padding: '1.5rem',
      background: variant === 'blue'
        ? 'linear-gradient(135deg, rgba(26,122,255,0.18) 0%, rgba(0,98,230,0.10) 100%)'
        : 'var(--c-glass-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: variant === 'blue'
        ? '1px solid rgba(26,122,255,0.40)'
        : 'var(--c-border)',
      borderRadius: '1.25rem',
      boxShadow: variant === 'blue'
        ? '0 0 28px rgba(26,122,255,0.12), 0 8px 24px rgba(0,0,0,0.22)'
        : 'var(--c-shadow-md)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '1.25rem',
      transition: 'transform 200ms ease, box-shadow 200ms ease, background 350ms ease',
      outline: 'none',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = 'translateY(-3px)'
      el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = ''
      el.style.boxShadow = variant === 'blue'
        ? '0 0 28px rgba(26,122,255,0.12), 0 8px 24px rgba(0,0,0,0.22)'
        : 'var(--c-shadow-md)'
    }}
  >
    <div style={{
      width: '3rem', height: '3rem', borderRadius: '0.875rem', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: variant === 'blue'
        ? 'rgba(26,122,255,0.22)'
        : 'var(--c-glass-bg-sm)',
      border: variant === 'blue'
        ? '1px solid rgba(26,122,255,0.35)'
        : 'var(--c-border-sm)',
      color: variant === 'blue' ? '#6aadff' : 'var(--c-text-2)',
      transition: 'background 350ms ease, border 350ms ease, color 350ms ease',
    }}>
      {icon}
    </div>
    <div>
      <p style={{
        fontSize: '1rem', fontWeight: 700,
        color: 'var(--c-text-1)', marginBottom: '0.2rem',
        transition: 'color 350ms ease',
      }}>{title}</p>
      <p style={{
        fontSize: '0.8125rem', color: 'var(--c-text-3)',
        transition: 'color 350ms ease',
      }}>{description}</p>
    </div>
    <svg
      style={{ marginLeft: 'auto', color: 'var(--c-text-4)', flexShrink: 0, transition: 'color 350ms ease' }}
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </div>
)

/* ─── Favourite card placeholder ─────────────────────────────────────────── */
const FavCard = ({ index }: { index: number }) => {
  const labels = ['Empresa A', 'Empresa B', 'Serviço C']
  const subs   = ['Tecnologia', 'Varejo', 'Saúde']
  return (
    <div style={{
      padding: '1.25rem',
      background: 'var(--c-glass-bg-sm)',
      border: 'var(--c-border-sm)',
      borderRadius: '1rem',
      transition: 'transform 200ms ease, background 350ms ease',
      cursor: 'pointer',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = ''}
    >
      <div style={{
        width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem',
        background: `hsl(${210 + index * 40}, 70%, 55%)`,
        marginBottom: '0.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1rem', fontWeight: 800, color: '#fff',
      }}>
        {labels[index][0]}
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>
        {labels[index]}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
        {subs[index]}
      </p>
    </div>
  )
}

/* ─── MyAreaPage ─────────────────────────────────────────────────────────── */
export default function MyAreaPage({
  onNavigate, notifications, collaboratingCompanies,
  onAcceptInvite, onDeclineInvite, onViewCompany,
}: MyAreaPageProps) {
  const [photoUrl,       setPhotoUrl]       = useState<string | null>(null)
  const [avatarHover,    setAvatarHover]    = useState(false)
  const [accessibility,  setAccessibility]  = useState<string[]>([])
  const [savingA11y,     setSavingA11y]     = useState(false)
  const [savedA11y,      setSavedA11y]      = useState(false)
  const [hasFavorites]                      = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const userName   = 'Marcos Oliveira'
  const socialName = 'Marco'
  const initials   = getInitials(userName)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPhotoUrl(URL.createObjectURL(file))
  }

  const saveA11y = () => {
    setSavingA11y(true)
    setTimeout(() => { setSavingA11y(false); setSavedA11y(true); setTimeout(() => setSavedA11y(false), 2500) }, 1200)
  }

  return (
    <>
      <Grain />
      <ThemeToggle />

      <div className="r-layout" style={{
        minHeight: '100vh',
        position: 'relative', zIndex: 1,
        padding: '5.5rem 1.5rem 3rem',
      }}>
        <div className="r-container" style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* ── Top Nav ──────────────────────────────────────────────────── */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            marginBottom: '2rem',
          }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '32px', objectFit: 'contain' }} draggable={false} />
            <div style={{ flex: 1 }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
              color: 'var(--c-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'color 350ms ease',
            }}>
              minha área
            </span>
            <div style={{ flex: 1 }} />
            <Button
              variant="ghost" size="sm"
              icon={<LogoutIcon />} iconPosition="left"
              onClick={() => onNavigate('login')}
            >
              Sair
            </Button>
          </nav>

          {/* ── Card de perfil ───────────────────────────────────────────── */}
          <GlassCard variant="lg" style={{ marginBottom: '1.25rem' }}>
            <div className="r-profile-body" style={{
              display: 'flex', alignItems: 'center',
              gap: '2rem', flexWrap: 'wrap',
            }}>

              {/* Avatar uploadável */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  role="button" tabIndex={0}
                  aria-label="Alterar foto de perfil"
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    border: '2px solid rgba(26,122,255,0.45)',
                    boxShadow: '0 0 20px rgba(26,122,255,0.20)',
                    transition: 'box-shadow 250ms ease',
                    flexShrink: 0,
                  }}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="Foto de perfil"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: 'linear-gradient(135deg, #1a7aff 0%, #004bbf 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em',
                      userSelect: 'none',
                    }}>
                      {initials}
                    </div>
                  )}

                  {/* Overlay câmera */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.52)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                    opacity: avatarHover ? 1 : 0,
                    transition: 'opacity 200ms ease',
                  }}>
                    <CameraIcon />
                  </div>
                </div>

                {/* Badge de edição */}
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: '#1a7aff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--c-bg)',
                    boxShadow: '0 2px 8px rgba(26,122,255,0.45)',
                    color: '#fff',
                  }}
                >
                  <EditIcon />
                </div>

                <input
                  ref={fileRef} type="file" accept="image/*"
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Info do usuário */}
              <div className="r-profile-info" style={{ flex: 1, minWidth: '180px' }}>
                <div className="r-profile-info-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                  <h2 style={{
                    fontSize: '1.375rem', fontWeight: 800,
                    letterSpacing: '-0.035em', color: 'var(--c-text-1)',
                    transition: 'color 350ms ease',
                  }}>{userName}</h2>
                  <Badge variant="blue" size="sm">{socialName}</Badge>
                </div>
                <p style={{
                  fontSize: '0.875rem', color: 'var(--c-text-3)',
                  marginBottom: '1rem', transition: 'color 350ms ease',
                }}>
                  marcos.lucas.ti@gmail.com
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge variant="outline" size="sm" dot>Membro desde Jun/26</Badge>
                  {accessibility.length > 0 && accessibility[0] !== 'nenhuma' && (
                    <Badge variant="white" size="sm">{accessibility.length} acessibilidade{accessibility.length > 1 ? 's' : ''}</Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="r-profile-stats" style={{
                display: 'flex', alignItems: 'center',
                borderLeft: '1px solid var(--c-divider)',
                paddingLeft: '1.5rem', gap: '0',
                transition: 'border-color 350ms ease',
              }}>
                <StatItem value="0" label="empresas" />
                <div style={{ width: '1px', height: '2.5rem', background: 'var(--c-divider)', transition: 'background 350ms ease' }} />
                <StatItem value="0" label="favoritos" />
              </div>

            </div>
          </GlassCard>

          {/* ── Notificações ─────────────────────────────────────────────── */}
          {notifications.some(n => n.status === 'pending') && (
            <GlassCard style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '0.75rem', flexShrink: 0,
                  background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#fbbf24', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.125rem' }}>
                    notificações
                  </p>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>
                    Você tem convites pendentes
                  </h3>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.filter(n => n.status === 'pending').map(notif => (
                  <div key={notif.id} className="r-notif-item" style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                    padding: '1rem', borderRadius: '1rem',
                    background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)',
                    transition: 'background 350ms ease',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '0.75rem', flexShrink: 0,
                      background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem', fontWeight: 800, color: '#fff',
                    }}>
                      {notif.companyName[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.2rem', transition: 'color 350ms ease' }}>
                        {notif.companyName}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                        Convite de <strong style={{ color: 'var(--c-text-2)' }}>{notif.invitedBy}</strong> · {notif.companyCategory}
                      </p>
                    </div>
                    <div className="r-notif-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="primary" size="sm" onClick={() => onAcceptInvite(notif.id)}>
                        Aceitar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeclineInvite(notif.id)}>
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── Grid: acessibilidade + empresas ──────────────────────────── */}
          <div className="r-grid-main" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '1.25rem',
            marginBottom: '1.25rem',
            alignItems: 'start',
          }}>

            {/* Acessibilidade */}
            <GlassCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                    color: 'var(--c-text-blue)', letterSpacing: '0.12em',
                    textTransform: 'uppercase', marginBottom: '0.25rem',
                    transition: 'color 350ms ease',
                  }}>
                    critérios
                  </p>
                  <h3 style={{
                    fontSize: '1.0625rem', fontWeight: 700,
                    color: 'var(--c-text-1)', transition: 'color 350ms ease',
                  }}>
                    Acessibilidade
                  </h3>
                </div>
                {savedA11y && (
                  <Badge variant="success" size="sm" dot>Salvo</Badge>
                )}
              </div>

              <AccessibilityChips selected={accessibility} onChange={setAccessibility} />

              <p style={{
                marginTop: '0.75rem', marginBottom: '1.25rem',
                fontSize: '0.75rem', color: 'var(--c-text-3)',
                fontFamily: 'var(--font-mono)', transition: 'color 350ms ease',
              }}>
                Mais opções serão adicionadas em breve · múltipla escolha
              </p>

              <Button
                variant="secondary" size="sm"
                loading={savingA11y}
                onClick={saveA11y}
              >
                {savingA11y ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </GlassCard>

            {/* Empresas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  color: 'var(--c-text-blue)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: '0.625rem',
                  transition: 'color 350ms ease',
                }}>
                  empresas
                </p>
              </div>
              <ActionCard
                variant="blue"
                icon={<BuildingPlusIcon />}
                title="Criar empresa"
                description="Cadastre um novo negócio"
                onClick={() => onNavigate('create-company')}
              />
              <ActionCard
                icon={<BuildingListIcon />}
                title="Minhas empresas"
                description="Gerencie seus negócios"
                onClick={() => onNavigate('my-companies')}
              />
            </div>

          </div>

          {/* ── Colaborações ─────────────────────────────────────────────── */}
          {collaboratingCompanies.length > 0 && (
            <GlassCard style={{ marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>
                  colaborações
                </p>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>
                  Empresas que colaboro
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {collaboratingCompanies.map(company => (
                  <div key={company.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem', borderRadius: '1rem',
                    background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)',
                    cursor: 'pointer', transition: 'background 200ms ease, transform 200ms ease',
                  }}
                    onClick={() => onViewCompany(company.id)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                      ;(e.currentTarget as HTMLDivElement).style.background = 'var(--c-glass-bg)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = ''
                      ;(e.currentTarget as HTMLDivElement).style.background = 'var(--c-glass-bg-sm)'
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '0.75rem', flexShrink: 0,
                      background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem', fontWeight: 800, color: '#fff',
                    }}>
                      {company.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.125rem', transition: 'color 350ms ease' }}>
                        {company.name}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                        {company.categoryLabel} · {company.address.split('—')[0]?.trim()}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm">Colaborador</Badge>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--c-text-4)', flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ── Meus Favoritos ───────────────────────────────────────────── */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                  color: 'var(--c-text-blue)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: '0.25rem',
                  transition: 'color 350ms ease',
                }}>
                  coleção
                </p>
                <h3 style={{
                  fontSize: '1.0625rem', fontWeight: 700,
                  color: 'var(--c-text-1)', transition: 'color 350ms ease',
                }}>
                  Meus Favoritos
                </h3>
              </div>
              {hasFavorites && (
                <Button variant="ghost" size="sm">Ver todos →</Button>
              )}
            </div>

            {hasFavorites ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
                {[0, 1, 2].map(i => <FavCard key={i} index={i} />)}
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem 1rem', gap: '0.875rem',
              }}>
                <div style={{ color: 'var(--c-text-4)', transition: 'color 350ms ease' }}>
                  <HeartIcon />
                </div>
                <p style={{
                  fontSize: '1rem', fontWeight: 600,
                  color: 'var(--c-text-2)', transition: 'color 350ms ease',
                }}>
                  Nenhum favorito ainda
                </p>
                <p style={{
                  fontSize: '0.875rem', color: 'var(--c-text-3)',
                  transition: 'color 350ms ease', textAlign: 'center',
                }}>
                  Explore a plataforma e salve o que mais gostar
                </p>
              </div>
            )}
          </GlassCard>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <footer style={{
            marginTop: '2rem', textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
            color: 'var(--c-text-4)', display: 'flex',
            gap: '1.25rem', alignItems: 'center', justifyContent: 'center',
            transition: 'color 350ms ease',
          }}>
            <span>© 2026 Plura</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
          </footer>

        </div>
      </div>
    </>
  )
}
