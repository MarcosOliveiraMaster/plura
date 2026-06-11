import { useState, useRef } from 'react'
import { GlassCard }   from '../components/GlassCard'
import { Input }       from '../components/Input'
import { Button }      from '../components/Button'
import { ThemeToggle } from '../components/ThemeToggle'
import pluraLogo       from '../assets/plura.png'
import type { Page, Company } from '../App'

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

/* ─── SectionLabel ──────────────────────────────────────────────────────── */
const SectionLabel = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.75rem 0 1.25rem' }}>
    <span style={{
      fontSize: '0.6875rem', fontFamily: 'var(--font-mono)',
      color: 'var(--c-text-blue)', letterSpacing: '0.12em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
      transition: 'color 350ms ease',
    }}>{label}</span>
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
const CATEGORIES = [
  { value: 'hotel',            label: 'Hotel' },
  { value: 'hostel',           label: 'Hostel' },
  { value: 'pousada',          label: 'Pousada' },
  { value: 'bar',              label: 'Bar' },
  { value: 'restaurante',      label: 'Restaurante' },
  { value: 'cafe',             label: 'Café' },
  { value: 'espaco-eventos',   label: 'Espaço de Eventos' },
  { value: 'passeio-turistico',label: 'Passeio Turístico' },
  { value: 'museu',            label: 'Museu' },
  { value: 'parque',           label: 'Parque / Área Verde' },
  { value: 'academia',         label: 'Academia / Esporte' },
  { value: 'clinica',          label: 'Clínica / Saúde' },
  { value: 'outros',           label: 'Outros' },
]

const A11Y_OPTIONS = [
  { id: 'rampa',           label: 'Rampa de acesso' },
  { id: 'elevador',        label: 'Elevador acessível' },
  { id: 'banheiro',        label: 'Banheiro adaptado' },
  { id: 'vaga-pcd',        label: 'Vaga PCD' },
  { id: 'piso-tatil',      label: 'Piso tátil' },
  { id: 'libras',          label: 'Atendimento em Libras' },
  { id: 'braile',          label: 'Materiais em Braille' },
  { id: 'cadeira-rodas',   label: 'Cadeira de rodas' },
  { id: 'audiodescricao',  label: 'Audiodescrição' },
  { id: 'entrada-acessivel', label: 'Entrada acessível' },
]

