import { Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface DataField {
  key: string
  label: string
  type?: 'text' | 'number' | 'select' | 'date'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  width?: 'sm' | 'md' | 'full'
}

interface Props {
  fields: DataField[]
  values: Record<string, any>
  onChange: (key: string, value: any) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

function getSpan(field: DataField): string {
  const w = field.width ?? (field.type === 'number' ? 'sm' : field.type === 'select' ? 'md' : 'full')
  switch (w) {
    case 'sm':   return 'sm:col-span-1 lg:col-span-1'
    case 'md':   return 'sm:col-span-1 lg:col-span-2'
    case 'full':  return 'sm:col-span-2 lg:col-span-3'
  }
}

export function DataForm({ fields, values, onChange, onSubmit, onCancel, submitLabel = 'Guardar', loading }: Props) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => (
          <div key={field.key} className={getSpan(field)}>
            <label className="block text-xs font-medium mb-1">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, field.options?.[0] && typeof field.options[0].value === 'number' ? Number(e.target.value) : e.target.value)}
                className="theme-input"
              >
                <option value="">Seleccionar...</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                type="number"
                step="0.01"
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, Number(e.target.value))}
                className="theme-input"
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <input
                type={field.type ?? 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="theme-input"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {onCancel && <Button size="icon" variant="outline" onClick={onCancel} title="Cancelar"><X className="size-4" /></Button>}
        <Button size="icon" onClick={onSubmit} disabled={loading} title={typeof submitLabel === 'string' ? submitLabel : 'Guardar'}><Save className="size-4" /></Button>
      </div>
    </div>
  )
}
