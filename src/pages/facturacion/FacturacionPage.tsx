import { FileText, HandCoins, Receipt, Search, ShoppingCart, Truck } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SelectorUnico } from '@/components/SelectorUnico'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { fetchTiposByClase } from '@/services/facturacion'
import type { TipoComprobante } from '@/types/database'

const colorPalette = ['bg-blue-50 text-blue-600','bg-green-50 text-green-700','bg-amber-50 text-amber-600','bg-rose-50 text-rose-600','bg-purple-50 text-purple-600','bg-cyan-50 text-cyan-600','bg-orange-50 text-orange-600','bg-teal-50 text-teal-600','bg-indigo-50 text-indigo-600','bg-pink-50 text-pink-600']
const iconMap: Record<string, LucideIcon> = { FC: ShoppingCart, FV: FileText, NC: Receipt, PE: Truck, RC: HandCoins }

function Card({ icon: Icon, nombre, descripcion, color, onClick }: { icon: LucideIcon; nombre: string; descripcion?: string; color: string; onClick: () => void }) {
  return (<button type="button" onClick={onClick} className="flex items-center gap-4 rounded-xl border bg-card p-5 text-left transition-all hover:shadow-md hover:border-primary">
    <div className={cn('flex size-12 items-center justify-center rounded-xl', color)}><Icon className="size-6" /></div>
    <div className="min-w-0"><p className="text-sm font-medium truncate">{nombre}</p>{descripcion && <p className="mt-0.5 text-xs text-muted-foreground leading-tight line-clamp-2">{descripcion}</p>}</div>
  </button>)
}

export function FacturacionPage() {
  const navigate = useNavigate(); const { profile } = useAuth()
  const [tipos, setTipos] = useState<TipoComprobante[]>([]); const [search, setSearch] = useState('')
  const [selectorOpen, setSelectorOpen] = useState(false); const [selectorItems, setSelectorItems] = useState<any[]>([]); const [selectedClase, setSelectedClase] = useState('')
  useEffect(() => { supabase.from('tipo_comprobante').select('*').eq('ina', false).order('codigo').then(({ data }) => { if (data) setTipos(data) }) }, [])
  async function handleCardClick(claseCodigo: string) {
    if (!profile?.emp_ide) return; const items = await fetchTiposByClase(profile.emp_ide, claseCodigo)
    if (items.length > 1) { setSelectedClase(claseCodigo); setSelectorItems(items.map((i) => ({ id: i.ide, label: `${i.codigo} - ${i.nombre}`, descripcion: i.descripcion ?? undefined }))); setSelectorOpen(true) }
    else { navigate(`/dashboard/facturacion/nueva/${claseCodigo}`) }
  }
  const filtered = search ? tipos.filter((t) => t.nombre.toLowerCase().includes(search.toLowerCase()) || (t.descripcion ?? '').toLowerCase().includes(search.toLowerCase())) : tipos
  return (<>
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Transacciones</h1><p className="text-sm text-muted-foreground">Selecciona un tipo de comprobante</p></div>
        <div className="relative w-64"><Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((t, i) => (<Card key={t.codigo} icon={iconMap[t.codigo] ?? FileText} nombre={t.nombre} descripcion={t.descripcion ?? undefined} color={colorPalette[i % colorPalette.length]} onClick={() => handleCardClick(t.codigo)} />))}
      </div>
      {filtered.length === 0 && search && <p className="py-4 text-center text-sm text-muted-foreground">Sin resultados para "{search}"</p>}
    </div>
    <SelectorUnico open={selectorOpen} title="Seleccionar Tipo de Comprobante" items={selectorItems}
      onSelect={(item) => { setSelectorOpen(false); navigate(`/dashboard/facturacion/nueva/${selectedClase}/${(item.label ?? '').split(' ')[0]}`) }}
      onClose={() => setSelectorOpen(false)} />
  </>)
}
