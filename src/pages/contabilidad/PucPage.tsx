import { ChevronDown, ChevronRight, Plus, RefreshCw, Search, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { fetchPuc, fetchPucConSaldos, updatePucCuenta } from '@/services/contabilidad'
import type { PucConfig, PucConSaldo, PucCuenta } from '@/types/contabilidad'

// ── Helpers ──────────────────────────────────────────

function nivelLabel(n: number) {
  return ({ 1: 'Clase', 2: 'Grupo', 4: 'Cuenta', 6: 'Subcuenta', 8: 'Auxiliar' })[n] ?? `N${n}`
}

function autoDetectLevel(codigo: string): number {
  const len = codigo.replace(/\s/g, '').length
  if (len <= 1) return 1
  if (len <= 2) return 2
  if (len <= 4) return 4
  if (len <= 6) return 6
  return 8
}

const defaultConfig: PucConfig = {
  req_tercero: false, req_centro_costo: false, req_documento: false, req_referencia: false,
  cta_impuestos: false, cta_impuestos_asignacion: null,
  aplicar_depreciaciones: false, depreciaciones_asignacion: null,
  establecer_presupuesto: false, presupuesto_asignacion: null,
  es_corriente: false, es_reciproca: false, no_acumular_tercero: false, no_validar_documento: false,
  validar_saldos_contrarios: false, no_reclasificar: false, inactiva: false,
}

const configFields: { key: keyof PucConfig; label: string; hasBtn?: boolean }[] = [
  { key: 'req_tercero', label: 'Requiere y acumula saldos por tercero' },
  { key: 'req_centro_costo', label: 'Requiere y acumula saldos por centro de costo' },
  { key: 'req_documento', label: 'Requiere y acumula saldos por documento relacionado' },
  { key: 'req_referencia', label: 'Requiere y acumula saldos por referencia (mcias y activos fijos)' },
  { key: 'cta_impuestos', label: 'Cuenta de impuestos' },
  { key: 'aplicar_depreciaciones', label: 'Aplicar depreciaciones' },
  { key: 'establecer_presupuesto', label: 'Establecer presupuesto' },
  { key: 'es_corriente', label: 'Es corriente' },
  { key: 'es_reciproca', label: 'Es una cuenta recíproca' },
  { key: 'no_acumular_tercero', label: 'No acumular saldos por tercero' },
  { key: 'no_validar_documento', label: 'No validar documento afectado' },
  { key: 'validar_saldos_contrarios', label: 'Validar saldos contrarios a la naturaleza' },
  { key: 'no_reclasificar', label: 'No reclasificar, causar o provisionar (Cartera financiera)' },
  { key: 'inactiva', label: 'Inactiva' },
]

// ── TreeNode ─────────────────────────────────────────

function TreeNode({
  cuenta,
  depth,
  selected,
  onSelect,
}: {
  cuenta: PucConSaldo
  depth: number
  selected: string | null
  onSelect: (c: PucCuenta) => void
}) {
  const [open, setOpen] = useState(depth < 2)
  const hasChildren = (cuenta.children?.length ?? 0) > 0
  const isSelected = selected === cuenta.codigo

  return (
    <>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm transition-colors hover:bg-accent',
          isSelected && 'bg-primary/10 font-medium text-primary',
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(cuenta)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
            className="inline-flex"
          >
            {open ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
          </button>
        ) : <span className="inline-block w-3.5" />}
        <span className="font-mono text-[11px] text-muted-foreground">{cuenta.codigo}</span>
        <span className="truncate">{cuenta.nombre}</span>
      </div>
      {open && hasChildren && cuenta.children!.map((child) => (
        <TreeNode key={child.codigo} cuenta={child} depth={depth + 1} selected={selected} onSelect={onSelect} />
      ))}
    </>
  )
}

// ── BalanceMatrix ────────────────────────────────────

function BalanceMatrix() {
  const months = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    label: new Date(2026, i).toLocaleString('es', { month: 'short' }),
  }))

  return (
    <div className="overflow-y-auto">
      <table className="w-full min-w-[600px] text-[11px]">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-1.5 py-0.5 text-left font-medium">Año</th>
            <th className="px-1.5 py-0.5 text-left font-medium">Mes</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Débitos</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Créditos</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Saldo</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Débitos</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Créditos</th>
            <th className="px-1.5 py-0.5 text-right font-medium">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.mes} className="border-b last:border-0 text-muted-foreground">
              <td className="px-1.5 py-0.5">{m.mes === 1 ? new Date().getFullYear() : ''}</td>
              <td className="px-1.5 py-0.5 capitalize">{m.label}</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
              <td className="px-1.5 py-0.5 text-right">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────

