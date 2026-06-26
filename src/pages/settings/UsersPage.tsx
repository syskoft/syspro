import { useCallback, useEffect, useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { RoleBadge, StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Usuario o email...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function UsersPage() {
  const { profile, user: authUser } = useAuth()
  const [usuarios, setUsuarios] = useState<User[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const formFields = [
    { key: 'usu', label: 'Usuario', required: true },
    { key: 'mail', label: 'Email', required: true },
    { key: 'password', label: 'Contraseña (solo creación)', type: 'text' as const },
    { key: 'role', label: 'Rol', required: true, placeholder: 'Admin, Operador, Consultor...' },
    { key: 'emp_ide', label: 'Empresa', type: 'select' as const, options: empresas.map((e) => ({ value: e.emp_ide, label: `${e.emp_ide} - ${e.nom_com}` })) },
  ]

  const load = useCallback(async (filters?: Record<string, string>) => {
    if (!profile?.emp_ide && profile?.role !== 'superadmin') return
    setLoading(true)
    let query = supabase.from('usuarios').select('*')
    if (filters?.search) query = query.or(`usu.ilike.%${filters.search}%,mail.ilike.%${filters.search}%`)
    if (filters?.ina === 'activos') query = query.eq('ina', false)
    else if (filters?.ina === 'inactivos') query = query.eq('ina', true)
    if (profile?.role !== 'superadmin' && profile?.emp_ide) query = query.eq('emp_ide', profile.emp_ide)
    const { data } = await query.order('created_at', { ascending: false })
    if (data) setUsuarios(data)
    setLoading(false)
  }, [profile])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    supabase.from('empresas').select('emp_ide, nom_com').order('nom_com').then(({ data }) => {
      if (data) setEmpresas(data)
    })
  }, [])

  function handleClear() { setUsuarios([]) }

  const roleLower = (v: string) => (v ?? '').toLowerCase().trim()

  async function handleCreate(vals: Record<string, any>) {
    if (roleLower(vals.role) === 'superadmin') return alert('No puedes crear usuarios SUPERADMIN')
    const { error } = await supabase.rpc('admin_create_user', {
      p_email: vals.mail,
      p_password: vals.password || 'Cambiar123!',
      p_emp_ide: vals.emp_ide || profile?.emp_ide || '',
      p_role: roleLower(vals.role) || 'admin',
    })
    if (error) throw error
    await new Promise((r) => setTimeout(r, 500))
    load()
  }

  async function handleSave(row: User) {
    if (roleLower(row.role) === 'superadmin' && row.id !== authUser?.id) {
      return alert('Solo el usuario actual puede tener rol SUPERADMIN')
    }
    if (row.role === 'superadmin' && row.id === authUser?.id) {
      const { error } = await supabase.from('usuarios').update({ usu: row.usu, mail: row.mail, ina: row.ina }).eq('id', row.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('usuarios').update(row).eq('id', row.id)
      if (error) throw error
    }
    load()
  }

  async function handleDelete(row: User) {
    // Marcar como inactivo en vez de eliminar
    if (row.id === authUser?.id) return
    if (!confirm(`¿Inactivar usuario ${row.usu}?`)) return
    await supabase.from('usuarios').update({ ina: true }).eq('id', row.id)
    load()
  }

  return (
    <CrudPage
      title="Usuarios"
      filterFields={filterFields}
      onSearch={load}
      onClear={handleClear}
      fields={formFields}
      columns={[
        { key: 'usu', label: 'Usuario', editable: true },
        { key: 'mail', label: 'Email', editable: true },
        { key: 'role', label: 'Rol', render: (v) => <RoleBadge role={v} />,
          renderEdit: (v, _, onChange) => (
            <input type="text" defaultValue={v} onChange={(e) => onChange(e.target.value)}
              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
              placeholder="Admin, Operador..." />
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
      onCreate={handleCreate}
      onSave={handleSave}
      onDelete={handleDelete}
      canDelete={(row) => row.id !== authUser?.id && row.role !== 'superadmin'}
    />
  )
}
