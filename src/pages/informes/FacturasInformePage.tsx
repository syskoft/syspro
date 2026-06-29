import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type DataColumn } from '@/components/DataTable'; import { FilterBar } from '@/components/FilterBar'
import { StatusBadge } from '@/components/StatusBadge'; import { useAuth } from '@/contexts/AuthContext'
import { fetchFacturas, fetchTiposComp, fmtNum } from '@/services/facturacion'; import { supabase } from '@/lib/supabase'
import type { Factura } from '@/types/database'
const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

export function FacturasInformePage() {
  const { profile } = useAuth(); const navigate = useNavigate()
  const [facturas, setFacturas] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  const [clases, setClases] = useState<{ codigo: string; nombre: string }[]>([])
  const [terceros, setTerceros] = useState<{ ide: number; nombre: string }[]>([])
  useEffect(() => { if (!profile?.emp_ide) return; fetchTiposComp().then((tc) => setClases(tc.map((c) => ({ codigo: c.codigo, nombre: c.nombre })))); supabase.from('terceros').select('ide, nombre').eq('emp_ide', profile.emp_ide).eq('ina', false).in('tipo', ['cliente', 'ambos']).order('nombre').then(({ data }) => { if (data) setTerceros(data) }) }, [profile?.emp_ide])
  const filterFields = [
    { key: 'search', label: 'Buscar', placeholder: 'Concepto...' },
    { key: 'tipo', label: 'Clase', type: 'select' as const, options: [{ value: '', label: 'Todas' }, ...clases.map((c) => ({ value: c.codigo, label: `${c.codigo} - ${c.nombre}` }))] },
    { key: 'tercero', label: 'Cliente', type: 'select' as const, options: [{ value: '', label: 'Todos' }, ...terceros.map((t) => ({ value: String(t.ide), label: t.nombre }))] },
    { key: 'estado', label: 'Estado', type: 'select' as const, options: [{ value: 'emitida', label: 'Emitidas' }, { value: 'pagada', label: 'Pagadas' }, { value: 'anulada', label: 'Anuladas' }] },
  ]
  const loadData = useCallback(async (f?: Record<string, string>) => {
    if (!profile?.emp_ide) return; setLoading(true)
    try { const data = await fetchFacturas(profile.emp_ide, f); const enriched = await Promise.all(data.map(async (fac) => { const { data: t } = await supabase.from('terceros').select('nombre').eq('emp_ide', profile.emp_ide!).eq('ide', fac.tercero_ide).maybeSingle(); return { ...fac, tercero_nombre: t?.nombre ?? '' } })); setFacturas(enriched) } finally { setLoading(false) }
  }, [profile])
  const columns: DataColumn<Factura>[] = [
    { key: 'numero', label: 'Numero', render: (_v: any, row: any) => (<span className="font-mono text-xs">{row.prefijo}-{fmtNum(row.consecutivo)}</span>) },
    { key: 'tipo_comp', label: 'Clase', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'tercero_nombre', label: 'Cliente', render: (v) => v ?? '-' },
    { key: 'fecha', label: 'Fecha', render: (v) => v?.slice(0, 10) },
    { key: 'total', label: 'Total', render: (v) => <span className="font-mono text-xs">{fmt(v)}</span> },
    { key: 'estado', label: 'Estado', render: (v) => <StatusBadge active={v === 'emitida' || v === 'pagada'} /> },
  ]
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Comprobantes</h1>
      <FilterBar fields={filterFields} onSearch={loadData} onClear={() => setFacturas([])} loading={loading} />
      <DataTable columns={columns} data={facturas} idKey="ide" loading={loading} onEditClick={(row) => navigate(`/dashboard/informes/facturas/${row.ide}`)} />
    </div>
  )
}
