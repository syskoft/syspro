import { Building2, CreditCard, Settings, Shield } from 'lucide-react'

import { Tabs } from '@/components/Tabs'

import { AdminEmpresasPage } from './AdminEmpresasPage'
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
        { id: 'usuarios', label: 'Usuarios', icon: <Shield size={16} />, content: <AdminUsuariosPage /> },
      ]}
      storageKey="admin-tab"
    />
  )
}
