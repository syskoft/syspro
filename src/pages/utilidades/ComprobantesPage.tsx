import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { AsientoContable, FacturaItem } from '@/types/database'
const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

export function ComprobantesPage() {
  const { profile } = useAuth()
  const [comprobantes, setComprobantes] = useState<any[]>([]); const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState(''); const [expandId, setExpandId] = useState<number | null>(null)
  const [items, setItems] = useState<FacturaItem[]>([]); const [asientos, setAsientos] = useState<AsientoContable[]>([]); const [loadingDetail, setLoadingDetail] = useState(false)
  const loadData = useCallback(async () => {
    if (!profile?.emp_ide) return; setLoading(true)
    let q = supabase.from('comprobantes').select('*').eq('emp_ide', profile.emp_ide).order('created_at', { ascending: false }).limit(50)
    if (search) q = q.ilike('concepto', `%${search}%`)
    const { data } = await q; if (data) setComprobantes(data); setLoading(false)
  }, [profile?.emp_ide, search])
  useEffect(() => { loadData() }, [loadData])
  async function toggleExpand(comp: any) {
    if (expandId === comp.ide) { setExpandId(null); return }; setExpandId(comp.ide); setLoadingDetail(true)
    try {
      const [it, as] = await Promise.all([
        comp.origen_factura ? supabase.from('factura_items').select('*').eq('emp_ide', profile?.emp_ide).eq('factura_ide', comp.origen_factura) : Promise.resolve({ data: [] }),
        supabase.from('asientos_contables').select('*').eq('emp_ide', profile?.emp_ide).eq('comprobante_ide', comp.ide).order('ide'),
      ])
      setItems((it.data ?? []) as FacturaItem[]); setAsientos((as.data ?? []) as AsientoContable[])
    } finally { setLoadingDetail(false) }
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Comprobantes</h1>
        <div className="relative w-64"><Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none" /></div></div>
      <div className="rounded-lg border">
        {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p> : comprobantes.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sin comprobantes</p> : (
        <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground"><th className="px-3 py-2 w-10"></th><th className="px-3 py-2 w-16">#</th><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Concepto</th><th className="px-3 py-2 w-24">Estado</th></tr></thead>
        <tbody>{comprobantes.map((c) => (<>
          <tr key={c.ide} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => toggleExpand(c)}><td className="px-3 py-2.5">{expandId === c.ide ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</td><td className="px-3 py-2.5 font-mono text-xs">{c.consecutivo}</td><td className="px-3 py-2.5 text-xs">{c.fecha?.slice(0, 10)}</td><td className="px-3 py-2.5 text-xs">{c.concepto ?? '-'}</td><td className="px-3 py-2.5 text-xs">{c.estado}</td></tr>
          {expandId === c.ide && (<tr key={`${c.ide}-d`}><td colSpan={5} className="px-0 py-0">
            {loadingDetail ? <p className="px-6 py-4 text-xs text-muted-foreground">Cargando...</p> : (
            <div className="border-t bg-muted/10 px-6 py-4 space-y-4">
              {items.length > 0 && (<div><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Items</p><table className="w-full text-xs"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-2 py-1">Artículo</th><th className="px-2 py-1 w-14 text-center">Cant</th><th className="px-2 py-1 w-20 text-right">Precio</th><th className="px-2 py-1 w-14 text-center">IVA%</th><th className="px-2 py-1 w-20 text-right">Total</th></tr></thead><tbody>{items.map((item) => (<tr key={item.ide} className="border-b last:border-0"><td className="px-2 py-1">Artículo {item.articulo_ide ?? 'Servicio'}</td><td className="px-2 py-1 text-center">{item.cantidad}</td><td className="px-2 py-1 text-right font-mono">{fmt(item.precio_unitario)}</td><td className="px-2 py-1 text-center">{item.iva_porcentaje}%</td><td className="px-2 py-1 text-right font-mono">{fmt(item.total)}</td></tr>))}</tbody></table></div>)}
              {asientos.length > 0 && (<div><p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Contabilización</p><table className="w-full text-xs"><thead><tr className="border-b text-left text-muted-foreground"><th className="px-2 py-1">Cuenta PUC</th><th className="px-2 py-1">Detalle</th><th className="px-2 py-1 w-24 text-right">Débito</th><th className="px-2 py-1 w-24 text-right">Crédito</th></tr></thead><tbody>{asientos.map((a) => (<tr key={a.ide} className="border-b last:border-0"><td className="px-2 py-1 font-mono">{a.cuenta_puc_codigo}</td><td className="px-2 py-1">{a.detalle}</td><td className="px-2 py-1 text-right font-mono">{a.debito > 0 ? fmt(a.debito) : ''}</td><td className="px-2 py-1 text-right font-mono">{a.credito > 0 ? fmt(a.credito) : ''}</td></tr>))}<tr className="border-t font-medium"><td colSpan={2} className="px-2 py-1">Totales</td><td className="px-2 py-1 text-right font-mono">{fmt(asientos.reduce((s, a) => s + a.debito, 0))}</td><td className="px-2 py-1 text-right font-mono">{fmt(asientos.reduce((s, a) => s + a.credito, 0))}</td></tr></tbody></table></div>)}
            </div>)}
          </td></tr>)}</>))}</tbody></table>)}
      </div>
    </div>
  )
}
