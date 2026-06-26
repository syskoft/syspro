import { supabase } from '@/lib/supabase'
import type { Emp, SusTip, User } from '@/types/database'

// ── EMPRESAS ────────────────────────────────────────

export async function fetchEmpresas(filters?: Record<string, string>): Promise<Emp[]> {
  let query = supabase.from('empresas').select('*').order('created_at', { ascending: false })
  if (filters?.search) {
    query = query.or(`nom_com.ilike.%${filters.search}%,ide_emp.ilike.%${filters.search}%,ciu.ilike.%${filters.search}%`)
  }
  if (filters?.ina === 'activas') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivas') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateEmpresa(emp_ide: string, updates: Partial<Emp>) {
  const { error } = await supabase.from('empresas').update(updates).eq('emp_ide', emp_ide)
  if (error) throw error
}

export async function createEmpresa(data: Partial<Emp>) {
  const { error } = await supabase.from('empresas').insert(data)
  if (error) throw error
}

export async function deleteEmpresa(emp_ide: string) {
  const { error } = await supabase.from('empresas').delete().eq('emp_ide', emp_ide)
  if (error) throw error
}

// ── PLANES ──────────────────────────────────────────

export async function fetchPlanes(filters?: Record<string, string>): Promise<SusTip[]> {
  let query = supabase.from('tipos_suscripcion').select('*').order('ide')
  if (filters?.search) query = query.ilike('nom_sus_emp', `%${filters.search}%`)
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createPlan(plan: Partial<SusTip>) {
  const { error } = await supabase.from('tipos_suscripcion').insert(plan)
  if (error) throw error
}

export async function updatePlan(ide: number, updates: Partial<SusTip>) {
  const { error } = await supabase.from('tipos_suscripcion').update(updates).eq('ide', ide)
  if (error) throw error
}

export async function deletePlan(ide: number) {
  const { error } = await supabase.from('tipos_suscripcion').delete().eq('ide', ide)
  if (error) throw error
}

// ── SUSCRIPCIONES ───────────────────────────────────

export async function fetchSuscripciones(filters?: Record<string, string>): Promise<any[]> {
  let query = supabase
    .from('suscripciones')
    .select('*, empresas!inner(emp_ide, nom_com), tipos_suscripcion!inner(ide, nom_sus_emp)')
    .order('created_at', { ascending: false })
  if (filters?.emp_ide) query = query.eq('emp_ide', filters.emp_ide)
  if (filters?.sus_emp) query = query.eq('sus_emp', Number(filters.sus_emp))
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createSuscripcion(sub: { emp_ide: string; sus_emp: number; fec_ini: string; fec_fin: string; num_mes: number }) {
  const { error } = await supabase.from('suscripciones').insert(sub)
  if (error) throw error
}

export async function updateSuscripcion(ide: number, updates: { fec_ini?: string; fec_fin?: string; num_mes?: number }) {
  const { error } = await supabase.from('suscripciones').update(updates).eq('ide', ide)
  if (error) throw error
}

export async function deleteSuscripcion(ide: number) {
  const { error } = await supabase.from('suscripciones').delete().eq('ide', ide)
  if (error) throw error
}

// ── USUARIOS GLOBAL ────────────────────────────────

export async function fetchUsuarios(filters?: Record<string, string>): Promise<User[]> {
  let query = supabase.from('usuarios').select('*').order('created_at', { ascending: false })
  if (filters?.search) query = query.or(`usu.ilike.%${filters.search}%,mail.ilike.%${filters.search}%`)
  if (filters?.role) query = query.eq('role', filters.role)
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateUsuario(id: string, updates: Partial<User>) {
  const { error } = await supabase.from('usuarios').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteUsuario(id: string) {
  const { error } = await supabase.from('usuarios').delete().eq('id', id)
  if (error) throw error
}
