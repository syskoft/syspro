import { BookOpen, ClipboardList, CreditCard, FileText, List, Package, Receipt, Search, Settings, Users, Wrench } from 'lucide-react'
import type { SubModuleItem } from '@/components/ModuleLauncher'

export const subModules: Record<string, SubModuleItem[]> = {
  contabilidad: [
    { id: 'puc', label: 'Plan de Cuentas', description: 'Catálogo PUC con saldos acumulados', icon: BookOpen, href: '/dashboard/contabilidad/puc' },
    { id: 'definicion-cuentas', label: 'Definición de Cuentas', description: 'Configuración de cuentas contables por impuesto', icon: Settings, href: '/dashboard/contabilidad/definicion-cuentas' },
  ],
  pos: [
    { id: 'fp', label: 'Factura de Venta POS', description: 'Facturación rápida desde punto de venta', icon: CreditCard, href: '/dashboard/pos/nueva/FP' },
    { id: 'pp', label: 'Pedido POS', description: 'Pedido registrado desde punto de venta', icon: ClipboardList, href: '/dashboard/pos/nueva/PP' },
  ],
  procesos: [
    { id: 'log-eventos', label: 'Log de Eventos', description: 'Registro de acciones realizadas en el sistema', icon: Search, href: '/dashboard/procesos/log-eventos' },
  ],
  utilidades: [
    { id: 'comprobantes', label: 'Comprobantes', description: 'Visualización de comprobantes, items y contabilización', icon: Search, href: '/dashboard/utilidades/comprobantes' },
  ],
  informes: [
    { id: 'facturas-informe', label: 'Comprobantes', description: 'Listado de comprobantes con filtros por clase, tipo y cliente', icon: FileText, href: '/dashboard/informes/facturas' },
  ],
  catalogos: [
    { id: 'articulos', label: 'Artículos', description: 'Gestión de productos y artículos', icon: Package, href: '/dashboard/catalogos/articulos' },
    { id: 'terceros', label: 'Terceros', description: 'Gestión de terceros (clientes, proveedores, vendedores)', icon: Users, href: '/dashboard/catalogos/terceros' },
    { id: 'formas-pago', label: 'Formas de Pago', description: 'Medios de pago', icon: CreditCard, href: '/dashboard/catalogos/formas-pago' },
    { id: 'listas-precios', label: 'Listas de Precios', description: 'Catálogo de listas de precios por artículo', icon: List, href: '/dashboard/catalogos/listas-precios' },
    { id: 'servicios', label: 'Servicios', description: 'Gestión de servicios', icon: Wrench, href: '/dashboard/catalogos/servicios' },
    { id: 'impuestos', label: 'Impuestos', description: 'Tarifas y configuración contable', icon: Receipt, href: '/dashboard/catalogos/impuestos' },
    { id: 'clases-comprobantes', label: 'Clases de Comprobantes', description: 'Clases de comprobante (FC, FV, NC...)', icon: FileText, href: '/dashboard/catalogos/clases-comprobantes' },
    { id: 'tipos-comprobante', label: 'Tipos de Comprobante', description: 'Tipos específicos por clase de comprobante', icon: List, href: '/dashboard/catalogos/tipos-comprobante' },
    { id: 'vendedores', label: 'Vendedores', description: 'Gestión de vendedores', icon: Users, href: '/dashboard/catalogos/vendedores' },
  ],
}
