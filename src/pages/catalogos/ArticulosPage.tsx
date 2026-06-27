import { DollarSign, Receipt, Save, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CrudPage } from '@/components/CrudPage'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { createArticulo, deleteArticulo, fetchArticuloImpuestos, fetchArticulos, saveArticuloImpuestos, updateArticulo } from '@/services/articulos'
import { fetchTarifas } from '@/services/impuestos'
import { fetchPreciosArticulo, savePreciosArticulo, type PrecioInput } from '@/services/precios'
import type { Articulo, TarifaImpuesto } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Código o nombre...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

const formFields = [
  { key: 'codigo', label: 'Código', required: true },
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'presentacion', label: 'Presentación', placeholder: 'Ej: Caja, Paquete, Unidad' },
  { key: 'unidades_presentacion', label: 'Unds. por presentación', type: 'number' as const },
  { key: 'precio', label: 'Precio (sin IVA)', type: 'number' as const },
]

export function ArticulosPage() {
  const { profile } = useAuth()
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [tarifas, setTarifas] = useState<TarifaImpuesto[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTaxes, setSelectedTaxes] = useState<number[]>([])
  const [editTax, setEditTax] = useState<{ articuloIde: number; articuloNombre: string; tarifaIds: number[] } | null>(null)
  const [editPrecios, setEditPrecios] = useState<{ articuloIde: number; articuloNombre: string; precios: PrecioInput[]; taxIds: number[] } | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async (f?: Record<string, string>) => {
    if (!profile?.emp_ide) return
    setLoading(true)
    try {
      const [a, t] = await Promise.all([
        fetchArticulos(profile.emp_ide, f),
        fetchTarifas(profile.emp_ide),
      ])
      setArticulos(a)
      setTarifas(t)
    } finally { setLoading(false) }
  }, [profile?.emp_ide])

  useEffect(() => { if (profile?.emp_ide) fetchTarifas(profile.emp_ide).then(setTarifas) }, [profile?.emp_ide])

  function handleSearch(filters: Record<string, string>) { loadData(filters) }
  function handleClear() { setArticulos([]) }

  function addTax(tarifaId: number) {
    if (selectedTaxes.length >= 5 || selectedTaxes.includes(tarifaId)) return
    setSelectedTaxes([...selectedTaxes, tarifaId])
  }
  function removeTax(tarifaId: number) {
    setSelectedTaxes(selectedTaxes.filter((id) => id !== tarifaId))
  }

  const tarifasDisp = tarifas.filter((t) => !t.ina)
  const tarifasSelect = tarifasDisp.filter((t) => !selectedTaxes.includes(t.ide))
  const tarifasEditSel = editTax ? tarifasDisp.filter((t) => !editTax.tarifaIds.includes(t.ide)) : []

  function calcPos(precio: number, taxIds: number[]): number {
    const total = taxIds.reduce((s, id) => s + (tarifas.find((x) => x.ide === id)?.porcentaje ?? 0), 0)
    return Math.round(precio * (1 + total / 100) * 100) / 100
  }

  function calcFinal(precio: number, incluyeImpuesto: boolean, taxes: TarifaImpuesto[]) {
    const taxPct = taxes.reduce((s, t) => s + (t.porcentaje ?? 0), 0)
    if (incluyeImpuesto) {
      const base = Math.round((precio / (1 + taxPct / 100)) * 100) / 100
      const taxAmount = Math.round((precio - base) * 100) / 100
      return { taxPct, taxAmount, total: precio }
    }
    const taxAmount = Math.round((precio * taxPct / 100) * 100) / 100
    return { taxPct, taxAmount, total: precio + taxAmount }
  }

  async function handleCreate(vals: Record<string, any>) {
    if (!profile?.emp_ide) return
    setSaving(true)
    const precio = Number(vals.precio ?? 0)
    const n = await createArticulo(profile.emp_ide, {
      codigo: vals.codigo, nombre: vals.nombre, presentacion: vals.presentacion || null,
      unidades_presentacion: Number(vals.unidades_presentacion ?? 1), precio, precio_pos: calcPos(precio, selectedTaxes),
    })
    if (selectedTaxes.length > 0) await saveArticuloImpuestos(profile.emp_ide, n.ide, selectedTaxes)
    setSelectedTaxes([])
    setSaving(false)
    loadData()
  }

  async function handleSave(row: Articulo) {
    if (!profile?.emp_ide) return
    await updateArticulo(profile.emp_ide, row.ide, { ...row, precio_pos: calcPos(Number(row.precio), []) })
    loadData()
  }

  async function handleDelete(row: Articulo) {
    if (!profile?.emp_ide) return
    if (!confirm(`¿Eliminar ${row.nombre}?`)) return
    await deleteArticulo(profile.emp_ide, row.ide)
    loadData()
  }

  async function openTaxEditor(articulo: Articulo) {
    if (!profile?.emp_ide) return
    const imp = await fetchArticuloImpuestos(profile.emp_ide, articulo.ide)
    setEditTax({ articuloIde: articulo.ide, articuloNombre: articulo.nombre, tarifaIds: imp.map((i) => i.tarifa_id) })
  }

  async function saveEditTax() {
    if (!profile?.emp_ide || !editTax) return
    setSaving(true)
    await saveArticuloImpuestos(profile.emp_ide, editTax.articuloIde, editTax.tarifaIds)
    const a = articulos.find((x) => x.ide === editTax.articuloIde)
    if (a) await updateArticulo(profile.emp_ide, a.ide, { precio_pos: calcPos(Number(a.precio), editTax.tarifaIds) })
    setEditTax(null)
    setSaving(false)
    loadData()
  }

  async function openPriceEditor(articulo: Articulo) {
    if (!profile?.emp_ide) return
    try {
      const [imp, precios] = await Promise.all([
        fetchArticuloImpuestos(profile.emp_ide, articulo.ide),
        fetchPreciosArticulo(profile.emp_ide, articulo.ide),
      ])
      setEditPrecios({
        articuloIde: articulo.ide,
        articuloNombre: articulo.nombre,
        precios: precios.map((p) => ({ nombre: p.nombre, precio: Number(p.precio), incluye_impuesto: p.incluye_impuesto })),
        taxIds: imp.map((i) => i.tarifa_id),
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cargar precios')
    }
  }

  async function saveEditPrices() {
    if (!profile?.emp_ide || !editPrecios) return
    setSaving(true)
    try {
      await savePreciosArticulo(profile.emp_ide, editPrecios.articuloIde, editPrecios.precios)
      setEditPrecios(null)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar precios')
    } finally {
      setSaving(false)
    }
  }

  function addPrecioRow() {
    if (!editPrecios) return
    setEditPrecios({
      ...editPrecios,
      precios: [...editPrecios.precios, { nombre: '', precio: 0, incluye_impuesto: false }],
    })
  }

  function updatePrecioRow(idx: number, field: keyof PrecioInput, value: any) {
    if (!editPrecios) return
    const precios = [...editPrecios.precios]
    precios[idx] = { ...precios[idx], [field]: value }
    setEditPrecios({ ...editPrecios, precios })
  }

  function removePrecioRow(idx: number) {
    if (!editPrecios) return
    setEditPrecios({
      ...editPrecios,
      precios: editPrecios.precios.filter((_, i) => i !== idx),
    })
  }

  const columns = [
    { key: 'codigo', label: 'Código', editable: true },
    { key: 'nombre', label: 'Nombre', editable: true },
    { key: 'presentacion', label: 'Presentación', editable: true },
    { key: 'unidades_presentacion', label: 'Unds/Pres', editable: true,
      renderEdit: (v: any, _: any, onChange: any) => (
        <input type="number" min={1} defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-16 rounded border border-input bg-background px-2 py-1 text-xs" />
      ),
    },
    { key: 'precio', label: 'Precio', render: (v: any) => fmt(v), editable: true,
      renderEdit: (v: any, _: any, onChange: any) => (
        <input type="number" step="0.01" defaultValue={v} onChange={(e) => onChange(Number(e.target.value))} className="w-24 rounded border border-input bg-background px-2 py-1 text-right text-xs" />
      ),
    },
    { key: 'precio_pos', label: 'POS', render: (v: any) => fmt(v) },
    { key: 'ide', label: 'Acciones', render: (_v: any, row: any) => (
      <div className="flex gap-1">
        <button type="button" onClick={() => openTaxEditor(row)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Editar impuestos">
          <Receipt className="size-3.5" />
        </button>
        <button type="button" onClick={() => openPriceEditor(row)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Configurar precios">
          <DollarSign className="size-3.5" />
        </button>
      </div>
    )},
    { key: 'ina', label: 'Estado', render: (v: any) => <StatusBadge active={!v} />,
      renderEdit: (v: any, _: any, onChange: any) => (
        <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
          <option value="no">Activo</option><option value="si">Inactivo</option>
        </select>
      ),
    },
  ]

  return (
    <>
      <CrudPage
        title="Artículos"
        filterFields={filterFields}
        onSearch={handleSearch}
        onClear={handleClear}
        fields={formFields}
        columns={columns}
        data={articulos}
        idKey="ide"
        loading={loading}
        permisoCrear="articulos.crear"
        permisoEditar="articulos.editar"
        permisoEliminar="articulos.eliminar"
        onCreate={handleCreate}
        onSave={handleSave}
        onDelete={handleDelete}
        modalWidth="lg"
        renderModalContent={({ formVals }) => (
          <div className="mt-4 border-t pt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Impuestos asociados (máx 5)</p>
              {tarifasSelect.length > 0 && selectedTaxes.length < 5 && (
                <select value="" onChange={(e) => { const v = Number(e.target.value); if (v) addTax(v) }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  <option value="">+ Agregar impuesto</option>
                  {tarifasSelect.map((t: any) => (
                    <option key={t.ide} value={t.ide}>{t.nombre} ({t.porcentaje}%)</option>
                  ))}
                </select>
              )}
            </div>
            {selectedTaxes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin impuestos asignados</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTaxes.map((id) => {
                  const t = tarifas.find((x) => x.ide === id)
                  if (!t) return null
                  return (
                    <div key={id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm">
                      <span className="font-medium">{t.nombre}</span>
                      <span className="text-muted-foreground">{t.porcentaje}%</span>
                      <button type="button" onClick={() => removeTax(id)} className="text-muted-foreground hover:text-destructive">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              POS: {fmt(calcPos(Number(formVals.precio ?? 0), selectedTaxes))}
            </p>
          </div>
        )}
      />

      <Modal open={!!editTax} onClose={() => setEditTax(null)} title={`Impuestos — ${editTax?.articuloNombre ?? ''}`} width="md">
        {editTax && (
          <>
            <div className="mb-2 flex items-center gap-2">
              {tarifasEditSel.length > 0 && editTax.tarifaIds.length < 5 && (
                <select value="" onChange={(e) => { const v = Number(e.target.value); if (v) setEditTax({ ...editTax, tarifaIds: [...editTax.tarifaIds, v] }) }}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                  <option value="">+ Agregar impuesto</option>
                  {tarifasEditSel.map((t: any) => (
                    <option key={t.ide} value={t.ide}>{t.nombre} ({t.porcentaje}%)</option>
                  ))}
                </select>
              )}
              <span className="text-xs text-muted-foreground">{editTax.tarifaIds.length}/5</span>
            </div>
            {editTax.tarifaIds.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin impuestos asignados</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editTax.tarifaIds.map((id) => {
                  const t = tarifas.find((x) => x.ide === id)
                  if (!t) return null
                  return (
                    <div key={id} className="flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm">
                      <span className="font-medium">{t.nombre}</span>
                      <span className="text-muted-foreground">{t.porcentaje}%</span>
                      <button type="button" onClick={() => setEditTax({ ...editTax, tarifaIds: editTax.tarifaIds.filter((x) => x !== id) })} className="text-muted-foreground hover:text-destructive">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditTax(null)}>Cancelar</Button>
              <Button size="sm" onClick={saveEditTax} disabled={saving}><Save className="size-4" /> Guardar</Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!editPrecios} onClose={() => setEditPrecios(null)} title={`Precios — ${editPrecios?.articuloNombre ?? ''}`} width="lg">
        {editPrecios && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={addPrecioRow} title="Agregar precio">
                + Agregar precio
              </Button>
            </div>
            {editPrecios.precios.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin precios configurados</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                      <th className="px-3 py-2 w-44">Nombre</th>
                      <th className="px-3 py-2 w-28">Valor</th>
                      <th className="px-3 py-2 w-24 text-center">C/Imp</th>
                      <th className="px-3 py-2 w-36 text-right">Precio Final</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editPrecios.precios.map((p, idx) => {
                      const relevantTaxes = tarifas.filter((t) => editPrecios.taxIds.includes(t.ide))
                      const c = p.precio > 0 ? calcFinal(p.precio, p.incluye_impuesto, relevantTaxes) : null
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-1.5">
                            <input type="text" value={p.nombre}
                              onChange={(e) => updatePrecioRow(idx, 'nombre', e.target.value)}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                              placeholder="Ej: Minorista" />
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" step="0.01" value={p.precio}
                              onChange={(e) => updatePrecioRow(idx, 'precio', Number(e.target.value))}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-right text-xs" />
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <input type="checkbox"
                              checked={p.incluye_impuesto}
                              onChange={(e) => updatePrecioRow(idx, 'incluye_impuesto', e.target.checked)}
                              className="size-4 accent-primary" />
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            {c ? (
                              <div>
                                <span className="font-medium">{fmt(c.total)}</span>
                                {c.taxPct > 0 && (
                                  <span className="ml-1 text-[10px] text-muted-foreground">
                                    ({c.taxPct}% = {fmt(c.taxAmount)})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </td>
                          <td className="px-3 py-1.5">
                            <button type="button" onClick={() => removePrecioRow(idx)}
                              className="rounded p-1 text-muted-foreground hover:text-destructive" title="Eliminar">
                              <X className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditPrecios(null)}>Cancelar</Button>
              <Button size="sm" onClick={saveEditPrices} disabled={saving}><Save className="size-4" /> Guardar</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
