import { cn } from '@/lib/utils'

interface Props {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

export function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo', className }: Props) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
        className,
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
        role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700',
      )}
    >
      {role === 'superadmin' ? 'SUPERADMIN' : 'Admin'}
    </span>
  )
}
