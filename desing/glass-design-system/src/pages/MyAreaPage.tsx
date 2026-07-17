import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { GlassCard } from '../components/GlassCard'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Badge } from '../components/Badge'
import { ThemeToggle } from '../components/ThemeToggle'
import { supabase } from '../lib/supabase'
import { getProfile, updateProfile, uploadAvatar, getNotifications, respondToInvite, markNotificationRead, getCollaboratingCompanies } from '../lib/api'
import type { NotificationFull, CompanyFull } from '../lib/api'
import type { Database } from '../lib/database.types'
import { mapNeedsToFeatures } from '../lib/accessibilityMap'
import type { A11yFeature } from '../lib/accessibilityMap'
import pluraLogo from '../assets/plura.png'
import type { Page } from '../App'

type A11yNeed = Database['public']['Enums']['user_accessibility_need']

interface MyAreaPageProps {
  user:                     User
  onNavigate:               (page: Page) => void
  onViewCompany:            (companyId: string) => void
  onSearchNextDestination:  (a11yFilter: A11yFeature[]) => void
}

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.032, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />
)

/* ─── Accessibility chips ─────────────────────────────────────────────────── */
const ACCESSIBILITY_OPTIONS: { id: A11yNeed; label: string }[] = [
  { id: 'visual',           label: 'Deficiência visual' },
  { id: 'auditiva',         label: 'Deficiência auditiva' },
  { id: 'motora',           label: 'Deficiência motora' },
  { id: 'intelectual',      label: 'Deficiência intelectual' },
  { id: 'tea',              label: 'TEA (Autismo)' },
  { id: 'neurodivergencia', label: 'Neurodivergência' },
  { id: 'nenhuma',          label: 'Nenhuma' },
]

const AccessibilityChips = ({ selected, onChange }: { selected: A11yNeed[]; onChange: (ids: A11yNeed[]) => void }) => {
  const toggle = (id: A11yNeed) => {
    if (id === 'nenhuma') { onChange(selected.includes('nenhuma') ? [] : ['nenhuma']); return }
    const without = selected.filter(s => s !== 'nenhuma')
    onChange(without.includes(id) ? without.filter(s => s !== id) : [...without, id])
  }
  return (
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
  )
}

/* ─── Ícones ─────────────────────────────────────────────────────────────── */
const CameraIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
const BuildingPlusIcon= () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="19" y1="5" x2="19" y2="11"/><line x1="16" y1="8" x2="22" y2="8"/></svg>
const BuildingListIcon= () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const CompassIcon     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const HeartIcon       = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const LogoutIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const EditIcon        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const UserIcon        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const SmileIcon       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
const EmailIcon       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
const MapPinIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const CloseIcon       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const BellIcon        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>

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

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function maskCep(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 350ms ease' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
  </div>
)

const StatItem = ({ value, label }: { value: string | number; label: string }) => (
  <div style={{ textAlign: 'center', padding: '0 1.25rem' }}>
    <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--c-text-1)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>{value}</p>
    <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>{label}</p>
  </div>
)

const ActionCard = ({ icon, title, description, variant = 'default', onClick }: { icon: React.ReactNode; title: string; description: string; variant?: 'default' | 'blue'; onClick?: () => void }) => (
  <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick?.()} style={{
    padding: '1.5rem',
    background: variant === 'blue' ? 'linear-gradient(135deg,rgba(26,122,255,0.18),rgba(0,98,230,0.10))' : 'var(--c-glass-bg)',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: variant === 'blue' ? '1px solid rgba(26,122,255,0.40)' : 'var(--c-border)',
    borderRadius: '1.25rem',
    boxShadow: variant === 'blue' ? '0 0 28px rgba(26,122,255,0.12),0 8px 24px rgba(0,0,0,0.22)' : 'var(--c-shadow-md)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem',
    transition: 'transform 200ms ease, box-shadow 200ms ease, background 350ms ease', outline: 'none',
  }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.35)' }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = variant === 'blue' ? '0 0 28px rgba(26,122,255,0.12),0 8px 24px rgba(0,0,0,0.22)' : 'var(--c-shadow-md)' }}
  >
    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: variant === 'blue' ? 'rgba(26,122,255,0.22)' : 'var(--c-glass-bg-sm)', border: variant === 'blue' ? '1px solid rgba(26,122,255,0.35)' : 'var(--c-border-sm)', color: variant === 'blue' ? '#6aadff' : 'var(--c-text-2)', transition: 'background 350ms ease' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.2rem', transition: 'color 350ms ease' }}>{title}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>{description}</p>
    </div>
    <svg style={{ marginLeft: 'auto', color: 'var(--c-text-4)', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
  </div>
)

/* ─── Helpers de notificação ─────────────────────────────────────────────── */
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `há ${d} dia${d > 1 ? 's' : ''}`
  const w = Math.floor(d / 7)
  if (w < 5)  return `há ${w} semana${w > 1 ? 's' : ''}`
  const mo = Math.floor(d / 30)
  return `há ${mo} ${mo > 1 ? 'meses' : 'mês'}`
}

