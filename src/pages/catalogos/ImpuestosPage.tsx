import { ChevronRight, Pencil, Plus, Save } from 'lucide-react'

import { Permiso } from '@/components/Permiso'
import { useCallback, useEffect, useState } from 'react'

import { Modal } from '@/components/Modal'
import { SuperBox, type SuperBoxItem } from '@/components/SuperBox'
import { Button } from '@/components/ui/button'
import { DataForm, type DataField } from '@/components/DataForm'
import { DataTable, type DataColumn } from '@/components/DataTable'
import { FilterBar, type FilterField } from '@/components/FilterBar'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { fetchPuc } from '@/services/contabilidad'
import {
  createTarifa,
  deleteTarifa,
  fetchClases,
  fetchConfigClase,
  fetchTarifas,
  updateTarifa,
} from '@/services/impuestos'
import type { ClaseImpuesto, TarifaConfigItem, TarifaImpuesto } from '@/types/database'
import type { PucCuenta } from '@/types/contabilidad'

const filterFields: FilterField[] = [
  { key: 'search', label: 'Buscar', placeholder: 'Nombre o clase...' },
  { key: 'ina', label: 'Estado', type: 'select', options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function ImpuestosPage() {
  const { profile } = useAuth()
  const [tarifas, setTarifas] = useState<TarifaImpuesto[]>([])
  const [clases, setClases] = useState<ClaseImpuesto[]>([])
  const [cuentasPuc, setCuentasPuc] = useState<PucCuenta[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formVals, setFormVals] = useState<Record<string, any>>({})
  const [editRow, setEditRow] = useState<TarifaImpuesto | null>(null)
  const [editVals, setEditVals] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  // Modal de configuración contable
  const [configTarifa, setConfigTarifa] = useState<TarifaImpuesto | null>(null)
  const [configEditing, setConfigEditing] = useState(false)
  const [configItems, setConfigItems] = useState<TarifaConfigItem[]>([])
  const [configDirty, setConfigDirty] = useState(false)

  const loadTarifas = useCallback(async (filtros?: Record<string, string>) => {
    if (!profile?.emp_ide) return
    setLoading(true)
    try {
      const [t, c, p] = await Promise.all([
        fetchTarifas(profile.emp_ide, filtros),
        fetchClases(),
        fetchPuc(profile.emp_ide),
      ])
      setTarifas(t)
      setClases(c)
      setCuentasPuc(p)
    } finally {
      setLoading(false)
    }
  }, [profile?.emp_ide])

  useEffect(() => { loadTarifas() }, [loadTarifas])

  function handleSearch(filters: Record<string, string>) { loadTarifas(filters) }
  function handleClear() { setTarifas([]) }

  const formFields: DataField[] = [
    {
      key: 'clase_codigo', label: 'Clase', type: 'select', required: true,
      options: clases.map((c) => ({ value: c.codigo, label: `${c.codigo} - ${c.nombre}` })),
    },
    { key: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej: IVA 19%' },
    { key: 'porcentaje', label: '%', type: 'number', required: true, width: 'sm' },
  ]

  async function handleCreate() {
    if (!profile?.emp_ide) return
    setSaving(true)
    const configs = await fetchConfigClase(formVals.clase_codigo)
    const config: TarifaConfigItem[] = configs.map((c) => ({
      concepto: c.concepto,
      naturaleza: c.naturaleza,
      cuenta_puc: null,
    }))
    await createTarifa(profile.emp_ide, {
      clase_codigo: formVals.clase_codigo,
      nombre: formVals.nombre,
      porcentaje: Number(formVals.porcentaje),
      config,
    })
    setShowForm(false)
    setFormVals({})
    setSaving(false)
    loadTarifas()
  }

  function openConfig(tarifa: TarifaImpuesto) {
    setConfigTarifa(tarifa)
    setConfigItems(JSON.parse(JSON.stringify(tarifa.config ?? [])))
    setConfigEditing(false)
    setConfigDirty(false)
  }

  function updateConfigItem(idx: number, cuentaPuc: string | null) {
    setConfigItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], cuenta_puc: cuentaPuc ?? null }
      return next
    })
    setConfigDirty(true)
  }

  async function saveConfig() {
    if (!profile?.emp_ide || !configTarifa) return
    setSaving(true)
    await updateTarifa(profile.emp_ide, configTarifa.ide, { config: configItems })
    setConfigEditing(false)
    setConfigDirty(false)
    setSaving(false)
    setConfigTarifa(null)
    loadTarifas()
  }

  const cuentasItems: SuperBoxItem[] = cuentasPuc.map((c) => ({
    id: c.codigo,
    label: `${c.codigo} - ${c.nombre}`,
    secondaryLabel: c.nombre,
  }))

  const columns: DataColumn<TarifaImpuesto>[] = [
    { key: 'clases_impuestos', label: 'Clase', render: (v) => <span className="font-medium">{v?.nombre ?? '-'}</span> },
    { key: 'nombre', label: 'Nombre', editable: true },
    { key: 'porcentaje', label: '%', render: (v) => `${Number(v).toFixed(2)}%`, editable: true,
      renderEdit: (v, _, onChange) => (
        <input type="number" step="0.01" defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs" />
      ),
    },
    { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
      renderEdit: (v, _, onChange) => (
        <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
          <option value="no">Activo</option><option value="si">Inactivo</option>
        </select>
      ),
    },
    {
      key: 'ide', label: 'Config',
      render: (_v, row) => (
        <button type="button" onClick={() => openConfig(row)} className="flex items-center gap-0.5 rounded p-1 text-muted-foreground hover:bg-accent" title="Configuración contable">
          <ChevronRight className="size-4" />
          <span className="text-[10px]">{row.config?.length ?? 0}</span>
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Impuestos</h1>
        <Permiso accion="impuestos.crear">
          <Button size="sm" onClick={() => setShowForm(true)} title="Nuevo"><Plus className="size-4" /></Button>
        </Permiso>
      </div>

      <FilterBar fields={filterFields} onSearch={handleSearch} onClear={handleClear} loading={loading} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva tarifa">
        <DataForm fields={formFields} values={formVals} onChange={(k, v) => setFormVals({ ...formVals, [k]: v })}
          onSubmit={handleCreate} onCancel={() => setShowForm(false)} submitLabel="Crear" loading={saving} />
      </Modal>

      <Modal open={!!editRow} onClose={() => setEditRow(null)} title="Editar tarifa">
        <DataForm fields={formFields} values={editVals} onChange={(k, v) => setEditVals({ ...editVals, [k]: v })}
          onSubmit={async () => { if (editRow && profile?.emp_ide) { await updateTarifa(profile.emp_ide, editRow.ide, editVals as any); setEditRow(null); loadTarifas() } }}
          onCancel={() => setEditRow(null)} submitLabel="Guardar" loading={saving} />
      </Modal>

      <DataTable columns={columns} data={tarifas} idKey="ide" loading={loading}
        onSave={async (row) => { if (profile?.emp_ide) { await updateTarifa(profile.emp_ide, row.ide, row); loadTarifas() } }}
        onEditClick={(row) => { setEditRow(row); setEditVals(row) }}
        onDelete={async (row) => { if (profile?.emp_ide && confirm(`¿Eliminar ${row.nombre}?`)) { await deleteTarifa(profile.emp_ide, row.ide); loadTarifas() } }}
        permisoEditar="impuestos.editar"
        permisoEliminar="impuestos.eliminar"
      />

      {/* Modal de configuración contable */}
      <Modal open={!!configTarifa} onClose={() => { if (!configDirty || confirm('¿Descartar cambios?')) setConfigTarifa(null) }} title={`Config. Contable — ${configTarifa?.nombre ?? ''}`} width="lg">
        {configTarifa && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {configEditing ? 'Editando configuración contable' : `${configItems.length} concepto(s) contable(s)`}
              </p>
              {configEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setConfigItems(JSON.parse(JSON.stringify(configTarifa!.config ?? []))); setConfigEditing(false); setConfigDirty(false) }}>Cancelar</Button>
                  <Button size="sm" onClick={saveConfig} disabled={!configDirty || saving}><Save className="size-4" /> Guardar</Button>
                </div>
              ) : (
                <Permiso accion="impuestos.config_contable">
                  <Button size="sm" variant="outline" onClick={() => setConfigEditing(true)}><Pencil className="size-3.5" /> Editar</Button>
                </Permiso>
              )}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="theme-table-header">
                  <th className="px-3 py-2">Concepto</th>
                  <th className="px-3 py-2">Cuenta PUC</th>
                  <th className="px-3 py-2 w-16">Nat</th>
                </tr>
              </thead>
              <tbody>
                {configItems.map((item, idx) => (
                  <tr key={idx} className="theme-table-row">
                    <td className="px-3 py-1.5 text-xs">{item.concepto}</td>
                    <td className="px-3 py-1.5">
                      {configEditing ? (
                        <SuperBox value={item.cuenta_puc} items={cuentasItems} onChange={(v) => updateConfigItem(idx, v)} />
                      ) : (
                        <span className="text-xs font-mono">{item.cuenta_puc ?? <span className="text-muted-foreground italic">Sin asignar</span>}</span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${item.naturaleza === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.naturaleza === 'D' ? 'Db' : 'Cr'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Modal>
    </div>
  )
}
