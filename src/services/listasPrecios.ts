import { supabase } from '@/lib/supabase'
import type { ListaPrecio, ListaPrecioItem } from '@/types/database'

export async function fetchListas(emp_ide: string, filters?: Record<string, string>): Promise<(ListaPrecio & { item_count: number })[]> {
  let query = supabase
    .from('listas_precios')
    .select('*, item_count: lista_precios_items(count)')
    .eq('emp_ide', emp_ide)
    .order('nombre')
  if (filters?.search) query = query.ilike('nombre', `%${filters.search}%`)
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((r: any) => ({ ...r, item_count: r.item_count?.[0]?.count ?? 0 }))
}

export async function createLista(emp_ide: string, data: { nombre: string; descripcion?: string }) {
  const { data: nuevo, error } = await supabase.from('listas_precios').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error
  return nuevo as { ide: number }
}

export async function updateLista(emp_ide: string, ide: number, data: Partial<ListaPrecio>) {
  const { error } = await supabase.from('listas_precios').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteLista(emp_ide: string, ide: number) {
  const { error } = await supabase.from('listas_precios').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function fetchItems(emp_ide: string, listaIde: number): Promise<ListaPrecioItem[]> {
  const { data, error } = await supabase
    .from('lista_precios_items')
    .select('*, articulo: articulo_ide(*)')
    .eq('emp_ide', emp_ide)
    .eq('lista_ide', listaIde)
    .order('articulo_ide')
  if (error) throw error
  return data ?? []
}

export interface ItemInput {
  articulo_ide: number
  tipo: 'fijo' | 'porcentual'
  valor: number
}

export async function saveItems(emp_ide: string, listaIde: number, items: ItemInput[]) {
  await supabase.from('lista_precios_items').delete().eq('emp_ide', emp_ide).eq('lista_ide', listaIde)
  if (items.length === 0) return
  const { error } = await supabase.from('lista_precios_items').insert(
    items.map((i) => ({ ...i, emp_ide, lista_ide: listaIde })),
  )
  if (error) throw error
}
