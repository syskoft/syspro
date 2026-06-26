import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl'
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, onClose, title, children, width = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 pt-10 pb-10 transition-opacity duration-150"
      onClick={onClose}
    >
      <div
        className={cn('w-full scale-100 rounded-xl border bg-card p-6 shadow-2xl transition-all duration-150', widths[width])}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
