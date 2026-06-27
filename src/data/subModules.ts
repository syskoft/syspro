import { BookOpen, List, Package, Receipt, Settings, Wrench } from 'lucide-react'

import type { SubModuleItem } from '@/components/ModuleLauncher'

export const subModules: Record<string, SubModuleItem[]> = {
  contabilidad: [
    { id: 'puc', label: 'Plan de Cuentas', description: 'Catálogo PUC con saldos acumulados', icon: BookOpen, href: '/dashboard/contabilidad/puc' },
    { id: 'definicion-cuentas', label: 'Definición de Cuentas', description: 'Configuración de cuentas contables por impuesto', icon: Settings, href: '/dashboard/contabilidad/definicion-cuentas' },
  ],
  catalogos: [
    { id: 'articulos', label: 'Artículos', description: 'Gestión de productos y artículos', icon: Package, href: '/dashboard/catalogos/articulos' },
    { id: 'listas-precios', label: 'Listas de Precios', description: 'Catálogo de listas de precios por artículo', icon: List, href: '/dashboard/catalogos/listas-precios' },
    { id: 'servicios', label: 'Servicios', description: 'Gestión de servicios', icon: Wrench, href: '/dashboard/catalogos/servicios' },
    { id: 'impuestos', label: 'Impuestos', description: 'Tarifas y configuración contable', icon: Receipt, href: '/dashboard/catalogos/impuestos' },
  ],
}
