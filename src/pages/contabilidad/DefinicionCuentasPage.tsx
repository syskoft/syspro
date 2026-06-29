import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SuperBox, type SuperBoxItem } from '@/components/SuperBox'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { fetchDefCuentas, fetchPuc, saveDefCuentas } from '@/services/contabilidad'
import type { PucCuenta } from '@/types/contabilidad'

const tabs = [
  { id: 'impuestos', label: 'Impuestos' },
  { id: 'transacciones', label: 'Transacciones' },
  { id: 'comerciales', label: 'Comerciales' },
  { id: 'financieros', label: 'Financieros' },
  { id: 'varios', label: 'Varios' },
]

interface DefCuenta {
  ide: number
  emp_ide: string
  tab: string
  seccion: string
  concepto_id: string
  concepto: string
  cuenta_puc: string | null
  naturaleza: 'D' | 'C'
}

export function DefinicionCuentasPage() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('impuestos')
  const [rows, setRows] = useState<DefCuenta[]>([])
  const [cuentas, setCuentas] = useState<PucCuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<Record<number, string | null>>({})

  useEffect(() => {
    if (!profile?.emp_ide) return
    setLoading(true)
    Promise.all([
      fetchDefCuentas(profile.emp_ide, activeTab),
      fetchPuc(profile.emp_ide),
    ])
      .then(([r, c]) => { setRows(r); setCuentas(c) })
      .finally(() => setLoading(false))
  }, [profile?.emp_ide, activeTab])

  function handleChange(ide: number, cuentaPuc: string | null) {
    setChanges((prev) => ({ ...prev, [ide]: cuentaPuc }))
    setDirty(true)
  }

  function getCuentaPuc(ide: number): string | null {
    if (ide in changes) return changes[ide]
    return rows.find((r) => r.ide === ide)?.cuenta_puc ?? null
  }

  async function handleSave() {
    if (!profile?.emp_ide) return
    setSaving(true)
    try {
      const updates = Object.entries(changes).map(([ide, cuenta_puc]) => ({
        ide: Number(ide),
        cuenta_puc,
      }))
      await saveDefCuentas(profile.emp_ide, updates)
      setChanges({})
      setDirty(false)
      // Refresh
      const data = await fetchDefCuentas(profile.emp_ide, activeTab)
      setRows(data)
    } finally {
      setSaving(false)
    }
  }

  const izquierda = rows.filter((r) => r.seccion === 'izquierda')
  const derecha = rows.filter((r) => r.seccion === 'derecha')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Definición de Cuentas Contables</h1>
        <Button size="sm" onClick={handleSave} disabled={!dirty || saving} title={saving ? 'Guardando...' : 'Guardar configuración'}>
          <Save className="size-4" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.id === 'impuestos' && <StatusBadge active className="!text-[10px] !px-1.5 !py-0" />}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : activeTab !== 'impuestos' ? (
        <p className="py-12 text-center text-muted-foreground">
          Configuración próximamente
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Columna izquierda */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Impuestos y Retenciones Generales</h2>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                    <th className="px-3 py-2">Concepto</th>
                    <th className="px-3 py-2">Cuenta PUC</th>
                    <th className="px-3 py-2 w-16">Nat</th>
                  </tr>
                </thead>
                <tbody>
                  {izquierda.map((row) => (
                    <tr key={row.ide} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-1.5 text-xs">{row.concepto}</td>
                      <td className="px-3 py-1.5">
                        <SuperBox
                          value={getCuentaPuc(row.ide)}
                          items={cuentas.map((c) => ({ id: c.codigo, label: `${c.codigo} - ${c.nombre}`, secondaryLabel: c.nombre })) as SuperBoxItem[]}
                          onChange={(v) => handleChange(row.ide, v)}
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-medium', row.naturaleza === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')}>
                          {row.naturaleza === 'D' ? 'Db' : 'Cr'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna derecha */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Impuestos Específicos y Saludables</h2>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                    <th className="px-3 py-2">Concepto</th>
                    <th className="px-3 py-2">Cuenta PUC</th>
                    <th className="px-3 py-2 w-16">Nat</th>
                  </tr>
                </thead>
                <tbody>
                  {derecha.map((row) => (
                    <tr key={row.ide} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-1.5 text-xs">{row.concepto}</td>
                      <td className="px-3 py-1.5">
                        <SuperBox
                          value={getCuentaPuc(row.ide)}
                          items={cuentas.map((c) => ({ id: c.codigo, label: `${c.codigo} - ${c.nombre}`, secondaryLabel: c.nombre })) as SuperBoxItem[]}
                          onChange={(v) => handleChange(row.ide, v)}
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-medium', row.naturaleza === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700')}>
                          {row.naturaleza === 'D' ? 'Db' : 'Cr'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
