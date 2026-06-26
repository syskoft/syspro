import { cn } from '@/lib/utils'

interface Props {
  logoUrl?: string | null
  nombre: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 8, md: 12, lg: 20 } // en rem (h-8 = 32px, h-12 = 48px, h-20 = 80px)
const textSizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }

export function EmpresaLogo({ logoUrl, nombre, size = 'md', className }: Props) {
  const h = sizes[size]
  const initial = (nombre ?? '?').charAt(0).toUpperCase()

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={nombre}
        className={cn('rounded-lg border object-cover bg-white', `h-${h} w-${h}`, className)}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border font-bold text-muted-foreground bg-muted/30',
        `h-${h} w-${h}`,
        textSizes[size],
        className,
      )}
    >
      {initial}
    </div>
  )
}
