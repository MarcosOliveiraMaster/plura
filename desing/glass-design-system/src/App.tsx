import { useState } from 'react'
import './design-system/global.css'
import './design-system/responsive.css'
import LoginPage          from './pages/LoginPage'
import SignUpPage         from './pages/SignUpPage'
import MyAreaPage         from './pages/MyAreaPage'
import CreateCompanyPage  from './pages/CreateCompanyPage'
import MyCompaniesPage    from './pages/MyCompaniesPage'
import CompanyProfilePage from './pages/CompanyProfilePage'

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type Page =
  | 'login' | 'signup' | 'myarea'
  | 'create-company' | 'edit-company' | 'my-companies'
  | 'company-profile'

export interface Collaborator {
  id: string
  email: string
  name?: string
  status: 'pending' | 'accepted'
}

export interface Company {
  id: string
  name: string
  cnpj: string
  category: string
  categoryLabel: string
  description: string
  address: string
  photos: string[]
  accessibility: string[]
  instagram?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  website?: string
  createdAt: string
  collaborators: Collaborator[]
}

export interface Notification {
  id: string
  type: 'company-invite'
  companyId: string
  companyName: string
  companyCategory: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */
const MOCK_COMPANY: Company = {
  id:            'mock-vista-verde',
  name:          'Pousada Vista Verde',
  cnpj:          '12.345.678/0001-90',
  category:      'pousada',
  categoryLabel: 'Pousada',
  description:   'Pousada charmosa no coração histórico de Paraty, com jardim tropical, piscina natural e café da manhã incluso. A 5 minutos a pé do centro histórico e das trilhas da Mata Atlântica.',
  address:       'Rua do Comércio, 45 — Centro Histórico, Paraty - RJ, 23970-000',
  photos:        [],
  accessibility: ['rampa', 'banheiro', 'vaga-pcd', 'piso-tatil', 'cadeira-rodas'],
  instagram:     '@pousadavistaverde',
  website:       'pousadavistaverde.com.br',
  youtube:       'https://youtube.com/@pousadavistaverde',
  createdAt:     '2026-01-15',
  collaborators: [
    { id: 'c1', email: 'ana.silva@email.com',   name: 'Ana Silva',   status: 'accepted' },
    { id: 'c2', email: 'pedro.costa@email.com', name: 'Pedro Costa', status: 'pending'  },
  ],
}

const MOCK_INVITE_COMPANY: Company = {
  id:            'invite-hostel-sul',
  name:          'Hostel Trilhas do Sul',
  cnpj:          '98.765.432/0001-10',
  category:      'hostel',
  categoryLabel: 'Hostel',
  description:   'Hostel aconchegante no coração da Serra Gaúcha, com vista para as montanhas, trilhas ecológicas ao redor e café colonial incluso.',
  address:       'Estrada das Bromélias, 234 — Canela, RS, 95680-000',
  photos:        [],
  accessibility: ['rampa', 'banheiro'],
  instagram:     '@hosteltrilhasdosul',
  website:       'hosteltrilhasdosul.com.br',
  createdAt:     '2025-11-20',
  collaborators: [],
}

const INITIAL_NOTIFICATION: Notification = {
  id:              'notif-1',
  type:            'company-invite',
  companyId:       'invite-hostel-sul',
  companyName:     'Hostel Trilhas do Sul',
  companyCategory: 'Hostel',
  invitedBy:       'Maria Santos',
  status:          'pending',
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page,                   setPage]                   = useState<Page>('login')
  const [companies,              setCompanies]              = useState<Company[]>([MOCK_COMPANY])
  const [notifications,          setNotifications]          = useState<Notification[]>([INITIAL_NOTIFICATION])
  const [collaboratingCompanies, setCollaboratingCompanies] = useState<Company[]>([])
  const [activeCompanyId,        setActiveCompanyId]        = useState<string | null>(null)

  const allCompanies = [...companies, ...collaboratingCompanies]
  const activeCompany = allCompanies.find(c => c.id === activeCompanyId) ?? null

  /* company handlers */
  const handleSaveCompany = (company: Company) => {
    setCompanies(prev => {
      const exists = prev.some(c => c.id === company.id)
      return exists ? prev.map(c => c.id === company.id ? company : c) : [...prev, company]
    })
    setPage('my-companies')
  }

  const handleEditCompany = (companyId: string) => {
    setActiveCompanyId(companyId)
    setPage('edit-company')
  }

  const handleViewCompany = (companyId: string) => {
    setActiveCompanyId(companyId)
    setPage('company-profile')
  }

  const handleAddCollaborator = (companyId: string, email: string) => {
    const collab: Collaborator = {
      id:     Date.now().toString(),
      email,
      status: 'pending',
    }
    setCompanies(prev => prev.map(c =>
      c.id === companyId ? { ...c, collaborators: [...c.collaborators, collab] } : c
    ))
  }

  const handleRemoveCollaborator = (companyId: string, collaboratorId: string) => {
    setCompanies(prev => prev.map(c =>
      c.id === companyId
        ? { ...c, collaborators: c.collaborators.filter(col => col.id !== collaboratorId) }
        : c
    ))
  }

  /* notification handlers */
  const handleAcceptInvite = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId)
    if (!notif) return
    if (notif.companyId === MOCK_INVITE_COMPANY.id) {
      setCollaboratingCompanies(prev => [...prev, MOCK_INVITE_COMPANY])
    }
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, status: 'accepted' } : n
    ))
  }

  const handleDeclineInvite = (notificationId: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, status: 'declined' } : n
    ))
  }

  /* render */
  if (page === 'signup') return <SignUpPage onNavigate={setPage} />

  if (page === 'myarea') return (
    <MyAreaPage
      onNavigate={setPage}
      notifications={notifications}
      collaboratingCompanies={collaboratingCompanies}
      onAcceptInvite={handleAcceptInvite}
      onDeclineInvite={handleDeclineInvite}
      onViewCompany={handleViewCompany}
    />
  )

  if (page === 'create-company') return (
    <CreateCompanyPage onNavigate={setPage} onSave={handleSaveCompany} />
  )

  if (page === 'edit-company' && activeCompany) return (
    <CreateCompanyPage onNavigate={setPage} onSave={handleSaveCompany} initialData={activeCompany} />
  )

  if (page === 'my-companies') return (
    <MyCompaniesPage
      onNavigate={setPage}
      companies={companies}
      onEditCompany={handleEditCompany}
      onViewCompany={handleViewCompany}
    />
  )

  if (page === 'company-profile' && activeCompany) return (
    <CompanyProfilePage
      onNavigate={setPage}
      company={activeCompany}
      isOwner={companies.some(c => c.id === activeCompany.id)}
      onAddCollaborator={handleAddCollaborator}
      onRemoveCollaborator={handleRemoveCollaborator}
      onEditCompany={handleEditCompany}
    />
  )

  return <LoginPage onNavigate={setPage} />
}
