import { Grid3x3, X, type LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'

export interface QuickActionItem {
  id: string
  label: string
  description: string
  icon: LucideIcon
  href: string
}

interface Props {
  open: boolean
  onClose: () => void
  items: QuickActionItem[]
}

const bgColors: Record<string, string> = {
  dashboard: 'bg-blue-50 text-blue-600',
  facturacion: 'bg-blue-50 text-blue-600',
  contabilidad: 'bg-emerald-50 text-emerald-600',
  inventarios: 'bg-amber-50 text-amber-600',
  pos: 'bg-purple-50 text-purple-600',
  restaurante: 'bg-rose-50 text-rose-600',
  crm: 'bg-cyan-50 text-cyan-600',
  informes: 'bg-indigo-50 text-indigo-600',
  perfil: 'bg-gray-50 text-gray-600',
  usuarios: 'bg-violet-50 text-violet-600',
  admin: 'bg-orange-50 text-orange-600',
}

export function QuickActionPanel({ open, onClose, items }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleClick(href: string) {
    navigate(href)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-16 transition-opacity duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl scale-100 rounded-xl border bg-card p-6 shadow-2xl transition-all duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3x3 className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Navegación rápida</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.href)}
              className="group flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={cn('rounded-lg p-2.5 shrink-0', bgColors[item.id] ?? 'bg-muted text-muted-foreground')}>
                <item.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