type NotifType = 'company_invite' | 'invite_accepted' | 'invite_declined' | 'company_edited' | 'new_review'

function notifMeta(type: NotifType): { label: string; accent: string; bg: string; border: string } {
  switch (type) {
    case 'company_invite':   return { label: 'Convite de empresa',  accent: '#a78bfa', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)' }
    case 'invite_accepted':  return { label: 'Convite aceito',      accent: '#4ade80', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.30)'  }
    case 'invite_declined':  return { label: 'Convite recusado',    accent: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.30)'  }
    case 'company_edited':   return { label: 'Empresa atualizada',  accent: '#60a5fa', bg: 'rgba(26,122,255,0.12)', border: 'rgba(26,122,255,0.28)' }
    case 'new_review':       return { label: 'Nova avaliação',      accent: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.30)' }
  }
}

function notifDescription(notif: NotificationFull): string {
  const company = notif.companies?.name ?? 'uma empresa'
  const inviter = (notif.collaborators as any)?.inviter
  const who     = inviter?.name ?? inviter?.email ?? 'alguém'
  switch (notif.type as NotifType) {
    case 'company_invite':  return `${who} convidou você para colaborar em ${company}`
    case 'invite_accepted': return `${who} aceitou seu convite para ${company}`
    case 'invite_declined': return `${who} recusou seu convite para ${company}`
    case 'company_edited':  return `${company} teve informações atualizadas`
    case 'new_review':      return `Nova avaliação recebida em ${company}`
    default:                return company
  }
}

