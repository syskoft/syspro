import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface SuperBoxItem {
  id: string
  label: string
  secondaryLabel?: string
}

interface Props {
  value: string | null
  items: SuperBoxItem[]
  onChange: (id: string | null) => void
  placeholder?: string
}

export function SuperBox({ value, items, onChange, placeholder = 'Buscar...' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = items.find((i) => i.id === value)

  const filtered = query
    ? items.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          i.secondaryLabel?.toLowerCase().includes(query.toLowerCase()),
      )
    : items

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  function handleClear() {
    onChange(null)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs">
        <Search className="size-3 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={open ? query : (selected?.label ?? '')}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={value ? '' : placeholder}
          className="flex-1 min-w-0 bg-transparent outline-none"
        />
        {value && (
          <button type="button" onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="size-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full min-w-[300px] overflow-y-auto rounded-md border bg-card shadow-lg">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Sin resultados</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-1.5 text-left text-xs hover:bg-accent',
                  item.id === value && 'bg-primary/10 font-medium',
                )}
              >
                <span className="truncate">{item.label}</span>
                {item.secondaryLabel && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">{item.secondaryLabel}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
