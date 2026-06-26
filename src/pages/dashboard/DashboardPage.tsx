import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  Package,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Emp } from '@/types/database'

const moduleCards = [
  { label: 'Facturación', href: '/dashboard/facturacion', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Contabilidad', href: '/dashboard/contabilidad', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Inventarios', href: '/dashboard/inventarios', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'POS', href: '/dashboard/pos', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Restaurante', href: '/dashboard/restaurante', icon: UtensilsCrossed, color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'CRM', href: '/dashboard/crm', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Informes', href: '/dashboard/informes', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
]

export function DashboardPage() {
  const { profile } = useAuth()
  const [company, setCompany] = useState<Emp | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!profile?.emp_ide) return
    supabase
      .from('empresas')
      .select('*')
      .eq('emp_ide', profile.emp_ide)
      .single()
      .then(({ data }) => {
        if (data) setCompany(data)
      })
  }, [profile?.emp_ide])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Bienvenido{company ? `, ${company.nom_com}` : ''}
        </h1>
        <p className="text-muted-foreground">
          {company?.raz_soc ?? ''}
          {company?.emp_ide && ` · ${company.emp_ide}`}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">NIT</p>
          <p className="mt-1 text-lg font-semibold">{company?.ide_emp ?? '-'}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Ciudad</p>
          <p className="mt-1 text-lg font-semibold">{company?.ciu ?? '-'}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Teléfono</p>
          <p className="mt-1 text-lg font-semibold">{company?.tel ?? '-'}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Régimen</p>
          <p className="mt-1 text-lg font-semibold">{company?.reg_tri ?? '-'}</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Módulos</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {moduleCards.map((mod) => (
          <button
            key={mod.label}
            type="button"
            onClick={() => navigate(mod.href)}
            className={cn(
              'flex items-center gap-4 rounded-lg border p-4 text-left transition-all hover:shadow-md',
              mod.bg,
            )}
          >
            <div className={cn('rounded-lg p-2', mod.bg)}>
              <mod.icon className={cn('size-6', mod.color)} />
            </div>
            <div>
              <p className="font-medium">{mod.label}</p>
              <p className="text-xs text-muted-foreground">Ir al módulo</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
