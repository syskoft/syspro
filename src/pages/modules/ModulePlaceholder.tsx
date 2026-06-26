import { useLocation } from 'react-router-dom'

export function ModulePlaceholder() {
  const location = useLocation()
  const name = location.pathname.split('/').pop() ?? ''

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <h1 className="text-3xl font-bold capitalize">{name}</h1>
      <p className="mt-2 text-muted-foreground">
        Este módulo estará disponible próximamente.
      </p>
    </div>
  )
}
