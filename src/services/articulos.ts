import { supabase } from '@/lib/supabase'
import type { Articulo, ArticuloImpuesto } from '@/types/database'

export async function fetchArticulos(emp_ide: string, filters?: Record<string, string>): Promise<Articulo[]> {
  let query = supabase.from('articulos').select('*').eq('emp_ide', emp_ide).order('codigo')
  if (filters?.search) query = query.or(`codigo.ilike.%${filters.search}%,nombre.ilike.%${filters.search}%`)
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchArticuloImpuestos(emp_ide: string, articuloIde: number): Promise<ArticuloImpuesto[]> {
  const { data, error } = await supabase
    .from('articulo_impuestos')
    .select('*, tarifa: tarifa_id(*)')
    .eq('emp_ide', emp_ide)
    .eq('articulo_ide', articuloIde)
  if (error) throw error
  return data ?? []
}

export async function saveArticuloImpuestos(
  emp_ide: string,
  articuloIde: number,
  tarifaIds: number[],
) {
  // Eliminar impuestos actuales
  await supabase.from('articulo_impuestos').delete().eq('emp_ide', emp_ide).eq('articulo_ide', articuloIde)

  // Insertar nuevos (máx 5)
  const toInsert = tarifaIds.slice(0, 5).map((tarifa_id) => ({
    emp_ide,
    articulo_ide: articuloIde,
    tarifa_id,
  }))

  if (toInsert.length > 0) {
    const { error } = await supabase.from('articulo_impuestos').insert(toInsert)
    if (error) throw error
  }
}

export async function createArticulo(emp_ide: string, data: Partial<Articulo>) {
  const { data: nuevo, error } = await supabase.from('articulos').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error
  return nuevo as { ide: number }
}

export async function updateArticulo(emp_ide: string, ide: number, data: Partial<Articulo>) {
  const { error } = await supabase.from('articulos').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteArticulo(emp_ide: string, ide: number) {
  const { error } = await supabase.from('articulos').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
