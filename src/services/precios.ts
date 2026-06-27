import { supabase } from '@/lib/supabase'
import type { ArticuloPrecio } from '@/types/database'

export async function fetchPreciosArticulo(emp_ide: string, articuloIde: number): Promise<ArticuloPrecio[]> {
  const { data, error } = await supabase
    .from('articulos_precios')
    .select('*')
    .eq('emp_ide', emp_ide)
    .eq('articulo_ide', articuloIde)
    .order('nombre')
  if (error) throw error
  return data ?? []
}

export interface PrecioInput {
  nombre: string
  precio: number
  incluye_impuesto: boolean
}

export async function savePreciosArticulo(emp_ide: string, articuloIde: number, precios: PrecioInput[]) {
  await supabase.from('articulos_precios').delete().eq('emp_ide', emp_ide).eq('articulo_ide', articuloIde)
  if (precios.length === 0) return
  const { error } = await supabase.from('articulos_precios').insert(
    precios.map((p) => ({ ...p, emp_ide, articulo_ide: articuloIde })),
  )
  if (error) throw error
}
