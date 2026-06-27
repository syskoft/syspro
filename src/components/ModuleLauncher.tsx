import { X, type LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
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
}

const defaultColors = 'bg-muted text-muted-foreground'

const colorMap: Record<string, string> = {
  puc: 'bg-emerald-50 text-emerald-600',
  comprobantes: 'bg-blue-50 text-blue-600',
  'libro-mayor': 'bg-indigo-50 text-indigo-600',
  balance: 'bg-amber-50 text-amber-600',
  precios: 'bg-green-50 text-green-700',
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

export function ModuleLauncher({ variant = 'modal', open, onClose, title, items }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    if (variant !== 'modal' || !open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [variant, open, onClose])

  function handleClick(href: string) {
    navigate(href)
    if (variant === 'modal') onClose?.()
  }

  // Variante page: inline sin overlay
  if (variant === 'page') {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">{title}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} item={item} onClick={() => handleClick(item.href)} />
          ))}
        </div>
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
