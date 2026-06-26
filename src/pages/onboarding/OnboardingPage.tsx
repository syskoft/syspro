import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { fetchPlans, type AdminFormData, type CompanyFormData } from '@/services/onboarding'
import type { SusTip } from '@/types/database'

import { StepAdmin } from './components/StepAdmin'
import { StepCompany } from './components/StepCompany'
import { StepConfirm } from './components/StepConfirm'
import { StepPlan } from './components/StepPlan'

const STEPS = ['Empresa', 'Plan', 'Administrador', 'Confirmar']

const defaultCompany: CompanyFormData = {
  ide_emp: '',
  nom_com: '',
  raz_soc: '',
  dir: '',
  ciu: '',
  dep: '',
  tel: '',
  tel_2: '',
  tel_3: '',
  rep_leg: '',
  cc_rep_leg: '',
  per_ini_ano: new Date().getFullYear(),
  per_ini_mes: new Date().getMonth() + 1,
  pla_ctas: '',
  reg_tri: '',
  imp_vtas: 0,
}

const defaultAdmin: AdminFormData = {
  email: '',
  password: '',
}

export function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [company, setCompany] = useState<CompanyFormData>(defaultCompany)
  const [plans, setPlans] = useState<SusTip[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
  const [admin, setAdmin] = useState<AdminFormData>(defaultAdmin)

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      fetchPlans()
        .then(setPlans)
        .catch(console.error)
    })
  }, [])

  const selectedPlan = plans.find((p) => p.ide === selectedPlanId) ?? null

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <img
            src="/img/logo_syskoft.png"
            alt="SYSKOFT"
            className="mx-auto h-10"
          />
          <h1 className="mt-4 text-2xl font-bold">Configura tu empresa</h1>
          <p className="text-sm text-muted-foreground">
            Completa los pasos para crear tu empresa en SYSPRO
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full text-sm font-medium',
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-sm md:inline',
                  i <= step ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-px w-6 bg-border md:mx-2 md:w-8" />
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="rounded-lg border bg-card p-6">
          {step === 0 && (
            <StepCompany
              data={company}
              onChange={setCompany}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <StepPlan
              selectedPlan={selectedPlanId}
              onSelect={setSelectedPlanId}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}

          {step === 2 && (
            <StepAdmin
              data={admin}
              onChange={setAdmin}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepConfirm
              company={company}
              plan={selectedPlan}
              admin={admin}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
