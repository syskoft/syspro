import { useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { createPlan, deletePlan, fetchPlanes, updatePlan } from '@/services/admin'
import type { SusTip } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

const fields = [
  { key: 'nom_sus_emp', label: 'Nombre del plan', required: true },
  { key: 'num_mes', label: 'Meses', type: 'number' as const, required: true },
  { key: 'val_sus_emp', label: 'Valor', type: 'number' as const, required: true },
]

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Nombre del plan...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function AdminPlanesPage() {
  const { profile } = useAuth()
  const [planes, setPlanes] = useState<SusTip[]>([])
  const [loading, setLoading] = useState(false)

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  async function handleSearch(filters: Record<string, string>) {
    setLoading(true)
    try { setPlanes(await fetchPlanes(filters)) } finally { setLoading(false) }
  }

  function handleClear() { setPlanes([]) }

  return (
    <CrudPage
      title="Planes de Suscripción"
      filterFields={filterFields}
      onSearch={handleSearch}
      onClear={handleClear}
      fields={fields}
      columns={[
        { key: 'ide', label: 'ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
        { key: 'nom_sus_emp', label: 'Nombre', editable: true },
        { key: 'num_mes', label: 'Meses', editable: true,
          renderEdit: (v, _, onChange) => (
            <input type="number" defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-16 rounded border border-input bg-background px-2 py-1 text-xs" />
          ),
        },
        { key: 'val_sus_emp', label: 'Valor', render: (v) => <span className="font-mono text-xs block text-right">{fmt(v)}</span>, editable: true,
          renderEdit: (v, _, onChange) => (
            <input type="number" step="0.01" defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-24 rounded border border-input bg-background px-2 py-1 text-right text-xs" />
          ),
        },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
          renderEdit: (v, _, onChange) => (
            <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="no">Activo</option><option value="si">Inactivo</option>
            </select>
          ),
        },
      ]}
      data={planes}
      loading={loading}
      onCreate={async (vals) => { await createPlan(vals); handleSearch({}) }}
      onSave={async (row) => { await updatePlan(row.ide, row); handleSearch({}) }}
      onDelete={async (row) => { if (confirm(`¿Eliminar plan ${row.nom_sus_emp}?`)) { await deletePlan(row.ide); handleSearch({}) } }}
    />
  )
}
