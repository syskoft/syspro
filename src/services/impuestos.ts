import { supabase } from '@/lib/supabase'
import type { ClaseImpuesto, ConfigContableClase, TarifaImpuesto } from '@/types/database'

export async function fetchClases(): Promise<ClaseImpuesto[]> {
  const { data, error } = await supabase.from('clases_impuestos').select('*').eq('ina', false).order('codigo')
  if (error) throw error
  return data ?? []
}

export async function fetchConfigClase(claseCodigo: string): Promise<ConfigContableClase[]> {
  const { data, error } = await supabase.from('config_contable_clase').select('*').eq('clase_codigo', claseCodigo).order('orden')
  if (error) throw error
  return data ?? []
}

export async function fetchTarifas(emp_ide: string, filters?: Record<string, string>): Promise<TarifaImpuesto[]> {
  let query = supabase.from('tarifas_impuestos').select('*, clases_impuestos!inner(codigo, nombre)').eq('emp_ide', emp_ide).order('created_at', { ascending: false })
  if (filters?.search) query = query.or(`nombre.ilike.%${filters.search}%,clase_codigo.ilike.%${filters.search}%`)
  if (filters?.clase) query = query.eq('clase_codigo', filters.clase)
  if (filters?.ina === 'activos') query = query.eq('ina', false)
  else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createTarifa(emp_ide: string, data: Partial<TarifaImpuesto>) {
  const { error } = await supabase.from('tarifas_impuestos').insert({ ...data, emp_ide })
  if (error) throw error
}

export async function updateTarifa(emp_ide: string, ide: number, data: Partial<TarifaImpuesto>) {
  const { error } = await supabase.from('tarifas_impuestos').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteTarifa(emp_ide: string, ide: number) {
  const { error } = await supabase.from('tarifas_impuestos').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
