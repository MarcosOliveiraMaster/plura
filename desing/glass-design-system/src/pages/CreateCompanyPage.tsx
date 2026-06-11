import { useState, useRef, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { GlassCard }   from '../components/GlassCard'
import { Input }       from '../components/Input'
import { Button }      from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import { createCompany, updateCompany, getCompanyById, uploadCompanyPhoto, deleteCompanyPhoto, photoUrl } from '../lib/api'
import type { Database } from '../lib/database.types'
import pluraLogo       from '../assets/plura.png'
import type { Page } from '../App'

type A11yFeature = Database['public']['Enums']['accessibility_feature']
type CompanyCategory = Database['public']['Enums']['company_category']

/* ─── Grain ─────────────────────────────────────────────────────────────── */
const Grain = () => (
  <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, opacity: 0.032, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%25%3E%3C/svg%3E")`, backgroundSize: '180px 180px' }} />
)

const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--c-text-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 350ms ease' }}>{label}</span>
    <div style={{ flex: 1, height: '1px', background: 'var(--c-divider)' }} />
  </div>
)

/* ─── Masks ─────────────────────────────────────────────────────────────── */
function maskCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2)  return d
  if (d.length <= 5)  return `${d.slice(0,2)}.${d.slice(2)}`
  if (d.length <= 8)  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8)}`
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}
function maskCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d
}

/* ─── Data ──────────────────────────────────────────────────────────────── */
const CATEGORIES: { value: CompanyCategory; label: string }[] = [
  { value: 'hotel',             label: 'Hotel' },
  { value: 'hostel',            label: 'Hostel' },
  { value: 'pousada',           label: 'Pousada' },
  { value: 'bar',               label: 'Bar' },
  { value: 'restaurante',       label: 'Restaurante' },
  { value: 'cafe',              label: 'Café' },
  { value: 'espaco_eventos',    label: 'Espaço de Eventos' },
  { value: 'passeio_turistico', label: 'Passeio Turístico' },
  { value: 'museu',             label: 'Museu' },
  { value: 'parque',            label: 'Parque / Área Verde' },
  { value: 'academia',          label: 'Academia / Esporte' },
  { value: 'clinica',           label: 'Clínica / Saúde' },
  { value: 'outros',            label: 'Outros' },
]

const A11Y_OPTIONS: { id: A11yFeature; label: string }[] = [
  { id: 'rampa',            label: 'Rampa de acesso' },
  { id: 'elevador',         label: 'Elevador acessível' },
  { id: 'banheiro_adaptado', label: 'Banheiro adaptado' },
  { id: 'vaga_pcd',         label: 'Vaga PCD' },
  { id: 'piso_tatil',       label: 'Piso tátil' },
  { id: 'libras',           label: 'Atendimento em Libras' },
  { id: 'braille',          label: 'Materiais em Braille' },
  { id: 'cadeira_rodas',    label: 'Cadeira de rodas' },
  { id: 'audiodescricao',   label: 'Audiodescrição' },
  { id: 'entrada_acessivel', label: 'Entrada acessível' },
]

const AccessibilityChips = ({ selected, onChange }: { selected: A11yFeature[]; onChange: (ids: A11yFeature[]) => void }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {A11Y_OPTIONS.map(opt => {
      const active = selected.includes(opt.id)
      return (
        <button key={opt.id} type="button" onClick={() => onChange(active ? selected.filter(s => s !== opt.id) : [...selected, opt.id])} style={{
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

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const CepSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin 0.7s linear infinite', display: 'block' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
)
const CepCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const ArrowLeftIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
const BuildingIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const MapPinIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const LinkIcon      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const PlusIcon      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const XIcon         = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

/* ─── Photo entry ────────────────────────────────────────────────────────── */
interface PhotoEntry {
  id?:          string   // DB id if existing
  previewUrl:   string   // blob or public URL for display
  storagePath?: string   // if already uploaded
  file?:        File     // if new upload
}

/* ─── CreateCompanyPage ──────────────────────────────────────────────────── */
interface CreateCompanyPageProps {
  user:       User
  companyId?: string  // set when editing
  onNavigate: (page: Page) => void
  onSaved:    () => void
}

export default function CreateCompanyPage({ user, companyId, onNavigate, onSaved }: CreateCompanyPageProps) {
  const isEdit = !!companyId

  const [name,          setName]          = useState('')
  const [cnpj,          setCnpj]          = useState('')
  const [cep,           setCep]           = useState('')
  const [address,       setAddress]       = useState('')
  const [city,          setCity]          = useState('')
  const [state,         setState]         = useState('')
  const [complement,    setComplement]    = useState('')
  const [category,      setCategory]      = useState<CompanyCategory | ''>('')
  const [description,   setDescription]   = useState('')
  const [photos,        setPhotos]        = useState<PhotoEntry[]>([])
  const [accessibility, setAccessibility] = useState<A11yFeature[]>([])
  const [youtube,       setYoutube]       = useState('')
  const [instagram,     setInstagram]     = useState('')
  const [facebook,      setFacebook]      = useState('')
  const [tiktok,        setTiktok]        = useState('')
  const [website,       setWebsite]       = useState('')
  const [loading,       setLoading]       = useState(false)
  const [loadingData,   setLoadingData]   = useState(isEdit)
  const [cepLoading,    setCepLoading]    = useState(false)
  const [cepFound,      setCepFound]      = useState(false)
  const [errors,        setErrors]        = useState<Record<string, string>>({})
  const [generalError,  setGeneralError]  = useState('')

  const photoRef = useRef<HTMLInputElement>(null)

  const fetchCep = async (digits: string) => {
    setCepLoading(true)
    setCepFound(false)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setErrors(p => ({ ...p, cep: 'CEP não encontrado' }))
      } else {
        const logradouro = [data.logradouro, data.bairro].filter(Boolean).join(', ')
        setAddress(logradouro)
        setCity(data.localidade ?? '')
        setState(data.uf ?? '')
        setErrors(p => ({ ...p, cep: '', address: '' }))
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

  // Load existing company data when editing
  useEffect(() => {
    if (!companyId) return
    getCompanyById(companyId).then(company => {
      if (!company) return
      setName(company.name)
      setCnpj(company.cnpj)
      setAddress(company.address ?? '')
      setCity(company.city ?? '')
      setState(company.state ?? '')
      setCategory(company.category)
      setDescription(company.description ?? '')
      setAccessibility((company.accessibility_features ?? []) as A11yFeature[])
      setInstagram(company.instagram ?? '')
      setFacebook(company.facebook ?? '')
      setTiktok(company.tiktok ?? '')
      setYoutube(company.youtube ?? '')
      setWebsite(company.website ?? '')
      setPhotos(company.company_photos.map(p => ({
        id:          p.id,
        previewUrl:  photoUrl(p.storage_path),
        storagePath: p.storage_path,
      })))
      setLoadingData(false)
    })
  }, [companyId])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())        e.name        = 'Nome é obrigatório'
    if (!category)           e.category    = 'Selecione uma categoria'
    if (!description.trim()) e.description = 'Descrição é obrigatória'
    if (!address.trim())     e.address     = 'Endereço é obrigatório'
    return e
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const newEntries: PhotoEntry[] = files.map(f => ({
      previewUrl: URL.createObjectURL(f),
      file: f,
    }))
    setPhotos(prev => [...prev, ...newEntries].slice(0, 10))
    e.target.value = ''
  }

  const removePhoto = async (index: number) => {
    const entry = photos[index]
    if (entry.id && entry.storagePath) {
      // Delete from storage + DB
      try { await deleteCompanyPhoto(entry.id, entry.storagePath) } catch {}
    }
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setGeneralError('')
    setLoading(true)

    try {
      const rawCnpj = cnpj.replace(/\D/g, '')
      const payload = {
        owner_id:               user.id,
        name:                   name.trim(),
        cnpj:                   rawCnpj,
        category:               category as CompanyCategory,
        description:            description.trim(),
        address:                address.trim(),
        city:                   city.trim() || null,
        state:                  state.trim().toUpperCase().slice(0, 2) || null,
        accessibility_features: accessibility,
        instagram:              instagram.trim() || null,
        facebook:               facebook.trim() || null,
        tiktok:                 tiktok.trim() || null,
        youtube:                youtube.trim() || null,
        website:                website.trim() || null,
      }

      let savedId = companyId
      if (isEdit) {
        await updateCompany(companyId!, payload)
      } else {
        const created = await createCompany(payload)
        savedId = created.id
      }

      // Upload new photos
      const newPhotos = photos.filter(p => p.file)
      for (const p of newPhotos) {
        if (p.file) await uploadCompanyPhoto(savedId!, p.file)
      }

      onSaved()
    } catch (err: any) {
      setGeneralError(err.message ?? 'Erro ao salvar empresa')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600,
    color: 'var(--c-text-2)', marginBottom: '0.375rem', transition: 'color 350ms ease',
  }
  const errorStyle: React.CSSProperties = { marginTop: '0.375rem', fontSize: '0.8125rem', color: '#ef4444' }

  if (loadingData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(26,122,255,0.2)', borderTopColor: '#1a7aff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <>
      <Grain />
      <ThemeToggle />

      <div className="r-layout-center" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5.5rem 1rem 3rem', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          <button type="button" onClick={() => onNavigate(isEdit ? 'my-companies' : 'myarea')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', padding: '0 0 1.5rem', cursor: 'pointer', color: 'var(--c-text-3)', fontSize: '0.875rem', fontFamily: 'inherit', transition: 'color 150ms ease' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}>
            <ArrowLeftIcon /> {isEdit ? 'Minhas empresas' : 'Minha área'}
          </button>

          <GlassCard variant="lg" className="r-form-card" style={{ padding: '2.5rem 2rem' }}>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src={pluraLogo} alt="Plura" style={{ height: '40px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.035em', color: 'var(--c-text-1)', marginBottom: '0.375rem', transition: 'color 350ms ease' }}>
                {isEdit ? 'Editar empresa' : 'Criar empresa'}
              </h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
                {isEdit ? 'Atualize as informações do seu negócio' : 'Cadastre seu negócio na plataforma'}
              </p>
            </div>

            {generalError && (
              <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.875rem', color: '#f87171' }}>
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* IDENTIFICAÇÃO */}
              <SectionLabel label="Identificação" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Nome da empresa" placeholder="Nome do seu negócio" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})) }} error={errors.name} leadingIcon={<BuildingIcon />} />
                <Input label="CNPJ" placeholder="00.000.000/0000-00" value={cnpj} onChange={e => setCnpj(maskCnpj(e.target.value))} inputMode="numeric" maxLength={18} />
              </div>

              {/* LOCALIZAÇÃO */}
              <SectionLabel label="Localização" />
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
                      value={address}
                      onChange={e => { setAddress(e.target.value); setErrors(p => ({...p, address: ''})) }}
                      error={errors.address}
                      autoComplete="street-address"
                      disabled={cepLoading}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      label="Cidade"
                      placeholder="São Paulo"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      disabled={cepLoading}
                    />
                  </div>
                  <div style={{ width: '80px', flexShrink: 0 }}>
                    <Input
                      label="UF"
                      placeholder="SP"
                      value={state}
                      onChange={e => setState(e.target.value.toUpperCase().slice(0, 2))}
                      maxLength={2}
                      disabled={cepLoading}
                    />
                  </div>
                </div>
                <Input label="Complemento" placeholder="Bairro, referência… (opcional)" value={complement} onChange={e => setComplement(e.target.value)} />
              </div>

              {/* APRESENTAÇÃO */}
              <SectionLabel label="Apresentação" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select value={category} onChange={e => { setCategory(e.target.value as CompanyCategory); setErrors(p => ({...p, category: ''})) }} style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', background: 'var(--c-input-bg)', border: errors.category ? '1px solid #ef4444' : '1px solid var(--c-input-border)', borderRadius: '0.875rem', color: category ? 'var(--c-input-text)' : 'var(--c-placeholder)', fontSize: '0.9375rem', fontFamily: 'inherit', outline: 'none', appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', transition: 'border 200ms ease, background 350ms ease', boxSizing: 'border-box' }}>
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.category && <p style={errorStyle}>{errors.category}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea placeholder="Conte sobre o negócio, diferenciais, o que oferece…" value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({...p, description: ''})) }} rows={4} style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--c-input-bg)', border: errors.description ? '1px solid #ef4444' : '1px solid var(--c-input-border)', borderRadius: '0.875rem', color: 'var(--c-input-text)', fontSize: '0.9375rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, minHeight: '100px', transition: 'border 200ms ease, background 350ms ease' }}
                    onFocus={e => { if (!errors.description) e.target.style.borderColor = 'rgba(26,122,255,0.6)' }}
                    onBlur={e => { if (!errors.description) e.target.style.borderColor = 'var(--c-input-border)' }} />
                  {errors.description && <p style={errorStyle}>{errors.description}</p>}
                </div>

                {/* Fotos */}
                <div>
                  <label style={labelStyle}>Fotos do empreendimento <span style={{ fontWeight: 400, color: 'var(--c-text-3)' }}>(até 10)</span></label>
                  <div className="r-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
                    {photos.map((entry, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.625rem', overflow: 'hidden', border: '1px solid var(--c-input-border)' }}>
                        <img src={entry.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <button type="button" onClick={() => photoRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '0.625rem', border: '1.5px dashed var(--c-input-border)', background: 'var(--c-glass-bg-sm)', cursor: 'pointer', color: 'var(--c-text-3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.6875rem', transition: 'border-color 150ms ease, color 150ms ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,122,255,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#6aadff' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-input-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-3)' }}>
                        <PlusIcon />
                        {photos.length === 0 && <span>Adicionar</span>}
                      </button>
                    )}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
                </div>
              </div>

              {/* ACESSIBILIDADE */}
              <SectionLabel label="Acessibilidade" />
              <AccessibilityChips selected={accessibility} onChange={setAccessibility} />
              <p style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)', transition: 'color 350ms ease' }}>
                Selecione os recursos disponíveis · múltipla escolha
              </p>

              {/* LINKS */}
              <SectionLabel label="Links e redes sociais" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Vídeo (YouTube)" placeholder="https://youtube.com/watch?v=..." value={youtube} onChange={e => setYoutube(e.target.value)} leadingIcon={<LinkIcon />} />
                <div className="r-social-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Input label="Instagram" placeholder="@usuario"       value={instagram} onChange={e => setInstagram(e.target.value)} />
                  <Input label="Facebook"  placeholder="@pagina"        value={facebook}  onChange={e => setFacebook(e.target.value)} />
                  <Input label="TikTok"    placeholder="@usuario"       value={tiktok}    onChange={e => setTiktok(e.target.value)} />
                  <Input label="Website"   placeholder="meusite.com.br" value={website}   onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>

              <Button type="submit" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}>
                {loading ? (isEdit ? 'Salvando…' : 'Criando empresa…') : (isEdit ? 'Salvar alterações' : 'Criar empresa')}
              </Button>

            </form>
          </GlassCard>

          <footer style={{ marginTop: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--c-text-4)', display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', transition: 'color 350ms ease' }}>
            <span>© 2026 Plura</span><span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Termos</a><span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.7 }}>Privacidade</a>
          </footer>

        </div>
      </div>

      <style>{`textarea::placeholder{color:var(--c-placeholder);}option{background:var(--c-option-bg)!important;color:var(--c-input-text);}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
