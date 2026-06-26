import { Building2, CreditCard, Grid3x3, Settings, Shield } from 'lucide-react'

import { Tabs } from '@/components/Tabs'

import { AdminEmpresasPage } from './AdminEmpresasPage'
import { AdminModulosPlanPage } from './AdminModulosPlanPage'
import { AdminPlanesPage } from './AdminPlanesPage'
import { AdminSuscripcionesPage } from './AdminSuscripcionesPage'
import { AdminUsuariosPage } from './AdminUsuariosPage'

export function AdminPanel() {
  return (
    <Tabs
      tabs={[
        { id: 'empresas', label: 'Empresas', icon: <Building2 size={16} />, content: <AdminEmpresasPage /> },
        { id: 'planes', label: 'Planes', icon: <Settings size={16} />, content: <AdminPlanesPage /> },
        { id: 'susc', label: 'Suscripciones', icon: <CreditCard size={16} />, content: <AdminSuscripcionesPage /> },
        { id: 'modulos', label: 'Módulos x Plan', icon: <Grid3x3 size={16} />, content: <AdminModulosPlanPage /> },
        { id: 'usuarios', label: 'Usuarios', icon: <Shield size={16} />, content: <AdminUsuariosPage /> },
      ]}
      storageKey="admin-tab"
    />
  )
}
