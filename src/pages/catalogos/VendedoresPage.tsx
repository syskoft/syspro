import { useCallback, useEffect, useState } from 'react'
import { CrudPage } from '@/components/CrudPage'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { useAlertContext } from '@/hooks/AlertProvider'
import { supabase } from '@/lib/supabase'
import { createVendedor, deleteVendedor, fetchVendedores, updateVendedor } from '@/services/vendedores'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Código o nombre...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
]

export function VendedoresPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  const [terceros, setTerceros] = useState<any[]>([])
  useEffect(() => { if (profile?.emp_ide) { supabase.from('terceros').select('ide,identificacion,nombre,telefono,email').eq('emp_ide', profile.emp_ide).eq('ina', false).in('tipo', ['cliente', 'proveedor', 'ambos']).order('nombre').then(({ data: d }) => { if (d) setTerceros(d) }) } }, [profile?.emp_ide])
  const loadData = useCallback(async (f?: Record<string, string>) => { if (!profile?.emp_ide) return; setLoading(true); try { setData(await fetchVendedores(profile.emp_ide, f)) } finally { setLoading(false) } }, [profile])
  return (
    <CrudPage title="Vendedores" filterFields={filterFields} onSearch={loadData} onClear={() => setData([])}
      fields={[
        { key: 'tercero_ide', label: 'Tercero', type: 'select', required: true, options: terceros.map((t) => ({ value: String(t.ide), label: `${t.identificacion} - ${t.nombre}` })) },
        { key: 'codigo', label: 'Código', required: true, placeholder: 'V001' },
        { key: 'telefono', label: 'Teléfono' }, { key: 'email', label: 'Email' },
      ]}
      columns={[
        { key: 'codigo', label: 'Código', editable: true }, { key: 'tercero_nombre', label: 'Nombre' },
        { key: 'telefono', label: 'Teléfono', editable: true }, { key: 'email', label: 'Email', editable: true },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />, renderEdit: (v, _, o) => (<select defaultValue={v ? 'si' : 'no'} onChange={(e) => o(e.target.value === 'si')} className="rounded border bg-background px-2 py-1 text-xs"><option value="no">Activo</option><option value="si">Inactivo</option></select>) },
      ]} data={data} idKey="ide" loading={loading}
      permisoCrear="vendedores.crear" permisoEditar="vendedores.editar" permisoEliminar="vendedores.eliminar"
      onCreate={async (vals) => { const t = terceros.find((x) => x.ide === Number(vals.tercero_ide)); if (profile?.emp_ide) await createVendedor(profile.emp_ide, { ...vals, tercero_ide: Number(vals.tercero_ide), telefono: vals.telefono || t?.telefono || null, email: vals.email || t?.email || null }); loadData() }}
      onSave={async (row: any) => { if (profile?.emp_ide) await updateVendedor(profile.emp_ide, row.ide, row); loadData() }}
      onDelete={async (row: any) => { if (!profile?.emp_ide) return; if (!await confirm({ message: `¿Eliminar vendedor ${row.codigo}?`, confirmLabel: 'Eliminar' })) return; await deleteVendedor(profile.emp_ide, row.ide); loadData() }} />
  )
}
