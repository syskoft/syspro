import { Check, ChevronLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DataColumn<T> {
  key: string
  label: string
  editable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
  renderEdit?: (value: any, row: T, onChange: (val: any) => void) => React.ReactNode
}

import { Permiso } from '@/components/Permiso'

interface Props<T extends Record<string, any>> {
  columns: DataColumn<T>[]
  data: T[]
  idKey?: string
  loading?: boolean
  onSave?: (row: T) => Promise<void>
  onDelete?: (row: T) => Promise<void>
  onEditClick?: (row: T) => void
  permisoEditar?: string
  permisoEliminar?: string
  canDelete?: (row: T) => boolean
  emptyMessage?: string
}

const PAGE_SIZES = [10, 20, 50, 100]

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  idKey = 'ide',
  loading,
  onSave,
  onDelete,
  onEditClick,
  permisoEditar,
  permisoEliminar,
  canDelete,
  emptyMessage = 'No hay registros',
}: Props<T>) {
  const [editing, setEditing] = useState<string | number | null>(null)
  const [editForm, setEditForm] = useState<Partial<T>>({})
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const totalPages = Math.ceil(data.length / pageSize)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, data.length)
  const paginated = data.slice((page - 1) * pageSize, page * pageSize)

  function getRowId(row: T): string | number {
    return (row as any)[idKey] ?? JSON.stringify(row)
  }

  async function handleSave(row: T) {
    if (!onSave) return
    setSaving(true)
    await onSave({ ...row, ...editForm } as T)
    setEditing(null)
    setEditForm({})
    setSaving(false)
  }

  function startEdit(row: T) {
    setEditing(getRowId(row))
    setEditForm(row)
  }

  function goPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages || 1)))
  }

  const colSpan = columns.length + (onSave || onDelete ? 1 : 0)

  return (
    <>
      <div className="mb-2">
        <span className="text-sm text-muted-foreground">
          Total de registros: {data.length}
          {data.length > pageSize && ` (Mostrando ${from}-${to})`}
        </span>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="theme-table-header">
              {columns.map((col) => (
                <th key={col.key} className={cn('px-3 py-2', col.width)} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </th>
              ))}
              {(onSave || onDelete) && <th className="px-3 py-2 font-medium w-20"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-muted-foreground">{emptyMessage}</td></tr>
            ) : (
              paginated.map((row) => {
                const rowId = getRowId(row)
                const isEditing = editing === rowId

                return (
                  <tr key={rowId} className="theme-table-row">
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2">
                        {isEditing && col.editable ? (
                          col.renderEdit ? (
                            col.renderEdit((row as any)[col.key], row, (val) => setEditForm({ ...editForm, [col.key]: val }))
                          ) : (
                            <input
                              defaultValue={(row as any)[col.key] ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, [col.key]: e.target.value })}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
                            />
                          )
                        ) : col.render ? (
                          col.render((row as any)[col.key], row)
                        ) : (
                          <span className={cn(col.editable && 'font-medium')}>{(row as any)[col.key] ?? '-'}</span>
                        )}
                      </td>
                    ))}
                    {(onSave || onDelete) && (
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleSave(row)} disabled={saving} title="Guardar"><Check className="size-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(null)} title="Cancelar"><X className="size-3.5" /></Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {onSave && (
                              <Permiso accion={permisoEditar ?? ''}>
                                {onEditClick
                                  ? <Button size="sm" variant="ghost" onClick={() => onEditClick(row)}><Pencil className="size-3.5" /></Button>
                                  : <Button size="sm" variant="ghost" onClick={() => startEdit(row)}><Pencil className="size-3.5" /></Button>
                                }
                              </Permiso>
                            )}
                            {onDelete && (
                              <Permiso accion={permisoEliminar ?? ''}>
                                {canDelete && !canDelete(row)
                                  ? <Button size="sm" variant="ghost" className="text-destructive" disabled title="No se puede eliminar este usuario"><Trash2 className="size-3.5" /></Button>
                                  : <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(row)}><Trash2 className="size-3.5" /></Button>
                                }
                              </Permiso>
                            )}
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {data.length > pageSize && (
          <div className="flex items-center justify-between border-t px-3 py-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
                className="rounded p-1 hover:bg-accent disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number
                if (totalPages <= 7) {
                  p = i + 1
                } else if (page <= 4) {
                  p = i + 1
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i
                } else {
                  p = page - 3 + i
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goPage(p)}
                    className={cn(
                      'min-w-[24px] rounded px-1.5 py-0.5 text-center',
                      p === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
                    )}
                  >
                    {p}
                  </button>
                )
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => goPage(page + 1)}
                className="rounded p-1 hover:bg-accent disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                className="rounded border border-input bg-background px-2 py-1 text-xs"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
