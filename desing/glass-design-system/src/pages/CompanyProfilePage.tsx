import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { GlassCard }   from '../components/GlassCard'
import { Button }      from '../components/Button'
import { Badge }       from '../components/Badge'
import { ThemeToggle } from '../components/ThemeToggle'
import { getCompanyById, inviteCollaborator, removeCollaborator, photoUrl } from '../lib/api'
import type { CompanyFull } from '../lib/api'
import pluraLogo       from '../assets/plura.png'
import type { Page } from '../App'

interface CompanyProfilePageProps {
  user:          User | null
  companyId:     string
  onNavigate:    (page: Page) => void
  onEditCompany: (companyId: string) => void
  backPage?:     Page
}

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.032, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />
)

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
const A11Y_LABELS: Record<string, string> = {
  rampa: 'Rampa de acesso', elevador: 'Elevador acessível', banheiro_adaptado: 'Banheiro adaptado',
  vaga_pcd: 'Vaga PCD', piso_tatil: 'Piso tátil', libras: 'Atendimento em Libras',
  braille: 'Materiais em Braille', cadeira_rodas: 'Cadeira de rodas',
  audiodescricao: 'Audiodescrição', entrada_acessivel: 'Entrada acessível',
}

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const ArrowLeftIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
const EditIcon      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const UserPlusIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
const TrashIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const UserIcon      = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const XIcon         = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const InstagramIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
const WebIcon       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
const YoutubeIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>
const MapPinIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>

const SectionHeader = ({ label, title }: { label: string; title: string }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>{label}</p>
    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>{title}</h3>
  </div>
)

