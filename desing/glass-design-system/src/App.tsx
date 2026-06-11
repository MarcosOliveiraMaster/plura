import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import './design-system/global.css'
import './design-system/responsive.css'
import { supabase } from './lib/supabase'
import LoginPage          from './pages/LoginPage'
import SignUpPage         from './pages/SignUpPage'
import MyAreaPage         from './pages/MyAreaPage'
import CreateCompanyPage  from './pages/CreateCompanyPage'
import MyCompaniesPage    from './pages/MyCompaniesPage'
import CompanyProfilePage from './pages/CompanyProfilePage'

export type Page =
  | 'login' | 'signup' | 'myarea'
  | 'create-company' | 'edit-company' | 'my-companies'
  | 'company-profile'

/* ─── Loading spinner ────────────────────────────────────────────────────── */
function Loader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '2rem', height: '2rem',
        border: '2px solid rgba(26,122,255,0.2)',
        borderTopColor: '#1a7aff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page,            setPage]            = useState<Page>('login')
  const [user,            setUser]            = useState<User | null>(null)
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [initializing,    setInitializing]    = useState(true)

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) setPage('myarea')
      setInitializing(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setPage('myarea')
      }
      if (event === 'SIGNED_OUT') {
        setPage('login')
        setActiveCompanyId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const navigate = (p: Page) => setPage(p)

  const viewCompany = (id: string) => {
    setActiveCompanyId(id)
    setPage('company-profile')
  }

  const editCompany = (id: string) => {
    setActiveCompanyId(id)
    setPage('edit-company')
  }

  if (initializing) return <Loader />

  if (!user || page === 'login')  return <LoginPage  onNavigate={navigate} />
  if (page === 'signup')          return <SignUpPage  onNavigate={navigate} />

  if (page === 'myarea') return (
    <MyAreaPage user={user} onNavigate={navigate} onViewCompany={viewCompany} />
  )

  if (page === 'create-company') return (
    <CreateCompanyPage
      user={user}
      onNavigate={navigate}
      onSaved={() => navigate('my-companies')}
    />
  )

  if (page === 'edit-company' && activeCompanyId) return (
    <CreateCompanyPage
      user={user}
      companyId={activeCompanyId}
      onNavigate={navigate}
      onSaved={() => navigate('my-companies')}
    />
  )

  if (page === 'my-companies') return (
    <MyCompaniesPage
      user={user}
      onNavigate={navigate}
      onEditCompany={editCompany}
      onViewCompany={viewCompany}
    />
  )

  if (page === 'company-profile' && activeCompanyId) return (
    <CompanyProfilePage
      user={user}
      companyId={activeCompanyId}
      onNavigate={navigate}
      onEditCompany={editCompany}
    />
  )

  return <MyAreaPage user={user} onNavigate={navigate} onViewCompany={viewCompany} />
}
