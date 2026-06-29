import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'
import type { Tercero } from '@/types/database'

interface Props {
  open: boolean; terceros: Pick<Tercero, 'ide' | 'identificacion' | 'nombre' | 'telefono' | 'tipo'>[]
  excludeIds?: number[]; filterTipo?: string[]
  onSelect: (tercero: Pick<Tercero, 'ide' | 'identificacion' | 'nombre'>) => void; onClose: () => void
}

export function BuscarTerceroModal({ open, terceros, excludeIds, filterTipo, onSelect, onClose }: Props) {
  const [query, setQuery] = useState(''); const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])
  const disponibles = (excludeIds ? terceros.filter((t) => !excludeIds.includes(t.ide)) : terceros)
    .filter((t) => !filterTipo || filterTipo.length === 0 || filterTipo.includes(t.tipo))
  const filtered = query ? disponibles.filter((t) => t.identificacion.toLowerCase().includes(query.toLowerCase()) || t.nombre.toLowerCase().includes(query.toLowerCase())) : []
  function handleSelect(t: Pick<Tercero, 'ide' | 'identificacion' | 'nombre'>) { onSelect(t); onClose() }
  return (
    <Modal open={open} onClose={onClose} title="Buscar Cliente" width="lg">
      <div className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por identificación o nombre..." autoFocus
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" /></div>
        {query.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Escribe para buscar clientes</p> :
        filtered.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados</p> : (
        <div className="max-h-72 overflow-y-auto rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground sticky top-0">
          <th className="px-3 py-2 w-28">Identificación</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2 w-24">Teléfono</th><th className="px-3 py-2 w-14"></th>
        </tr></thead><tbody>{filtered.map((t) => (<tr key={t.ide} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => handleSelect(t)}>
          <td className="px-3 py-2 font-mono text-xs">{t.identificacion}</td>
          <td className="px-3 py-2 text-xs">{t.nombre}</td>
          <td className="px-3 py-2 text-xs">{t.telefono ?? '-'}</td>
          <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelect(t) }}>+</Button></td>
        </tr>))}</tbody></table></div>)}
        <div className="text-xs text-muted-foreground">{disponibles.length} cliente(s) · {filtered.length} resultado(s)</div>
      </div>
    </Modal>
  )
}
