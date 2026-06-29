import { Search, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'

export interface SubModuleItem {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href: string
}

interface Props {
  variant?: 'modal' | 'page'
  open?: boolean
  onClose?: () => void
  title: string
  items: SubModuleItem[]
  searchable?: boolean
}

const defaultColors = 'bg-muted text-muted-foreground'

const colorMap: Record<string, string> = {
  puc: 'bg-emerald-50 text-emerald-600',
  comprobantes: 'bg-blue-50 text-blue-600',
  'libro-mayor': 'bg-indigo-50 text-indigo-600',
  balance: 'bg-amber-50 text-amber-600',
  'definicion-cuentas': 'bg-sky-50 text-sky-600',
  articulos: 'bg-orange-50 text-orange-600',
  servicios: 'bg-cyan-50 text-cyan-600',
  impuestos: 'bg-rose-50 text-rose-600',
  terceros: 'bg-green-50 text-green-700',
  'formas-pago': 'bg-purple-50 text-purple-600',
  'listas-precios': 'bg-teal-50 text-teal-600',
  'clases-comprobantes': 'bg-amber-50 text-amber-600',
  'tipos-comprobante': 'bg-sky-50 text-sky-600',
  vendedores: 'bg-green-50 text-green-700',
  facturas: 'bg-blue-50 text-blue-600',
  fp: 'bg-blue-50 text-blue-600',
  pp: 'bg-amber-50 text-amber-600',
  'facturas-informe': 'bg-blue-50 text-blue-600',
}

function Card({ item, onClick }: { item: SubModuleItem; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="theme-card-btn">
      <div className={cn('rounded-lg p-2.5 shrink-0', colorMap[item.id] ?? defaultColors)}>
        <item.icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground leading-tight">{item.description}</p>
      </div>
    </button>
  )
}

export function ModuleLauncher({ variant = 'modal', open, onClose, title, items, searchable }: Props) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (variant !== 'modal' || !open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [variant, open, onClose])

  useEffect(() => { setSearch('') }, [items])

  function handleClick(href: string) { navigate(href); if (variant === 'modal') onClose?.() }

  const filtered = search ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())) : items

  if (variant === 'page') {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          {searchable && (
            <div className="relative w-64"><Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o descripcion..." className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none" />
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (<Card key={item.id} item={item} onClick={() => handleClick(item.href)} />))}
        </div>
        {filtered.length === 0 && search && <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados para "{search}"</p>}
      </div>
    )
  }

  // Variante modal: overlay con fondo oscuro
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24 transition-opacity duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg scale-100 rounded-xl border bg-card p-6 shadow-2xl transition-all duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} item={item} onClick={() => handleClick(item.href)} />
          ))}
        </div>
      </div>
    </div>
  )
}
