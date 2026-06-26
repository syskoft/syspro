import { useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { createEmpresa, deleteEmpresa, fetchEmpresas, updateEmpresa } from '@/services/admin'
import type { Emp } from '@/types/database'

const fields = [
  { key: 'ide_emp', label: 'NIT', required: true },
  { key: 'nom_com', label: 'Nombre comercial', required: true },
  { key: 'raz_soc', label: 'Razón social', required: true },
  { key: 'dir', label: 'Dirección' },
  { key: 'ciu', label: 'Ciudad' },
  { key: 'dep', label: 'Departamento' },
  { key: 'tel', label: 'Teléfono' },
  { key: 'rep_leg', label: 'Representante legal' },
  { key: 'cc_rep_leg', label: 'C.C. Rep. Legal' },
  { key: 'reg_tri', label: 'Régimen tributario', type: 'select' as const, options: [
    { value: 'Regimen Común', label: 'Régimen Común' },
    { value: 'Regimen Simplificado', label: 'Régimen Simplificado' },
  ]},
  { key: 'imp_vtas', label: 'IVA %', type: 'number' as const },
]

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'NIT, nombre o ciudad...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activas', label: 'Activas' },
    { value: 'inactivas', label: 'Inactivas' },
  ]},
]

export function AdminEmpresasPage() {
  const { profile } = useAuth()
  const [empresas, setEmpresas] = useState<Emp[]>([])
  const [loading, setLoading] = useState(false)

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  async function handleSearch(filters: Record<string, string>) {
    setLoading(true)
    try { setEmpresas(await fetchEmpresas(filters)) } finally { setLoading(false) }
  }

  function handleClear() { setEmpresas([]) }

  return (
    <CrudPage
      title="Empresas"
      filterFields={filterFields}
      onSearch={handleSearch}
      onClear={handleClear}
      fields={fields}
      columns={[
        { key: 'emp_ide', label: 'ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
        { key: 'ide_emp', label: 'NIT', editable: true },
        { key: 'nom_com', label: 'Nombre', editable: true },
        { key: 'raz_soc', label: 'Razón social', editable: true },
        { key: 'ciu', label: 'Ciudad', editable: true },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
          renderEdit: (v, _, onChange) => (
            <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="no">Activo</option><option value="si">Inactivo</option>
            </select>
          ),
        },
      ]}
      data={empresas}
      idKey="emp_ide"
      loading={loading}
      onCreate={async (vals) => { await createEmpresa(vals); handleSearch({}) }}
      onSave={async (row) => { await updateEmpresa(row.emp_ide, row); handleSearch({}) }}
      onDelete={async (row) => { if (confirm(`¿Eliminar ${row.nom_com}?`)) { await deleteEmpresa(row.emp_ide); handleSearch({}) } }}
    />
  )
}
