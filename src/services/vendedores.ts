import { supabase } from '@/lib/supabase'
import type { Vendedor } from '@/types/database'

export async function fetchVendedores(emp_ide: string, filters?: Record<string, string>): Promise<(Vendedor & { tercero_nombre?: string })[]> {
  let q = supabase.from('vendedores').select('*').eq('emp_ide', emp_ide).order('codigo')
  if (filters?.search) q = q.or(`codigo.ilike.%${filters.search}%,tercero.nombre.ilike.%${filters.search}%`)
  if (filters?.ina === 'activos') q = q.eq('ina', false)
  else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
  const { data, error } = await q
  if (error) throw error
  const enriched = await Promise.all((data ?? []).map(async (v) => {
    const { data: t } = await supabase.from('terceros').select('nombre').eq('emp_ide', emp_ide).eq('ide', v.tercero_ide).single()
    return { ...v, tercero_nombre: t?.nombre ?? '' }
  }))
  return enriched
}

export async function createVendedor(emp_ide: string, data: Partial<Vendedor>) {
  const { data: r, error } = await supabase.from('vendedores').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error; return r as { ide: number }
}

export async function updateVendedor(emp_ide: string, ide: number, data: Partial<Vendedor>) {
  const { error } = await supabase.from('vendedores').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteVendedor(emp_ide: string, ide: number) {
  const { error } = await supabase.from('vendedores').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
