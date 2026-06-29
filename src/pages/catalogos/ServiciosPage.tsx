import { useCallback, useState } from 'react'
import { CrudPage } from '@/components/CrudPage'; import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'; import { useAlertContext } from '@/hooks/AlertProvider'
import { createServicio, deleteServicio, fetchServicios, updateServicio } from '@/services/servicios'
const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })
const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Codigo o nombre...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
]
const formFields = [
  { key: 'codigo', label: 'Codigo', required: true }, { key: 'nombre', label: 'Nombre', required: true },
  { key: 'precio', label: 'Precio', type: 'number' as const },
]

export function ServiciosPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [servicios, setServicios] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  const loadData = useCallback(async (f?: Record<string, string>) => { if (!profile?.emp_ide) return; setLoading(true); try { setServicios(await fetchServicios(profile.emp_ide, f)) } finally { setLoading(false) } }, [profile])
  return (
    <CrudPage title="Servicios" filterFields={filterFields} onSearch={loadData} onClear={() => setServicios([])} fields={formFields}
      columns={[
        { key: 'codigo', label: 'Codigo', editable: true }, { key: 'nombre', label: 'Nombre', editable: true },
        { key: 'precio', label: 'Precio', render: (v) => fmt(v), editable: true, renderEdit: (v, _, o) => (<input type="number" step="0.01" defaultValue={v} onChange={(e) => o(Number(e.target.value))} className="w-24 rounded border bg-background px-2 py-1 text-right text-xs" />) },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />, renderEdit: (v, _, o) => (<select defaultValue={v ? 'si' : 'no'} onChange={(e) => o(e.target.value === 'si')} className="rounded border bg-background px-2 py-1 text-xs"><option value="no">Activo</option><option value="si">Inactivo</option></select>) },
      ]} data={servicios} idKey="ide" loading={loading}
      permisoCrear="servicios.crear" permisoEditar="servicios.editar" permisoEliminar="servicios.eliminar"
      onCreate={async (vals) => { if (profile?.emp_ide) await createServicio(profile.emp_ide, vals); loadData() }}
      onSave={async (row: any) => { if (profile?.emp_ide) await updateServicio(profile.emp_ide, row.ide, row); loadData() }}
      onDelete={async (row: any) => { if (!profile?.emp_ide) return; if (!await confirm({ message: `Eliminar ${row.nombre}?`, confirmLabel: 'Eliminar' })) return; await deleteServicio(profile.emp_ide, row.ide); loadData() }} />
  )
}
