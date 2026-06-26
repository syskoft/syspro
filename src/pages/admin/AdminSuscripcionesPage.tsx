import { useEffect, useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { useAuth } from '@/contexts/AuthContext'
import { createSuscripcion, deleteSuscripcion, fetchEmpresas, fetchPlanes, fetchSuscripciones, updateSuscripcion } from '@/services/admin'
import type { Emp, SusTip } from '@/types/database'

export function AdminSuscripcionesPage() {
  const { profile } = useAuth()
  const [suscripciones, setSuscripciones] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<Emp[]>([])
  const [planes, setPlanes] = useState<SusTip[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmpresas().then(setEmpresas)
    fetchPlanes().then(setPlanes)
  }, [])

  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Acceso no autorizado</p>

  async function handleSearch(filters: Record<string, string>) {
    setLoading(true)
    try { setSuscripciones(await fetchSuscripciones(filters)) } finally { setLoading(false) }
  }

  function handleClear() { setSuscripciones([]) }

  const formFields = [
    {
      key: 'emp_ide', label: 'Empresa', type: 'select' as const, required: true,
      options: empresas.map((e) => ({ value: e.emp_ide, label: e.nom_com })),
    },
    {
      key: 'sus_emp', label: 'Plan', type: 'select' as const, required: true,
      options: planes.map((p) => ({ value: p.ide, label: p.nom_sus_emp })),
    },
    { key: 'num_mes', label: 'Meses', type: 'number' as const, required: true },
  ]

  const filterFields = [
    {
      key: 'emp_ide', label: 'Empresa', type: 'select' as const,
      options: [{ value: '', label: 'Todas' }, ...empresas.map((e) => ({ value: e.emp_ide, label: e.nom_com }))],
    },
    {
      key: 'sus_emp', label: 'Plan', type: 'select' as const,
      options: [{ value: '', label: 'Todos' }, ...planes.map((p) => ({ value: String(p.ide), label: p.nom_sus_emp }))],
    },
  ]

  async function handleCreate(vals: Record<string, any>) {
    const plan = planes.find((p) => p.ide === Number(vals.sus_emp))
    if (!plan) return
    const fec_ini = new Date()
    const fec_fin = new Date(); fec_fin.setMonth(fec_fin.getMonth() + Number(vals.num_mes || plan.num_mes))
    await createSuscripcion({
      emp_ide: vals.emp_ide,
      sus_emp: Number(vals.sus_emp),
      fec_ini: fec_ini.toISOString().split('T')[0],
      fec_fin: fec_fin.toISOString().split('T')[0],
      num_mes: Number(vals.num_mes || plan.num_mes),
    })
    handleSearch({})
  }

  return (
    <CrudPage
      title="Suscripciones"
      filterFields={filterFields}
      onSearch={handleSearch}
      onClear={handleClear}
      fields={formFields}
      columns={[
        { key: 'ide', label: 'ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
        { key: 'empresas', label: 'Empresa', render: (v) => v?.nom_com ?? '-' },
        { key: 'tipos_suscripcion', label: 'Plan', render: (v) => v?.nom_sus_emp ?? '-' },
        { key: 'fec_ini', label: 'Inicio', editable: true },
        { key: 'fec_fin', label: 'Fin', editable: true },
        { key: 'num_mes', label: 'Meses', editable: true,
          renderEdit: (v, _, onChange) => (
            <input type="number" defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-16 rounded border border-input bg-background px-2 py-1 text-xs" />
          ),
        },
      ]}
      data={suscripciones}
      loading={loading}
      onCreate={handleCreate}
      onSave={async (row) => { await updateSuscripcion(row.ide, { fec_ini: row.fec_ini, fec_fin: row.fec_fin, num_mes: row.num_mes }); handleSearch({}) }}
      onDelete={async (row) => { if (confirm('¿Eliminar suscripción?')) { await deleteSuscripcion(row.ide); handleSearch({}) } }}
    />
  )
}
