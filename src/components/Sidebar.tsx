import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Monitor,
  Package,
  Shield,
  UserCog,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { EmpresaLogo } from '@/components/EmpresaLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Emp } from '@/types/database'

type EmpresaMini = Pick<Emp, 'logo_url' | 'nom_com'>

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { id: 'facturacion', label: 'Facturación', href: '/dashboard/facturacion', icon: FileText },
  { id: 'catalogos', label: 'Catálogos', href: '/dashboard/catalogos', icon: ClipboardList },
  { id: 'contabilidad', label: 'Contabilidad', href: '/dashboard/contabilidad', icon: BookOpen },
  { id: 'inventarios', label: 'Inventarios', href: '/dashboard/inventarios', icon: Package },
  { id: 'pos', label: 'POS', href: '/dashboard/pos', icon: CreditCard },
  { id: 'restaurante', label: 'Restaurante', href: '/dashboard/restaurante', icon: UtensilsCrossed },
  { id: 'crm', label: 'CRM', href: '/dashboard/crm', icon: Users },
  { id: 'informes', label: 'Informes', href: '/dashboard/informes', icon: BarChart3 },
]

const adminSection = {
  section: 'Administración',
  items: [
    { label: 'Panel de Administración', href: '/dashboard/admin', icon: Monitor },
  ],
}

const configSection = (visible: boolean, isSuperAdmin: boolean) => ({
  section: 'Configuración',
  items: [
    { label: 'Mi Empresa', href: '/dashboard/perfil', icon: Building2 },
    ...(visible ? [{ label: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog }] : []),
    ...(isSuperAdmin ? [{ label: 'Permisos', href: '/dashboard/permisos', icon: Shield }] : []),
  ],
})

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const [empresa, setEmpresa] = useState<EmpresaMini | null>(null)
  const [allowedModules, setAllowedModules] = useState<string[]>([])
  const [showUsuarios, setShowUsuarios] = useState(false)
  const isSuperAdmin = profile?.role === 'superadmin'

  useEffect(() => {
    if (!profile?.emp_ide) return

    // Cargar datos de empresa
    supabase.from('empresas').select('logo_url, nom_com').eq('emp_ide', profile.emp_ide).single().then(({ data }) => {
      if (data) setEmpresa(data)
    })

    // Cargar suscripción activa para filtrar módulos
    supabase
      .from('suscripciones')
      .select('sus_emp')
      .eq('emp_ide', profile.emp_ide)
      .order('ide', { ascending: false })
      .limit(1)
      .single()
      .then(({ data: sub }) => {
        if (sub) {
          supabase
            .from('plan_modulos')
            .select('modulo_codigo')
            .eq('plan_id', sub.sus_emp)
            .then(({ data: mods }) => {
              const codes = mods?.map((m: any) => m.modulo_codigo) ?? []
              setAllowedModules(codes)
              setShowUsuarios(codes.includes('usuarios'))
            })
        }
      })
  }, [profile?.emp_ide])

  const visibleModules = isSuperAdmin
    ? ALL_MODULES
    : ALL_MODULES.filter((m) => allowedModules.includes(m.id))

  const navItems = [
    {
      section: 'Principal',
      items: visibleModules.filter((m) => m.id === 'dashboard'),
    },
    {
      section: 'Módulos',
      items: visibleModules.filter((m) => m.id !== 'dashboard'),
    },
    ...(isSuperAdmin ? [adminSection] : []),
    configSection(showUsuarios, isSuperAdmin),
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex flex-col items-end border-b px-3 py-3">
        <span className="font-mono text-sm tracking-widest text-primary">SYSPRO</span>
        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">by SYSKOFT</span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {navItems.map((group) =>
          group.items.length > 0 ? (
            <div key={group.section}>
              <p className="theme-nav-section">{group.section}</p>
              {group.items.map((item: any) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  className={({ isActive }) => cn('theme-nav-item', isActive && 'theme-nav-active')}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null,
        )}
      </nav>

      <div className="border-t p-4">
        {profile && (
          <div className="mb-3 flex items-center gap-2 truncate text-sm">
            <EmpresaLogo logoUrl={empresa?.logo_url} nombre={empresa?.nom_com ?? ''} size="sm" />
            <div className="min-w-0">
              <p className="truncate font-medium">{profile.usu}</p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.role === 'superadmin' ? 'SUPERADMIN' : 'Admin'}
                {profile.emp_ide && ` · ${profile.emp_ide}`}
              </p>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={signOut} title="Cerrar sesión">
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  )
}
