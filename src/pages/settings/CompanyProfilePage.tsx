import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Emp, EmpSub, SusTip } from '@/types/database'

export function CompanyProfilePage() {
  const { profile } = useAuth()
  const [company, setCompany] = useState<Emp | null>(null)
  const [subscription, setSubscription] = useState<{
    plan: SusTip | null
    sub: EmpSub | null
  }>({ plan: null, sub: null })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Emp>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.emp_ide) return

    supabase
      .from('empresas')
      .select('*')
      .eq('emp_ide', profile.emp_ide)
      .single()
      .then(({ data }) => {
        if (data) {
          setCompany(data)
          setForm(data)
        }
      })

    supabase
      .from('suscripciones')
      .select('*, tipos_suscripcion: sus_emp(*)')
      .eq('emp_ide', profile.emp_ide)
      .order('ide', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSubscription({
            sub: data,
            plan: data.tipos_suscripcion as unknown as SusTip,
          })
        }
      })
  }, [profile?.emp_ide])

  async function handleSave() {
    if (!company) return
    setSaving(true)

    const { error } = await supabase
      .from('empresas')
      .update({
        nom_com: form.nom_com,
        raz_soc: form.raz_soc,
        dir: form.dir,
        ciu: form.ciu,
        dep: form.dep,
        tel: form.tel,
        tel_2: form.tel_2,
        tel_3: form.tel_3,
        rep_leg: form.rep_leg,
        cc_rep_leg: form.cc_rep_leg,
      })
      .eq('emp_ide', company.emp_ide)

    if (!error) {
      setCompany({ ...company, ...form })
      setEditing(false)
    }
    setSaving(false)
  }

  if (!company) {
    return <p className="text-muted-foreground">Cargando...</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi Empresa</h1>
          <p className="text-sm text-muted-foreground">{company.emp_ide}</p>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); setForm(company) }}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-2 gap-4 p-6">
          <Field label="NIT" value={company.ide_emp} />
          {editing ? (
            <>
              <FieldEdit label="Nombre comercial" value={form.nom_com ?? ''} onChange={(v) => setForm({ ...form, nom_com: v })} />
              <FieldEdit label="Razón social" value={form.raz_soc ?? ''} onChange={(v) => setForm({ ...form, raz_soc: v })} />
              <FieldEdit label="Dirección" value={form.dir ?? ''} onChange={(v) => setForm({ ...form, dir: v })} />
              <FieldEdit label="Ciudad" value={form.ciu ?? ''} onChange={(v) => setForm({ ...form, ciu: v })} />
              <FieldEdit label="Departamento" value={form.dep ?? ''} onChange={(v) => setForm({ ...form, dep: v })} />
              <FieldEdit label="Teléfono" value={form.tel ?? ''} onChange={(v) => setForm({ ...form, tel: v })} />
              <FieldEdit label="Teléfono 2" value={form.tel_2 ?? ''} onChange={(v) => setForm({ ...form, tel_2: v })} />
              <FieldEdit label="Celular" value={form.tel_3 ?? ''} onChange={(v) => setForm({ ...form, tel_3: v })} />
              <FieldEdit label="Representante legal" value={form.rep_leg ?? ''} onChange={(v) => setForm({ ...form, rep_leg: v })} />
              <FieldEdit label="C.C. Rep. Legal" value={form.cc_rep_leg ?? ''} onChange={(v) => setForm({ ...form, cc_rep_leg: v })} />
            </>
          ) : (
            <>
              <Field label="Nombre comercial" value={company.nom_com} />
              <Field label="Razón social" value={company.raz_soc} />
              <Field label="Dirección" value={company.dir ?? '-'} />
              <Field label="Ciudad" value={company.ciu ?? '-'} />
              <Field label="Departamento" value={company.dep ?? '-'} />
              <Field label="Teléfono" value={company.tel ?? '-'} />
              <Field label="Teléfono 2" value={company.tel_2 ?? '-'} />
              <Field label="Celular" value={company.tel_3 ?? '-'} />
              <Field label="Representante legal" value={company.rep_leg ?? '-'} />
              <Field label="C.C. Rep. Legal" value={company.cc_rep_leg ?? '-'} />
            </>
          )}
        </div>
      </div>

      {subscription.plan && (
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Suscripción</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan" value={subscription.plan.nom_sus_emp} />
            <Field label="Valor" value={`$${subscription.plan.val_sus_emp.toLocaleString('es-CO')}`} />
            <Field label="Inicio" value={subscription.sub?.fec_ini ?? '-'} />
            <Field label="Fin" value={subscription.sub?.fec_fin ?? '-'} />
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function FieldEdit({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      />
    </div>
  )
}
