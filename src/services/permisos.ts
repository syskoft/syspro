import { supabase } from '@/lib/supabase'
import type { PermisoAccion } from '@/types/database'

export async function fetchAcciones(): Promise<PermisoAccion[]> {
  const { data, error } = await supabase.from('permiso_acciones').select('*').order('modulo').order('codigo')
  if (error) throw error
  return data ?? []
}

export async function fetchPermisosUsuario(usuarioId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('usuario_permisos').select('accion_codigo').eq('usuario_id', usuarioId)
  if (error) throw error
  return new Set(data?.map((r: any) => r.accion_codigo) ?? [])
}

export async function savePermisosUsuario(usuarioId: string, acciones: string[]) {
  // Eliminar permisos actuales
  await supabase.from('usuario_permisos').delete().eq('usuario_id', usuarioId)
  // Insertar nuevos
  if (acciones.length > 0) {
    const { error } = await supabase.from('usuario_permisos').insert(
      acciones.map((a) => ({ usuario_id: usuarioId, accion_codigo: a })),
    )
    if (error) throw error
  }
}
