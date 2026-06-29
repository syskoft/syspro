import { supabase } from '@/lib/supabase'
import type { ComprobanteTipo, Factura, FacturaItem, FacturacionConfig, FormaPago, Tercero, TipoComprobante } from '@/types/database'

// ── Tipos de comprobante ──────────────────────────
export async function fetchTiposComp(): Promise<TipoComprobante[]> {
  const { data, error } = await supabase.from('tipo_comprobante').select('*').eq('ina', false).order('codigo')
  if (error) throw error; return data ?? []
}

// ── Terceros ──────────────────────────────────────
export async function fetchTerceros(emp_ide: string, filters?: Record<string, string>): Promise<Tercero[]> {
  let q = supabase.from('terceros').select('*').eq('emp_ide', emp_ide).order('nombre')
  if (filters?.search) q = q.or(`nombre.ilike.%${filters.search}%,identificacion.ilike.%${filters.search}%`)
  if (filters?.tipo) q = q.eq('tipo', filters.tipo)
  if (filters?.ina === 'activos') q = q.eq('ina', false)
  else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
  const { data, error } = await q
  if (error) throw error; return data ?? []
}

export async function createTercero(emp_ide: string, data: Partial<Tercero>) {
  const { data: r, error } = await supabase.from('terceros').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error; return r as { ide: number }
}

