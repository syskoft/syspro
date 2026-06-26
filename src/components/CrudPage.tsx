import { Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { DataForm, type DataField } from '@/components/DataForm'
import { DataTable, type DataColumn } from '@/components/DataTable'
import { FilterBar, type FilterField } from '@/components/FilterBar'
import { Modal } from '@/components/Modal'
import { Permiso } from '@/components/Permiso'

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
  renderModalContent?: (props: {
    formVals: Record<string, any>
    onChange: (key: string, value: any) => void
    onClose: () => void
    isEditing: boolean
  }) => ReactNode
  modalWidth?: 'sm' | 'md' | 'lg' | 'xl'
  permisoCrear?: string
  permisoEditar?: string
  permisoEliminar?: string
  canDelete?: (row: T) => boolean
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
  renderModalContent,
  modalWidth,
  permisoCrear,
  permisoEditar,
  permisoEliminar,
  canDelete,
}: Props<T>) {
  const [showNew, setShowNew] = useState(false)
  const [newVals, setNewVals] = useState<Record<string, any>>({})
  const [editRow, setEditRow] = useState<T | null>(null)
  const [editVals, setEditVals] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!onCreate) return
    setSaving(true)
    setError(null)
    try {
      await onCreate(newVals)
      setShowNew(false)
      setNewVals({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSave() {
    if (!onSave || !editRow) return
    setSaving(true)
    setError(null)
    try {
      await onSave({ ...editRow, ...editVals } as T)
      setEditRow(null)
      setEditVals({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const hasFilters = filterFields && filterFields.length > 0 && onSearch

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Permiso accion={permisoCrear ?? ''}>
          <Button size="sm" onClick={() => setShowNew(true)} title="Nuevo"><Plus className="size-4" /></Button>
        </Permiso>
      </div>

      {hasFilters && (
        <FilterBar fields={filterFields} onSearch={onSearch} onClear={onClear ?? (() => {})} loading={loading} />
      )}

      <DataTable
        columns={columns}
        data={data}
        idKey={idKey}
        loading={loading}
        onSave={onSave}
        onDelete={onDelete}
        onEditClick={onSave ? (row) => { setEditRow(row); setEditVals(row) } : undefined}
        permisoEditar={permisoEditar}
        permisoEliminar={permisoEliminar}
        canDelete={canDelete}
      />

      <Modal open={showNew} onClose={() => { setShowNew(false); setNewVals({}); setError(null) }} title={`Nuevo ${title}`} width={modalWidth}>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {onCreate && (
          <DataForm fields={fields} values={newVals} onChange={(k, v) => setNewVals({ ...newVals, [k]: v })}
            onSubmit={handleCreate} onCancel={() => { setShowNew(false); setNewVals({}); setError(null) }} submitLabel="Guardar" loading={saving} />
        )}
        {renderModalContent?.({ formVals: newVals, onChange: (k, v) => setNewVals({ ...newVals, [k]: v }), onClose: () => setShowNew(false), isEditing: false })}
      </Modal>

      <Modal open={!!editRow} onClose={() => { setEditRow(null); setError(null) }} title={`Editar ${title}`} width={modalWidth}>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {editRow && (
          <>
            <DataForm fields={fields} values={editVals} onChange={(k, v) => setEditVals({ ...editVals, [k]: v })}
              onSubmit={handleEditSave} onCancel={() => { setEditRow(null); setError(null) }} submitLabel="Guardar" loading={saving} />
            {renderModalContent?.({ formVals: editVals, onChange: (k, v) => setEditVals({ ...editVals, [k]: v }), onClose: () => setEditRow(null), isEditing: true })}
          </>
        )}
      </Modal>
    </div>
  )
}
