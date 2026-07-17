import { useState, useEffect, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { ThemeToggle } from '../components/ThemeToggle'
import { getAllCompanies, photoUrl } from '../lib/api'
import type { CompanyCard } from '../lib/api'
import type { Database } from '../lib/database.types'
import pluraLogo from '../assets/plura.png'
import type { Page } from '../App'

type A11yFeature = Database['public']['Enums']['accessibility_feature']

interface HomePageProps {
  user:               User | null
  onNavigate:         (page: Page) => void
  onViewCompany:      (id: string) => void
  initialA11yFilter?: A11yFeature[] | null
  onPrefillConsumed?: () => void
}

/* ─── Maps ───────────────────────────────────────────────────────────────── */
const CATEGORY_LABEL: Record<string, string> = {
  hotel: 'Hotel', hostel: 'Hostel', pousada: 'Pousada', bar: 'Bar',
  restaurante: 'Restaurante', cafe: 'Café', espaco_eventos: 'Espaço de Eventos',
  passeio_turistico: 'Passeio Turístico', museu: 'Museu', parque: 'Parque',
  academia: 'Academia', clinica: 'Clínica', outros: 'Outros',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  hotel: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  hostel: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
  pousada: 'linear-gradient(135deg,#10b981,#059665)',
  bar: 'linear-gradient(135deg,#f59e0b,#d97706)',
  restaurante: 'linear-gradient(135deg,#ef4444,#dc2626)',
  cafe: 'linear-gradient(135deg,#92400e,#78350f)',
  espaco_eventos: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  passeio_turistico: 'linear-gradient(135deg,#06b6d4,#0891b2)',
  museu: 'linear-gradient(135deg,#d97706,#b45705)',
  parque: 'linear-gradient(135deg,#22c55e,#15803d)',
  academia: 'linear-gradient(135deg,#f97316,#c2410c)',
  clinica: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
  outros: 'linear-gradient(135deg,#6b7280,#4b5563)',
}

const A11Y_OPTIONS: { id: A11yFeature; label: string; short: string }[] = [
  { id: 'rampa',            label: 'Rampa de acesso',      short: 'Rampa'     },
  { id: 'elevador',         label: 'Elevador acessível',   short: 'Elevador'  },
  { id: 'banheiro_adaptado',label: 'Banheiro adaptado',    short: 'Banheiro ♿'},
  { id: 'vaga_pcd',         label: 'Vaga PCD',             short: 'Vaga PCD'  },
  { id: 'piso_tatil',       label: 'Piso tátil',           short: 'Piso tátil'},
  { id: 'libras',           label: 'Atendimento em Libras', short: 'Libras'   },
  { id: 'braille',          label: 'Braille',               short: 'Braille'  },
  { id: 'cadeira_rodas',    label: 'Cadeira de rodas',      short: 'Cadeira'  },
  { id: 'audiodescricao',   label: 'Audiodescrição',        short: 'Áudio'    },
  { id: 'entrada_acessivel',label: 'Entrada acessível',     short: 'Entrada'  },
]

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.028, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />
)

/* ─── Ícones ─────────────────────────────────────────────────────────────── */
const SearchIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const CityIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const MapPinIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const A11yIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v6l-3 3"/><path d="M9 21l3-6 3 6"/><path d="M6 10l2.5 2.5"/><path d="M18 10l-2.5 2.5"/></svg>
const UserIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const XSmallIcon  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

/* ─── Componente Input simples (inline) ──────────────────────────────────── */
function FilterInput({ icon, placeholder, value, onChange }: {
  icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
      <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)', pointerEvents: 'none' }}>
        {icon}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '0.625rem 0.875rem 0.625rem 2.25rem',
          background: 'var(--c-glass-bg-sm)',
          border: '1px solid var(--c-input-border)',
          borderRadius: '0.75rem',
          color: 'var(--c-text-1)',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 200ms ease, background 350ms ease',
        }}
        onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(26,122,255,0.55)' }}
        onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-3)', display: 'flex', padding: '2px' }}
        >
          <XSmallIcon />
        </button>
      )}
    </div>
  )
}

