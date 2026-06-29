import { useCallback, useState } from 'react'
import { CrudPage } from '@/components/CrudPage'; import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'; import { useAlertContext } from '@/hooks/AlertProvider'
import { createTercero, deleteTercero, fetchTerceros, updateTercero } from '@/services/facturacion'
import type { Tercero } from '@/types/database'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Nombre o identificación...' },
  { key: 'tipo', label: 'Tipo', type: 'select' as const, options: [{ value: 'cliente', label: 'Clientes' }, { value: 'proveedor', label: 'Proveedores' }, { value: 'ambos', label: 'Ambos' }] },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
]
const formFields = [
  { key: 'identificacion', label: 'Identificación', required: true }, { key: 'dv', label: 'DV' },
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'tipo', label: 'Tipo', type: 'select' as const, required: true, options: [{ value: 'cliente', label: 'Cliente' }, { value: 'proveedor', label: 'Proveedor' }, { value: 'ambos', label: 'Ambos' }] },
  { key: 'direccion', label: 'Dirección' }, { key: 'ciudad', label: 'Ciudad' }, { key: 'departamento', label: 'Departamento' },
  { key: 'telefono', label: 'Teléfono' }, { key: 'email', label: 'Email' }, { key: 'regimen', label: 'Régimen' },
]

export function TercerosPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [terceros, setTerceros] = useState<Tercero[]>([]); const [loading, setLoading] = useState(false)
  const loadData = useCallback(async (f?: Record<string, string>) => { if (!profile?.emp_ide) return; setLoading(true); try { setTerceros(await fetchTerceros(profile.emp_ide, f)) } finally { setLoading(false) } }, [profile])
  return (
    <CrudPage title="Terceros" filterFields={filterFields} onSearch={loadData} onClear={() => setTerceros([])} fields={formFields}
      columns={[
        { key: 'identificacion', label: 'Identificación', render: (v) => <span className="font-mono text-xs">{v}</span> },
        { key: 'nombre', label: 'Nombre', editable: true }, { key: 'tipo', label: 'Tipo', render: (v) => <span className="capitalize">{v}</span> },
        { key: 'ciudad', label: 'Ciudad' }, { key: 'telefono', label: 'Teléfono' },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />, renderEdit: (v, _, o) => (<select defaultValue={v ? 'si' : 'no'} onChange={(e) => o(e.target.value === 'si')} className="rounded border bg-background px-2 py-1 text-xs"><option value="no">Activo</option><option value="si">Inactivo</option></select>) },
      ]} data={terceros} idKey="ide" loading={loading}
      permisoCrear="terceros.crear" permisoEditar="terceros.editar" permisoEliminar="terceros.eliminar"
      onCreate={async (vals) => { await createTercero(profile?.emp_ide ?? '', vals); loadData() }}
      onSave={async (row) => { if (profile?.emp_ide) await updateTercero(profile.emp_ide, row.ide, row); loadData() }}
      onDelete={async (row) => { if (profile?.emp_ide && await confirm({ message: `¿Eliminar ${row.nombre}?`, confirmLabel: 'Eliminar' })) { await deleteTercero(profile.emp_ide, row.ide); loadData() } }} />
  )
}
