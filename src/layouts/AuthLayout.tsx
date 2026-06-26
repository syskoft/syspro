import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'

export function AuthLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Outlet />
    </div>
  )
}
