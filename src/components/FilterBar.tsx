import { RotateCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

export interface FilterField {
  key: string
  label: string
  type?: 'text' | 'select' | 'date'
  options?: { value: string; label: string }[]
  placeholder?: string
  defaultValue?: string
}

interface Props {
  fields: FilterField[]
  onSearch: (values: Record<string, string>) => void
  onClear: () => void
  loading?: boolean
}

export function FilterBar({ fields, onSearch, onClear, loading }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const f of fields) init[f.key] = f.defaultValue ?? ''
    return init
  })

  useEffect(() => {
    const init: Record<string, string> = {}
    for (const f of fields) init[f.key] = f.defaultValue ?? ''
    setValues(init)
  }, [fields])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const filtered: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) if (v) filtered[k] = v
    onSearch(filtered)
  }

  function handleClear() {
    const init: Record<string, string> = {}
    for (const f of fields) init[f.key] = f.defaultValue ?? ''
    setValues(init)
    onClear()
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/20 p-4">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground">{field.label}</label>
          {field.type === 'select' ? (
            <select
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
              className="h-8 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="">Todos</option>
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type ?? 'text'}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
              placeholder={field.placeholder ?? field.label}
              className="h-8 w-48 rounded-md border border-input bg-background px-3 text-xs"
            />
          )}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          <Search className="size-3.5" /> Consultar
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          <RotateCcw className="size-3.5" /> Limpiar
        </Button>
      </div>
    </form>
  )
}
