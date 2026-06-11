import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button }      from '../components/Button'
import { Badge }       from '../components/Badge'
import { ThemeToggle } from '../components/ThemeToggle'
import { getMyCompanies, photoUrl } from '../lib/api'
import type { CompanyFull } from '../lib/api'
import pluraLogo       from '../assets/plura.png'
import type { Page } from '../App'

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.032, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />
)

/* ─── Maps ───────────────────────────────────────────────────────────────── */
const A11Y_LABELS: Record<string, string> = {
  rampa: 'Rampa', elevador: 'Elevador', banheiro_adaptado: 'Banheiro adapt.',
  vaga_pcd: 'Vaga PCD', piso_tatil: 'Piso tátil', libras: 'Libras',
  braille: 'Braille', cadeira_rodas: 'Cadeira de rodas',
  audiodescricao: 'Audiodescrição', entrada_acessivel: 'Entrada acessível',
}

const CATEGORY_LABEL: Record<string, string> = {
  hotel: 'Hotel', hostel: 'Hostel', pousada: 'Pousada', bar: 'Bar',
  restaurante: 'Restaurante', cafe: 'Café', espaco_eventos: 'Espaço de Eventos',
  passeio_turistico: 'Passeio Turístico', museu: 'Museu', parque: 'Parque',
  academia: 'Academia', clinica: 'Clínica', outros: 'Outros',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  hotel: 'linear-gradient(135deg,#6366f1cc,#4f46e566)',
  hostel: 'linear-gradient(135deg,#8b5cf6cc,#7c3aed66)',
  pousada: 'linear-gradient(135deg,#10b981cc,#059a6566)',
  bar: 'linear-gradient(135deg,#f59e0bcc,#d9770666)',
  restaurante: 'linear-gradient(135deg,#ef4444cc,#dc262666)',
  cafe: 'linear-gradient(135deg,#92400ecc,#78350f66)',
  espaco_eventos: 'linear-gradient(135deg,#3b82f6cc,#1d4ed866)',
  passeio_turistico: 'linear-gradient(135deg,#06b6d4cc,#0891b266)',
  museu: 'linear-gradient(135deg,#d97706cc,#b4570566)',
  parque: 'linear-gradient(135deg,#22c55ecc,#15803d66)',
  academia: 'linear-gradient(135deg,#f97316cc,#c2410c66)',
  clinica: 'linear-gradient(135deg,#0ea5e9cc,#075f8966)',
  outros: 'linear-gradient(135deg,#6b7280cc,#4b556366)',
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const EyeIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const BackIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

/* ─── CompanyCard ────────────────────────────────────────────────────────── */
const CompanyCard = ({ company, onEdit, onView }: { company: CompanyFull; onEdit: () => void; onView: () => void }) => {
  const initials     = company.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const gradient     = CATEGORY_GRADIENT[company.category] ?? CATEGORY_GRADIENT['outros']
  const coverPhoto   = company.company_photos.find(p => p.is_cover) ?? company.company_photos[0]
  const coverSrc     = coverPhoto ? photoUrl(coverPhoto.storage_path) : null
  const a11yList     = (company.accessibility_features ?? []) as string[]
  const visibleA11y  = a11yList.slice(0, 3)
  const extraA11y    = a11yList.length - 3

  return (
    <div style={{ background: 'var(--c-glass-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: 'var(--c-border)', borderRadius: '1.25rem', boxShadow: 'var(--c-shadow-md)', overflow: 'hidden', transition: 'transform 200ms ease, box-shadow 200ms ease, background 350ms ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 48px rgba(0,0,0,0.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--c-shadow-md)' }}>

      {/* Cover */}
      <div style={{ height: '110px', background: coverSrc ? `url(${coverSrc}) center/cover no-repeat` : gradient, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <Badge variant="white" size="sm">{CATEGORY_LABEL[company.category] ?? company.category}</Badge>
        </div>
        <div style={{ position: 'absolute', bottom: '-20px', left: '1.25rem', width: '44px', height: '44px', borderRadius: '0.75rem', background: gradient, border: '2.5px solid var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', userSelect: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
          {initials}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.625rem 1.25rem 1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--c-text-1)', marginBottom: '0.2rem', transition: 'color 350ms ease' }}>{company.name}</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', marginBottom: '0.625rem', transition: 'color 350ms ease' }}>
          {company.city ? `${company.city}${company.state ? `/${company.state}` : ''}` : (company.address ?? 'Endereço não informado')}
        </p>
        <p className="company-desc" style={{ fontSize: '0.875rem', color: 'var(--c-text-2)', lineHeight: 1.5, marginBottom: '0.875rem', transition: 'color 350ms ease' }}>
          {company.description}
        </p>

        {a11yList.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.875rem' }}>
            {visibleA11y.map(id => (
              <span key={id} style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500, background: 'rgba(26,122,255,0.12)', border: '1px solid rgba(26,122,255,0.25)', color: '#6aadff' }}>
                {A11Y_LABELS[id] ?? id}
              </span>
            ))}
            {extraA11y > 0 && (
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 500, background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-3)' }}>+{extraA11y}</span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" size="sm" icon={<EyeIcon />} iconPosition="left" style={{ flex: 1, justifyContent: 'center' }} onClick={onView}>
            Ver empresa
          </Button>
          <Button variant="ghost" size="sm" icon={<EditIcon />} iconPosition="left" onClick={onEdit}>
            Editar
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── MyCompaniesPage ────────────────────────────────────────────────────── */
interface MyCompaniesPageProps {
  user:          User
  onNavigate:    (page: Page) => void
  onEditCompany: (companyId: string) => void
  onViewCompany: (companyId: string) => void
}

export default function MyCompaniesPage({ user, onNavigate, onEditCompany, onViewCompany }: MyCompaniesPageProps) {
  const [companies, setCompanies] = useState<CompanyFull[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getMyCompanies(user.id).then(data => {
      setCompanies(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user.id])

  return (
    <>
      <Grain />
      <ThemeToggle />

      <div className="r-layout" style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '5.5rem 1.5rem 3rem' }}>
        <div className="r-container" style={{ maxWidth: '960px', margin: '0 auto' }}>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '32px', objectFit: 'contain' }} draggable={false} />
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 350ms ease' }}>minhas empresas</span>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" icon={<BackIcon />} iconPosition="left" onClick={() => onNavigate('myarea')}>
              Minha área
            </Button>
          </nav>

          <div className="r-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>Minhas Empresas</h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                {loading ? 'Carregando…' : `${companies.length} ${companies.length === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}`}
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => onNavigate('create-company')}>
              + Nova empresa
            </Button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '320px', borderRadius: '1.25rem', background: 'var(--c-glass-bg)', border: 'var(--c-border)', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--c-text-4)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text-2)', marginBottom: '0.5rem' }}>Nenhuma empresa ainda</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', marginBottom: '1.5rem' }}>Cadastre seu primeiro negócio na plataforma</p>
              <Button variant="primary" size="sm" onClick={() => onNavigate('create-company')}>+ Criar empresa</Button>
            </div>
          ) : (
            <div className="r-companies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
              {companies.map(company => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={() => onEditCompany(company.id)}
                  onView={() => onViewCompany(company.id)}
                />
              ))}
            </div>
          )}

          <footer style={{ marginTop: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-4)', display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', transition: 'color 350ms ease' }}>
            <span>© 2026 Plura</span><span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a><span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
          </footer>

        </div>
      </div>

      <style>{`.company-desc{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </>
  )
}
