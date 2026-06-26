import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  createAdminUser,
  createCompany,
  createSubscription,
  type AdminFormData,
  type CompanyFormData,
} from '@/services/onboarding'
import type { SusTip } from '@/types/database'

interface Props {
  company: CompanyFormData
  plan: SusTip | null
  admin: AdminFormData
  onBack: () => void
}

export function StepConfirm({ company, plan, admin, onBack }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleConfirm() {
    if (!plan) return
    setSubmitting(true)
    setError(null)

    try {
      const emp = await createCompany(company)
      await createSubscription(emp.emp_ide, plan.ide, plan.num_mes)
      await createAdminUser(admin.email, admin.password, emp.emp_ide)
      navigate('/login', {
        state: { message: 'Empresa creada exitosamente. Inicia sesión con tu cuenta de administrador.' },
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear la empresa',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (val: number) =>
    '$' + val.toLocaleString('es-CO')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Confirmar y crear</h2>
        <p className="text-sm text-muted-foreground">
          Revisa la información antes de crear tu empresa.
        </p>
      </div>

      <div className="space-y-4">
        <section className="rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
            Empresa
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">NIT</dt>
            <dd>{company.ide_emp}</dd>
            <dt className="text-muted-foreground">Nombre comercial</dt>
            <dd>{company.nom_com}</dd>
            <dt className="text-muted-foreground">Razón social</dt>
            <dd>{company.raz_soc}</dd>
            {company.dir && (
              <>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd>{company.dir}</dd>
              </>
            )}
            {company.ciu && (
              <>
                <dt className="text-muted-foreground">Ciudad</dt>
                <dd>{company.ciu}</dd>
              </>
            )}
          </dl>
        </section>

        {plan && (
          <section className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
              Plan contratado
            </h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Plan</dt>
              <dd>{plan.nom_sus_emp}</dd>
              <dt className="text-muted-foreground">Valor</dt>
              <dd>{formatCurrency(plan.val_sus_emp)}</dd>
              <dt className="text-muted-foreground">Duración</dt>
              <dd>
                {plan.num_mes === 1 ? 'Mensual' : `${plan.num_mes} meses`}
              </dd>
            </dl>
          </section>
        )}

        <section className="rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
            Administrador
          </h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{admin.email}</dd>
          </dl>
        </section>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={submitting}>
          Atrás
        </Button>
        <Button onClick={handleConfirm} disabled={submitting}>
          {submitting ? 'Creando empresa...' : 'Crear empresa'}
        </Button>
      </div>
    </div>
  )
}
