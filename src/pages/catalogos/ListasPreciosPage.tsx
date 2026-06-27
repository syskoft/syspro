import { Save, Settings, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CrudPage } from '@/components/CrudPage'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { fetchArticulosAll } from '@/services/articulos'
import { createLista, deleteLista, fetchItems, fetchListas, saveItems, updateLista, type ItemInput } from '@/services/listasPrecios'
import type { Articulo, ListaPrecio } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Nombre de lista...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activas' },
    { value: 'inactivos', label: 'Inactivas' },
  ]},
]

const formFields = [
  { key: 'nombre', label: 'Nombre', required: true, placeholder: 'Ej: Mayorista, VIP...' },
  { key: 'descripcion', label: 'Descripción' },
]

export function ListasPreciosPage() {
  const { profile } = useAuth()
  const [listas, setListas] = useState<(ListaPrecio & { item_count: number })[]>([])
  const [loading, setLoading] = useState(false)
  const [editItems, setEditItems] = useState<{
    listaIde: number; listaNombre: string; items: ItemInput[]; articulos: Pick<Articulo, 'ide' | 'codigo' | 'nombre' | 'ultimo_costo' | 'costo_promedio'>[]
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async (f?: Record<string, string>) => {
    if (!profile?.emp_ide) return
    setLoading(true)
    try {
      setListas(await fetchListas(profile.emp_ide, f))
    } finally { setLoading(false) }
  }, [profile?.emp_ide])

  function handleSearch(filters: Record<string, string>) { loadData(filters) }
  function handleClear() { setListas([]) }

  async function openItemEditor(lista: ListaPrecio & { item_count: number }) {
    if (!profile?.emp_ide) return
    try {
      const [items, articulos] = await Promise.all([
        fetchItems(profile.emp_ide, lista.ide),
        fetchArticulosAll(profile.emp_ide),
      ])
      setEditItems({
        listaIde: lista.ide,
        listaNombre: lista.nombre,
        items: items.map((i) => ({ articulo_ide: i.articulo_ide, tipo: i.tipo, valor: Number(i.valor) })),
        articulos,
      })
    } catch (err: any) {
      console.error('Error al cargar items:', err)
      alert(err?.message ?? 'Error al cargar items')
    }
  }

  async function saveItemEditor() {
    if (!profile?.emp_ide || !editItems) return
    setSaving(true)
    try {
      await saveItems(profile.emp_ide, editItems.listaIde, editItems.items)
      setEditItems(null)
      loadData()
    } catch (err: any) {
      console.error('Error al guardar items:', err)
      alert(err?.message ?? 'Error al guardar items')
    } finally { setSaving(false) }
  }

  function addItem() {
    if (!editItems || editItems.articulos.length === 0) return
    // Agregar el primer artículo disponible que no esté ya en la lista
    const used = new Set(editItems.items.map((i) => i.articulo_ide))
    const next = editItems.articulos.find((a) => !used.has(a.ide))
    if (!next) { alert('Todos los artículos ya están en la lista'); return }
    setEditItems({
      ...editItems,
      items: [...editItems.items, { articulo_ide: next.ide, tipo: 'fijo', valor: 0 }],
    })
  }

  function updateItem(idx: number, field: keyof ItemInput, value: any) {
    if (!editItems) return
    const items = [...editItems.items]
    items[idx] = { ...items[idx], [field]: value }
    setEditItems({ ...editItems, items })
  }

  function removeItem(idx: number) {
    if (!editItems) return
    setEditItems({ ...editItems, items: editItems.items.filter((_, i) => i !== idx) })
  }

  function calcPrecio(item: ItemInput, articulo?: Pick<Articulo, 'ultimo_costo' | 'costo_promedio'>): number | null {
    if (item.tipo === 'fijo') return item.valor
    const costo = articulo?.ultimo_costo ?? 0
    if (costo <= 0) return null
    return Math.round(costo * (1 + item.valor / 100) * 100) / 100
  }

  function getArticulo(articuloIde: number) {
    if (!editItems) return undefined
    return editItems.articulos.find((a) => a.ide === articuloIde)
  }

  return (
    <>
      <CrudPage
        title="Listas de Precios"
        filterFields={filterFields}
        onSearch={handleSearch}
        onClear={handleClear}
        fields={formFields}
        columns={[
          { key: 'nombre', label: 'Nombre', editable: true },
          { key: 'descripcion', label: 'Descripción', editable: true },
          { key: 'item_count', label: 'Artículos', render: (v: number) => <span className="font-mono text-xs">{v}</span> },
          { key: 'ide', label: 'Items', render: (_v: any, row: any) => (
            <button type="button" onClick={() => openItemEditor(row)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Configurar artículos de la lista">
              <Settings className="size-3.5" />
            </button>
          )},
          { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
            renderEdit: (v, _, onChange) => (
              <select defaultValue={v ? 'si' : 'no'} onChange={(e) => onChange(e.target.value === 'si')} className="rounded border border-input bg-background px-2 py-1 text-xs">
                <option value="no">Activo</option><option value="si">Inactivo</option>
              </select>
            ),
          },
        ]}
        data={listas}
        idKey="ide"
        loading={loading}
        permisoCrear="listas_precios.crear"
        permisoEditar="listas_precios.editar"
        permisoEliminar="listas_precios.eliminar"
        onCreate={async (vals: any) => { await createLista(profile?.emp_ide ?? '', { nombre: vals.nombre, descripcion: vals.descripcion }); loadData() }}
        onSave={async (row: any) => { if (profile?.emp_ide) await updateLista(profile.emp_ide, row.ide, { nombre: row.nombre, descripcion: row.descripcion, ina: row.ina }); loadData() }}
        onDelete={async (row) => { if (profile?.emp_ide && confirm(`¿Eliminar lista "${row.nombre}"?`)) { await deleteLista(profile.emp_ide, row.ide); loadData() } }}
      />

      <Modal open={!!editItems} onClose={() => setEditItems(null)} title={`Artículos — ${editItems?.listaNombre ?? ''}`} width="xl">
        {editItems && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={addItem}>+ Agregar artículo</Button>
            </div>
            {editItems.items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin artículos configurados</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Artículo</th>
                      <th className="px-3 py-2 w-20">Tipo</th>
                      <th className="px-3 py-2 w-24">Valor</th>
                      <th className="px-3 py-2 w-24">Costo</th>
                      <th className="px-3 py-2 w-28 text-right">Precio Calculado</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editItems.items.map((item, idx) => {
                      const a = getArticulo(item.articulo_ide)
                      const precio = calcPrecio(item, a)
                      return (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-3 py-1.5 font-mono text-xs">{a?.codigo ?? item.articulo_ide}</td>
                          <td className="px-3 py-1.5 text-xs">{a?.nombre ?? '—'}</td>
                          <td className="px-3 py-1.5">
                            <select value={item.tipo} onChange={(e) => updateItem(idx, 'tipo', e.target.value)}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-xs">
                              <option value="fijo">Fijo</option>
                              <option value="porcentual">%</option>
                            </select>
                          </td>
                          <td className="px-3 py-1.5">
                            <input type="number" step="0.01" value={item.valor}
                              onChange={(e) => updateItem(idx, 'valor', Number(e.target.value))}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-right text-xs" />
                          </td>
                          <td className="px-3 py-1.5 font-mono text-xs text-right">
                            {a ? fmt(a.ultimo_costo) : '—'}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            {precio !== null
                              ? <span className="font-medium text-xs">{fmt(precio)}</span>
                              : <span className="text-[10px] text-muted-foreground">Sin costo</span>
                            }
                          </td>
                          <td className="px-3 py-1.5">
                            <button type="button" onClick={() => removeItem(idx)}
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
              <Button size="sm" variant="outline" onClick={() => setEditItems(null)}>Cancelar</Button>
              <Button size="sm" onClick={saveItemEditor} disabled={saving}><Save className="size-4" /> Guardar</Button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}
