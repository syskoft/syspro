import { useCallback, useEffect, useState } from 'react'
import { CrudPage } from '@/components/CrudPage'; import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'; import { useAlertContext } from '@/hooks/AlertProvider'
import { createComprobanteTipo, deleteComprobanteTipo, fetchAllTipos, fetchTiposComp, updateComprobanteTipo } from '@/services/facturacion'

export function ComprobanteTiposPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  const [clases, setClases] = useState<{ codigo: string; nombre: string }[]>([])
  useEffect(() => { fetchTiposComp().then((tc) => setClases(tc.map((c) => ({ codigo: c.codigo, nombre: c.nombre })))) }, [])
  const loadData = useCallback(async (f?: Record<string, string>) => { if (!profile?.emp_ide) return; setLoading(true); try { setData(await fetchAllTipos(profile.emp_ide, f)) } finally { setLoading(false) } }, [profile])
  const dynFilter = [
    { key: 'search', label: 'Buscar', placeholder: 'Código o nombre...' },
    { key: 'clase', label: 'Clase', type: 'select' as const, options: [{ value: '', label: 'Todas' }, ...clases.map((c) => ({ value: c.codigo, label: c.nombre }))] },
    { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
  ]
  return (
    <CrudPage title="Tipos de Comprobante" filterFields={dynFilter} onSearch={loadData} onClear={() => setData([])}
      fields={[
        { key: 'clase_codigo', label: 'Clase', type: 'select', required: true, options: clases.map((c) => ({ value: c.codigo, label: `${c.codigo} - ${c.nombre}` })) },
        { key: 'codigo', label: 'Código', required: true, placeholder: 'FV01' },
        { key: 'nombre', label: 'Nombre', required: true }, { key: 'descripcion', label: 'Descripción' },
      ]}
      columns={[
        { key: 'clase_codigo', label: 'Clase', render: (v) => { const c = clases.find((x) => x.codigo === v); return <span className="font-mono text-xs">{c ? `${v} - ${c.nombre}` : v}</span> } },
        { key: 'codigo', label: 'Código', editable: true }, { key: 'nombre', label: 'Nombre', editable: true },
        { key: 'descripcion', label: 'Descripción', editable: true },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />, renderEdit: (v, _, o) => (<select defaultValue={v ? 'si' : 'no'} onChange={(e) => o(e.target.value === 'si')} className="rounded border bg-background px-2 py-1 text-xs"><option value="no">Activo</option><option value="si">Inactivo</option></select>) },
      ]} data={data} idKey="ide" loading={loading}
      permisoCrear="comp_tipos.crear" permisoEditar="comp_tipos.editar" permisoEliminar="comp_tipos.eliminar"
      onCreate={async (vals) => { if (profile?.emp_ide) await createComprobanteTipo(profile.emp_ide, vals); loadData() }}
      onSave={async (row: any) => { if (profile?.emp_ide) await updateComprobanteTipo(profile.emp_ide, row.ide, row); loadData() }}
      onDelete={async (row: any) => { if (!profile?.emp_ide) return; if (!await confirm({ message: `¿Eliminar ${row.nombre}?`, confirmLabel: 'Eliminar' })) return; await deleteComprobanteTipo(profile.emp_ide, row.ide); loadData() }} />
  )
}