export async function updateTercero(emp_ide: string, ide: number, data: Partial<Tercero>) {
  const { error } = await supabase.from('terceros').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteTercero(emp_ide: string, ide: number) {
  const { error } = await supabase.from('terceros').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

// ── Formas de pago ────────────────────────────────
export async function fetchFormasPago(emp_ide: string): Promise<FormaPago[]> {
  const { data, error } = await supabase.from('formas_pago').select('*').eq('emp_ide', emp_ide).eq('ina', false).order('codigo')
  if (error) throw error; return data ?? []
}

export async function fetchFormasPagoByClase(emp_ide: string, claseCodigo: string): Promise<FormaPago[]> {
  const { data, error } = await supabase.from('formas_pago').select('*').eq('emp_ide', emp_ide).eq('ina', false).order('codigo')
  if (error) throw error
  return (data ?? []).filter((fp) => !fp.aplica_en || fp.aplica_en.length === 0 || fp.aplica_en.includes(claseCodigo))
}

export async function createFormaPago(emp_ide: string, data: Partial<FormaPago>) {
  const { data: r, error } = await supabase.from('formas_pago').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error; return r as { ide: number }
}

export async function updateFormaPago(emp_ide: string, ide: number, data: Partial<FormaPago>) {
  const { error } = await supabase.from('formas_pago').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteFormaPago(emp_ide: string, ide: number) {
  const { error } = await supabase.from('formas_pago').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

// ── Facturación Config ────────────────────────────
export async function fetchFactConfig(emp_ide: string): Promise<FacturacionConfig | null> {
  const { data, error } = await supabase.from('facturacion_config').select('*').eq('emp_ide', emp_ide).maybeSingle()
  if (error) throw error; return data
}

export async function upsertFactConfig(emp_ide: string, data: Partial<FacturacionConfig>) {
  const { error } = await supabase.from('facturacion_config').upsert({ emp_ide, ...data })
  if (error) throw error
}

// ── Facturas + Contabilización ────────────────────
export const fmtNum = (n: number) => String(n).padStart(10, '0')

export async function getNextConsecutivo(emp_ide: string, prefijo: string): Promise<number> {
  const { data } = await supabase.from('facturas').select('consecutivo').eq('emp_ide', emp_ide).eq('prefijo', prefijo)
    .order('consecutivo', { ascending: false }).limit(1).maybeSingle()
  return (data?.consecutivo ?? 0) + 1
}

export async function fetchFacturas(emp_ide: string, filters?: Record<string, string>): Promise<Factura[]> {
  let q = supabase.from('facturas').select('*').eq('emp_ide', emp_ide).order('created_at', { ascending: false })
  if (filters?.tipo) q = q.eq('tipo_comp', filters.tipo)
  if (filters?.tipoIde) q = q.eq('comprobante_tipo_ide', Number(filters.tipoIde))
  if (filters?.tercero) q = q.eq('tercero_ide', Number(filters.tercero))
  if (filters?.search) q = q.ilike('concepto', `%${filters.search}%`)
  if (filters?.estado) q = q.eq('estado', filters.estado)
  if (filters?.ina === 'activos') q = q.eq('ina', false)
  else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
  const { data, error } = await q
  if (error) throw error; return data ?? []
}

export async function fetchFacturaById(emp_ide: string, facturaIde: number): Promise<Factura | null> {
  const { data, error } = await supabase.from('facturas').select('*').eq('emp_ide', emp_ide).eq('ide', facturaIde).maybeSingle()
  if (error) throw error; return data
}

export async function fetchFacturaItems(emp_ide: string, facturaIde: number): Promise<FacturaItem[]> {
  const { data, error } = await supabase.from('factura_items').select('*').eq('emp_ide', emp_ide).eq('factura_ide', facturaIde).order('ide')
  if (error) throw error; return data ?? []
}

export interface PagoInput { forma_pago_ide: number; valor: number }

interface ItemInput { tipo: 'articulo' | 'servicio'; item_ide: number; cantidad: number; precio_unitario: number; iva_porcentaje: number }

interface CrearFacturaInput {
  tipo_comp: string; prefijo: string; comprobante_tipo_ide?: number
  tercero_ide: number; vendedor_ide?: number | null
  fecha: string; fecha_vencimiento?: string; forma_pago_ide?: number
  pagos?: PagoInput[]; concepto?: string; items: ItemInput[]
}

export async function crearFacturaConContabilizacion(emp_ide: string, input: CrearFacturaInput) {
  const { data: defCuentas } = await supabase.from('def_cuentas_contables').select('concepto_id, cuenta_puc, naturaleza')
    .eq('emp_ide', emp_ide).eq('tab', 'transacciones')
  const cuentaVentas = defCuentas?.find((r) => r.concepto_id === 'ventas')?.cuenta_puc
  const cuentaClientes = defCuentas?.find((r) => r.concepto_id === 'clientes')?.cuenta_puc
  const cuentaIva = defCuentas?.find((r) => r.concepto_id === 'iva')?.cuenta_puc
  if (!cuentaVentas || !cuentaClientes) throw new Error('Configura las cuentas contables en Contabilidad → Definición de Cuentas → Transacciones')

  let sub_total = 0, total_impuestos = 0
  const items = input.items.map((item) => {
    const st = item.cantidad * item.precio_unitario
    const iva = Math.round(st * item.iva_porcentaje / 100 * 100) / 100
    sub_total += st; total_impuestos += iva
    return { ...item, sub_total: st, iva_valor: iva, total: st + iva }
  })
  const total = Math.round((sub_total + total_impuestos) * 100) / 100
  const prefijo = input.prefijo
  let facturaIde: number | null = null
  let consecutivo = 0

  for (let attempt = 0; attempt < 10; attempt++) {
    consecutivo = await getNextConsecutivo(emp_ide, prefijo) + attempt
    const { data: factura, error: errFac } = await supabase.from('facturas').insert({
      emp_ide, tipo_comp: input.tipo_comp, consecutivo, prefijo: input.prefijo,
      comprobante_tipo_ide: input.comprobante_tipo_ide ?? null, tercero_ide: input.tercero_ide,
      vendedor_ide: input.vendedor_ide ?? null, fecha: input.fecha,
      fecha_vencimiento: input.fecha_vencimiento ?? null, concepto: input.concepto ?? null,
      sub_total, total_impuestos, total, saldo: total, estado: 'emitida',
    }).select('ide').single()
    if (errFac) { if (errFac.code === '23505') continue; throw errFac }
    facturaIde = factura.ide; break
  }
  if (!facturaIde) throw new Error('No se pudo generar un consecutivo único.')

  const itemsToInsert = items.map((i) => ({
    factura_ide: facturaIde!, emp_ide, tipo: i.tipo,
    articulo_ide: i.tipo === 'articulo' ? i.item_ide : null,
    servicio_ide: i.tipo === 'servicio' ? i.item_ide : null,
    cantidad: i.cantidad, precio_unitario: i.precio_unitario, sub_total: i.sub_total,
    iva_porcentaje: i.iva_porcentaje, iva_valor: i.iva_valor, total: i.total,
  }))
  const { error: errItems } = await supabase.from('factura_items').insert(itemsToInsert)
  if (errItems) throw errItems

  const pagos = input.pagos ?? (input.forma_pago_ide ? [{ forma_pago_ide: input.forma_pago_ide, valor: total }] : [])
  if (pagos.length > 0) {
    const { error: errPagos } = await supabase.from('factura_pagos').insert(
      pagos.map((p) => ({ factura_ide: facturaIde!, emp_ide, forma_pago_ide: p.forma_pago_ide, valor: p.valor })),
    )
    if (errPagos) throw errPagos
  }

  const { data: ultimoComp } = await supabase.from('comprobantes').select('consecutivo').eq('emp_ide', emp_ide)
    .order('consecutivo', { ascending: false }).limit(1).maybeSingle()
  const compConsecutivo = (ultimoComp?.consecutivo ?? 0) + 1
  const numFactura = `${prefijo}-${fmtNum(consecutivo)}`
  const conceptoComp = `${numFactura} ${input.concepto ?? ''}`
  const { data: comprobante, error: errComp } = await supabase.from('comprobantes').insert({
    emp_ide, consecutivo: compConsecutivo, fecha: input.fecha, concepto: conceptoComp, origen_factura: facturaIde,
  }).select('ide').single()
  if (errComp) throw errComp

  const asientos = [
    { comprobante_ide: comprobante.ide, emp_ide, cuenta_puc_codigo: cuentaClientes, detalle: conceptoComp, debito: total, credito: 0 },
    { comprobante_ide: comprobante.ide, emp_ide, cuenta_puc_codigo: cuentaVentas, detalle: conceptoComp, debito: 0, credito: sub_total },
  ]
  if (total_impuestos > 0 && cuentaIva) {
    asientos.push({ comprobante_ide: comprobante.ide, emp_ide, cuenta_puc_codigo: cuentaIva, detalle: conceptoComp, debito: 0, credito: total_impuestos })
  }
  const { error: errAsientos } = await supabase.from('asientos_contables').insert(asientos)
  if (errAsientos) throw errAsientos

  await supabase.from('facturas').update({ comprobante_ide: comprobante.ide }).eq('emp_ide', emp_ide).eq('ide', facturaIde)
  return { facturaIde, consecutivo }
}

// ── Tipos de Comprobante ──────────────────────────
export async function fetchTiposByClase(emp_ide: string, claseCodigo: string): Promise<ComprobanteTipo[]> {
  const { data, error } = await supabase.from('comprobante_tipos').select('*')
    .eq('emp_ide', emp_ide).eq('clase_codigo', claseCodigo).eq('ina', false).order('codigo')
  if (error) throw error; return data ?? []
}

export async function fetchAllTipos(emp_ide: string, filters?: Record<string, string>): Promise<ComprobanteTipo[]> {
  let q = supabase.from('comprobante_tipos').select('*').eq('emp_ide', emp_ide).order('clase_codigo').order('codigo')
  if (filters?.search) q = q.or(`codigo.ilike.%${filters.search}%,nombre.ilike.%${filters.search}%`)
  if (filters?.clase) q = q.eq('clase_codigo', filters.clase)
  if (filters?.ina === 'activos') q = q.eq('ina', false)
  else if (filters?.ina === 'inactivos') q = q.eq('ina', true)
  const { data, error } = await q
  if (error) throw error; return data ?? []
}

export async function createComprobanteTipo(emp_ide: string, data: Partial<ComprobanteTipo>) {
  const { data: r, error } = await supabase.from('comprobante_tipos').insert({ ...data, emp_ide }).select('ide').single()
  if (error) throw error; return r as { ide: number }
}

export async function updateComprobanteTipo(emp_ide: string, ide: number, data: Partial<ComprobanteTipo>) {
  const { error } = await supabase.from('comprobante_tipos').update(data).eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}

export async function deleteComprobanteTipo(emp_ide: string, ide: number) {
  const { error } = await supabase.from('comprobante_tipos').delete().eq('emp_ide', emp_ide).eq('ide', ide)
  if (error) throw error
}