/* ─── Skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{ borderRadius: '1.25rem', overflow: 'hidden', background: 'var(--c-glass-bg)', border: 'var(--c-border)', animation: 'pulse 1.5s ease infinite' }}>
    <div style={{ height: '160px', background: 'var(--c-glass-bg-sm)' }} />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ height: '0.75rem', width: '60px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
      <div style={{ height: '1.125rem', width: '140px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
      <div style={{ height: '0.75rem', width: '100px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
    </div>
  </div>
)

/* ─── Company card ───────────────────────────────────────────────────────── */
function CompanyGridCard({ company, onClick }: { company: CompanyCard; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const cover    = company.company_photos.find(p => p.is_cover) ?? company.company_photos[0]
  const coverSrc = cover ? photoUrl(cover.storage_path) : null
  const gradient = CATEGORY_GRADIENT[company.category] ?? CATEGORY_GRADIENT['outros']
  const initials = company.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const features = (company.accessibility_features ?? []) as string[]
  const visibleFeatures = features.slice(0, 3)
  const extraCount      = features.length - 3

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '1.25rem', overflow: 'hidden',
        background: 'var(--c-glass-bg)',
        border: 'var(--c-border)',
        boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.38)' : 'var(--c-shadow-md)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 220ms ease, box-shadow 220ms ease, background 350ms ease',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {/* Foto de capa */}
      <div style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
        {coverSrc ? (
          <img
            src={coverSrc}
            alt={company.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.04em', userSelect: 'none' }}>
            {initials}
          </div>
        )}
        {/* Badge de categoria sobreposto */}
        <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem' }}>
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '9999px', padding: '0.25rem 0.625rem',
            color: '#fff',
          }}>
            {CATEGORY_LABEL[company.category] ?? company.category}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '0.875rem 1rem 1rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.25rem', lineHeight: 1.3, transition: 'color 350ms ease', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {company.name}
        </p>

        {(company.city || company.state) && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 350ms ease' }}>
            <MapPinIcon />
            {[company.city, company.state].filter(Boolean).join(' · ')}
          </p>
        )}

        {features.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
            {visibleFeatures.map(f => {
              const opt = A11Y_OPTIONS.find(o => o.id === f)
              return (
                <span key={f} style={{
                  fontSize: '0.6875rem', fontWeight: 600,
                  padding: '0.2rem 0.5rem', borderRadius: '9999px',
                  background: 'rgba(26,122,255,0.12)',
                  border: '1px solid rgba(26,122,255,0.28)',
                  color: '#6aadff',
                }}>
                  {opt?.short ?? f}
                </span>
              )
            })}
            {extraCount > 0 && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600,
                padding: '0.2rem 0.5rem', borderRadius: '9999px',
                background: 'var(--c-glass-bg-sm)',
                border: '1px solid var(--c-input-border)',
                color: 'var(--c-text-3)',
              }}>
                +{extraCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── HomePage ───────────────────────────────────────────────────────────── */
export default function HomePage({ user, onNavigate, onViewCompany, initialA11yFilter, onPrefillConsumed }: HomePageProps) {
  const [companies,    setCompanies]    = useState<CompanyCard[]>([])
  const [loading,      setLoading]      = useState(true)
  const [searchName,   setSearchName]   = useState('')
  const [searchCity,   setSearchCity]   = useState('')
  const [searchAddr,   setSearchAddr]   = useState('')
  const [a11yFilter,   setA11yFilter]   = useState<A11yFeature[]>(() => initialA11yFilter ?? [])
  const [showA11y,     setShowA11y]     = useState(() => !!initialA11yFilter?.length)
  const [fromProfile,  setFromProfile]  = useState(() => !!initialA11yFilter?.length)

  useEffect(() => {
    getAllCompanies()
      .then(setCompanies)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Consome o pré-preenchimento vindo de "Buscar Próximo Destino" uma única vez, no mount
  useEffect(() => {
    onPrefillConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleA11y = (id: A11yFeature) => {
    setFromProfile(false)
    setA11yFilter(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const filtered = useMemo(() => {
    const name = searchName.trim().toLowerCase()
    const city = searchCity.trim().toLowerCase()
    const addr = searchAddr.trim().toLowerCase()
    return companies.filter(c => {
      if (name && !c.name.toLowerCase().includes(name)) return false
      if (city && !(c.city ?? '').toLowerCase().includes(city)) return false
      if (addr && !(c.state ?? '').toLowerCase().includes(addr) && !(c.description ?? '').toLowerCase().includes(addr)) return false
      if (a11yFilter.length > 0) {
        const features = (c.accessibility_features ?? []) as string[]
        if (!a11yFilter.every(f => features.includes(f))) return false
      }
      return true
    })
  }, [companies, searchName, searchCity, searchAddr, a11yFilter])

  const hasFilters = searchName || searchCity || searchAddr || a11yFilter.length > 0

  return (
    <>
      <Grain />

      {/* ── Topo ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', padding: '0.875rem 1.5rem',
        gap: '1rem',
        background: 'var(--c-glass-bg)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--c-divider)',
        transition: 'background 350ms ease',
      }}>
        <img src={pluraLogo} alt="Plura" style={{ height: '30px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
        <div style={{ flex: 1 }} />
        <ThemeToggle />
        {user ? (
          <button
            onClick={() => onNavigate('myarea')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg,#1a7aff,#0062e6)',
              border: 'none', borderRadius: '0.75rem',
              color: '#fff', fontSize: '0.875rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26,122,255,0.35)',
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            <UserIcon />
            Minha Área
          </button>
        ) : (
          <button
            onClick={() => onNavigate('login')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem',
              background: 'var(--c-glass-bg-sm)',
              border: '1px solid var(--c-input-border)',
              borderRadius: '0.75rem',
              color: 'var(--c-text-1)', fontSize: '0.875rem', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,122,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#6aadff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ''; (e.currentTarget as HTMLButtonElement).style.color = '' }}
          >
            <UserIcon />
            Entrar
          </button>
        )}
      </header>

      {/* ── Conteúdo ── */}
      <main style={{ paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 2.5rem', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1.25rem)', marginBottom: '0.875rem' }}>
            <img
              src={pluraLogo}
              alt=""
              aria-hidden
              draggable={false}
              style={{ height: 'clamp(2.5rem, 6vw, 4rem)', width: 'auto', objectFit: 'contain', userSelect: 'none' }}
            />
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.045em',
              lineHeight: 1.05,
              color: 'var(--c-text-1)',
              margin: 0,
              transition: 'color 350ms ease',
            }}>
              Plura
            </h1>
          </div>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--c-text-2)',
            lineHeight: 1.55,
            maxWidth: '480px',
            margin: '0 auto',
            transition: 'color 350ms ease',
          }}>
            Encontre seu lazer com acessibilidade
          </p>
        </div>

        {/* Filtros */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{
            background: 'var(--c-glass-bg)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: 'var(--c-border)',
            borderRadius: '1.25rem',
            boxShadow: 'var(--c-shadow-md)',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            {/* Linha de inputs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <FilterInput icon={<SearchIcon />}  placeholder="Buscar por nome…"    value={searchName} onChange={setSearchName} />
              <FilterInput icon={<CityIcon />}    placeholder="Cidade…"             value={searchCity} onChange={setSearchCity} />
              <FilterInput icon={<MapPinIcon />}  placeholder="Estado…"             value={searchAddr} onChange={setSearchAddr} />
            </div>

            {/* Toggle acessibilidade */}
            <div>
              <button
                onClick={() => setShowA11y(v => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.375rem 0.875rem',
                  background: a11yFilter.length > 0
                    ? 'linear-gradient(135deg,rgba(26,122,255,0.22),rgba(0,98,230,0.14))'
                    : 'var(--c-glass-bg-sm)',
                  border: a11yFilter.length > 0 ? '1px solid rgba(26,122,255,0.45)' : '1px solid var(--c-input-border)',
                  borderRadius: '9999px',
                  color: a11yFilter.length > 0 ? '#6aadff' : 'var(--c-text-2)',
                  fontSize: '0.8125rem', fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
              >
                <A11yIcon />
                Acessibilidade
                {a11yFilter.length > 0 && (
                  <span style={{ background: '#1a7aff', color: '#fff', borderRadius: '9999px', minWidth: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 800, padding: '0 4px' }}>
                    {a11yFilter.length}
                  </span>
                )}
                {fromProfile && (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)' }}>
                    · do seu perfil
                  </span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transition: 'transform 200ms ease', transform: showA11y ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showA11y && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {A11Y_OPTIONS.map(opt => {
                    const active = a11yFilter.includes(opt.id)
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleA11y(opt.id)}
                        style={{
                          padding: '0.35rem 0.75rem', borderRadius: '9999px',
                          fontSize: '0.8125rem', fontWeight: 500,
                          fontFamily: 'inherit', cursor: 'pointer',
                          transition: 'all 200ms ease', outline: 'none',
                          background: active ? 'linear-gradient(135deg,rgba(26,122,255,0.25),rgba(0,98,230,0.18))' : 'var(--c-glass-bg-sm)',
                          border: active ? '1px solid rgba(26,122,255,0.55)' : '1px solid var(--c-input-border)',
                          color: active ? '#6aadff' : 'var(--c-text-2)',
                          boxShadow: active ? '0 0 10px rgba(26,122,255,0.15)' : 'none',
                        }}
                      >
                        {active && <span style={{ marginRight: '0.3rem', fontSize: '0.6rem' }}>✓</span>}
                        {opt.label}
                      </button>
                    )
                  })}
                  {a11yFilter.length > 0 && (
                    <button
                      onClick={() => { setA11yFilter([]); setFromProfile(false) }}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: '9999px',
                        fontSize: '0.8125rem', fontWeight: 500,
                        fontFamily: 'inherit', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171',
                        transition: 'all 200ms ease',
                      }}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de empresas */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Cabeçalho do grid */}
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>
                {hasFilters
                  ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                  : `${companies.length} empresa${companies.length !== 1 ? 's' : ''} na plataforma`
                }
              </p>
              {hasFilters && (
                <button
                  onClick={() => { setSearchName(''); setSearchCity(''); setSearchAddr(''); setA11yFilter([]); setFromProfile(false) }}
                  style={{ fontSize: '0.8125rem', color: 'var(--c-text-blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 150ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                >
                  Limpar tudo
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" style={{ color: 'var(--c-text-4)', opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
                {companies.length === 0 ? 'Nenhuma empresa cadastrada ainda' : 'Nenhum resultado para esses filtros'}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                {companies.length === 0 ? 'Em breve novos negócios acessíveis por aqui' : 'Tente outros termos ou remova alguns filtros'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              {filtered.map(company => (
                <CompanyGridCard
                  key={company.id}
                  company={company}
                  onClick={() => onViewCompany(company.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-4)', display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', transition: 'color 350ms ease' }}>
        <span>© 2026 Plura</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
      </footer>

      <style>{`
        ::placeholder { color: var(--c-placeholder); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </>
  )
}
