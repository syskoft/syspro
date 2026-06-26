import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface Modulo {
  codigo: string
  nombre: string
  descripcion: string | null
  tipo: 'modulo' | 'submodulo'
  modulo_padre: string | null
  orden: number
}

interface Plan {
  ide: number
  nom_sus_emp: string
}

export function AdminModulosPlanPage() {
  const { profile } = useAuth()
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [planes, setPlanes] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [assigned, setAssigned] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('modulos_sistema').select('*').eq('ina', false).order('orden'),
      supabase.from('tipos_suscripcion').select('ide, nom_sus_emp').eq('ina', false).order('ide'),
    ]).then(([m, p]) => {
      setModulos(m.data ?? [])
      setPlanes(p.data ?? [])
      if (p.data?.length) setSelectedPlan(p.data[0].ide)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedPlan) return
    setLoading(true)
    supabase
      .from('plan_modulos')
      .select('modulo_codigo')
      .eq('plan_id', selectedPlan)
      .then(({ data }) => {
        setAssigned(new Set(data?.map((r: any) => r.modulo_codigo) ?? []))
        setDirty(false)
        setLoading(false)
      })
  }, [selectedPlan])

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  function toggleModulo(codigo: string) {
    setAssigned((prev) => {
      const next = new Set(prev)
      if (next.has(codigo)) next.delete(codigo)
      else next.add(codigo)
      return next
    })
    setDirty(true)
  }

  // Si se activa un módulo, activar también sus submódulos
  // Si se desactiva un módulo, desactivar también sus submódulos
  function handleToggle(modulo: Modulo) {
    const hijos = modulos.filter((m) => m.modulo_padre === modulo.codigo)
    if (modulo.tipo === 'modulo') {
      const newState = !assigned.has(modulo.codigo)
      setAssigned((prev) => {
        const next = new Set(prev)
        if (newState) {
          next.add(modulo.codigo)
          hijos.forEach((h) => next.add(h.codigo))
        } else {
          next.delete(modulo.codigo)
          hijos.forEach((h) => next.delete(h.codigo))
        }
        return next
      })
    } else {
      toggleModulo(modulo.codigo)
    }
    setDirty(true)
  }

  async function handleSave() {
    if (!selectedPlan) return
    setSaving(true)

    // Obtener las asignaciones actuales
    const { data: current } = await supabase
      .from('plan_modulos')
      .select('modulo_codigo')
      .eq('plan_id', selectedPlan)

    const currentSet = new Set(current?.map((r: any) => r.modulo_codigo) ?? [])

    // Calcular diferencias
    const toAdd = [...assigned].filter((c) => !currentSet.has(c))
    const toRemove = [...currentSet].filter((c) => !assigned.has(c))

    // Insertar nuevas
    for (const codigo of toAdd) {
      await supabase.from('plan_modulos').insert({ plan_id: selectedPlan, modulo_codigo: codigo })
    }

    // Eliminar quitadas
    for (const codigo of toRemove) {
      await supabase.from('plan_modulos').delete().eq('plan_id', selectedPlan).eq('modulo_codigo', codigo)
    }

    setDirty(false)
    setSaving(false)
  }

  const modulosPrincipales = modulos.filter((m) => m.tipo === 'modulo')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Módulos por Plan</h1>
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
          <Save className="size-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      <div className="flex gap-2">
        {planes.map((p) => (
          <button
            key={p.ide}
            type="button"
            onClick={() => setSelectedPlan(p.ide)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              selectedPlan === p.ide
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent',
            )}
          >
            {p.nom_sus_emp}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="theme-table-header">
                <th className="px-4 py-2 w-10"></th>
                <th className="px-4 py-2">Módulo</th>
                <th className="px-4 py-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {modulosPrincipales.map((mod) => {
                const activo = assigned.has(mod.codigo)
                return (
                  <tr key={mod.codigo} className={cn('theme-table-row', activo && 'bg-primary/5')}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => handleToggle(mod)}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{mod.nombre}</td>
                    <td className="px-4 py-2 text-muted-foreground">{mod.descripcion}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
