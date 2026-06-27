import { supabase } from '@/lib/supabase'
import type { ArticuloPrecio } from '@/types/database'

export async function fetchPrecios(emp_ide: string, filters?: Record<string, string>): Promise<ArticuloPrecio[]> {
  let query = supabase
    .from('articulos_precios')
    .select('*, articulo: articulo_ide(*)')
    .eq('emp_ide', emp_ide)
    .order('articulo_ide')
    .order('nombre')
  if (filters?.search) {
    query = query.or(
      `nombre.ilike.%${filters.search}%,articulo.codigo.ilike.%${filters.search}%,articulo.nombre.ilike.%${filters.search}%`,
    )
  }
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createPrecio(
  emp_ide: string,
  data: { articulo_ide: number; nombre: string; precio: number; incluye_impuesto: boolean },
) {
  const { data: nuevo, error } = await supabase
    .from('articulos_precios')
    .insert({ ...data, emp_ide })
    .select('ide')
    .single()
  if (error) throw error
  return nuevo as { ide: number }
}

export async function updatePrecio(emp_ide: string, ide: number, data: Partial<ArticuloPrecio>) {
  const { error } = await supabase.from('articulos_precios').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deletePrecio(emp_ide: string, ide: number) {
  const { error } = await supabase.from('articulos_precios').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
