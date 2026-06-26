import { useState } from 'react'

import { Button } from '@/components/ui/button'
import type { AdminFormData } from '@/services/onboarding'

interface Props {
  data: AdminFormData
  onChange: (data: AdminFormData) => void
  onNext: () => void
  onBack: () => void
}

const defaultData: AdminFormData = {
  email: '',
  password: '',
}

export function StepAdmin({ data, onChange, onNext, onBack }: Props) {
  const merged = { ...defaultData, ...data }
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleNext() {
    if (!merged.email || !merged.password) {
      setError('Todos los campos son obligatorios')
      return
    }
    if (merged.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (merged.password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setError(null)
    onNext()
  }

  function update(field: keyof AdminFormData, value: string) {
    onChange({ ...merged, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Administrador de la empresa</h2>
        <p className="text-sm text-muted-foreground">
          Crea el usuario administrador que gestionará la empresa en SYSPRO.
        </p>
      </div>

      <div className="max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            required
            value={merged.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="admin@miempresa.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contraseña *
          </label>
          <input
            type="password"
            required
            value={merged.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirmar contraseña *
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!merged.email || !merged.password}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
