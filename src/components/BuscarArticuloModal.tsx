import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/Modal'
import type { Articulo } from '@/types/database'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO', { minimumFractionDigits: 2 })

interface Props {
  open: boolean; articulos: Pick<Articulo, 'ide' | 'codigo' | 'nombre' | 'precio' | 'ultimo_costo'>[]
  excludeIds?: number[]
  onSelect: (articulo: Pick<Articulo, 'ide' | 'codigo' | 'nombre' | 'precio' | 'ultimo_costo'>) => void; onClose: () => void
}

export function BuscarArticuloModal({ open, articulos, excludeIds, onSelect, onClose }: Props) {
  const [query, setQuery] = useState(''); const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 100) } }, [open])
  const disponibles = excludeIds ? articulos.filter((a) => !excludeIds.includes(a.ide)) : articulos
  const filtered = query ? disponibles.filter((a) => a.codigo.toLowerCase().includes(query.toLowerCase()) || a.nombre.toLowerCase().includes(query.toLowerCase())) : []
  function handleSelect(a: Pick<Articulo, 'ide' | 'codigo' | 'nombre' | 'precio' | 'ultimo_costo'>) { onSelect(a); onClose() }
  return (<Modal open={open} onClose={onClose} title="Buscar Articulo" width="lg"><div className="space-y-3">
    <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por codigo o nombre..." autoFocus className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm outline-none" /></div>
    {query.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Escribe para buscar articulos</p> : filtered.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sin resultados</p> : (
    <div className="max-h-72 overflow-y-auto rounded-lg border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground sticky top-0"><th className="px-3 py-2 w-20">Codigo</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2 w-24 text-right">Precio</th><th className="px-3 py-2 w-24 text-right">Costo</th><th className="px-3 py-2 w-14"></th></tr></thead>
      <tbody>{filtered.map((a) => (<tr key={a.ide} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => handleSelect(a)}><td className="px-3 py-2 font-mono text-xs">{a.codigo}</td><td className="px-3 py-2 text-xs">{a.nombre}</td><td className="px-3 py-2 text-right font-mono text-xs">{fmt(a.precio)}</td><td className="px-3 py-2 text-right font-mono text-xs">{fmt(a.ultimo_costo)}</td><td className="px-3 py-2"><Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleSelect(a) }}>+</Button></td></tr>))}</tbody></table></div>)}
    <div className="text-xs text-muted-foreground">{disponibles.length} articulo(s) · {filtered.length} resultado(s)</div>
  </div></Modal>)
}
