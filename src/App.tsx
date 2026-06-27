import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminPanel } from '@/pages/admin/AdminPanel'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ArticulosPage } from '@/pages/catalogos/ArticulosPage'
import { CatalogoPage } from '@/pages/catalogos/CatalogoPage'
import { ImpuestosPage } from '@/pages/catalogos/ImpuestosPage'

import { ServiciosPage } from '@/pages/catalogos/ServiciosPage'
import { ContabilidadPage } from '@/pages/contabilidad/ContabilidadPage'
import { DefinicionCuentasPage } from '@/pages/contabilidad/DefinicionCuentasPage'
import { PucPage } from '@/pages/contabilidad/PucPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ModulePlaceholder } from '@/pages/modules/ModulePlaceholder'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { PermisosPage } from '@/pages/settings/PermisosPage'
import { CompanyProfilePage } from '@/pages/settings/CompanyProfilePage'
import { UsersPage } from '@/pages/settings/UsersPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/perfil" element={<CompanyProfilePage />} />
              <Route path="/dashboard/usuarios" element={<UsersPage />} />
              <Route path="/dashboard/permisos" element={<PermisosPage />} />
              <Route path="/dashboard/facturacion" element={<ModulePlaceholder />} />
              <Route path="/dashboard/catalogos" element={<CatalogoPage />} />
              <Route path="/dashboard/catalogos/articulos" element={<ArticulosPage />} />
              <Route path="/dashboard/catalogos/servicios" element={<ServiciosPage />} />
              <Route path="/dashboard/catalogos/impuestos" element={<ImpuestosPage />} />
              <Route path="/dashboard/contabilidad" element={<ContabilidadPage />} />
              <Route path="/dashboard/contabilidad/puc" element={<PucPage />} />
              <Route path="/dashboard/contabilidad/comprobantes" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/libro-mayor" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/balance" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/definicion-cuentas" element={<DefinicionCuentasPage />} />
              <Route path="/dashboard/inventarios" element={<ModulePlaceholder />} />
              <Route path="/dashboard/pos" element={<ModulePlaceholder />} />
              <Route path="/dashboard/restaurante" element={<ModulePlaceholder />} />
              <Route path="/dashboard/crm" element={<ModulePlaceholder />} />
              <Route path="/dashboard/informes" element={<ModulePlaceholder />} />
              <Route path="/dashboard/admin" element={<AdminPanel />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