/* ─── NotificationsDrawer ────────────────────────────────────────────────── */
function NotificationsDrawer({ notifications, onAccept, onDecline, onClose }: {
  notifications: NotificationFull[]
  onAccept:  (notif: NotificationFull) => Promise<void>
  onDecline: (notif: NotificationFull) => Promise<void>
  onClose:   () => void
}) {
  const [accepting, setAccepting] = useState<string | null>(null)
  const [declining, setDeclining] = useState<string | null>(null)

  const pending = notifications.filter(n => n.status === 'unread' && n.type === 'company_invite')
  const history = notifications.filter(n => n.status === 'read' || n.type !== 'company_invite')

  const handleAccept = async (notif: NotificationFull) => {
    setAccepting(notif.id)
    try { await onAccept(notif) } finally { setAccepting(null) }
  }
  const handleDecline = async (notif: NotificationFull) => {
    setDeclining(notif.id)
    try { await onDecline(notif) } finally { setDeclining(null) }
  }

  /* Convite pendente — com botões Aceitar / Recusar */
  const PendingCard = ({ notif }: { notif: NotificationFull }) => {
    const meta    = notifMeta('company_invite')
    const company = notif.companies
    const inviter = (notif.collaborators as any)?.inviter
    const busy    = !!accepting || !!declining
    return (
      <div style={{
        borderRadius: '1rem', overflow: 'hidden',
        border: `1px solid ${meta.border}`,
        background: meta.bg,
      }}>
        <div style={{ padding: '0.875rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
          {/* Inicial da empresa */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '0.75rem', flexShrink: 0,
            background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.0625rem', fontWeight: 800, color: '#fff',
          }}>
            {company?.name?.[0] ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Label do tipo */}
            <p style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: meta.accent, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              {meta.label}
            </p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.2rem', transition: 'color 350ms ease', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {company?.name ?? 'Empresa'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', lineHeight: 1.4, transition: 'color 350ms ease' }}>
              Convite de <strong style={{ color: 'var(--c-text-2)', fontWeight: 600 }}>
                {inviter?.name ?? inviter?.email ?? 'alguém'}
              </strong>
              {company?.category && <span style={{ opacity: 0.7 }}> · {CATEGORY_LABEL[company.category] ?? company.category}</span>}
            </p>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--c-text-4)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '0.125rem', transition: 'color 350ms ease' }}>
            {timeAgo(notif.created_at)}
          </span>
        </div>
        {/* Botões */}
        <div style={{ display: 'flex', gap: '0', borderTop: `1px solid ${meta.border}` }}>
          <button
            onClick={() => handleAccept(notif)}
            disabled={busy}
            style={{
              flex: 1, padding: '0.625rem', border: 'none', borderRight: `1px solid ${meta.border}`,
              background: accepting === notif.id ? 'rgba(26,122,255,0.25)' : 'rgba(26,122,255,0.12)',
              color: '#6aadff', fontWeight: 700, fontSize: '0.8125rem',
              fontFamily: 'inherit', cursor: busy ? 'wait' : 'pointer',
              transition: 'background 200ms ease',
            }}
            onMouseEnter={e => { if (!busy) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(26,122,255,0.22)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = accepting === notif.id ? 'rgba(26,122,255,0.25)' : 'rgba(26,122,255,0.12)' }}
          >
            {accepting === notif.id ? '…' : 'Aceitar'}
          </button>
          <button
            onClick={() => handleDecline(notif)}
            disabled={busy}
            style={{
              flex: 1, padding: '0.625rem', border: 'none',
              background: declining === notif.id ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: 'var(--c-text-3)', fontWeight: 600, fontSize: '0.8125rem',
              fontFamily: 'inherit', cursor: busy ? 'wait' : 'pointer',
              transition: 'background 200ms ease, color 200ms ease',
            }}
            onMouseEnter={e => { if (!busy) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.10)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171' } }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = declining === notif.id ? 'rgba(239,68,68,0.15)' : 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-3)' }}
          >
            {declining === notif.id ? '…' : 'Recusar'}
          </button>
        </div>
      </div>
    )
  }

  /* Item de histórico — qualquer tipo já respondido/lido */
  const HistoryItem = ({ notif }: { notif: NotificationFull }) => {
    const meta    = notifMeta(notif.type as NotifType)
    const company = notif.companies
    const isPending = notif.status === 'unread' && notif.type === 'company_invite'
    if (isPending) return null
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--c-divider)',
        opacity: notif.type === 'company_invite' ? 0.65 : 1,
      }}>
        {/* Ícone colorido por tipo */}
        <div style={{
          width: '34px', height: '34px', borderRadius: '0.625rem', flexShrink: 0,
          background: meta.bg, border: `1px solid ${meta.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', fontWeight: 800,
          color: meta.accent,
        }}>
          {company?.name?.[0] ?? '·'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: meta.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {meta.label}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-2)', lineHeight: 1.45, transition: 'color 350ms ease' }}>
            {notifDescription(notif)}
          </p>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--c-text-4)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: '0.125rem', transition: 'color 350ms ease' }}>
          {timeAgo(notif.created_at)}
        </span>
      </div>
    )
  }

  const hasAny = notifications.length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9400,
          background: 'rgba(4,4,15,0.55)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          animation: 'nd-fade 180ms ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9401,
        width: '100%', maxWidth: '400px',
        background: 'var(--c-glass-bg-lg)',
        backdropFilter: 'blur(32px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
        borderLeft: 'var(--c-border-lg)',
        boxShadow: '-24px 0 80px rgba(0,0,0,0.45)',
        display: 'flex', flexDirection: 'column',
        animation: 'nd-slide 220ms cubic-bezier(0.34,1.1,0.64,1)',
      }}>

        {/* Cabeçalho */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.5rem 1.5rem 1.25rem',
          borderBottom: '1px solid var(--c-divider)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '0.75rem',
              background: pending.length > 0 ? 'rgba(245,158,11,0.18)' : 'var(--c-glass-bg-sm)',
              border: `1px solid ${pending.length > 0 ? 'rgba(245,158,11,0.4)' : 'var(--c-border-sm)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: pending.length > 0 ? '#fbbf24' : 'var(--c-text-3)',
              transition: 'all 300ms ease',
            }}>
              <BellIcon />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>
                Notificações
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                {pending.length > 0
                  ? `${pending.length} convite${pending.length > 1 ? 's' : ''} aguardando`
                  : hasAny ? 'Tudo em dia' : 'Nenhuma notificação'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar notificações"
            style={{
              background: 'none', border: '1px solid var(--c-input-border)',
              borderRadius: '0.625rem', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--c-text-2)', flexShrink: 0,
              transition: 'background 200ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass-bg-sm)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {!hasAny ? (
            /* Estado vazio */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px', gap: '0.75rem', color: 'var(--c-text-4)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
                Tudo em silêncio por aqui
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', textAlign: 'center', lineHeight: 1.5, transition: 'color 350ms ease' }}>
                Convites para colaborar em empresas aparecerão aqui
              </p>
            </div>
          ) : (
            <div>
              {/* ── Pendentes ── */}
              {pending.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem', transition: 'color 350ms ease' }}>
                    Aguardando resposta · {pending.length}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pending.map(n => <PendingCard key={n.id} notif={n} />)}
                  </div>
                </div>
              )}

              {/* ── Histórico ── */}
              {history.length > 0 && (
                <div>
                  <p style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.5rem', transition: 'color 350ms ease' }}>
                    Histórico · {history.length}
                  </p>
                  <div>
                    {history.map(n => <HistoryItem key={n.id} notif={n} />)}
                  </div>
                  {/* Última linha sem divider */}
                  <div style={{ height: '0.5rem' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes nd-fade  { from { opacity:0 } to { opacity:1 } }
        @keyframes nd-slide { from { transform:translateX(100%) } to { transform:translateX(0) } }
      `}</style>
    </>
  )
}

/* ─── EditProfileModal ───────────────────────────────────────────────────── */
function EditProfileModal({ user, initialFullName, initialNomeSocial, initialA11y, initialCep, initialAddress, initialComplement, onClose, onSaved }: {
  user: User
  initialFullName: string
  initialNomeSocial: string
  initialA11y: A11yNeed[]
  initialCep: string
  initialAddress: string
  initialComplement: string
  onClose: () => void
  onSaved: (displayName: string, a11y: A11yNeed[]) => void
}) {
  const [nome,        setNome]        = useState(initialFullName)
  const [nomeSocial,  setNomeSocial]  = useState(initialNomeSocial)
  const [cep,         setCep]         = useState(initialCep)
  const [endereco,    setEndereco]    = useState(initialAddress)
  const [complemento, setComplemento] = useState(initialComplement)
  const [acess,       setAcess]       = useState<A11yNeed[]>(initialA11y)
  const [cepLoading,  setCepLoading]  = useState(false)
  const [cepFound,    setCepFound]    = useState(!!initialAddress && !!initialCep)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState<Record<string, string>>({})

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
    const masked = maskCep(raw)
    const digits = masked.replace(/\D/g, '')
    setCep(masked)
    setCepFound(false)
    setErrors(p => ({ ...p, cep: '' }))
    if (digits.length === 8) fetchCep(digits)
  }

  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!nome.trim()) errs.nome = 'Nome é obrigatório'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const displayName = nomeSocial.trim() || nome.trim()
      await updateProfile(user.id, {
        name:               displayName,
        accessibility_needs: acess,
        cep:                cep.replace(/\D/g, '') || null,
        address:            endereco.trim() || null,
        complement:         complemento.trim() || null,
      })
      await supabase.auth.updateUser({ data: { full_name: nome.trim() } })
      onSaved(displayName, acess)
      onClose()
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Editar perfil"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(4,4,15,0.78)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '2rem 1rem 3rem', overflowY: 'auto',
        animation: 'ep-fade 220ms ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: '520px', marginTop: '1rem',
        background: 'var(--c-glass-bg-lg)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
        border: 'var(--c-border-lg)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--c-shadow-lg)',
        padding: '2.5rem 2rem',
        animation: 'ep-scale 280ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>
              Editar perfil
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
              Atualize suas informações pessoais
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'none', border: '1px solid var(--c-input-border)',
              borderRadius: '0.625rem', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--c-text-2)',
              transition: 'all 200ms ease', flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--c-glass-bg-sm)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
          >
            <CloseIcon />
          </button>
        </div>

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
          {/* E-mail — não editável */}
          <div style={{ position: 'relative' }}>
            <Input
              label="E-mail"
              type="email"
              value={user.email ?? ''}
              onChange={() => {}}
              disabled
              leadingIcon={<EmailIcon />}
            />
            <span style={{
              position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(30%)',
              fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-4)',
              letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none',
            }}>
              não editável
            </span>
          </div>
        </div>

        {/* ── ENDEREÇO ── */}
        <SectionLabel label="Endereço" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{ width: '140px', flexShrink: 0 }}>
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
        <AccessibilityChips selected={acess} onChange={setAcess} />
        <p style={{ marginTop: '0.625rem', marginBottom: '1.75rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>
          Mais opções serão adicionadas em breve · múltipla escolha
        </p>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={loading} style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave}>
            {loading ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes ep-fade  { from { opacity:0 } to { opacity:1 } }
        @keyframes ep-scale { from { opacity:0; transform:scale(0.94) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
      `}</style>
    </div>
  )
}

/* ─── MyAreaPage ─────────────────────────────────────────────────────────── */
export default function MyAreaPage({ user, onNavigate, onViewCompany, onSearchNextDestination }: MyAreaPageProps) {
  const [photoUrl,        setPhotoUrl]        = useState<string | null>(null)
  const [avatarHover,     setAvatarHover]     = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [accessibility,   setAccessibility]   = useState<A11yNeed[]>([])
  const [savingA11y,      setSavingA11y]      = useState(false)
  const [savedA11y,       setSavedA11y]       = useState(false)
  const [profileName,     setProfileName]     = useState('')

  const [companyCount,    setCompanyCount]    = useState(0)
  const [notifications,   setNotifications]   = useState<NotificationFull[]>([])
  const [collabCompanies, setCollabCompanies] = useState<CompanyFull[]>([])
  const [loadingProfile,  setLoadingProfile]  = useState(true)
  const [showEditModal,       setShowEditModal]       = useState(false)
  const [showNotifications,   setShowNotifications]   = useState(false)
  const [profileFullName, setProfileFullName] = useState((user.user_metadata?.full_name as string) ?? '')
  const [profileCep,      setProfileCep]      = useState('')
  const [profileAddress,  setProfileAddress]  = useState('')
  const [profileComplement, setProfileComplement] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const userEmail = user.email ?? ''
  const initials  = getInitials(profileName || userEmail.split('@')[0])

  useEffect(() => {
    async function load() {
      setLoadingProfile(true)
      try {
        const [profile, notifs, collabs] = await Promise.all([
          getProfile(user.id),
          getNotifications(user.id),
          getCollaboratingCompanies(user.id),
        ])
        setProfileName(profile.name ?? '')
        setPhotoUrl(profile.avatar_url ?? null)
        setAccessibility((profile.accessibility_needs ?? []) as A11yNeed[])
        setProfileFullName((user.user_metadata?.full_name as string) ?? profile.name ?? '')
        setProfileCep(profile.cep ? (profile.cep.length === 8 ? `${profile.cep.slice(0,5)}-${profile.cep.slice(5)}` : profile.cep) : '')
        setProfileAddress(profile.address ?? '')
        setProfileComplement(profile.complement ?? '')
        setNotifications(notifs)
        setCollabCompanies(collabs)

        const { count } = await supabase
          .from('companies').select('*', { count: 'exact', head: true }).eq('owner_id', user.id)
        setCompanyCount(count ?? 0)
      } catch (err) {
        console.error('Error loading profile', err)
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [user.id])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUrl(URL.createObjectURL(file))
    setUploadingAvatar(true)
    try {
      const url = await uploadAvatar(user.id, file)
      setPhotoUrl(url)
    } catch (err) {
      console.error('Erro ao salvar foto de perfil:', err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const saveA11y = async () => {
    setSavingA11y(true)
    try {
      await updateProfile(user.id, { accessibility_needs: accessibility })
      setSavedA11y(true)
      setTimeout(() => setSavedA11y(false), 2500)
    } catch (err) {
      console.error('Error saving accessibility', err)
    } finally {
      setSavingA11y(false)
    }
  }

  const handleAcceptInvite = async (notif: NotificationFull) => {
    if (!notif.collaborators?.id) return
    try {
      await respondToInvite(notif.collaborators.id, true)
      await markNotificationRead(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'read' } : n))
      const updated = await getCollaboratingCompanies(user.id)
      setCollabCompanies(updated)
    } catch (err) {
      console.error('Error accepting invite', err)
    }
  }

  const handleDeclineInvite = async (notif: NotificationFull) => {
    if (!notif.collaborators?.id) return
    try {
      await respondToInvite(notif.collaborators.id, false)
      await markNotificationRead(notif.id)
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'read' } : n))
    } catch (err) {
      console.error('Error declining invite', err)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleEditSaved = (displayName: string, a11y: A11yNeed[]) => {
    setProfileName(displayName)
    setAccessibility(a11y)
  }

  const pendingNotifs = notifications.filter(n => n.status === 'unread' && n.type === 'company_invite')

  return (
    <>
      <Grain />
      <ThemeToggle />

      {showNotifications && (
        <NotificationsDrawer
          notifications={notifications}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          user={user}
          initialFullName={profileFullName}
          initialNomeSocial={profileName}
          initialA11y={accessibility}
          initialCep={profileCep}
          initialAddress={profileAddress}
          initialComplement={profileComplement}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}

      <div className="r-layout" style={{ minHeight: '100vh', position: 'relative', zIndex: 1, padding: '5.5rem 1.5rem 3rem' }}>
        <div className="r-container" style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src={pluraLogo} alt="Plura" style={{ height: '32px', objectFit: 'contain' }} draggable={false} />
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 350ms ease' }}>
              minha área
            </span>
            <div style={{ flex: 1 }} />
            <Button variant="ghost" size="sm" icon={<LogoutIcon />} iconPosition="left" onClick={handleSignOut}>
              Sair
            </Button>
          </nav>

          {/* Card de perfil */}
          <GlassCard variant="lg" style={{ marginBottom: '1.25rem' }}>
            {loadingProfile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--c-glass-bg-sm)', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ height: '1.25rem', width: '180px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
                  <div style={{ height: '0.875rem', width: '220px', borderRadius: '0.375rem', background: 'var(--c-glass-bg-sm)' }} />
                </div>
              </div>
            ) : (
              <div className="r-profile-body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    role="button" tabIndex={0} aria-label="Alterar foto de perfil"
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                    onMouseEnter={() => setAvatarHover(true)}
                    onMouseLeave={() => setAvatarHover(false)}
                    style={{ width: '88px', height: '88px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '2px solid rgba(26,122,255,0.45)', boxShadow: '0 0 20px rgba(26,122,255,0.20)', transition: 'box-shadow 250ms ease', flexShrink: 0 }}
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a7aff,#004bbf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', userSelect: 'none' }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: uploadingAvatar || avatarHover ? 1 : 0, transition: 'opacity 200ms ease' }}>
                      {uploadingAvatar
                        ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        : <CameraIcon />
                      }
                    </div>
                  </div>
                  <div onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: '#1a7aff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--c-bg)', boxShadow: '0 2px 8px rgba(26,122,255,0.45)', color: '#fff' }}>
                    <EditIcon />
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                </div>

                {/* Info */}
                <div className="r-profile-info" style={{ flex: 1, minWidth: '180px' }}>
                  <h2 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>
                    {profileName || userEmail.split('@')[0]}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', marginBottom: '0.875rem', transition: 'color 350ms ease' }}>
                    {userEmail}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {accessibility.length > 0 && !accessibility.includes('nenhuma') && (
                      <Badge variant="white" size="sm">{accessibility.length} acessibilidade{accessibility.length > 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<EditIcon />}
                      iconPosition="left"
                      onClick={() => setShowEditModal(true)}
                    >
                      Editar perfil
                    </Button>

                    {/* Botão Notificações */}
                    <button
                      onClick={() => setShowNotifications(true)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.625rem',
                        background: pendingNotifs.length > 0
                          ? 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(245,158,11,0.08))'
                          : 'var(--c-glass-bg-sm)',
                        border: `1px solid ${pendingNotifs.length > 0 ? 'rgba(245,158,11,0.45)' : 'var(--c-input-border)'}`,
                        color: pendingNotifs.length > 0 ? '#fbbf24' : 'var(--c-text-2)',
                        fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        boxShadow: pendingNotifs.length > 0 ? '0 0 14px rgba(245,158,11,0.18)' : 'none',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                    >
                      <BellIcon />
                      Notificações
                      {pendingNotifs.length > 0 && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '18px', height: '18px', padding: '0 5px',
                          borderRadius: '9999px',
                          background: '#f59e0b',
                          color: '#fff',
                          fontSize: '0.6875rem', fontWeight: 800,
                          lineHeight: 1,
                        }}>
                          {pendingNotifs.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="r-profile-stats" style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--c-divider)', paddingLeft: '1.5rem', gap: '0', transition: 'border-color 350ms ease' }}>
                  <StatItem value={companyCount} label="empresas" />
                  <div style={{ width: '1px', height: '2.5rem', background: 'var(--c-divider)', transition: 'background 350ms ease' }} />
                  <StatItem value={collabCompanies.length} label="colaborações" />
                </div>
              </div>
            )}
          </GlassCard>

          {/* Buscar próximo destino */}
          <div style={{ marginBottom: '1.25rem' }}>
            <ActionCard
              variant="blue"
              icon={<CompassIcon />}
              title="Buscar Próximo Destino"
              description="Volte para a busca com os filtros de acessibilidade do seu perfil já aplicados"
              onClick={() => onSearchNextDestination(mapNeedsToFeatures(accessibility))}
            />
          </div>

          {/* Grid: acessibilidade + empresas */}
          <div className="r-grid-main" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'start' }}>

            {/* Acessibilidade */}
            <GlassCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>critérios</p>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>Acessibilidade</h3>
                </div>
                {savedA11y && <Badge variant="success" size="sm" dot>Salvo</Badge>}
              </div>
              <AccessibilityChips selected={accessibility} onChange={setAccessibility} />
              <p style={{ marginTop: '0.75rem', marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>
                Mais opções serão adicionadas em breve · múltipla escolha
              </p>
              <Button variant="secondary" size="sm" loading={savingA11y} onClick={saveA11y}>
                {savingA11y ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </GlassCard>

            {/* Empresas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>empresas</p>
              <ActionCard variant="blue" icon={<BuildingPlusIcon />} title="Criar empresa" description="Cadastre um novo negócio" onClick={() => onNavigate('create-company')} />
              <ActionCard icon={<BuildingListIcon />} title="Minhas empresas" description="Gerencie seus negócios" onClick={() => onNavigate('my-companies')} />
            </div>
          </div>

          {/* Colaborações */}
          {collabCompanies.length > 0 && (
            <GlassCard style={{ marginBottom: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>colaborações</p>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>Empresas que colaboro</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {collabCompanies.map(company => (
                  <div key={company.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', borderRadius: '1rem', background: 'var(--c-glass-bg-sm)', border: '1px solid var(--c-input-border)', cursor: 'pointer', transition: 'background 200ms ease, transform 200ms ease' }}
                    onClick={() => onViewCompany(company.id)}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--c-glass-bg)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.background = 'var(--c-glass-bg-sm)' }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', flexShrink: 0, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: '#fff' }}>
                      {company.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--c-text-1)', marginBottom: '0.125rem', transition: 'color 350ms ease' }}>{company.name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--c-text-3)', transition: 'color 350ms ease' }}>
                        {CATEGORY_LABEL[company.category] ?? company.category}
                        {company.city ? ` · ${company.city}` : ''}
                        {company.state ? `/${company.state}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm">Colaborador</Badge>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--c-text-4)', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Favoritos */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem', transition: 'color 350ms ease' }}>coleção</p>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--c-text-1)', transition: 'color 350ms ease' }}>Meus Favoritos</h3>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '0.875rem' }}>
              <div style={{ color: 'var(--c-text-4)', transition: 'color 350ms ease' }}><HeartIcon /></div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>Nenhum favorito ainda</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--c-text-3)', transition: 'color 350ms ease', textAlign: 'center' }}>Explore a plataforma e salve o que mais gostar</p>
            </div>
          </GlassCard>

          <footer style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-4)', display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', transition: 'color 350ms ease' }}>
            <span>© 2026 Plura</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </>
  )
}

const CATEGORY_LABEL: Record<string, string> = {
  hotel: 'Hotel', hostel: 'Hostel', pousada: 'Pousada', bar: 'Bar',
  restaurante: 'Restaurante', cafe: 'Café', espaco_eventos: 'Espaço de Eventos',
  passeio_turistico: 'Passeio Turístico', museu: 'Museu', parque: 'Parque',
  academia: 'Academia', clinica: 'Clínica', outros: 'Outros',
}
