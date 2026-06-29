import { useEffect, useState } from 'react'
import { SuperBox, type SuperBoxItem } from '@/components/SuperBox'; import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'; import { fetchPuc } from '@/services/contabilidad'
import { fetchFactConfig, upsertFactConfig } from '@/services/facturacion'; import type { PucCuenta } from '@/types/contabilidad'

const CUENTAS = [
  { key: 'cuenta_clientes', label: 'Cuenta de Clientes (Debito)', defaultCodigo: '130505' },
  { key: 'cuenta_ventas', label: 'Cuenta de Ventas (Credito)', defaultCodigo: '413505' },
  { key: 'cuenta_iva', label: 'Cuenta de IVA (Credito)', defaultCodigo: '240805' },
  { key: 'cuenta_devoluciones', label: 'Cuenta Devoluciones', defaultCodigo: '417505' },
  { key: 'cuenta_descuentos', label: 'Cuenta Descuentos', defaultCodigo: '417510' },
]

export function ConfigContablePage() {
  const { profile } = useAuth(); const [cuentasPuc, setCuentasPuc] = useState<PucCuenta[]>([])
  const [config, setConfig] = useState<Record<string, string | null>>({}); const [dirty, setDirty] = useState(false); const [saving, setSaving] = useState(false)
  useEffect(() => { if (!profile?.emp_ide) return; fetchPuc(profile.emp_ide).then(setCuentasPuc); fetchFactConfig(profile.emp_ide).then((c) => { if (c) setConfig({ cuenta_clientes: c.cuenta_clientes, cuenta_ventas: c.cuenta_ventas, cuenta_iva: c.cuenta_iva, cuenta_devoluciones: c.cuenta_devoluciones, cuenta_descuentos: c.cuenta_descuentos }) }) }, [profile?.emp_ide])
  const pucItems: SuperBoxItem[] = cuentasPuc.map((c) => ({ id: c.codigo, label: `${c.codigo} - ${c.nombre}`, secondaryLabel: c.nombre }))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Configuracion Contable</h1><Button size="sm" onClick={async () => { if (!profile?.emp_ide) return; setSaving(true); try { await upsertFactConfig(profile.emp_ide, config as any); setDirty(false) } catch (err: any) { alert(err?.message ?? 'Error') } finally { setSaving(false) } }} disabled={!dirty || saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></div>
      <p className="text-sm text-muted-foreground">Asigna las cuentas PUC que se usaran automaticamente al crear facturas.</p>
      <div className="grid gap-4 sm:grid-cols-2">{CUENTAS.map(({ key, label }) => (<div key={key} className="rounded-lg border p-4"><label className="mb-2 block text-sm font-medium">{label}</label><SuperBox value={config[key] ?? null} items={pucItems} onChange={(v) => { setConfig((prev) => ({ ...prev, [key]: v })); setDirty(true) }} placeholder="Buscar cuenta..." /></div>))}</div>
    </div>
  )
}
