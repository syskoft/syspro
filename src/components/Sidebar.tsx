import {
  BarChart3,
  BookOpen,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Monitor,
  Package,
  UserCog,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const baseNav = [
  { section: 'Principal', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Módulos', items: [
    { label: 'Facturación', href: '/dashboard/facturacion', icon: FileText },
    { label: 'Contabilidad', href: '/dashboard/contabilidad', icon: BookOpen },
    { label: 'Inventarios', href: '/dashboard/inventarios', icon: Package },
    { label: 'POS', href: '/dashboard/pos', icon: CreditCard },
    { label: 'Restaurante', href: '/dashboard/restaurante', icon: UtensilsCrossed },
    { label: 'CRM', href: '/dashboard/crm', icon: Users },
    { label: 'Informes', href: '/dashboard/informes', icon: BarChart3 },
  ]},
]

const adminSection = {
  section: 'Administración',
  items: [
    { label: 'Panel de Administración', href: '/dashboard/admin', icon: Monitor },
  ],
}

const configSection = { section: 'Configuración', items: [
  { label: 'Mi Empresa', href: '/dashboard/perfil', icon: Building2 },
  { label: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog },
]}

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const isSuperAdmin = profile?.role === 'superadmin'

  const navItems = isSuperAdmin
    ? [...baseNav, adminSection, configSection]
    : [...baseNav, configSection]

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <img src="/img/logo_syskoft.png" alt="SYSKOFT" className="h-8" />
        <span className="text-sm font-semibold">SYSPRO</span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="mb-1 px-2 text-xs font-medium uppercase text-muted-foreground">
              {group.section}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        {profile && (
          <div className="mb-3 truncate text-sm">
            <p className="font-medium">{profile.usu}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {profile.role === 'superadmin' ? 'SUPERADMIN' : 'Admin'}
              {profile.emp_ide && ` · ${profile.emp_ide}`}
            </p>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}
