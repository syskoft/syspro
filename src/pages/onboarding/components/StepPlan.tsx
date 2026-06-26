import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchPlans } from '@/services/onboarding'
import type { SusTip } from '@/types/database'

interface Props {
  selectedPlan: number | null
  onSelect: (planId: number) => void
  onNext: () => void
  onBack: () => void
}

export function StepPlan({ selectedPlan, onSelect, onNext, onBack }: Props) {
  const [plans, setPlans] = useState<SusTip[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    fetchPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setLoading(false))
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Plan de suscripción</h2>
        <p className="text-sm text-muted-foreground">
          Selecciona el plan que mejor se adapte a tu empresa.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando planes...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.ide}
              type="button"
              onClick={() => onSelect(plan.ide)}
              className={cn(
                'rounded-lg border p-6 text-left transition-all hover:border-primary',
                selectedPlan === plan.ide
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-input',
              )}
            >
              <h3 className="font-semibold">{plan.nom_sus_emp}</h3>
              <p className="mt-1 text-2xl font-bold">
                ${plan.val_sus_emp.toLocaleString('es-CO')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.num_mes === 1
                  ? 'Mensual'
                  : `${plan.num_mes} meses`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {plan.num_mes === 1
                  ? 'Facturación mensual, cancela cuando quieras'
                  : 'Ahorra con el plan anual'}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext} disabled={!selectedPlan}>
          Continuar
        </Button>
      </div>
    </div>
  )
}
