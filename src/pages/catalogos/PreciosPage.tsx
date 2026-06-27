import { useCallback, useState } from 'react'

import { CrudPage } from '@/components/CrudPage'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { fetchArticuloImpuestos } from '@/services/articulos'
import { createPrecio, deletePrecio, fetchPrecios, updatePrecio } from '@/services/precios'
import type { ArticuloPrecio, TarifaImpuesto } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

const filterFields = [
  { key: 'search', label: 'Buscar', placeholder: 'Artículo o nombre de precio...' },
  { key: 'ina', label: 'Estado', type: 'select' as const, options: [
    { value: 'activos', label: 'Activos' },
    { value: 'inactivos', label: 'Inactivos' },
  ]},
]

export function PreciosPage() {
  const { profile } = useAuth()
  const [precios, setPrecios] = useState<ArticuloPrecio[]>([])
  const [loading, setLoading] = useState(false)

  // Cache de tarifas por artículo para cálculo de impuestos (articulo_ide → tarifa[])
  const [taxCache, setTaxCache] = useState<Record<number, TarifaImpuesto[]>>({})

  const loadData = useCallback(async (f?: Record<string, string>) => {
    if (!profile?.emp_ide) return
    setLoading(true)
    try {
      const p = await fetchPrecios(profile.emp_ide, f)
      setPrecios(p)

      // Precargar impuestos de los artículos que aparecen
      const articleIds = [...new Set(p.map((x) => x.articulo_ide))]
      const missing = articleIds.filter((id) => !taxCache[id])
      if (missing.length > 0 && profile?.emp_ide) {
        const entries = await Promise.all(
          missing.map(async (id) => {
            const imp = await fetchArticuloImpuestos(profile.emp_ide!, id)
            return [id, imp.map((i) => i.tarifa).filter(Boolean) as TarifaImpuesto[]] as const
          }),
        )
        setTaxCache((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
      }
    } finally {
      setLoading(false)
    }
  }, [profile?.emp_ide])

  function handleSearch(filters: Record<string, string>) { loadData(filters) }
  function handleClear() { setPrecios([]) }

  function calcTotal(precio: number, incluyeImpuesto: boolean, taxes: TarifaImpuesto[]) {
    const taxPct = taxes.reduce((s, t) => s + (t.porcentaje ?? 0), 0)
    if (incluyeImpuesto) {
      const base = Math.round((precio / (1 + taxPct / 100)) * 100) / 100
      const taxAmount = Math.round((precio - base) * 100) / 100
      return { base, taxPct, taxAmount, total: precio, incluyeImpuesto }
    }
    const taxAmount = Math.round((precio * taxPct / 100) * 100) / 100
    return { base: precio, taxPct, taxAmount, total: precio + taxAmount, incluyeImpuesto }
  }

  function getTaxes(row: ArticuloPrecio): TarifaImpuesto[] {
    return taxCache[row.articulo_ide] ?? []
  }

  const formFields = [
    { key: 'articulo_ide', label: 'Artículo', type: 'select' as const, required: true,
      options: [...new Map(precios.map((p) => [p.articulo_ide, p.articulo])).entries()]
        .filter(([_, a]) => a)
        .map(([id, a]) => ({ value: String(id), label: `${a!.codigo} - ${a!.nombre}` })),
    },
    { key: 'nombre', label: 'Nombre del precio', required: true, placeholder: 'Ej: Minorista, Mayorista...' },
    { key: 'precio', label: 'Valor', type: 'number' as const, required: true },
  ]

  async function handleCreate(vals: Record<string, any>) {
    if (!profile?.emp_ide) return
    await createPrecio(profile.emp_ide, {
      articulo_ide: Number(vals.articulo_ide),
      nombre: vals.nombre,
      precio: Number(vals.precio),
      incluye_impuesto: vals.incluye_impuesto === true || vals.incluye_impuesto === 'true',
    })
    loadData()
  }

  async function handleSave(row: ArticuloPrecio) {
    if (!profile?.emp_ide) return
    await updatePrecio(profile.emp_ide, row.ide, row)
    loadData()
  }

  async function handleDelete(row: ArticuloPrecio) {
    if (!profile?.emp_ide) return
    if (!confirm(`¿Eliminar precio "${row.nombre}"?`)) return
    await deletePrecio(profile.emp_ide, row.ide)
    loadData()
  }

  return (
    <CrudPage
      title="Precios"
      filterFields={filterFields}
      onSearch={handleSearch}
      onClear={handleClear}
      fields={formFields}
      columns={[
        { key: 'articulo', label: 'Código', render: (v) => <span className="font-mono text-xs">{v?.codigo ?? '-'}</span> },
        { key: 'articulo', label: 'Artículo', render: (v) => v?.nombre ?? '-' },
        { key: 'nombre', label: 'Nombre', editable: true },
        { key: 'precio', label: 'Valor', render: (v) => fmt(v), editable: true,
          renderEdit: (v, _, onChange) => (
            <input type="number" step="0.01" defaultValue={v}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-24 rounded border border-input bg-background px-2 py-1 text-right text-xs" />
          ),
        },
        { key: 'incluye_impuesto', label: 'C/Impuesto', render: (v) => v ? 'Sí' : 'No',
          renderEdit: (v, _row, onChange) => (
            <select defaultValue={v ? 'si' : 'no'}
              onChange={(e) => onChange(e.target.value === 'si')}
              className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="no">No</option><option value="si">Sí</option>
            </select>
          ),
        },
        { key: 'ide', label: 'Precio Final', render: (_v, row) => {
          const c = calcTotal(Number(row.precio), row.incluye_impuesto, getTaxes(row))
          return (
            <div className="text-right">
              <span className="font-medium">{fmt(c.total)}</span>
              {c.taxPct > 0 && (
                <span className="ml-1 text-[10px] text-muted-foreground">
                  ({c.incluyeImpuesto ? 'inc' : '+'}{c.taxPct}% = {fmt(c.incluyeImpuesto ? c.base : c.taxAmount)})
                </span>
              )}
            </div>
          )
        }},
        { key: 'ina', label: 'Estado', render: (v) => <StatusBadge active={!v} />,
          renderEdit: (v, _, onChange) => (
            <select defaultValue={v ? 'si' : 'no'}
              onChange={(e) => onChange(e.target.value === 'si')}
              className="rounded border border-input bg-background px-2 py-1 text-xs">
              <option value="no">Activo</option><option value="si">Inactivo</option>
            </select>
          ),
        },
      ]}
      data={precios}
      idKey="ide"
      loading={loading}
      onCreate={handleCreate}
      onSave={handleSave}
      onDelete={handleDelete}
      permisoCrear="precios.crear"
      permisoEditar="precios.editar"
      permisoEliminar="precios.eliminar"
      modalWidth="md"
      renderModalContent={({ formVals, onChange }) => {
        const articuloIde = Number(formVals.articulo_ide)
        const taxes = articuloIde ? taxCache[articuloIde] ?? [] : []
        const precio = Number(formVals.precio ?? 0)
        const incluye = formVals.incluye_impuesto === true || formVals.incluye_impuesto === 'true'
        const c = precio > 0 ? calcTotal(precio, incluye, taxes) : null
        return (
          <div className="mt-4 space-y-3 border-t pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox"
                checked={incluye}
                onChange={(e) => onChange('incluye_impuesto', e.target.checked)}
                className="size-4 accent-primary" />
              Este precio ya incluye impuestos
            </label>
            {c && (
              <div className="rounded-md border bg-muted/20 p-3 text-sm space-y-1">
                <p className="font-medium">Desglose:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Base</span>
                  <span className="text-right font-mono">{fmt(c.base)}</span>
                  <span className="text-muted-foreground">Impuesto ({c.taxPct}%)</span>
                  <span className="text-right font-mono">{fmt(c.taxAmount)}</span>
                  <span className="text-muted-foreground font-medium">Total</span>
                  <span className="text-right font-mono font-semibold">{fmt(c.total)}</span>
                </div>
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
