import { supabase } from '@/lib/supabase'

export interface EventLogEntry {
  ide: number; emp_ide: string; usuario_nombre: string | null
  accion: 'CREAR' | 'EDITAR' | 'ELIMINAR'; tabla: string
  registro_id: number | null; detalle: any; created_at: string
}

export async function fetchEventLog(emp_ide: string, filters?: Record<string, string>): Promise<EventLogEntry[]> {
  let q = supabase.from('event_log').select('*').eq('emp_ide', emp_ide).order('created_at', { ascending: false }).limit(100)
  if (filters?.accion) q = q.eq('accion', filters.accion)
  if (filters?.tabla) q = q.eq('tabla', filters.tabla)
  if (filters?.search) q = q.ilike('detalle::text', `%${filters.search}%`)
  const { data, error } = await q
  if (error) throw error; return data ?? []
}

export async function insertEventLog(
  emp_ide: string,
  usuarioNombre: string | null,
  accion: 'CREAR' | 'EDITAR' | 'ELIMINAR',
  tabla: string,
  registro_id?: number,
  detalle?: any,
) {
  const { error } = await supabase.from('event_log').insert({
    emp_ide, usuario_nombre: usuarioNombre, accion, tabla, registro_id: registro_id ?? null, detalle: detalle ?? null,
  })
  if (error) throw error
}
