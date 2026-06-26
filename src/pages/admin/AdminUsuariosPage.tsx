import { useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { RoleBadge, StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { deleteUsuario, fetchUsuarios, updateUsuario } from '@/services/admin'
import type { User } from '@/types/database'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Usuario o email...' },
  { key: 'role', label: 'Rol', type: 'select' as const, options: [
    { value: 'admin', label: 'Admin' },
    { value: 'superadmin', label: 'SUPERADMIN' },
  ]},
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function AdminUsuariosPage() {
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  async function handleSearch(filters: Record<string, string>) {
    setLoading(true)
    try { setUsuarios(await fetchUsuarios(filters)) } finally { setLoading(false) }
  }

  function handleClear() { setUsuarios([]) }

  return (
    <CrudPage
      title="Usuarios del Sistema"
      filterFields={filterFields}
      onSearch={handleSearch}
      onClear={handleClear}
      fields={[]}
      columns={[
        { key: 'usu', label: 'Usuario', editable: true },
        { key: 'mail', label: 'Email', editable: true },
        { key: 'role', label: 'Rol', render: (v) => <RoleBadge role={v} />,
          renderEdit: (v, _, onChange) => (
            <select defaultValue={v} onChange={(e) => onChange(e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="admin">Admin</option><option value="superadmin">SUPERADMIN</option>
            </select>
          ),
        },
        { key: 'emp_ide', label: 'Empresa', editable: true, render: (v) => <span className="font-mono text-xs">{v ?? '-'}</span> },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
          renderEdit: (v, _, onChange) => (
            <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="no">Activo</option><option value="si">Inactivo</option>
            </select>
          ),
        },
      ]}
      data={usuarios}
      idKey="id"
      loading={loading}
      onSave={async (row) => { await updateUsuario(row.id, row); handleSearch({}) }}
      onDelete={async (row) => { if (confirm(`¿Eliminar usuario ${row.usu}?`)) { await deleteUsuario(row.id); handleSearch({}) } }}
    />
  )
}