export function PucPage() {
  const { profile } = useAuth()
  const [tree, setTree] = useState<PucConSaldo[]>([])
  const [flat, setFlat] = useState<PucCuenta[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PucCuenta | null>(null)

  // Form state
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [naturaleza, setNaturaleza] = useState<'D' | 'C'>('D')
  const [config, setConfig] = useState<PucConfig>(defaultConfig)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  function reload() {
    if (!profile?.emp_ide) return
    setLoading(true)
    Promise.all([
      fetchPucConSaldos(profile.emp_ide),
      fetchPuc(profile.emp_ide),
    ]).then(([t, f]) => { setTree(t); setFlat(f); setLoading(false) })
  }

  useEffect(reload, [profile?.emp_ide])

  function onSelect(cuenta: PucCuenta) {
    setSelected(cuenta)
    setNombre(cuenta.nombre)
    setCodigo(cuenta.codigo)
    setNaturaleza(cuenta.tipo_naturaleza)
    setConfig({ ...defaultConfig, ...(cuenta.config ?? {}) })
    setDirty(false)
  }

  function toggleConfig(key: keyof PucConfig) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
  }

  async function handleSave() {
    if (!profile?.emp_ide || !selected) return
    setSaving(true)
    try {
      await updatePucCuenta(profile.emp_ide, selected.codigo, {
        nombre: nombre.trim(),
        tipo_naturaleza: naturaleza,
        config,
      })
      setDirty(false)
      reload()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!profile?.emp_ide || !selected) return
    if (!confirm(`¿Eliminar cuenta ${selected.codigo} - ${selected.nombre}?`)) return
    await supabase.from('puc_cuentas').delete().eq('emp_ide', profile.emp_ide).eq('codigo', selected.codigo)
    setSelected(null)
    reload()
  }

  // New account form
  const [showNew, setShowNew] = useState(false)
  const [newCodigo, setNewCodigo] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [newOverride, setNewOverride] = useState(false)
  const newNivel = autoDetectLevel(newCodigo)
  const newExists = flat.some((c) => c.codigo === newCodigo.replace(/\s/g, ''))

  async function handleNew() {
    if (!profile?.emp_ide || !newCodigo.trim() || !newNombre.trim() || newExists) return
    const clean = newCodigo.replace(/\s/g, '')
    const nivel = autoDetectLevel(clean)
    const padre = nivel === 1 ? null : flat.find((c) => c.codigo === clean.slice(0, nivel === 2 ? 1 : nivel === 4 ? 2 : nivel === 6 ? 4 : 6))?.codigo ?? null

    const nature = padre
      ? (() => { let p = flat.find((c) => c.codigo === padre); while (p && p.nivel > 1) p = flat.find((c) => c.codigo === p!.padre); return p?.tipo_naturaleza ?? 'D' })()
      : 'D'

    await supabase.from('puc_cuentas').insert({
      codigo: clean, emp_ide: profile.emp_ide, nombre: newNombre.trim(),
      tipo_naturaleza: newOverride ? (nature === 'D' ? 'C' : 'D') : nature,
      nivel, padre, config: {},
    })
    setNewCodigo(''); setNewNombre(''); setShowNew(false); reload()
  }

  const filteredTree = searchVal
    ? (() => {
        function filterNode(n: PucConSaldo): PucConSaldo | null {
          const match = n.codigo.includes(searchVal) || n.nombre.toLowerCase().includes(searchVal.toLowerCase())
          const filteredChildren = (n.children ?? []).map(filterNode).filter(Boolean) as PucConSaldo[]
          if (match || filteredChildren.length > 0) return { ...n, children: filteredChildren.length > 0 ? filteredChildren : n.children }
          return null
        }
        return tree.map(filterNode).filter(Boolean) as PucConSaldo[]
      })()
    : tree

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3">
      {/* ── Header + Toolbar ───────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
        <div className="w-32">
          <label className="block text-[11px] font-medium text-muted-foreground">Código</label>
          <input
            type="text" value={codigo}
            onChange={(e) => { setCodigo(e.target.value); setDirty(true) }}
            className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-mono"
            placeholder="110505"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-muted-foreground">Nombre</label>
          <input
            type="text" value={nombre}
            onChange={(e) => { setNombre(e.target.value); setDirty(true) }}
            className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            placeholder="Nombre de la cuenta"
          />
        </div>
        <div className="w-36">
          <label className="block text-[11px] font-medium text-muted-foreground">Naturaleza</label>
          <select
            value={naturaleza}
            onChange={(e) => { setNaturaleza(e.target.value as 'D' | 'C'); setDirty(true) }}
            className="mt-0.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="D">Débito</option>
            <option value="C">Crédito</option>
          </select>
        </div>
        <div className="h-8 w-px self-end bg-border" />
        <Button variant="ghost" size="icon" onClick={() => setShowNew(true)} title="Nuevo">
          <Plus className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}} title="Buscar">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={!dirty || !selected} onClick={handleSave} title={saving ? 'Guardando...' : 'Grabar'}>
          <Save className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive" disabled={!selected} onClick={handleDelete} title="Eliminar">
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* ── Main Split ─────────────────────────────── */}
      <div className="flex flex-[3] gap-4 overflow-hidden min-h-0">
        {/* Left: Checkboxes */}
        <div className="w-[340px] shrink-0 overflow-y-auto rounded-lg border bg-card p-3">
          <p className="mb-2 text-[11px] font-medium uppercase text-muted-foreground">Atributos de la cuenta</p>
          <div className="space-y-0.5">
            {configFields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={f.key}
                  checked={(config[f.key] as boolean) ?? false}
                  onChange={() => toggleConfig(f.key)}
                  className="size-3 shrink-0 accent-primary"
                />
                <label htmlFor={f.key} className="cursor-pointer text-[11px] leading-tight text-muted-foreground hover:text-foreground">
                  {f.label}
                </label>
                {f.hasBtn && (
                  <button type="button" className="ml-auto shrink-0 rounded px-1 py-0.5 text-[10px] text-muted-foreground hover:bg-accent" title="Asignar">→</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Tree */}
        <div className="flex-[2] overflow-y-auto rounded-lg border bg-card p-3 min-h-0">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-[11px] font-medium uppercase text-muted-foreground">Plan de Cuentas</p>
            <div className="relative ml-auto">
              <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                className="h-7 w-44 rounded-md border border-input bg-background pl-6 pr-2 text-xs"
                placeholder="Buscar..."
              />
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <div className="space-y-0.5">
              {filteredTree.map((root) => (
                <TreeNode key={root.codigo} cuenta={root} depth={0} selected={selected?.codigo ?? null} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Balance Matrix ─────────────────────────── */}
      <div className="max-h-28 shrink-0 rounded-lg border bg-card p-2 overflow-hidden">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase text-muted-foreground">Saldos mensuales</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <label className="flex items-center gap-0.5">
              <input type="checkbox" className="size-2.5 accent-primary" /> Fiscal
            </label>
            <label className="flex items-center gap-0.5">
              <input type="checkbox" className="size-2.5 accent-primary" /> Financiera
            </label>
            <label className="flex items-center gap-0.5">
              <input type="checkbox" className="size-2.5 accent-primary" defaultChecked /> Mayorizados
            </label>
          </div>
        </div>
        <BalanceMatrix />
      </div>

      {/* ── New Account Modal ─────────────────────── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold">Nueva cuenta</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Código</label>
                <input type="text" value={newCodigo} onChange={(e) => setNewCodigo(e.target.value)}
                  className={cn('w-full rounded-md border bg-background px-3 py-2 text-sm font-mono', newExists && 'border-destructive')}
                  placeholder="110505" autoFocus />
                {newExists && <p className="mt-0.5 text-xs text-destructive">Ya existe</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Nombre</label>
                <input type="text" value={newNombre} onChange={(e) => setNewNombre(e.target.value)}
                  className="theme-input"
                  placeholder="Caja General" />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Nivel: <strong>{nivelLabel(newNivel)}</strong></span>
                <button type="button" onClick={() => setNewOverride(!newOverride)}
                  className={cn('flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-accent', newOverride && 'text-primary')}>
                  <RefreshCw className="size-3" /> Invertir naturaleza
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleNew} disabled={!newCodigo.trim() || !newNombre.trim() || newExists}>Crear</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
