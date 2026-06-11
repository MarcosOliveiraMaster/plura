import { supabase, STORAGE_BUCKET, getPhotoUrl } from './supabase'
import type { Database } from './database.types'

type A11yNeed      = Database['public']['Enums']['user_accessibility_need']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']

/* ─── Profile ─────────────────────────────────────────────────────────────── */

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: {
  name?: string
  accessibility_needs?: A11yNeed[]
  avatar_url?: string
  cep?: string | null
  address?: string | null
  complement?: string | null
}) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (upErr) throw upErr

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  const url = `${data.publicUrl}?t=${Date.now()}`

  await updateProfile(userId, { avatar_url: data.publicUrl })
  return url
}

/* ─── Companies ───────────────────────────────────────────────────────────── */

const COMPANY_SELECT = `
  *,
  company_photos (id, storage_path, is_cover, order_index),
  collaborators (
    id, email, user_id, status, invited_by,
    profiles!collaborators_user_id_fkey (name, email)
  )
`

export type CompanyFull = Database['public']['Tables']['companies']['Row'] & {
  company_photos: Database['public']['Tables']['company_photos']['Row'][]
  collaborators: (Database['public']['Tables']['collaborators']['Row'] & {
    profiles: { name: string | null; email: string } | null
  })[]
}

export type CompanyCard = {
  id: string
  name: string
  category: Database['public']['Tables']['companies']['Row']['category']
  city: string | null
  state: string | null
  description: string | null
  accessibility_features: Database['public']['Tables']['companies']['Row']['accessibility_features']
  company_photos: { id: string; storage_path: string; is_cover: boolean | null; order_index: number | null }[]
}

export async function getAllCompanies(): Promise<CompanyCard[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, category, city, state, description, accessibility_features, company_photos(id, storage_path, is_cover, order_index)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CompanyCard[]
}

export async function getMyCompanies(userId: string): Promise<CompanyFull[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(COMPANY_SELECT)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as CompanyFull[]
}

export async function getCollaboratingCompanies(userId: string): Promise<CompanyFull[]> {
  const { data, error } = await supabase
    .from('collaborators')
    .select(`companies (${COMPANY_SELECT})`)
    .eq('user_id', userId)
    .eq('status', 'accepted')
  if (error) throw error
  return (data ?? []).map((d: any) => d.companies).filter(Boolean) as CompanyFull[]
}

export async function getCompanyById(id: string): Promise<CompanyFull | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(COMPANY_SELECT)
    .eq('id', id)
    .single()
  if (error) return null
  return data as CompanyFull
}

export async function createCompany(insert: CompanyInsert): Promise<CompanyFull> {
  const { data, error } = await supabase
    .from('companies').insert(insert).select(COMPANY_SELECT).single()
  if (error) throw error
  return data as CompanyFull
}

export async function updateCompany(id: string, updates: Partial<CompanyInsert>) {
  const { error } = await supabase.from('companies').update(updates).eq('id', id)
  if (error) throw error
}

/* ─── Photos ──────────────────────────────────────────────────────────────── */

export async function uploadCompanyPhoto(companyId: string, file: File): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg'
  const path = `${companyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file)
  if (upErr) throw upErr

  const { error: dbErr } = await supabase
    .from('company_photos')
    .insert({ company_id: companyId, storage_path: path })
  if (dbErr) throw dbErr

  return path
}

export async function deleteCompanyPhoto(photoId: string, storagePath: string) {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
  const { error } = await supabase.from('company_photos').delete().eq('id', photoId)
  if (error) throw error
}

export function photoUrl(storagePath: string) {
  return getPhotoUrl(storagePath)
}

/* ─── Collaborators ───────────────────────────────────────────────────────── */

export async function inviteCollaborator(
  companyId: string,
  email: string,
  invitedBy: string
) {
  const { data: collab, error } = await supabase
    .from('collaborators')
    .insert({ company_id: companyId, email: email.toLowerCase(), invited_by: invitedBy })
    .select()
    .single()
  if (error) throw error

  // If user already exists, link and notify them
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (profile) {
    await supabase.from('collaborators').update({ user_id: profile.id }).eq('id', collab.id)
    const { error: notifErr } = await supabase.from('notifications').insert({
      user_id:         profile.id,
      type:            'company_invite',
      company_id:      companyId,
      collaborator_id: collab.id,
    })
    if (notifErr) throw new Error(`Erro ao criar notificação: ${notifErr.message}`)
  }

  return collab
}

export async function removeCollaborator(collaboratorId: string) {
  const { error } = await supabase.from('collaborators').delete().eq('id', collaboratorId)
  if (error) throw error
}

export async function respondToInvite(collaboratorId: string, accept: boolean) {
  const status = accept ? 'accepted' : 'declined'
  const updates: { status: string; user_id?: string } = { status }

  if (accept) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) updates.user_id = user.id
  }

  const { error } = await supabase
    .from('collaborators').update(updates).eq('id', collaboratorId)
  if (error) throw error
}

/* ─── Notifications ───────────────────────────────────────────────────────── */

export type NotificationFull = Database['public']['Tables']['notifications']['Row'] & {
  companies: { name: string; category: string } | null
  collaborators: {
    id: string
    email: string
    invited_by: string
    inviter: { name: string | null; email: string } | null
  } | null
}

export async function getNotifications(userId: string): Promise<NotificationFull[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      companies (name, category),
      collaborators (
        id, email, invited_by,
        inviter:profiles!collaborators_invited_by_fkey (name, email)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as NotificationFull[]
}

export async function markNotificationRead(notificationId: string) {
  await supabase.from('notifications').update({ status: 'read' }).eq('id', notificationId)
}
