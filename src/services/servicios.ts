import { supabase } from '@/lib/supabase'
import type { Servicio } from '@/types/database'

export async function fetchServicios(emp_ide: string, filters?: Record<string, string>): Promise<Servicio[]> {
  let q = supabase.from('servicios').select('*').eq('emp_ide', emp_ide).order('codigo')
  if (filters?.search) q = q.or(`codigo.ilike.%${filters.search}%,nombre.ilike.%${filters.search}%`)
  if (filters?.ina === 'activos') q = q.eq('ina', false)
  else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
  const { data, error } = await q
  if (error) throw error; return data ?? []
}

export async function createServicio(emp_ide: string, data: Partial<Servicio>) {
  const { data: r, error } = await supabase.from('servicios').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error; return r as { ide: number }
}

export async function updateServicio(emp_ide: string, ide: number, data: Partial<Servicio>) {
  const { error } = await supabase.from('servicios').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteServicio(emp_ide: string, ide: number) {
  const { error } = await supabase.from('servicios').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
