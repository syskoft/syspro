import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

const permisosCache = new Map<string, Set<string>>()

export function usePermiso(accion: string): boolean {
  const { profile, user } = useAuth()
  const [tiene, setTiene] = useState(true)

  useEffect(() => {
    if (!user || !profile) return
    if (profile.role === 'superadmin') { setTiene(true); return }

    const userId = user.id
    if (permisosCache.has(userId)) {
      setTiene(permisosCache.get(userId)!.has(accion))
      return
    }

    supabase
      .from('usuario_permisos')
      .select('accion_codigo')
      .eq('usuario_id', userId)
      .then(({ data }) => {
        const set = new Set(data?.map((r: any) => r.accion_codigo) ?? [])
        permisosCache.set(userId, set)
        setTiene(set.has(accion))
      })
  }, [user, profile, accion])

  return tiene
}
