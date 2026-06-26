import { Pencil, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DataTable, type DataColumn } from '@/components/DataTable'
import { FilterBar } from '@/components/FilterBar'
import { Modal } from '@/components/Modal'
import { RoleBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { fetchAcciones, fetchPermisosUsuario, savePermisosUsuario } from '@/services/permisos'
import type { PermisoAccion } from '@/types/database'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Usuario o email...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function PermisosPage() {
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [acciones, setAcciones] = useState<PermisoAccion[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [permisos, setPermisos] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const load = useCallback(async (filters?: Record<string, string>) => {
    let query = supabase.from('usuarios').select('id, usu, mail, role, emp_ide, ina')
    if (filters?.search) query = query.or(`usu.ilike.%${filters.search}%,mail.ilike.%${filters.search}%`)
    if (filters?.ina === 'activos') query = query.eq('ina', false)
    else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
    const { data } = await query.order('usu')
    if (data) setUsuarios(data)
    fetchAcciones().then(setAcciones)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!selectedUser) return
    setPermisos(new Set())
    setDirty(false)
    fetchPermisosUsuario(selectedUser.id).then((s) => { setPermisos(s); setDirty(false) })
  }, [selectedUser])

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  function togglePermiso(codigo: string) {
    setPermisos((prev) => {
      const next = new Set(prev)
      if (next.has(codigo)) next.delete(codigo)
      else next.add(codigo)
      return next
    })
    setDirty(true)
  }

  async function handleSave() {
    if (!selectedUser) return
    setSaving(true)
    await savePermisosUsuario(selectedUser.id, [...permisos])
    setDirty(false)
    setSaving(false)
    // Cerrar modal después de guardar
    setSelectedUser(null)
  }

  const modulos = [...new Set(acciones.map((a) => a.modulo))]

  const columns: DataColumn<any>[] = [
    { key: 'usu', label: 'Usuario' },
    { key: 'mail', label: 'Email' },
    { key: 'role', label: 'Rol', render: (v) => <RoleBadge role={v} /> },
    { key: 'emp_ide', label: 'Empresa', render: (v) => <span className="font-mono text-xs">{v ?? '-'}</span> },
    { key: 'ina', label: 'Estado', render: (v) => (
      <span className={`theme-badge ${v ? 'theme-badge-inactive' : 'theme-badge-active'}`}>
        {v ? 'Inactivo' : 'Activo'}
      </span>
    )},
    { key: 'id', label: '', render: (_v, row) => (
      <button type="button" onClick={() => setSelectedUser(row)}
        className="rounded p-1 text-muted-foreground hover:text-foreground" title="Editar permisos">
        <Pencil className="size-3.5" />
      </button>
    )},
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Permisos de Usuarios</h1>

      <FilterBar fields={filterFields} onSearch={load} onClear={() => setUsuarios([])} />

      <DataTable columns={columns} data={usuarios} idKey="id" />

      <Modal open={!!selectedUser} onClose={() => { if (!dirty || confirm('¿Descartar cambios?')) setSelectedUser(null) }}
        title={`Permisos — ${selectedUser?.usu ?? ''}`} width="lg">
        {selectedUser && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RoleBadge role={selectedUser.role} />
                <span className="text-xs text-muted-foreground">{selectedUser.mail}</span>
              </div>
              <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                <Save className="size-4" /> {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>

            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="theme-table-header">
                    <th className="px-4 py-2">Módulo</th>
                    <th className="px-4 py-2">Acción</th>
                    <th className="px-4 py-2 w-16 text-center">Permiso</th>
                  </tr>
                </thead>
                <tbody>
                  {modulos.map((mod) => {
                    const modAcciones = acciones.filter((a) => a.modulo === mod)
                    return modAcciones.map((a, i) => (
                      <tr key={a.codigo} className={cn('theme-table-row', i === 0 && 'border-t-2')}>
                        {i === 0 && (
                          <td className="px-4 py-2 font-medium" rowSpan={modAcciones.length}>
                            {mod.charAt(0).toUpperCase() + mod.slice(1)}
                          </td>
                        )}
                        <td className="px-4 py-2">
                          <span className="text-xs">{a.nombre}</span>
                          {a.descripcion && <p className="text-[10px] text-muted-foreground">{a.descripcion}</p>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={permisos.has(a.codigo)}
                            onChange={() => togglePermiso(a.codigo)}
                            className="size-4 accent-primary"
                          />
                        </td>
                      </tr>
                    ))
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
