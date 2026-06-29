import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AlertProvider } from '@/hooks/AlertProvider'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminPanel } from '@/pages/admin/AdminPanel'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ArticulosPage } from '@/pages/catalogos/ArticulosPage'
import { CatalogoPage } from '@/pages/catalogos/CatalogoPage'
import { ClasesCompPage } from '@/pages/catalogos/ClasesCompPage'
import { ComprobanteTiposPage } from '@/pages/catalogos/ComprobanteTiposPage'
import { ImpuestosPage } from '@/pages/catalogos/ImpuestosPage'
import { ListasPreciosPage } from '@/pages/catalogos/ListasPreciosPage'
import { ServiciosPage } from '@/pages/catalogos/ServiciosPage'
import { VendedoresPage } from '@/pages/catalogos/VendedoresPage'
import { ContabilidadPage } from '@/pages/contabilidad/ContabilidadPage'
import { DefinicionCuentasPage } from '@/pages/contabilidad/DefinicionCuentasPage'
import { PucPage } from '@/pages/contabilidad/PucPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ConfigContablePage } from '@/pages/facturacion/ConfigContablePage'
import { FacturacionPage } from '@/pages/facturacion/FacturacionPage'
import { FormasPagoPage } from '@/pages/facturacion/FormasPagoPage'
import { NuevaFacturaPage } from '@/pages/facturacion/NuevaFacturaPage'
import { TercerosPage } from '@/pages/facturacion/TercerosPage'
import { FacturaDetallePage } from '@/pages/informes/FacturaDetallePage'
import { FacturasInformePage } from '@/pages/informes/FacturasInformePage'
import { InformesPage } from '@/pages/informes/InformesPage'
import { ModulePlaceholder } from '@/pages/modules/ModulePlaceholder'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { PosPage } from '@/pages/pos/PosPage'
import { POSFacturaPage } from '@/pages/pos/POSFacturaPage'
import { ProcesosPage } from '@/pages/procesos/ProcesosPage'
import { LogEventosPage } from '@/pages/procesos/LogEventosPage'
import { PermisosPage } from '@/pages/settings/PermisosPage'
import { CompanyProfilePage } from '@/pages/settings/CompanyProfilePage'
import { UsersPage } from '@/pages/settings/UsersPage'
import { ComprobantesPage } from '@/pages/utilidades/ComprobantesPage'
import { UtilidadesPage } from '@/pages/utilidades/UtilidadesPage'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
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
              <Route path="/dashboard/facturacion" element={<FacturacionPage />} />
              <Route path="/dashboard/facturacion/nueva/:clase" element={<NuevaFacturaPage />} />
              <Route path="/dashboard/facturacion/nueva/:clase/:tipoCodigo" element={<NuevaFacturaPage />} />
              <Route path="/dashboard/facturacion/config" element={<ConfigContablePage />} />
              <Route path="/dashboard/catalogos" element={<CatalogoPage />} />
              <Route path="/dashboard/catalogos/articulos" element={<ArticulosPage />} />
              <Route path="/dashboard/catalogos/servicios" element={<ServiciosPage />} />
              <Route path="/dashboard/catalogos/impuestos" element={<ImpuestosPage />} />
              <Route path="/dashboard/catalogos/listas-precios" element={<ListasPreciosPage />} />
              <Route path="/dashboard/catalogos/terceros" element={<TercerosPage />} />
              <Route path="/dashboard/catalogos/formas-pago" element={<FormasPagoPage />} />
              <Route path="/dashboard/catalogos/clases-comprobantes" element={<ClasesCompPage />} />
              <Route path="/dashboard/catalogos/tipos-comprobante" element={<ComprobanteTiposPage />} />
              <Route path="/dashboard/catalogos/vendedores" element={<VendedoresPage />} />
              <Route path="/dashboard/contabilidad" element={<ContabilidadPage />} />
              <Route path="/dashboard/contabilidad/puc" element={<PucPage />} />
              <Route path="/dashboard/contabilidad/comprobantes" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/libro-mayor" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/balance" element={<ModulePlaceholder />} />
              <Route path="/dashboard/contabilidad/definicion-cuentas" element={<DefinicionCuentasPage />} />
              <Route path="/dashboard/inventarios" element={<ModulePlaceholder />} />
              <Route path="/dashboard/pos" element={<PosPage />} />
              <Route path="/dashboard/pos/nueva/:clase" element={<POSFacturaPage />} />
              <Route path="/dashboard/pos/nueva/:clase/:tipoCodigo" element={<POSFacturaPage />} />
              <Route path="/dashboard/restaurante" element={<ModulePlaceholder />} />
              <Route path="/dashboard/crm" element={<ModulePlaceholder />} />
              <Route path="/dashboard/informes" element={<InformesPage />} />
              <Route path="/dashboard/informes/facturas" element={<FacturasInformePage />} />
              <Route path="/dashboard/informes/facturas/:id" element={<FacturaDetallePage />} />
              <Route path="/dashboard/utilidades" element={<UtilidadesPage />} />
              <Route path="/dashboard/utilidades/comprobantes" element={<ComprobantesPage />} />
              <Route path="/dashboard/procesos" element={<ProcesosPage />} />
              <Route path="/dashboard/procesos/log-eventos" element={<LogEventosPage />} />
              <Route path="/dashboard/admin" element={<AdminPanel />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App
