import { Minus, Plus, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BuscarTerceroModal } from '@/components/BuscarTerceroModal'
import { BuscarVendedorModal } from '@/components/BuscarVendedorModal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchArticulos } from '@/services/articulos'
import { crearFacturaConContabilizacion, fetchFormasPagoByClase, fetchTiposByClase, fetchTiposComp, fmtNum, getNextConsecutivo } from '@/services/facturacion'
import { fetchVendedores } from '@/services/vendedores'
import type { Articulo, FormaPago, Tercero, TipoComprobante } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })
const today = () => new Date().toISOString().slice(0, 10)
interface CartItem { tipo: 'articulo'; item_ide: number; codigo: string; nombre: string; cantidad: number; precio: number; iva: number; total: number }

export function POSFacturaPage() {
  const { clase, tipoCodigo } = useParams(); const navigate = useNavigate(); const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [claseInfo, setClaseInfo] = useState<TipoComprobante | null>(null)
  const [tiposDisp, setTiposDisp] = useState<any[]>([]); const [articulos, setArticulos] = useState<Articulo[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [nextConsecutivo, setNextConsecutivo] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [pagos, setPagos] = useState<{ formaPagoIde: number; valor: number }[]>([])
  const [editPagoIdx, setEditPagoIdx] = useState<number | null>(null); const [editPagoValor, setEditPagoValor] = useState('')
  const [clienteId, setClienteId] = useState('mostrador'); const [clienteNombre, setClienteNombre] = useState('Mostrador')
  const [showBuscarCliente, setShowBuscarCliente] = useState(false); const [showBuscarVendedor, setShowBuscarVendedor] = useState(false)
  const [searchQuery, setSearchQuery] = useState(''); const searchRef = useRef<HTMLInputElement>(null)
  const [clientes, setClientes] = useState<Pick<Tercero, 'ide' | 'identificacion' | 'nombre' | 'telefono' | 'tipo'>[]>([])
  const [vendedores, setVendedores] = useState<{ ide: number; codigo: string; nombre?: string }[]>([]); const [vendedorIde, setVendedorIde] = useState<number | null>(null)
  const storageKey = `pos_${clase}_${tipoCodigo ?? ''}`
  const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}')

  useEffect(() => { setCart(saved.cart ?? []); setPagos(saved.pagos ?? []); setClienteId(saved.clienteId ?? 'mostrador'); setClienteNombre(saved.clienteNombre ?? 'Mostrador'); setVendedorIde(saved.vendedorIde ?? null) }, [])
  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify({ cart, pagos, clienteId, clienteNombre, vendedorIde })) }, [cart, pagos, clienteId, clienteNombre, vendedorIde])
  useEffect(() => {
    if (!profile?.emp_ide || !clase) return
    fetchTiposComp().then((tc) => setClaseInfo(tc.find((c) => c.codigo === clase) ?? null))
    fetchTiposByClase(profile.emp_ide, clase).then(setTiposDisp)
    fetchArticulos(profile.emp_ide).then(setArticulos)
    fetchFormasPagoByClase(profile.emp_ide, clase).then(setFormasPago)
    getNextConsecutivo(profile.emp_ide, tipoCodigo || clase!).then(setNextConsecutivo)
    supabase.from('terceros').select('ide, identificacion, nombre, telefono, tipo').eq('emp_ide', profile.emp_ide).eq('ina', false).in('tipo', ['cliente', 'ambos']).order('nombre').then(({ data }) => { if (data) setClientes(data) })
    fetchVendedores(profile.emp_ide).then((v) => setVendedores(v.map((x) => ({ ide: x.ide, codigo: x.codigo, nombre: x.tercero_nombre }))))
  }, [profile?.emp_ide, clase])
  useEffect(() => { function onKey(e: KeyboardEvent) { if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus() }; if (e.key === 'F8') { e.preventDefault(); cobrar() }; if (e.key === 'Escape') { sessionStorage.removeItem(storageKey); navigate('/dashboard/pos') } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [cart])
  if (tiposDisp.length === 0 && claseInfo && !tipoCodigo) return (<div className="flex flex-col items-center justify-center py-20 text-center"><h2 className="text-xl font-bold mb-2">Sin tipos de comprobante</h2><p className="text-muted-foreground mb-4">No hay tipos de comprobante para "{claseInfo.nombre}".</p><Button onClick={() => navigate('/dashboard/catalogos/tipos-comprobante')}>Ir a Tipos de Comprobante</Button></div>)

  const articulosFiltrados = searchQuery ? articulos.filter((a) => !a.ina && (a.codigo.toLowerCase().includes(searchQuery.toLowerCase()) || a.nombre.toLowerCase().includes(searchQuery.toLowerCase()))) : []
  const productosRapidos = articulos.filter((a) => !a.ina).slice(0, 12)
  function agregarAlCarrito(a: Articulo) { setCart((prev) => { const e = prev.find((i) => i.item_ide === a.ide); if (e) return prev.map((i) => i.item_ide === a.ide ? { ...i, cantidad: i.cantidad + 1, total: Math.round((i.cantidad + 1) * i.precio * (1 + i.iva / 100) * 100) / 100 } : i); return [...prev, { tipo: 'articulo' as const, item_ide: a.ide, codigo: a.codigo, nombre: a.nombre, cantidad: 1, precio: Number(a.precio), iva: 19, total: Math.round(Number(a.precio) * 1.19 * 100) / 100 }] }); setSearchQuery(''); searchRef.current?.focus() }
  function cambiarCantidad(idx: number, delta: number) { setCart((prev) => prev.map((item, i) => { if (i !== idx) return item; const cant = Math.max(1, item.cantidad + delta); return { ...item, cantidad: cant, total: Math.round(cant * item.precio * (1 + item.iva / 100) * 100) / 100 } })) }
  function eliminarItem(idx: number) { setCart((prev) => prev.filter((_, i) => i !== idx)) }

  const subtotal = Math.round(cart.reduce((s, i) => s + i.cantidad * i.precio, 0) * 100) / 100
  const ivaTotal = Math.round(cart.reduce((s, i) => { const st = i.cantidad * i.precio; return s + Math.round(st * i.iva / 100 * 100) / 100 }, 0) * 100) / 100
  const total = Math.round((subtotal + ivaTotal) * 100) / 100
  const pendiente = Math.round((total - pagos.reduce((s, p) => s + p.valor, 0)) * 100) / 100

  async function cobrar() {
    if (!profile?.emp_ide || cart.length === 0) return; setSaving(true)
    try {
      let terceroIde: number
      if (clienteId === 'mostrador') { const { data: m } = await supabase.from('terceros').select('ide').eq('emp_ide', profile.emp_ide).eq('identificacion', '2222222222').maybeSingle(); if (m) terceroIde = m.ide; else { const { data: n } = await supabase.from('terceros').insert({ emp_ide: profile.emp_ide, identificacion: '2222222222', nombre: 'Mostrador', tipo: 'cliente' }).select('ide').single(); terceroIde = n!.ide } }
      else terceroIde = Number(clienteId)
      await crearFacturaConContabilizacion(profile.emp_ide, { tipo_comp: clase ?? 'FP', prefijo: tipoCodigo || clase || 'FP', vendedor_ide: vendedorIde, tercero_ide: terceroIde, fecha: today(), pagos: pagos.map((p) => ({ forma_pago_ide: p.formaPagoIde, valor: p.valor })), concepto: `Venta POS ${clase ?? 'FP'}`, items: cart.map((i) => ({ tipo: i.tipo, item_ide: i.item_ide, cantidad: i.cantidad, precio_unitario: i.precio, iva_porcentaje: i.iva })) })
      sessionStorage.removeItem(storageKey); navigate('/dashboard/informes/facturas')
    } catch (err: any) { alert(err?.message ?? 'Error al procesar venta') } finally { setSaving(false) }
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]"><div className="flex h-full gap-4">
      <div className="flex w-[380px] shrink-0 flex-col gap-3">
        <div className="flex items-center gap-2"><Button variant="outline" size="icon" onClick={() => { sessionStorage.removeItem(storageKey); navigate('/dashboard/pos') }} className="shrink-0">←</Button>
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar producto (F2)..." className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-base outline-none" /></div></div>
        {searchQuery ? (<div className="max-h-48 overflow-y-auto rounded-lg border bg-card">{articulosFiltrados.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Sin resultados</p> : articulosFiltrados.map((a) => (<button key={a.ide} type="button" onClick={() => agregarAlCarrito(a)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent border-b"><div><p className="text-sm font-medium">{a.nombre}</p><p className="text-xs text-muted-foreground">{a.codigo}</p></div><span className="text-base font-mono">{fmt(a.precio)}</span></button>))}</div>) : null}
        <div><p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Productos rápidos</p><div className="grid grid-cols-3 gap-2">{productosRapidos.map((a) => (<button key={a.ide} type="button" onClick={() => agregarAlCarrito(a)} className="flex flex-col items-center justify-center rounded-lg border bg-card p-3 text-center hover:bg-accent hover:border-primary min-h-[70px]"><span className="text-xs font-medium line-clamp-2">{a.nombre}</span><span className="mt-1 text-xs font-mono text-muted-foreground">{fmt(a.precio)}</span></button>))}</div></div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
          <div className="flex items-center gap-4"><span className="text-lg font-bold">{claseInfo?.nombre ?? clase ?? 'POS'}</span><span className="font-mono text-sm text-muted-foreground">{(tipoCodigo || clase) ?? ''}-{nextConsecutivo ? fmtNum(nextConsecutivo) : '...'}</span></div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1"><label className="text-xs text-muted-foreground">Cliente:</label><button type="button" onClick={() => setShowBuscarCliente(true)} className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent min-w-[140px]">{clienteId === 'mostrador' ? '🕴 Mostrador' : `👤 ${clienteNombre}`}</button></div>
            <div className="flex items-center gap-1"><label className="text-xs text-muted-foreground">Vendedor:</label><button type="button" onClick={() => setShowBuscarVendedor(true)} className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent min-w-[80px]">{vendedorIde ? vendedores.find((v) => v.ide === vendedorIde)?.codigo ?? '-' : '-'}</button></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto rounded-lg border bg-card">
          {cart.length === 0 ? <div className="flex h-full items-center justify-center"><p className="text-lg text-muted-foreground">Agrega productos</p></div> : (
          <table className="w-full text-base"><thead><tr className="border-b bg-muted/30 text-sm text-muted-foreground sticky top-0"><th className="px-4 py-3 text-left">Producto</th><th className="px-4 py-3 w-32 text-center">Cantidad</th><th className="px-4 py-3 w-28 text-right">Precio</th><th className="px-4 py-3 w-28 text-right">Total</th><th className="px-4 py-3 w-10"></th></tr></thead><tbody>{cart.map((item, idx) => (<tr key={idx} className="border-b hover:bg-muted/20"><td className="px-4 py-3"><p className="font-medium">{item.nombre}</p><p className="text-xs text-muted-foreground">{item.codigo}</p></td><td className="px-4 py-3"><div className="flex items-center justify-center gap-2"><button type="button" onClick={() => cambiarCantidad(idx, -1)} disabled={item.cantidad <= 1} className="flex size-8 items-center justify-center rounded-full border hover:bg-accent disabled:opacity-30"><Minus className="size-4" /></button><span className="w-8 text-center font-medium">{item.cantidad}</span><button type="button" onClick={() => cambiarCantidad(idx, 1)} className="flex size-8 items-center justify-center rounded-full border hover:bg-accent"><Plus className="size-4" /></button></div></td><td className="px-4 py-3 text-right font-mono">{fmt(item.precio)}</td><td className="px-4 py-3 text-right font-mono font-medium">{fmt(item.total)}</td><td className="px-4 py-3"><button type="button" onClick={() => eliminarItem(idx)} className="rounded p-1 text-muted-foreground hover:text-destructive"><X className="size-4" /></button></td></tr>))}</tbody></table>)}
        </div>
        <div className="rounded-lg border bg-card p-4"><div className="flex items-center justify-between gap-6">
          <div className="space-y-1"><p className="text-sm text-muted-foreground">Subtotal: <span className="font-mono">{fmt(subtotal)}</span></p><p className="text-sm text-muted-foreground">IVA: <span className="font-mono">{fmt(ivaTotal)}</span></p><p className="text-xl font-bold">Total: <span className="font-mono">{fmt(total)}</span></p>{pagos.length > 0 && <p className={`text-sm ${pendiente <= 0 ? 'text-green-600' : 'text-amber-600'}`}>{pendiente <= 0 ? '✓ Cubierto' : `Pendiente: ${fmt(pendiente)}`}</p>}</div>
          <div className="flex items-center gap-2">{pagos.map((p, idx) => { const fp = formasPago.find((f) => f.ide === p.formaPagoIde); return (<div key={idx} className="relative flex flex-col items-center rounded-lg border border-primary bg-primary/5 px-3 py-2"><span className="text-lg">{fp ? (fp.tipo === 'caja' ? '💵' : fp.tipo === 'tarjeta' ? '💳' : fp.tipo === 'banco' ? '🏦' : '🤝') : '💳'}</span><span className="text-[10px] font-medium">{fp?.nombre ?? ''}</span>{editPagoIdx === idx ? (<input type="number" step="0.01" value={editPagoValor} onChange={(e) => setEditPagoValor(e.target.value)} onBlur={() => { setPagos((prev) => prev.map((pp, i) => i === idx ? { ...pp, valor: Math.round(Number(editPagoValor) * 100) / 100 } : pp)); setEditPagoIdx(null) }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} className="w-20 rounded border bg-background px-1 py-0.5 text-center text-xs font-mono" autoFocus />) : (<button type="button" onClick={() => { setEditPagoIdx(idx); setEditPagoValor(String(p.valor)) }} className="text-xs font-mono hover:text-primary">{fmt(p.valor)}</button>)}<button type="button" onClick={() => setPagos((prev) => prev.filter((_, i) => i !== idx))} className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-white text-[10px]">✕</button></div>)})}
            {pagos.length < 3 && formasPago.filter((fp) => !pagos.some((p) => p.formaPagoIde === fp.ide)).map((fp) => (<button key={fp.ide} type="button" onClick={() => { const r = Math.round((total - pagos.reduce((s, p) => s + p.valor, 0)) * 100) / 100; if (r > 0) setPagos([...pagos, { formaPagoIde: fp.ide, valor: r }]) }} className="flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-accent"><span className="text-lg">{fp.tipo === 'caja' ? '💵' : fp.tipo === 'tarjeta' ? '💳' : fp.tipo === 'banco' ? '🏦' : '🤝'}</span><span className="text-[10px]">{fp.nombre}</span></button>))}
          </div>
          <Button size="lg" onClick={cobrar} disabled={saving || cart.length === 0 || pagos.length === 0 || pendiente > 0.01} className="h-16 min-w-[200px] text-lg font-bold gap-2 bg-green-600 hover:bg-green-700 text-white">🛒 {saving ? 'Procesando...' : `Cobrar ${fmt(total)}`}</Button>
        </div></div>
      </div>
      <BuscarTerceroModal open={showBuscarCliente} terceros={clientes} filterTipo={['cliente', 'ambos']} onSelect={(t) => { setClienteId(String(t.ide)); setClienteNombre(t.nombre) }} onClose={() => setShowBuscarCliente(false)} />
      <BuscarVendedorModal open={showBuscarVendedor} vendedores={vendedores} onSelect={(v) => setVendedorIde(v.ide)} onClose={() => setShowBuscarVendedor(false)} />
    </div></div>
  )
}
