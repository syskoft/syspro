import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'

interface Props {
  open: boolean; vendedores: { ide: number; codigo: string; nombre?: string; telefono?: string | null }[]
  onSelect: (vendedor: { ide: number; codigo: string; nombre?: string }) => void; onClose: () => void
}

export function BuscarVendedorModal({ open, vendedores, onSelect, onClose }: Props) {
  const [query, setQuery] = useState(''); const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])
  const filtered = query ? vendedores.filter((v) => v.codigo.toLowerCase().includes(query.toLowerCase()) || (v.nombre ?? '').toLowerCase().includes(query.toLowerCase())) : []
  function handleSelect(v: { ide: number; codigo: string; nombre?: string }) { onSelect(v); onClose() }
  return (
    <Modal open={open} onClose={onClose} title="Buscar Vendedor" width="lg">
      <div className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por código o nombre..." autoFocus
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" /></div>
        {query.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Escribe para buscar vendedores</p> :
        filtered.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados</p> : (
        <div className="max-h-72 overflow-y-auto rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground sticky top-0">
          <th className="px-3 py-2 w-20">Código</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2 w-28">Teléfono</th><th className="px-3 py-2 w-14"></th>
        </tr></thead><tbody>{filtered.map((v) => (<tr key={v.ide} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => handleSelect(v)}>
          <td className="px-3 py-2 font-mono text-xs">{v.codigo}</td>
          <td className="px-3 py-2 text-xs">{v.nombre ?? '-'}</td>
          <td className="px-3 py-2 text-xs">{v.telefono ?? '-'}</td>
          <td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelect(v) }}>+</Button></td>
        </tr>))}</tbody></table></div>)}
        <div className="text-xs text-muted-foreground">{vendedores.length} vendedor(es) · {filtered.length} resultado(s)</div>
      </div>
    </Modal>
  )
}
