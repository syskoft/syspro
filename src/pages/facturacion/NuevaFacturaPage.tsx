import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BuscarArticuloModal } from '@/components/BuscarArticuloModal'
import { BuscarServicioModal } from '@/components/BuscarServicioModal'
import { BuscarTerceroModal } from '@/components/BuscarTerceroModal'
import { BuscarVendedorModal } from '@/components/BuscarVendedorModal'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { fetchArticulos } from '@/services/articulos'
import { crearFacturaConContabilizacion, fetchFormasPagoByClase, fetchTerceros, fetchTiposByClase, fetchTiposComp, fmtNum, getNextConsecutivo } from '@/services/facturacion'
import { fetchServicios } from '@/services/servicios'
import { fetchVendedores } from '@/services/vendedores'
import type { Articulo, FormaPago, Servicio, Tercero, TipoComprobante } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 }); const today = () => new Date().toISOString().slice(0, 10)
interface FormItem { tipo: 'articulo' | 'servicio'; item_ide: number; codigo: string; nombre: string; cantidad: number; precio: number; iva: number; total: number }

export function NuevaFacturaPage() {
  const { clase, tipoCodigo } = useParams(); const navigate = useNavigate(); const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [showBuscarArticulo, setShowBuscarArticulo] = useState(false); const [showBuscarServicio, setShowBuscarServicio] = useState(false)
  const [showBuscarCliente, setShowBuscarCliente] = useState(false); const [showBuscarVendedor, setShowBuscarVendedor] = useState(false)
  const [claseInfo, setClaseInfo] = useState<TipoComprobante | null>(null); const [tiposDisp, setTiposDisp] = useState<any[]>([])
  const [terceros, setTerceros] = useState<Tercero[]>([]); const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [articulos, setArticulos] = useState<Articulo[]>([]); const [vendedores, setVendedores] = useState<{ ide: number; codigo: string; nombre?: string }[]>([]); const [servicios, setServicios] = useState<Servicio[]>([])
  const [nextConsecutivo, setNextConsecutivo] = useState<number | null>(null)
  const storageKey = `transaccion_${clase}_${tipoCodigo ?? ''}`
  const [formTipoIde, setFormTipoIde] = useState<number | null>(null)
  const [formTercero, setFormTercero] = useState(''); const [formFecha, setFormFecha] = useState(today())
  const [formVence, setFormVence] = useState(''); const [formFPago, setFormFPago] = useState(''); const [formVendedor, setFormVendedor] = useState('')
  const [formConcepto, setFormConcepto] = useState('')
  const [formItems, setFormItems] = useState<FormItem[]>(() => { try { const s = sessionStorage.getItem(storageKey); return s ? JSON.parse(s) : [] } catch { return [] } })

  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(formItems)) }, [formItems, storageKey])
  useEffect(() => { if (!profile?.emp_ide || !clase) return; const tc = tiposDisp.find((t) => t.ide === formTipoIde); getNextConsecutivo(profile.emp_ide, tc?.codigo || clase).then(setNextConsecutivo) }, [profile?.emp_ide, clase, formTipoIde, tiposDisp])
  useEffect(() => {
    if (!profile?.emp_ide || !clase) return
    fetchTiposComp().then((tc) => setClaseInfo(tc.find((c) => c.codigo === clase) ?? null))
    fetchTiposByClase(profile.emp_ide, clase).then((items) => { setTiposDisp(items); if (tipoCodigo) { const f = items.find((t) => t.codigo === tipoCodigo); if (f) setFormTipoIde(f.ide) } else if (items.length === 1) setFormTipoIde(items[0].ide) })
    fetchTerceros(profile.emp_ide).then(setTerceros)
    fetchFormasPagoByClase(profile.emp_ide, clase ?? '').then(setFormasPago)
    fetchArticulos(profile.emp_ide).then(setArticulos); fetchServicios(profile.emp_ide).then(setServicios)
    fetchVendedores(profile.emp_ide).then((v) => setVendedores(v.map((x) => ({ ide: x.ide, codigo: x.codigo, nombre: x.tercero_nombre }))))
  }, [profile?.emp_ide, clase])

  if (tiposDisp.length === 0 && claseInfo && !tipoCodigo) return (<div className="flex flex-col items-center justify-center py-20 text-center"><h2 className="text-xl font-bold mb-2">Sin tipos de comprobante</h2><p className="text-muted-foreground mb-4">No hay tipos de comprobante para "{claseInfo.nombre}". Crea uno.</p><Button onClick={() => navigate('/dashboard/catalogos/tipos-comprobante')}>Ir a Tipos</Button></div>)

  const formasItems = formasPago.map((f) => ({ value: String(f.ide), label: `${f.codigo} - ${f.nombre}` }))
  function agregarArticulo(ide: number) { const a = articulos.find((x) => x.ide === ide); if (!a) return; setFormItems([...formItems, { tipo: 'articulo', item_ide: a.ide, codigo: a.codigo, nombre: a.nombre, cantidad: 1, precio: Number(a.precio), iva: 19, total: Number(a.precio) * 1.19 }]) }
  function agregarServicio(ide: number) { const s = servicios.find((x) => x.ide === ide); if (!s) return; setFormItems([...formItems, { tipo: 'servicio', item_ide: s.ide, codigo: s.codigo, nombre: s.nombre, cantidad: 1, precio: Number(s.precio), iva: 19, total: Number(s.precio) * 1.19 }]) }
  function updateItem(idx: number, field: string, value: any) { setFormItems((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; if (field === 'cantidad' || field === 'precio' || field === 'iva') { const st = next[idx].cantidad * next[idx].precio; next[idx].total = Math.round(st * (1 + next[idx].iva / 100) * 100) / 100 }; return next }) }
  function removeItem(idx: number) { setFormItems((prev) => prev.filter((_, i) => i !== idx)) }
  const calcSubtotal = () => Math.round(formItems.reduce((s, i) => s + i.cantidad * i.precio, 0) * 100) / 100
  const calcIVA = () => Math.round(formItems.reduce((s, i) => { const st = i.cantidad * i.precio; return s + Math.round(st * i.iva / 100 * 100) / 100 }, 0) * 100) / 100
  const calcTotal = () => Math.round((calcSubtotal() + calcIVA()) * 100) / 100

  async function handleCreate() {
    if (!profile?.emp_ide || !formTercero) return; setSaving(true)
    try { const tipoCodigo2 = tiposDisp.find((t) => t.ide === formTipoIde)?.codigo; const prefijo = tipoCodigo2 || clase || 'FV'
      await crearFacturaConContabilizacion(profile.emp_ide, { tipo_comp: clase ?? 'FV', prefijo, comprobante_tipo_ide: formTipoIde ?? undefined, vendedor_ide: formVendedor ? Number(formVendedor) : null, tercero_ide: Number(formTercero), fecha: formFecha, fecha_vencimiento: formVence || undefined, forma_pago_ide: formFPago ? Number(formFPago) : undefined, concepto: formConcepto, items: formItems.map((i) => ({ tipo: i.tipo, item_ide: i.item_ide, cantidad: i.cantidad, precio_unitario: i.precio, iva_porcentaje: i.iva })) })
      sessionStorage.removeItem(storageKey); navigate('/dashboard/informes/facturas')
    } catch (err: any) { alert(err?.message ?? 'Error') } finally { setSaving(false) }
  }

  return (<div className="space-y-6">
    <div className="flex items-center gap-3"><Button variant="outline" size="icon" onClick={() => navigate('/dashboard/facturacion')}>←</Button>
      <h1 className="text-2xl font-bold">{(() => { const tc = tiposDisp.find((t) => t.ide === formTipoIde); return tc?.nombre ?? claseInfo?.nombre ?? clase ?? 'Factura' })()}
        {nextConsecutivo && <span className="ml-3 font-mono text-sm text-muted-foreground">{(tiposDisp.find((t) => t.ide === formTipoIde)?.codigo ?? clase ?? 'FV')}-{fmtNum(nextConsecutivo)}</span>}
      </h1>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo especifico</label>
        <select value={formTipoIde ?? ''} onChange={(e) => { const ide = e.target.value ? Number(e.target.value) : null; const tc = tiposDisp.find((t) => t.ide === ide); if (tc) navigate(`/dashboard/facturacion/nueva/${clase}/${tc.codigo}`, { replace: true }); else navigate(`/dashboard/facturacion/nueva/${clase}`, { replace: true }); setFormTipoIde(ide) }} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">General {clase}</option>{tiposDisp.map((t) => (<option key={t.ide} value={t.ide}>{t.codigo} - {t.nombre}</option>))}</select></div>
      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Fecha</label><input type="date" value={formFecha} onChange={(e) => setFormFecha(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vencimiento</label><input type="date" value={formVence} onChange={(e) => setFormVence(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Forma de Pago</label>
        <select value={formFPago} onChange={(e) => setFormFPago(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Seleccionar...</option>{formasItems.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}</select></div>
      <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1 block">Cliente</label>
        <button type="button" onClick={() => setShowBuscarCliente(true)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-left hover:bg-accent">{formTercero ? `${terceros.find((t) => t.ide === Number(formTercero))?.nombre ?? 'Cliente'}` : 'Seleccionar cliente...'}</button></div>
      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Vendedor</label>
        <button type="button" onClick={() => setShowBuscarVendedor(true)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-left hover:bg-accent">{formVendedor ? `${vendedores.find((v) => v.ide === Number(formVendedor))?.codigo} - ${vendedores.find((v) => v.ide === Number(formVendedor))?.nombre ?? ''}` : 'Sin vendedor'}</button></div>
      <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1 block">Concepto</label><input type="text" value={formConcepto} onChange={(e) => setFormConcepto(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
    </div>
    <div className="border-t pt-4">
      <div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium">Items</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setShowBuscarArticulo(true)}><Plus className="size-4" /> Articulo</Button><Button size="sm" variant="outline" onClick={() => setShowBuscarServicio(true)}><Plus className="size-4" /> Servicio</Button></div></div>
      {formItems.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Agrega articulos o servicios</p> : (
      <div className="overflow-x-auto rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium"><th className="px-3 py-2 w-14">Tipo</th><th className="px-3 py-2">Codigo</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2 w-16 text-center">Cant</th><th className="px-3 py-2 w-24 text-right">Precio</th><th className="px-3 py-2 w-16 text-center">IVA%</th><th className="px-3 py-2 w-28 text-right">Total</th><th className="px-3 py-2 w-10"></th></tr></thead>
        <tbody>{formItems.map((item, idx) => (<tr key={idx} className="border-b last:border-0 hover:bg-muted/30"><td className="px-3 py-1.5 text-[10px] text-muted-foreground">{item.tipo === 'articulo' ? 'ART' : 'SRV'}</td><td className="px-3 py-1.5 font-mono text-xs">{item.codigo}</td><td className="px-3 py-1.5 text-xs">{item.nombre}</td>
          <td className="px-3 py-1.5"><input type="number" min={1} value={item.cantidad} onChange={(e) => updateItem(idx, 'cantidad', Number(e.target.value))} className="w-14 rounded border bg-background px-2 py-1 text-center text-xs" /></td>
          <td className="px-3 py-1.5"><input type="number" step="0.01" value={item.precio} onChange={(e) => updateItem(idx, 'precio', Number(e.target.value))} className="w-20 rounded border bg-background px-2 py-1 text-right text-xs" /></td>
          <td className="px-3 py-1.5"><input type="number" step="0.01" value={item.iva} onChange={(e) => updateItem(idx, 'iva', Number(e.target.value))} className="w-14 rounded border bg-background px-2 py-1 text-center text-xs" /></td>
          <td className="px-3 py-1.5 text-right font-mono text-xs">{fmt(item.total)}</td>
          <td className="px-3 py-1.5"><button type="button" onClick={() => removeItem(idx)} className="rounded p-1 text-muted-foreground hover:text-destructive"><X className="size-3.5" /></button></td></tr>))}</tbody></table></div>)}
      {formItems.length > 0 && <div className="mt-3 flex justify-end gap-6 text-sm"><span>Subtotal: <strong className="font-mono">{fmt(calcSubtotal())}</strong></span><span>IVA: <strong className="font-mono">{fmt(calcIVA())}</strong></span><span className="text-base">Total: <strong className="font-mono">{fmt(calcTotal())}</strong></span></div>}
    </div>
    <div className="flex justify-end gap-2 border-t pt-4">
      <Button variant="outline" onClick={() => { sessionStorage.removeItem(storageKey); navigate('/dashboard/facturacion') }}>Cancelar</Button>
      <Button onClick={handleCreate} disabled={saving || !formTercero || formItems.length === 0}>{saving ? 'Guardando...' : 'Guardar y contabilizar'}</Button>
    </div>
    <BuscarVendedorModal open={showBuscarVendedor} vendedores={vendedores} onSelect={(v) => setFormVendedor(String(v.ide))} onClose={() => setShowBuscarVendedor(false)} />
    <BuscarTerceroModal open={showBuscarCliente} terceros={terceros.map((t) => ({ ide: t.ide, identificacion: t.identificacion, nombre: t.nombre, telefono: t.telefono, tipo: t.tipo }))} filterTipo={['cliente', 'ambos']} onSelect={(t) => setFormTercero(String(t.ide))} onClose={() => setShowBuscarCliente(false)} />
    <BuscarArticuloModal open={showBuscarArticulo} articulos={articulos} excludeIds={formItems.filter((i) => i.tipo === 'articulo').map((i) => i.item_ide)} onSelect={(a) => agregarArticulo(a.ide)} onClose={() => setShowBuscarArticulo(false)} />
    <BuscarServicioModal open={showBuscarServicio} servicios={servicios} excludeIds={formItems.filter((i) => i.tipo === 'servicio').map((i) => i.item_ide)} onSelect={(s) => agregarServicio(s.ide)} onClose={() => setShowBuscarServicio(false)} />
  </div>)
}
