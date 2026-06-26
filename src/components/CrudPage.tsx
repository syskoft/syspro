import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DataForm, type DataField } from '@/components/DataForm'
import { DataTable, type DataColumn } from '@/components/DataTable'
import { FilterBar, type FilterField } from '@/components/FilterBar'

interface Props<T extends Record<string, any>> {
  title: string
  columns: DataColumn<T>[]
  fields: DataField[]
  data: T[]
  idKey?: string
  loading?: boolean
  filterFields?: FilterField[]
  onSearch?: (filters: Record<string, string>) => void
  onClear?: () => void
  onCreate?: (values: Record<string, any>) => Promise<void>
  onSave?: (row: T) => Promise<void>
  onDelete?: (row: T) => Promise<void>
}

export function CrudPage<T extends Record<string, any>>({
  title,
  columns,
  fields,
  data,
  idKey,
  loading,
  filterFields,
  onSearch,
  onClear,
  onCreate,
  onSave,
  onDelete,
}: Props<T>) {
  const [showForm, setShowForm] = useState(false)
  const [formVals, setFormVals] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!onCreate) return
    setSaving(true)
    await onCreate(formVals)
    setShowForm(false)
    setFormVals({})
    setSaving(false)
  }

  const hasFilters = filterFields && filterFields.length > 0 && onSearch

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" /> Nuevo
        </Button>
      </div>

      {hasFilters && (
        <FilterBar
          fields={filterFields}
          onSearch={onSearch}
          onClear={onClear ?? (() => {})}
          loading={loading}
        />
      )}

      {showForm && onCreate && (
        <DataForm
          fields={fields}
          values={formVals}
          onChange={(k, v) => setFormVals({ ...formVals, [k]: v })}
          onSubmit={handleCreate}
          onCancel={() => { setShowForm(false); setFormVals({}) }}
          submitLabel="Guardar"
          loading={saving}
        />
      )}

      <DataTable
        columns={columns}
        data={data}
        idKey={idKey}
        loading={loading}
        onSave={onSave}
        onDelete={onDelete}
      />
    </div>
  )
}
