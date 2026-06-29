import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EmpresaLogo } from '@/components/EmpresaLogo'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { fmtNum } from '@/services/facturacion'
import type { Emp } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 0 })

const barColors: Record<string, string> = {
  FV: 'bg-blue-500', FC: 'bg-green-500', NC: 'bg-amber-500',
  ND: 'bg-rose-500', PE: 'bg-purple-500', PP: 'bg-cyan-500',
  RC: 'bg-teal-500', FP: 'bg-orange-500',
}
const iconMap: Record<string, string> = {
  FV: '📄', FC: '🛒', NC: '📝', ND: '📈', PE: '📋', PP: '📋', RC: '🧾', FP: '🧾',
}

export function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Emp | null>(null)
  const [loading, setLoading] = useState(true)

  // Metrics
  const [facturasHoy, setFacturasHoy] = useState(0)
  const [ventasHoy, setVentasHoy] = useState(0)
  const [promedio30, setPromedio30] = useState(0)
  const [porCobrar, setPorCobrar] = useState(0)

  // Bar chart data
  const [clases, setClases] = useState<{ codigo: string; nombre: string; cantidad: number; monto: number }[]>([])

  // Latest invoices
  const [recientes, setRecientes] = useState<any[]>([])

  useEffect(() => {
    if (!profile?.emp_ide) return
    const emp = profile.emp_ide

    Promise.all([
      supabase.from('empresas').select('*').eq('emp_ide', emp).single(),
      // Facturas hoy
      supabase.from('facturas').select('*', { count: 'exact', head: true }).eq('emp_ide', emp).eq('fecha', new Date().toISOString().slice(0, 10)).eq('ina', false),
      // Ventas hoy (FV + FP)
      supabase.from('facturas').select('total').eq('emp_ide', emp).eq('fecha', new Date().toISOString().slice(0, 10)).eq('ina', false).in('tipo_comp', ['FV', 'FP']),
      // Promedio 30 dias
      supabase.from('facturas').select('total').eq('emp_ide', emp).eq('estado', 'emitida').gte('created_at', new Date(Date.now() - 30*86400000).toISOString()),
      // Por cobrar
      supabase.from('facturas').select('saldo').eq('emp_ide', emp).eq('estado', 'emitida'),
      // Clases
      supabase.from('tipo_comprobante').select('codigo, nombre').eq('ina', false).order('codigo'),
      // Recientes
      supabase.from('facturas').select('*').eq('emp_ide', emp).eq('ina', false).order('created_at', { ascending: false }).limit(5),
    ]).then(([empRes, hoyCount, ventasRes, promRes, pendRes, clasesRes, recRes]) => {
      if (empRes.data) setCompany(empRes.data)
      setFacturasHoy(hoyCount.count ?? 0)
      setVentasHoy((ventasRes.data ?? []).reduce((s: number, r: any) => s + Number(r.total), 0))
      const promedios = (promRes.data ?? []).map((r: any) => Number(r.total))
      setPromedio30(promedios.length > 0 ? Math.round(promedios.reduce((a: number, b: number) => a + b, 0) / promedios.length) : 0)
      setPorCobrar((pendRes.data ?? []).reduce((s: number, r: any) => s + Number(r.saldo), 0))

      // Enriquecer clases con datos de facturas
      const clasesList = (clasesRes.data ?? []).map((tc: any) => ({ codigo: tc.codigo, nombre: tc.nombre, cantidad: 0, monto: 0 }))
      Promise.all(clasesList.map(async (c: any) => {
        const { data } = await supabase.from('facturas').select('total').eq('emp_ide', emp).eq('tipo_comp', c.codigo).eq('ina', false)
        if (data) { c.cantidad = data.length; c.monto = data.reduce((s: number, r: any) => s + Number(r.total), 0) }
      })).then(() => setClases(clasesList.sort((a: any, b: any) => b.monto - a.monto)))

      // Enriquecer recientes con nombre de tercero
      Promise.all((recRes.data ?? []).map(async (fac: any) => {
        const { data: t } = await supabase.from('terceros').select('nombre').eq('emp_ide', emp).eq('ide', fac.tercero_ide).maybeSingle()
        return { ...fac, tercero_nombre: t?.nombre ?? '-' }
      })).then(setRecientes)

      setLoading(false)
    })
  }, [profile?.emp_ide])

  const maxMonto = Math.max(...clases.map((c) => c.monto), 1)

  if (loading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Cargando...</p></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <EmpresaLogo logoUrl={company?.logo_url} nombre={company?.nom_com ?? ''} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">Bienvenido{company ? `, ${company.nom_com}` : ''}</h1>
          <p className="text-sm text-muted-foreground">{company?.raz_soc ?? ''}{company?.emp_ide && ` · ${company.emp_ide}`}</p>
        </div>
      </div>

      {/* Company info cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">NIT</p><p className="mt-1 text-lg font-semibold">{company?.ide_emp ?? '-'}</p></div>
        <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Ciudad</p><p className="mt-1 text-lg font-semibold">{company?.ciu ?? '-'}</p></div>
        <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Teléfono</p><p className="mt-1 text-lg font-semibold">{company?.tel ?? '-'}</p></div>
        <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Régimen</p><p className="mt-1 text-lg font-semibold">{company?.reg_tri ?? '-'}</p></div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-lg">📄</div>
            <div><p className="text-xs text-muted-foreground">Facturas hoy</p><p className="text-2xl font-bold">{facturasHoy}</p></div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-lg">💰</div>
            <div><p className="text-xs text-muted-foreground">Ventas hoy</p><p className="text-2xl font-bold">{fmt(ventasHoy)}</p></div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-lg">📊</div>
            <div><p className="text-xs text-muted-foreground">Promedio 30 días</p><p className="text-2xl font-bold">{fmt(promedio30)}</p></div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-50 text-lg">🧾</div>
            <div><p className="text-xs text-muted-foreground">Por cobrar</p><p className="text-2xl font-bold">{fmt(porCobrar)}</p></div>
          </div>
        </div>
      </div>

      {/* Bar chart by clase */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Facturas por clase</h2>
        <div className="space-y-3">
          {clases.filter((c) => c.cantidad > 0).length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin facturas registradas</p>
          ) : (
            clases.filter((c) => c.cantidad > 0).map((c) => (
              <div key={c.codigo}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{iconMap[c.codigo] ?? '📄'}</span>
                    <span className="font-medium">{c.nombre}</span>
                    <span className="text-xs text-muted-foreground">({c.cantidad})</span>
                  </div>
                  <span className="font-mono text-xs">{fmt(c.monto)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full transition-all duration-500 ${barColors[c.codigo] ?? 'bg-primary'}`}
                    style={{ width: `${Math.max((c.monto / maxMonto) * 100, 3)}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent invoices */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Últimas facturas</h2>
        {recientes.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Sin facturas</p>
        ) : (
          <div className="space-y-2">
            {recientes.map((fac) => (
              <button key={fac.ide} type="button" onClick={() => navigate(`/dashboard/informes/facturas/${fac.ide}`)}
                className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:bg-accent">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{fac.prefijo}-{fmtNum(fac.consecutivo)}</span>
                  <span className="font-medium">{fac.tercero_nombre}</span>
                  <span className="text-xs text-muted-foreground">{fac.fecha?.slice(0, 10)}</span>
                </div>
                <span className="font-mono text-xs">{fmt(fac.total)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
