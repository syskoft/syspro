import { cn } from '@/lib/utils'

interface Props {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

const roleColors: Record<string, string> = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  operator: 'bg-green-100 text-green-700',
  consultant: 'bg-amber-100 text-amber-700',
  seller: 'bg-cyan-100 text-cyan-700',
  warehouse: 'bg-orange-100 text-orange-700',
}

const roleLabels: Record<string, string> = {
  superadmin: 'SUPERADMIN',
  admin: 'Admin',
  operator: 'Operador',
  consultant: 'Consultor',
  seller: 'Vendedor',
  warehouse: 'Bodeguero',
}

export function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo', className }: Props) {
  return (
    <span className={cn('theme-badge', active ? 'theme-badge-active' : 'theme-badge-inactive', className)}>
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn('theme-badge', roleColors[role] ?? 'bg-gray-100 text-gray-700')}>
      {roleLabels[role] ?? role}
    </span>
  )
}
