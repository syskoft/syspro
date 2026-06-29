import { Plus, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { BuscarCuenta } from '@/components/BuscarCuenta'
import { Button } from '@/components/ui/button'
import { DataTable, type DataColumn } from '@/components/DataTable'
import { FilterBar } from '@/components/FilterBar'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import { Permiso } from '@/components/Permiso'
import { useAuth } from '@/contexts/AuthContext'
import { useAlertContext } from '@/hooks/AlertProvider'
import { fetchPuc } from '@/services/contabilidad'
import { createFormaPago, deleteFormaPago, fetchFormasPago, fetchTiposComp, updateFormaPago } from '@/services/facturacion'
import type { FormaPago } from '@/types/database'
import type { PucCuenta } from '@/types/contabilidad'

const TIPOS = [
  { value: 'caja', label: 'Caja' }, { value: 'banco', label: 'Banco' },
  { value: 'cuenta_cobrar_pagar', label: 'Cta x Cobrar/Pagar' }, { value: 'tarjeta', label: 'Tarjeta' }, { value: 'anticipo', label: 'Anticipo' },
]
const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Codigo o nombre...' },
  { key: 'tipo', label: 'Tipo', type: 'select' as const, options: TIPOS.map((t) => ({ value: t.value, label: t.label })) },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [{ value: 'activos', label: 'Activos' }, { value: 'inactivos', label: 'Inactivos' }] },
]

export function FormasPagoPage() {
  const { profile } = useAuth(); const { confirm } = useAlertContext()
  const [list, setList] = useState<FormaPago[]>([]); const [loading, setLoading] = useState(false)
  const [cuentasPuc, setCuentasPuc] = useState<PucCuenta[]>([]); const [clasesDisp, setClasesDisp] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false); const [editRow, setEditRow] = useState<FormaPago | null>(null)
  const [formVals, setFormVals] = useState<Record<string, any>>({}); const [saving, setSaving] = useState(false)
  const loadData = useCallback(async (filters?: Record<string, string>) => {
    if (!profile?.emp_ide) return; setLoading(true)
    try { let data = await fetchFormasPago(profile.emp_ide); if (filters?.search) { const q = filters.search.toLowerCase(); data = data.filter((fp) => fp.codigo.toLowerCase().includes(q) || fp.nombre.toLowerCase().includes(q)) }; if (filters?.tipo) data = data.filter((fp) => fp.tipo === filters.tipo); if (filters?.ina === 'activos') data = data.filter((fp) => !fp.ina); else if (filters?.ina === 'inactivos') data = data.filter((fp) => fp.ina); setList(data) } finally { setLoading(false) }
  }, [profile])
  useEffect(() => { if (profile?.emp_ide) { fetchPuc(profile.emp_ide).then(setCuentasPuc); fetchTiposComp().then((tc) => setClasesDisp(tc.map((c) => ({ codigo: c.codigo, nombre: c.nombre })))) } }, [profile?.emp_ide])
  function toggleAplica(c: string) { setFormVals((prev: any) => { const arr: string[] = prev.aplica_en ?? []; return { ...prev, aplica_en: arr.includes(c) ? arr.filter((x) => x !== c) : [...arr, c] } }) }
  async function handleSave() {
    if (!profile?.emp_ide) return; setSaving(true)
    try { const data = { codigo: formVals.codigo, nombre: formVals.nombre, tipo: formVals.tipo || null, cuenta_puc_codigo: formVals.cuenta_puc_codigo || null, aplica_en: formVals.aplica_en ?? [], ina: formVals.ina ?? false }; if (editRow) await updateFormaPago(profile.emp_ide, editRow.ide, data); else await createFormaPago(profile.emp_ide, data); setShowForm(false); loadData() } catch (err: any) { alert(err?.message ?? 'Error') } finally { setSaving(false) }
  }
  const columns: DataColumn<FormaPago>[] = [
    { key: 'codigo', label: 'Codigo' }, { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo', render: (v) => { const t = TIPOS.find((x) => x.value === v); return <span className="text-xs">{t ? t.label : '-'}</span> } },
    { key: 'cuenta_puc_codigo', label: 'Cuenta PUC', render: (v) => v ? <span className="font-mono text-xs">{v}</span> : '-' },
    { key: 'aplica_en', label: 'Aplica', render: (v: any) => { const a: string[] = v ?? []; return a.length > 0 ? <span className="text-xs">{a.join(', ')}</span> : <span className="text-xs text-muted-foreground">Todas</span> } },
    { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} /> },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Formas de Pago</h1><Permiso accion="formas_pago.crear"><Button size="sm" onClick={() => { setEditRow(null); setFormVals({}); setShowForm(true) }}><Plus className="size-4" /> Nuevo</Button></Permiso></div>
      <FilterBar fields={filterFields} onSearch={loadData} onClear={() => loadData()} loading={loading} />
      <DataTable columns={columns} data={list} idKey="ide" loading={loading} onEditClick={(row) => { setEditRow(row as any); setFormVals({ ...(row as any), aplica_en: (row as any).aplica_en ?? [] }); setShowForm(true) }}
        onDelete={async (row) => { if (profile?.emp_ide && await confirm({ message: `Eliminar ${(row as any).nombre}?`, confirmLabel: 'Eliminar' })) { await deleteFormaPago(profile.emp_ide, (row as any).ide); loadData() } }}
        permisoEditar="formas_pago.editar" permisoEliminar="formas_pago.eliminar" />
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editRow ? 'Editar' : 'Nueva Forma de Pago'} width="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium mb-1 block">Codigo *</label><input type="text" value={formVals.codigo ?? ''} onChange={(e) => setFormVals({ ...formVals, codigo: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium mb-1 block">Nombre *</label><input type="text" value={formVals.nombre ?? ''} onChange={(e) => setFormVals({ ...formVals, nombre: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-medium mb-1 block">Tipo</label><select value={formVals.tipo ?? ''} onChange={(e) => setFormVals({ ...formVals, tipo: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Seleccionar...</option>{TIPOS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}</select></div>
            <div><label className="text-xs font-medium mb-1 block">Estado</label><select value={formVals.ina ? 'si' : 'no'} onChange={(e) => setFormVals({ ...formVals, ina: e.target.value === 'si' })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="no">Activo</option><option value="si">Inactivo</option></select></div>
          </div>
          <div><label className="text-xs font-medium mb-1 block">Cuenta Contable (PUC)</label><BuscarCuenta value={formVals.cuenta_puc_codigo ?? null} cuentas={cuentasPuc} onChange={(v) => setFormVals({ ...formVals, cuenta_puc_codigo: v })} placeholder="Buscar cuenta..." /></div>
          <div><label className="text-xs font-medium mb-2 block">Aplica en clases</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{clasesDisp.map((c) => { const checked = (formVals.aplica_en ?? []).includes(c.codigo); return (<label key={c.codigo} className="flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-accent"><input type="checkbox" checked={checked} onChange={() => toggleAplica(c.codigo)} className="size-4 accent-primary" />{c.codigo} - {c.nombre}</label>) })}</div><p className="mt-1 text-xs text-muted-foreground">{(!formVals.aplica_en || formVals.aplica_en.length === 0) ? 'Ninguna = aplica a todas' : `Seleccionadas: ${formVals.aplica_en.join(', ')}`}</p></div>
          <div className="flex justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button><Button onClick={handleSave} disabled={saving || !formVals.codigo || !formVals.nombre}><Save className="size-4" /> {saving ? 'Guardando...' : 'Guardar'}</Button></div>
        </div>
      </Modal>
    </div>
  )
}
