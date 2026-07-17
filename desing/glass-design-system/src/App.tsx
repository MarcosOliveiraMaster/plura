import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import './design-system/global.css'
import './design-system/responsive.css'
import { supabase } from './lib/supabase'
import HomePage           from './pages/HomePage'
import LoginPage          from './pages/LoginPage'
import SignUpPage         from './pages/SignUpPage'
import MyAreaPage         from './pages/MyAreaPage'
import CreateCompanyPage  from './pages/CreateCompanyPage'
import MyCompaniesPage    from './pages/MyCompaniesPage'
import CompanyProfilePage from './pages/CompanyProfilePage'
import AuthCallbackPage   from './pages/AuthCallbackPage'
import type { A11yFeature } from './lib/accessibilityMap'

export type Page =
  | 'home' | 'login' | 'signup' | 'myarea'
  | 'create-company' | 'edit-company' | 'my-companies'
  | 'company-profile' | 'auth-callback'

/* ─── Loading spinner ────────────────────────────────────────────────────── */
function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
  const [page,            setPage]            = useState<Page>('home')
  const [user,            setUser]            = useState<User | null>(null)
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null)
  const [companyFromPage, setCompanyFromPage] = useState<Page>('home')
  const [initializing,    setInitializing]    = useState(true)
  const [pendingA11yFilter, setPendingA11yFilter] = useState<A11yFeature[] | null>(null)
  const isAuthCallback    = useRef(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('error='))) {
      isAuthCallback.current = true
      setPage('auth-callback')
      window.history.replaceState(null, '', window.location.pathname)
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      // Sempre inicia na home — usuário logado vê botão "Minha Área"
      if (!isAuthCallback.current) setPage('home')
      setInitializing(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!isAuthCallback.current && u && event === 'SIGNED_IN') {
        setPage('myarea')
      }
      if (event === 'SIGNED_OUT') {
        isAuthCallback.current = false
        setPage('home')
        setActiveCompanyId(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const navigate = (p: Page) => setPage(p)

  const searchNextDestination = (a11yFilter: A11yFeature[]) => {
    setPendingA11yFilter(a11yFilter)
    setPage('home')
  }

  const viewCompany = (id: string) => {
    setCompanyFromPage(page)
    setActiveCompanyId(id)
    setPage('company-profile')
  }

  const editCompany = (id: string) => {
    setActiveCompanyId(id)
    setPage('edit-company')
  }

  if (initializing) return <Loader />

  // Páginas públicas — acessíveis sem sessão
  if (page === 'home') return (
    <HomePage
      user={user}
      onNavigate={navigate}
      onViewCompany={viewCompany}
      initialA11yFilter={pendingA11yFilter}
      onPrefillConsumed={() => setPendingA11yFilter(null)}
    />
  )
  if (page === 'signup') return <SignUpPage onNavigate={navigate} />
  if (page === 'login')  return <LoginPage  onNavigate={navigate} />
  if (page === 'auth-callback') return (
    <AuthCallbackPage
      user={user}
      onNavigate={p => { isAuthCallback.current = false; navigate(p) }}
    />
  )
  // Perfil de empresa é público
  if (page === 'company-profile' && activeCompanyId) return (
    <CompanyProfilePage
      user={user}
      companyId={activeCompanyId}
      onNavigate={navigate}
      onEditCompany={editCompany}
      backPage={companyFromPage}
    />
  )

  // A partir daqui requer usuário autenticado
  if (!user) return <HomePage user={null} onNavigate={navigate} onViewCompany={viewCompany} />

  if (page === 'myarea') return (
    <MyAreaPage
      user={user}
      onNavigate={navigate}
      onViewCompany={viewCompany}
      onSearchNextDestination={searchNextDestination}
    />
  )
  if (page === 'create-company') return (
    <CreateCompanyPage user={user} onNavigate={navigate} onSaved={() => navigate('my-companies')} />
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

  return (
    <MyAreaPage
      user={user}
      onNavigate={navigate}
      onViewCompany={viewCompany}
      onSearchNextDestination={searchNextDestination}
    />
  )
}
