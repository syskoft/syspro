import { useState } from 'react'
import { CrudPage } from '@/components/CrudPage'; import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'; import { useAlertContext } from '@/hooks/AlertProvider'
import { supabase } from '@/lib/supabase'

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Código o nombre...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
]
const formFields = [
  { key: 'codigo', label: 'Código', required: true, placeholder: 'FC, FV, NC...' },
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'requiere_vendedor', label: 'Requiere vendedor', type: 'select' as const, options: [{ value: 'true', label: 'Sí' }, { value: 'false', label: 'No' }] },
]

export function ClasesCompPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [data, setData] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  if (profile?.role !== 'superadmin') return <p className="text-muted-foreground">Solo el SUPERADMIN puede gestionar clases de comprobantes.</p>
  async function load(filters?: Record<string, string>) {
    setLoading(true); let q = supabase.from('tipo_comprobante').select('*').order('codigo')
    if (filters?.search) q = q.or(`codigo.ilike.%${filters.search}%,nombre.ilike.%${filters.search}%`)
    if (filters?.ina === 'activos') q = q.eq('ina', false); else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
    const { data: d } = await q; if (d) setData(d); setLoading(false)
  }
  return (
    <CrudPage title="Clases de Comprobantes" filterFields={filterFields} onSearch={load} onClear={() => setData([])}
      fields={formFields}
      columns={[
        { key: 'codigo', label: 'Código', editable: true }, { key: 'nombre', label: 'Nombre', editable: true },
        { key: 'descripcion', label: 'Descripción', editable: true },
        { key: 'requiere_vendedor', label: 'Req.Vend', render: (v) => v ? 'Sí' : 'No' },
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />, renderEdit: (v, _, o) => (<select defaultValue={v ? 'si' : 'no'} onChange={(e) => o(e.target.value === 'si')} className="rounded border bg-background px-2 py-1 text-xs"><option value="no">Activo</option><option value="si">Inactivo</option></select>) },
      ]} data={data} idKey="codigo" loading={loading} permisoCrear="" permisoEditar="" permisoEliminar=""
      onCreate={async (vals) => { const { error } = await supabase.from('tipo_comprobante').insert({ ...vals, naturaleza: 'ingreso' }); if (error) throw error; load() }}
      onSave={async (row) => { const { error } = await supabase.from('tipo_comprobante').update({ nombre: row.nombre, descripcion: row.descripcion, ina: row.ina, requiere_vendedor: row.requiere_vendedor === true || row.requiere_vendedor === 'true' }).eq('codigo', row.codigo); if (error) throw error; load() }}
      onDelete={async (row: any) => { if (!await confirm({ message: `¿Eliminar ${row.nombre}?`, confirmLabel: 'Eliminar' })) return; const { error } = await supabase.from('tipo_comprobante').delete().eq('codigo', row.codigo); if (error) throw error; load() }} />
  )
}
