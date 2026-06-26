import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import type { PucCuenta } from '@/types/contabilidad'

interface Props {
  value: string | null
  cuentas: PucCuenta[]
  onChange: (codigo: string | null) => void
  placeholder?: string
}

export function BuscarCuenta({ value, cuentas, onChange, placeholder = 'Buscar cuenta...' }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = cuentas.find((c) => c.codigo === value)

  const filtered = query
    ? cuentas.filter(
        (c) =>
          c.codigo.includes(query) ||
          c.nombre.toLowerCase().includes(query.toLowerCase()),
      )
    : cuentas

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(codigo: string) {
    onChange(codigo)
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
          ref={inputRef}
          type="text"
          value={open ? query : (selected ? `${selected.codigo} - ${selected.nombre}` : '')}
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
            filtered.map((c) => (
              <button
                key={c.codigo}
                type="button"
                onClick={() => handleSelect(c.codigo)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-1.5 text-left text-xs hover:bg-accent',
                  c.codigo === value && 'bg-primary/10 font-medium',
                )}
              >
                <span className="font-mono text-[11px] text-muted-foreground shrink-0">{c.codigo}</span>
                <span className="truncate">{c.nombre}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