/* ─── AccessibilityChips ─────────────────────────────────────────────────── */
const AccessibilityChips = ({
  selected, onChange,
}: { selected: string[]; onChange: (ids: string[]) => void }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
    {A11Y_OPTIONS.map(opt => {
      const active = selected.includes(opt.id)
      return (
        <button
          key={opt.id} type="button"
          onClick={() => onChange(active
            ? selected.filter(s => s !== opt.id)
            : [...selected, opt.id]
          )}
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

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)
const BuildingIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const LinkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5"  y1="12" x2="19" y2="12"/>
  </svg>
)
const XIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
)

/* ─── CreateCompanyPage ──────────────────────────────────────────────────── */
interface CreateCompanyPageProps {
  onNavigate:   (page: Page) => void
  onSave:       (company: Company) => void
  initialData?: Company
}

export default function CreateCompanyPage({ onNavigate, onSave, initialData }: CreateCompanyPageProps) {
  const isEdit = !!initialData

  const [name,          setName]          = useState(initialData?.name          ?? '')
  const [cnpj,          setCnpj]          = useState(initialData?.cnpj          ?? '')
  const [cep,           setCep]           = useState('')
  const [address,       setAddress]       = useState(initialData?.address       ?? '')
  const [complement,    setComplement]    = useState('')
  const [category,      setCategory]      = useState(initialData?.category      ?? '')
  const [description,   setDescription]   = useState(initialData?.description   ?? '')
  const [photos,        setPhotos]        = useState<string[]>(initialData?.photos ?? [])
  const [accessibility, setAccessibility] = useState<string[]>(initialData?.accessibility ?? [])
  const [youtube,       setYoutube]       = useState(initialData?.youtube       ?? '')
  const [instagram,     setInstagram]     = useState(initialData?.instagram     ?? '')
  const [facebook,      setFacebook]      = useState(initialData?.facebook      ?? '')
  const [tiktok,        setTiktok]        = useState(initialData?.tiktok        ?? '')
  const [website,       setWebsite]       = useState(initialData?.website       ?? '')
  const [loading,       setLoading]       = useState(false)
  const [errors,        setErrors]        = useState<Record<string, string>>({})

  const photoRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())        e.name        = 'Nome é obrigatório'
    if (!category)           e.category    = 'Selecione uma categoria'
    if (!description.trim()) e.description = 'Descrição é obrigatória'
    if (!address.trim())     e.address     = 'Endereço é obrigatório'
    return e
  }

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urls = Array.from(e.target.files || []).map(f => URL.createObjectURL(f))
    setPhotos(prev => [...prev, ...urls].slice(0, 8))
    e.target.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    const categoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? category
    setTimeout(() => {
      setLoading(false)
      onSave({
        id:            initialData?.id ?? Date.now().toString(),
        name:          name.trim(),
        cnpj,
        category,
        categoryLabel,
        description:   description.trim(),
        address:       [address.trim(), complement.trim()].filter(Boolean).join(' — ') || initialData?.address || '',
        photos,
        accessibility,
        youtube:       youtube   || undefined,
        instagram:     instagram || undefined,
        facebook:      facebook  || undefined,
        tiktok:        tiktok    || undefined,
        website:       website   || undefined,
        createdAt:     initialData?.createdAt ?? new Date().toISOString().split('T')[0],
        collaborators: initialData?.collaborators ?? [],
      })
    }, 1800)
  }

  /* shared textarea/select label style */
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600,
    color: 'var(--c-text-2)', marginBottom: '0.375rem',
    transition: 'color 350ms ease',
  }
  const errorStyle: React.CSSProperties = {
    marginTop: '0.375rem', fontSize: '0.8125rem', color: '#ef4444',
  }

  return (
    <>
      <Grain />
      <ThemeToggle />

      <div className="r-layout-center" style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '5.5rem 1rem 3rem',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: '560px' }}>

          {/* Back */}
          <button
            type="button"
            onClick={() => onNavigate(isEdit ? 'my-companies' : 'myarea')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: 'none', padding: '0 0 1.5rem',
              cursor: 'pointer', color: 'var(--c-text-3)',
              fontSize: '0.875rem', fontFamily: 'inherit',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-1)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
          >
            <ArrowLeftIcon /> Minha área
          </button>

          <GlassCard variant="lg" className="r-form-card" style={{ padding: '2.5rem 2rem' }}>

            {/* Logo + title */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src={pluraLogo} alt="Plura" style={{ height: '40px', objectFit: 'contain', userSelect: 'none' }} draggable={false} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h1 style={{
                fontSize: '1.5rem', fontWeight: 800,
                letterSpacing: '-0.035em', color: 'var(--c-text-1)',
                marginBottom: '0.375rem', transition: 'color 350ms ease',
              }}>{isEdit ? 'Editar empresa' : 'Criar empresa'}</h1>
              <p style={{ fontSize: '0.9375rem', color: 'var(--c-text-2)', transition: 'color 350ms ease' }}>
                {isEdit ? 'Atualize as informações do seu negócio' : 'Cadastre seu negócio na plataforma'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* ══ IDENTIFICAÇÃO ══════════════════════════════════════════ */}
              <SectionLabel label="Identificação" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Nome da empresa"
                  placeholder="Nome do seu negócio"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})) }}
                  error={errors.name}
                  leadingIcon={<BuildingIcon />}
                />
                <Input
                  label="CNPJ"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={e => setCnpj(maskCnpj(e.target.value))}
                  inputMode="numeric"
                  maxLength={18}
                />
              </div>

              {/* ══ LOCALIZAÇÃO ════════════════════════════════════════════ */}
              <SectionLabel label="Localização" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="r-addr-row" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div className="r-cep-field" style={{ width: '140px', flexShrink: 0 }}>
                    <Input
                      label="CEP"
                      placeholder="00000-000"
                      value={cep}
                      onChange={e => setCep(maskCep(e.target.value))}
                      inputMode="numeric"
                      maxLength={9}
                      leadingIcon={<MapPinIcon />}
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
                    />
                  </div>
                </div>
                <Input
                  label="Complemento"
                  placeholder="Bairro, cidade, estado… (opcional)"
                  value={complement}
                  onChange={e => setComplement(e.target.value)}
                />
              </div>

              {/* ══ APRESENTAÇÃO ═══════════════════════════════════════════ */}
              <SectionLabel label="Apresentação" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Categoria */}
                <div>
                  <label style={labelStyle}>Categoria</label>
                  <select
                    value={category}
                    onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})) }}
                    style={{
                      width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem',
                      background: 'var(--c-input-bg)',
                      border: errors.category ? '1px solid #ef4444' : '1px solid var(--c-input-border)',
                      borderRadius: '0.875rem',
                      color: category ? 'var(--c-input-text)' : 'var(--c-placeholder)',
                      fontSize: '0.9375rem', fontFamily: 'inherit',
                      outline: 'none', appearance: 'none', cursor: 'pointer',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      transition: 'border 200ms ease, background 350ms ease, color 350ms ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p style={errorStyle}>{errors.category}</p>}
                </div>

                {/* Descrição */}
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea
                    placeholder="Conte sobre o negócio, diferenciais, o que oferece…"
                    value={description}
                    onChange={e => { setDescription(e.target.value); setErrors(p => ({...p, description: ''})) }}
                    rows={4}
                    style={{
                      width: '100%', padding: '0.75rem 1rem',
                      background: 'var(--c-input-bg)',
                      border: errors.description ? '1px solid #ef4444' : '1px solid var(--c-input-border)',
                      borderRadius: '0.875rem', color: 'var(--c-input-text)',
                      fontSize: '0.9375rem', fontFamily: 'inherit',
                      outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                      lineHeight: 1.6, minHeight: '100px',
                      transition: 'border 200ms ease, background 350ms ease, color 350ms ease',
                    }}
                    onFocus={e => { if (!errors.description) e.target.style.borderColor = 'rgba(26,122,255,0.6)' }}
                    onBlur={e => { if (!errors.description) e.target.style.borderColor = 'var(--c-input-border)' }}
                  />
                  {errors.description && <p style={errorStyle}>{errors.description}</p>}
                </div>

                {/* Fotos */}
                <div>
                  <label style={labelStyle}>
                    Fotos do empreendimento{' '}
                    <span style={{ fontWeight: 400, color: 'var(--c-text-3)' }}>(até 8)</span>
                  </label>
                  <div className="r-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {photos.map((url, i) => (
                      <div key={i} style={{
                        position: 'relative', aspectRatio: '1',
                        borderRadius: '0.625rem', overflow: 'hidden',
                        border: '1px solid var(--c-input-border)',
                      }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            width: '20px', height: '20px',
                            background: 'rgba(0,0,0,0.65)', border: 'none',
                            borderRadius: '50%', cursor: 'pointer', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))}
                    {photos.length < 8 && (
                      <button
                        type="button"
                        onClick={() => photoRef.current?.click()}
                        style={{
                          aspectRatio: '1', borderRadius: '0.625rem',
                          border: '1.5px dashed var(--c-input-border)',
                          background: 'var(--c-glass-bg-sm)', cursor: 'pointer',
                          color: 'var(--c-text-3)',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: '0.25rem', fontSize: '0.6875rem',
                          transition: 'border-color 150ms ease, color 150ms ease',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(26,122,255,0.5)'
                          ;(e.currentTarget as HTMLButtonElement).style.color = '#6aadff'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--c-input-border)'
                          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--c-text-3)'
                        }}
                      >
                        <PlusIcon />
                        {photos.length === 0 && <span>Adicionar</span>}
                      </button>
                    )}
                  </div>
                  <input
                    ref={photoRef} type="file" accept="image/*" multiple
                    onChange={handlePhotos} style={{ display: 'none' }}
                  />
                </div>

              </div>

              {/* ══ ACESSIBILIDADE ═════════════════════════════════════════ */}
              <SectionLabel label="Acessibilidade" />
              <AccessibilityChips selected={accessibility} onChange={setAccessibility} />
              <p style={{
                marginTop: '0.625rem', fontSize: '0.75rem',
                color: 'var(--c-text-3)', fontFamily: 'var(--font-mono)',
                transition: 'color 350ms ease',
              }}>
                Selecione os recursos disponíveis · múltipla escolha
              </p>

              {/* ══ LINKS ══════════════════════════════════════════════════ */}
              <SectionLabel label="Links e redes sociais" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input
                  label="Vídeo (YouTube)"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtube}
                  onChange={e => setYoutube(e.target.value)}
                  leadingIcon={<LinkIcon />}
                />
                <div className="r-social-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Input label="Instagram" placeholder="@usuario" value={instagram} onChange={e => setInstagram(e.target.value)} />
                  <Input label="Facebook"  placeholder="@pagina"  value={facebook}  onChange={e => setFacebook(e.target.value)} />
                  <Input label="TikTok"    placeholder="@usuario" value={tiktok}    onChange={e => setTiktok(e.target.value)} />
                  <Input label="Website"   placeholder="meusite.com.br" value={website} onChange={e => setWebsite(e.target.value)} />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                loading={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}
              >
                {loading ? (isEdit ? 'Salvando…' : 'Criando empresa…') : (isEdit ? 'Salvar alterações' : 'Criar empresa')}
              </Button>

            </form>

          </GlassCard>

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

      <style>{`
        textarea::placeholder { color: var(--c-placeholder); }
        option { background: var(--c-option-bg) !important; color: var(--c-input-text); }
      `}</style>
    </>
  )
}
