import { Button } from '@/components/ui/button'

export interface DataField {
  key: string
  label: string
  type?: 'text' | 'number' | 'select' | 'date'
  required?: boolean
  placeholder?: string
  options?: { value: string | number; label: string }[]
  columns?: number
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

export function DataForm({ fields, values, onChange, onSubmit, onCancel, submitLabel = 'Guardar', loading }: Props) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div key={field.key} style={field.columns === 1 ? { gridColumn: '1 / -1' } : undefined}>
            <label className="block text-xs font-medium mb-1">
              {field.label}
              {field.required && <span className="text-destructive ml-0.5">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, field.options?.[0] && typeof field.options[0].value === 'number' ? Number(e.target.value) : e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <input
                type={field.type ?? 'text'}
                value={values[field.key] ?? ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {onCancel && <Button size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>}
        <Button size="sm" onClick={onSubmit} disabled={loading}>{loading ? 'Guardando...' : submitLabel}</Button>
      </div>
    </div>
  )
}