/* ─── CollaboratorModal ──────────────────────────────────────────────────── */
function CollaboratorModal({ company, ownerId, isOwner, onClose, onRefresh }: {
  company: CompanyFull
  ownerId: string
  isOwner: boolean
  onClose: () => void
  onRefresh: () => void
}) {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleAdd = async () => {
    if (!email.trim() || !email.includes('@')) { setError('Informe um e-mail válido'); return }
    const already = company.collaborators.some(c => c.email === email.trim().toLowerCase())
    if (already) { setError('Este e-mail já foi convidado'); return }
    setError('')
    setLoading(true)
    try {
      await inviteCollaborator(company.id, email.trim(), ownerId)
      setEmail('')
      setSent(true)
      onRefresh()
      setTimeout(() => setSent(false), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao convidar')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (collaboratorId: string) => {
    try {
      await removeCollaborator(collaboratorId)
      onRefresh()
    } catch {}
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="r-modal" style={{ width: '100%', maxWidth: '440px', background: 'var(--c-glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: 'var(--c-border)', borderRadius: '1.5rem', boxShadow: '0 32px 80px rgba(0,0,0,0.50)', padding: '2rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>colaboradores</p>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.03em' }}>Gerenciar equipe</h3>
          </div>
          <button onClick={onClose} style={{ background: 'var(--c-glass-bg-sm)', border: 'var(--c-border-sm)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon />
          </button>
        </div>

        {isOwner && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text-2)', marginBottom: '0.5rem' }}>Convidar por e-mail</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email" placeholder="colaborador@email.com" value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ flex: 1, padding: '0.625rem 0.875rem', background: 'var(--c-input-bg)', border: error ? '1px solid #ef4444' : '1px solid var(--c-input-border)', borderRadius: '0.75rem', color: 'var(--c-input-text)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', transition: 'border 200ms ease, background 350ms ease' }}
                onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(26,122,255,0.6)' }}
                onBlur={e => { if (!error) e.target.style.borderColor = 'var(--c-input-border)' }}
              />
              <Button variant="primary" size="sm" loading={loading} onClick={handleAdd}>Convidar</Button>
            </div>
            {error && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#ef4444' }}>{error}</p>}
            {sent && <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#4ade80' }}>Convite enviado!</p>}
          </div>
        )}

        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            {company.collaborators.length === 0 ? 'Nenhum colaborador' : `${company.collaborators.length} colaborador(es)`}
          </p>
          {company.collaborators.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--c-text-4)', fontSize: '0.875rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              Nenhum colaborador ainda
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {company.collaborators.map(collab => {
                const profile = collab.profiles as any
                const displayName = profile?.name ?? collab.email
                return (
                  <div key={collab.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', borderRadius: '0.875rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', transition: 'background 350ms ease' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,rgba(26,122,255,0.3),rgba(0,98,230,0.2))', border: '1px solid rgba(26,122,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6aadff' }}>
                      <UserIcon />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '0.125rem', transition: 'color 350ms ease', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </p>
                      {profile?.name && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 350ms ease' }}>
                          {collab.email}
                        </p>
                      )}
                    </div>
                    <Badge variant={collab.status === 'accepted' ? 'success' : 'warning'} size="sm">
                      {collab.status === 'accepted' ? 'Ativo' : 'Pendente'}
                    </Badge>
                    {isOwner && (
                      <button onClick={() => handleRemove(collab.id)} title="Remover colaborador" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-4)', padding: '0.25rem', borderRadius: '0.375rem', display: 'flex', transition: 'color 150ms ease, background 150ms ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-4)'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── CompanyProfilePage ─────────────────────────────────────────────────── */
export default function CompanyProfilePage({ user, companyId, onNavigate, onEditCompany, backPage = 'my-companies' }: CompanyProfilePageProps) {
  const [company,         setCompany]         = useState<CompanyFull | null>(null)
  const [loading,         setLoading]         = useState(true)
  const [showModal,       setShowModal]       = useState(false)
  const [activePhoto,     setActivePhoto]     = useState<string | null>(null)

  const loadCompany = async () => {
    const data = await getCompanyById(companyId)
    setCompany(data)
    setLoading(false)
  }

  useEffect(() => { loadCompany() }, [companyId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(26,122,255,0.2)', borderTopColor: '#1a7aff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!company) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--c-text-3)' }}>
        <p>Empresa não encontrada</p>
        <Button variant="ghost" onClick={() => onNavigate(backPage)}>← Voltar</Button>
      </div>
    )
  }

  const isOwner    = !!user && company.owner_id === user.id
  const gradient   = CATEGORY_GRADIENT[company.category] ?? CATEGORY_GRADIENT['outros']
  const initials   = company.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const coverPhoto = company.company_photos.find(p => p.is_cover) ?? company.company_photos[0]
  const coverSrc   = coverPhoto ? photoUrl(coverPhoto.storage_path) : null
  const a11yList   = (company.accessibility_features ?? []) as string[]

  return (
    <>
      <Grain />
      <ThemeToggle />

      {/* Lightbox */}
      {activePhoto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.9)', cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setActivePhoto(null)}>
          <img src={activePhoto} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '1rem', objectFit: 'contain' }} />
        </div>
      )}

      {/* Collaborator modal */}
      {showModal && (
        <CollaboratorModal
          company={company}
          ownerId={user?.id ?? ''}
          isOwner={isOwner}
          onClose={() => setShowModal(false)}
          onRefresh={loadCompany}
        />
      )}

      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Cover */}
        <div className="r-cover" style={{ height: '280px', width: '100%', position: 'relative', background: coverSrc ? `url(${coverSrc}) center/cover no-repeat` : gradient }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,0.55) 100%)' }} />

          {/* Back */}
          <div className="r-cover-back-group" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="r-cover-back" onClick={() => onNavigate(backPage)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', padding: '0.5rem 1rem', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'background 150ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
              <ArrowLeftIcon /> Minhas empresas
            </button>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="r-cover-edit-group" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button className="r-cover-action-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9999px', padding: '0.5rem 1rem', color: '#fff', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'background 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.65)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}>
                <UserPlusIcon /> Equipe
              </button>
              <button className="r-cover-action-btn" onClick={() => onEditCompany(company.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(26,122,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(26,122,255,0.5)', borderRadius: '9999px', padding: '0.5rem 1rem', color: '#fff', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', transition: 'background 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(26,122,255,0.95)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(26,122,255,0.75)')}>
                <EditIcon /> Editar
              </button>
            </div>
          )}

          {/* Avatar */}
          <div className="r-cover-avatar" style={{ position: 'absolute', bottom: '-36px', left: '2rem', width: '72px', height: '72px', borderRadius: '1rem', background: gradient, border: '3px solid var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', userSelect: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.35)' }}>
            {initials}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '0 1.5rem', maxWidth: '960px', margin: '0 auto' }}>

          {/* Profile head */}
          <div className="r-profile-head r-profile-head-row" style={{ paddingTop: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--c-divider)', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', transition: 'border-color 350ms ease' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>{company.name}</h1>
                <Badge variant="blue" size="sm">{CATEGORY_LABEL[company.category] ?? company.category}</Badge>
              </div>
              {(company.address || company.city) && (
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.9375rem', color: 'var(--c-text-3)', marginBottom: '0.75rem', transition: 'color 350ms ease' }}>
                  <MapPinIcon />
                  {company.address ?? ''}{company.city ? ` · ${company.city}` : ''}{company.state ? `/${company.state}` : ''}
                </p>
              )}
              <div className="r-social-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {company.instagram && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-2)', transition: 'background 350ms ease' }}>
                    <InstagramIcon />{company.instagram}
                  </span>
                )}
                {company.website && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-2)', transition: 'background 350ms ease' }}>
                    <WebIcon />{company.website}
                  </span>
                )}
                {company.youtube && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8125rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', color: 'var(--c-text-2)', transition: 'background 350ms ease' }}>
                    <YoutubeIcon />YouTube
                  </span>
                )}
              </div>
            </div>
            <img src={pluraLogo} alt="Plura" style={{ height: '28px', opacity: 0.5 }} draggable={false} />
          </div>

          {/* Content grid */}
          <div className="r-profile-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', paddingTop: '1.5rem', paddingBottom: '3rem', alignItems: 'start' }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <GlassCard>
                <SectionHeader label="sobre" title="Sobre a empresa" />
                <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', lineHeight: 1.7, transition: 'color 350ms ease' }}>{company.description}</p>
              </GlassCard>

              {company.company_photos.length > 0 && (
                <GlassCard>
                  <SectionHeader label="galeria" title="Fotos" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.625rem' }}>
                    {company.company_photos.map(p => {
                      const url = photoUrl(p.storage_path)
                      return (
                        <div key={p.id} onClick={() => setActivePhoto(url)} style={{ aspectRatio: '4/3', borderRadius: '0.75rem', overflow: 'hidden', cursor: 'zoom-in', border: '1px solid var(--c-input-border)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.30)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>
              )}

              {a11yList.length > 0 && (
                <GlassCard>
                  <SectionHeader label="critérios" title="Acessibilidade" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {a11yList.map(id => (
                      <span key={id} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500, background: 'rgba(26,122,255,0.12)', border: '1px solid rgba(26,122,255,0.25)', color: '#6aadff', transition: 'background 350ms ease' }}>
                        {A11Y_LABELS[id] ?? id}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Info */}
              <GlassCard>
                <SectionHeader label="detalhes" title="Informações" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {company.cnpj && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '0.125rem' }}>CNPJ</p>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>{company.cnpj}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '0.125rem' }}>Categoria</p>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>{CATEGORY_LABEL[company.category] ?? company.category}</p>
                  </div>
                  {company.created_at && (
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: '0.125rem' }}>Membro desde</p>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>
                        {new Date(company.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Collaborators */}
              <GlassCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <SectionHeader label="equipe" title="Colaboradores" />
                  {isOwner && (
                    <Button variant="secondary" size="sm" icon={<UserPlusIcon />} iconPosition="left" onClick={() => setShowModal(true)}>
                      Adicionar
                    </Button>
                  )}
                </div>
                {company.collaborators.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--c-text-4)' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>👥</div>
                    <p style={{ fontSize: '0.875rem' }}>Nenhum colaborador</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {company.collaborators.map(collab => {
                      const profile = collab.profiles as any
                      const displayName = profile?.name ?? collab.email
                      return (
                        <div key={collab.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', borderRadius: '0.75rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', transition: 'background 350ms ease' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,rgba(26,122,255,0.3),rgba(0,98,230,0.2))', border: '1px solid rgba(26,122,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6aadff', fontSize: '0.75rem' }}>
                            {displayName[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--c-text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 350ms ease' }}>
                              {displayName}
                            </p>
                          </div>
                          <Badge variant={collab.status === 'accepted' ? 'success' : 'warning'} size="sm">
                            {collab.status === 'accepted' ? 'Ativo' : 'Pendente'}
                          </Badge>
                          {isOwner && (
                            <button onClick={async () => { await removeCollaborator(collab.id); loadCompany() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-4)', padding: '0.2rem', borderRadius: '0.375rem', display: 'flex', transition: 'color 150ms ease, background 150ms ease' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-4)'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </GlassCard>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
