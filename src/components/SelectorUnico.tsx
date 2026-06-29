import { Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'
import { cn } from '@/lib/utils'

export interface SelectorUnicoItem {
  id: string | number
  label: string
  descripcion?: string
  metadata?: Record<string, any>
}

interface Props {
  open: boolean
  title?: string
  items: SelectorUnicoItem[]
  placeholder?: string
  onSelect: (item: SelectorUnicoItem) => void
  onClose: () => void
}

export function SelectorUnico({ open, title = 'Seleccionar', items, placeholder = 'Buscar...', onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  const filtered = search
    ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()) || (i.descripcion ?? '').toLowerCase().includes(search.toLowerCase()))
    : items

  function handleConfirm() { const item = items.find((i) => i.id === selectedId); if (item) onSelect(item) }
  function handleDoubleClick(id: string | number) { const item = items.find((i) => i.id === id); if (item) { onSelect(item); onClose() } }

  return (
    <Modal open={open} onClose={onClose} title={title} width="md">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setSelectedId(null) }} placeholder={placeholder}
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" autoFocus />
        </div>
        <div className="max-h-64 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground sticky top-0">
            <th className="px-3 py-2 w-24">Código</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2 hidden sm:table-cell">Descripción</th>
          </tr></thead>
            <tbody>{filtered.length === 0 ? (<tr><td colSpan={3} className="px-3 py-8 text-center text-xs text-muted-foreground">Sin resultados</td></tr>) : (
              filtered.map((item) => { const parts = (item.label ?? '').split(' - '); const codigo = parts[0] ?? ''; const nombre = parts.slice(1).join(' - ') || codigo; const isSelected = selectedId === item.id
                return (<tr key={item.id} onClick={() => setSelectedId(item.id)} onDoubleClick={() => handleDoubleClick(item.id)}
                  className={cn('cursor-pointer border-b last:border-0 transition-colors', isSelected ? 'bg-primary/10' : 'hover:bg-accent')}>
                  <td className={cn('px-3 py-2.5 font-mono text-xs', isSelected && 'text-primary font-semibold')}>{isSelected && <span className="mr-1">▸</span>}{codigo}</td>
                  <td className="px-3 py-2.5 text-sm font-medium">{nombre}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">{item.descripcion ?? ''}</td>
                </tr>) }
              )
            )}</tbody>
          </table>
        </div>
        {items.length > 0 && <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{filtered.length} de {items.length} tipo(s)</span><span className="hidden sm:inline">Doble clic para seleccionar</span></div>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleConfirm} disabled={selectedId === null}>Seleccionar</Button>
        </div>
      </div>
    </Modal>
  )
}
