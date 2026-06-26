import {
  BarChart3,
  BookOpen,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Monitor,
  Package,
  UserCog,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'

const tabInfo: Record<string, { label: string; icon: LucideIcon }> = {
  '/dashboard':             { label: 'Dashboard', icon: LayoutDashboard },
  '/dashboard/contabilidad':{ label: 'Contabilidad', icon: BookOpen },
  '/dashboard/facturacion': { label: 'Facturación', icon: FileText },
  '/dashboard/inventarios': { label: 'Inventarios', icon: Package },
  '/dashboard/pos':         { label: 'POS', icon: CreditCard },
  '/dashboard/restaurante': { label: 'Restaurante', icon: UtensilsCrossed },
  '/dashboard/crm':         { label: 'CRM', icon: Users },
  '/dashboard/informes':    { label: 'Informes', icon: BarChart3 },
  '/dashboard/perfil':      { label: 'Mi Empresa', icon: Building2 },
  '/dashboard/usuarios':    { label: 'Usuarios', icon: UserCog },
  '/dashboard/admin':       { label: 'Panel de Administración', icon: Monitor },
}

export function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [tracked, setTracked] = useState<string[]>(['/dashboard'])
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  function handleDragStart(e: React.DragEvent, idx: number) {
    if (idx === 0) return
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx || dragIdx === 0 || idx === 0) return
    setTracked((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      return next
    })
    setDragIdx(idx)
  }

  function handleDragEnd() {
    setDragIdx(null)
  }

  useEffect(() => {
    if (!tracked.includes(location.pathname)) {
      setTracked((prev) => (prev.length < 10 ? [...prev, location.pathname] : prev))
    }
  }, [location.pathname])

  function closeTab(path: string) {
    const next = tracked.filter((p) => p !== path)
    setTracked(next)
    if (path === location.pathname) navigate('/dashboard')
  }

  function closeAll() {
    setTracked(['/dashboard'])
    navigate('/dashboard')
  }

  return (
    <div className="flex h-9 items-center gap-px overflow-x-auto border-b bg-muted/20 px-1">
      {tracked.map((path, idx) => {
        const info = tabInfo[path]
        const isActive = path === location.pathname
        return (
          <div
            key={path}
            draggable={path !== '/dashboard'}
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onClick={() => navigate(path)}
            className={cn(
              'group flex shrink-0 cursor-pointer items-center gap-1 rounded-t px-3 py-1.5 text-xs transition-all duration-150 select-none',
              isActive
                ? 'bg-card font-medium text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            {info?.icon && <info.icon className="size-3.5 shrink-0" />}
            <span className="truncate max-w-28">{info?.label ?? path}</span>
            {path !== '/dashboard' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeTab(path) }}
                className="ml-1 inline-flex rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted-foreground/20"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )
      })}

      {tracked.length > 1 && (
        <button
          type="button"
          onClick={closeAll}
          className="ml-auto shrink-0 px-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕ Cerrar todas
        </button>
      )}
    </div>
  )
}
