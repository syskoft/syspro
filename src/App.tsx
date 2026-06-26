import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminPanel } from '@/pages/admin/AdminPanel'
import { LoginPage } from '@/pages/auth/LoginPage'
import { PucPage } from '@/pages/contabilidad/PucPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ModulePlaceholder } from '@/pages/modules/ModulePlaceholder'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
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
              <Route path="/dashboard/facturacion" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad" element={<PucPage />} />
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
