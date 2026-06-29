import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'; import { StatusBadge } from '@/components/StatusBadge'
import { useAuth } from '@/contexts/AuthContext'
import { fetchFacturaById, fetchFacturaItems, fmtNum } from '@/services/facturacion'
import { supabase } from '@/lib/supabase'
import type { AsientoContable, Comprobante, Factura, FacturaItem } from '@/types/database'
const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

export function FacturaDetallePage() {
  const { id } = useParams(); const navigate = useNavigate(); const { profile } = useAuth()
  const [factura, setFactura] = useState<Factura | null>(null); const [items, setItems] = useState<FacturaItem[]>([])
  const [comprobante, setComprobante] = useState<Comprobante | null>(null); const [asientos, setAsientos] = useState<AsientoContable[]>([])
  const [loading, setLoading] = useState(true); const [terceroNombre, setTerceroNombre] = useState('')
  useEffect(() => { if (!profile?.emp_ide || !id) return; const fi = Number(id); loadData(fi) }, [profile?.emp_ide, id])
  async function loadData(fi: number) {
    if (!profile?.emp_ide) return; setLoading(true)
    try { const f = await fetchFacturaById(profile.emp_ide, fi); if (!f) { setLoading(false); return }; setFactura(f)
      const [it, comp] = await Promise.all([fetchFacturaItems(profile.emp_ide, fi), f.comprobante_ide ? supabase.from('comprobantes').select('*').eq('emp_ide', profile.emp_ide).eq('ide', f.comprobante_ide).maybeSingle() : Promise.resolve(null)])
      setItems(it); if (comp?.data) { setComprobante(comp.data); const { data: as } = await supabase.from('asientos_contables').select('*').eq('emp_ide', profile.emp_ide).eq('comprobante_ide', comp.data.ide).order('ide'); setAsientos(as ?? []) }
      const { data: t } = await supabase.from('terceros').select('nombre').eq('emp_ide', profile.emp_ide).eq('ide', f.tercero_ide).single(); if (t) setTerceroNombre(t.nombre)
    } finally { setLoading(false) }
  }
  if (loading) return <p className="py-8 text-center text-muted-foreground">Cargando...</p>
  if (!factura) return <p className="py-8 text-center text-muted-foreground">Factura no encontrada</p>
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => navigate('/dashboard/informes/facturas')}>←</Button>
        <div><h1 className="text-2xl font-bold">{factura.prefijo}-{fmtNum(factura.consecutivo)}</h1><p className="text-sm text-muted-foreground">{factura.tipo_comp} · {factura.fecha?.slice(0, 10)} · <StatusBadge active={factura.estado === 'emitida' || factura.estado === 'pagada'} /></p></div></div>
      <div className="grid grid-cols-2 gap-6 rounded-lg border p-4">
        <div><p className="text-xs text-muted-foreground">Cliente</p><p className="font-medium">{terceroNombre || `ID ${factura.tercero_ide}`}</p></div>
        <div><p className="text-xs text-muted-foreground">Vencimiento</p><p className="font-medium">{factura.fecha_vencimiento?.slice(0, 10) ?? 'Sin vencimiento'}</p></div>
        <div className="col-span-2"><p className="text-xs text-muted-foreground">Concepto</p><p className="font-medium">{factura.concepto ?? 'Sin concepto'}</p></div>
      </div>
      <div className="rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground"><th className="px-3 py-2">Articulo</th><th className="px-3 py-2 w-16 text-center">Cant</th><th className="px-3 py-2 w-24 text-right">Precio</th><th className="px-3 py-2 w-16 text-center">IVA%</th><th className="px-3 py-2 w-20 text-right">IVA</th><th className="px-3 py-2 w-28 text-right">Total</th></tr></thead>
        <tbody>{items.map((item) => (<tr key={item.ide} className="border-b last:border-0"><td className="px-3 py-2">Articulo {item.articulo_ide ?? 'Servicio'}</td><td className="px-3 py-2 text-center">{item.cantidad}</td><td className="px-3 py-2 text-right font-mono">{fmt(item.precio_unitario)}</td><td className="px-3 py-2 text-center">{item.iva_porcentaje}%</td><td className="px-3 py-2 text-right font-mono">{fmt(item.iva_valor)}</td><td className="px-3 py-2 text-right font-mono">{fmt(item.total)}</td></tr>))}</tbody></table>
        <div className="flex justify-end gap-6 border-t bg-muted/20 px-3 py-2 text-sm"><span>Subtotal: <strong className="font-mono">{fmt(factura.sub_total)}</strong></span><span>IVA: <strong className="font-mono">{fmt(factura.total_impuestos)}</strong></span><span className="text-base">Total: <strong className="font-mono">{fmt(factura.total)}</strong></span></div></div>
      {comprobante && (<div className="rounded-lg border"><div className="border-b bg-muted/30 px-3 py-2 text-sm font-medium">Comprobante contable #{comprobante.consecutivo} · {comprobante.fecha?.slice(0, 10)}</div>
        <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground"><th className="px-3 py-2">Cuenta PUC</th><th className="px-3 py-2">Detalle</th><th className="px-3 py-2 w-28 text-right">Debito</th><th className="px-3 py-2 w-28 text-right">Credito</th></tr></thead>
        <tbody>{asientos.map((a) => (<tr key={a.ide} className="border-b last:border-0"><td className="px-3 py-2 font-mono text-xs">{a.cuenta_puc_codigo}</td><td className="px-3 py-2 text-xs">{a.detalle}</td><td className="px-3 py-2 text-right font-mono text-xs">{a.debito > 0 ? fmt(a.debito) : ''}</td><td className="px-3 py-2 text-right font-mono text-xs">{a.credito > 0 ? fmt(a.credito) : ''}</td></tr>))}<tr className="border-t bg-muted/20 font-medium"><td colSpan={2} className="px-3 py-2 text-xs">Totales</td><td className="px-3 py-2 text-right font-mono text-xs">{fmt(asientos.reduce((s, a) => s + a.debito, 0))}</td><td className="px-3 py-2 text-right font-mono text-xs">{fmt(asientos.reduce((s, a) => s + a.credito, 0))}</td></tr></tbody></table></div>)}
      <div className="flex gap-2"><Button variant="outline" onClick={() => navigate('/dashboard/informes/facturas')}>Volver</Button></div>
    </div>
  )
}
