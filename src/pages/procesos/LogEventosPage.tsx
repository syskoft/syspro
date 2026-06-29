import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchEventLog, type EventLogEntry } from '@/services/eventLog'

const actionColors: Record<string, string> = {
  CREAR: 'bg-green-100 text-green-700',
  EDITAR: 'bg-blue-100 text-blue-700',
  ELIMINAR: 'bg-red-100 text-red-700',
}

export function LogEventosPage() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState<EventLogEntry[]>([]); const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState(''); const [filtroAccion, setFiltroAccion] = useState(''); const [filtroTabla, setFiltroTabla] = useState('')

  const loadData = useCallback(async () => {
    if (!profile?.emp_ide) return; setLoading(true)
    const filtros: Record<string, string> = {}
    if (filtroAccion) filtros.accion = filtroAccion
    if (filtroTabla) filtros.tabla = filtroTabla
    if (search) filtros.search = search
    try { setLogs(await fetchEventLog(profile.emp_ide, Object.keys(filtros).length > 0 ? filtros : undefined)) } finally { setLoading(false) }
  }, [profile?.emp_ide, search, filtroAccion, filtroTabla])
  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Log de Eventos</h1></div>
      <div className="flex flex-wrap gap-3">
        <div className="relative w-64"><Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en detalle..." className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none" /></div>
        <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Todas las acciones</option><option value="CREAR">CREAR</option><option value="EDITAR">EDITAR</option><option value="ELIMINAR">ELIMINAR</option></select>
        <select value={filtroTabla} onChange={(e) => setFiltroTabla(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm"><option value="">Todas las tablas</option><option value="facturas">facturas</option><option value="articulos">articulos</option><option value="servicios">servicios</option><option value="terceros">terceros</option><option value="vendedores">vendedores</option></select>
      </div>
      <div className="rounded-lg border">
        {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Cargando...</p> : logs.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Sin eventos registrados</p> : (
        <table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground"><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Usuario</th><th className="px-3 py-2 w-24">Acción</th><th className="px-3 py-2 w-24">Tabla</th><th className="px-3 py-2">Detalle</th></tr></thead>
        <tbody>{logs.map((l) => (<tr key={l.ide} className="border-b last:border-0 hover:bg-muted/30">
          <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString('es-CO')}</td>
          <td className="px-3 py-2 text-xs">{l.usuario_nombre ?? '-'}</td>
          <td className="px-3 py-2"><span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${actionColors[l.accion] ?? ''}`}>{l.accion}</span></td>
          <td className="px-3 py-2 font-mono text-xs">{l.tabla}</td>
          <td className="px-3 py-2 text-xs">{l.detalle ? JSON.stringify(l.detalle).slice(0, 80) : '-'}</td>
        </tr>))}</tbody></table>)}
      </div>
    </div>
  )
}
