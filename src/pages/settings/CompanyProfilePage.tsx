import { Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { EmpresaLogo } from '@/components/EmpresaLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { subirLogo, eliminarLogo } from '@/services/empresa'
import { cn } from '@/lib/utils'
import type { Emp, EmpSub, SusTip } from '@/types/database'

export function CompanyProfilePage() {
  const { profile } = useAuth()
  const [company, setCompany] = useState<Emp | null>(null)
  const [subscription, setSubscription] = useState<{ plan: SusTip | null; sub: EmpSub | null }>({ plan: null, sub: null })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Emp>>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile?.emp_ide) return
    supabase.from('empresas').select('*').eq('emp_ide', profile.emp_ide).single().then(({ data }) => {
      if (data) { setCompany(data); setForm(data) }
    })
    supabase.from('suscripciones').select('*, tipos_suscripcion: sus_emp(*)').eq('emp_ide', profile.emp_ide).order('ide', { ascending: false }).limit(1).single().then(({ data }) => {
      if (data) setSubscription({ sub: data, plan: data.tipos_suscripcion as unknown as SusTip })
    })
  }, [profile?.emp_ide])

  async function handleSave() {
    if (!company) return
    setSaving(true)
    const { error } = await supabase.from('empresas').update({
      nom_com: form.nom_com, raz_soc: form.raz_soc, dir: form.dir, ciu: form.ciu,
      dep: form.dep, tel: form.tel, tel_2: form.tel_2, tel_3: form.tel_3,
      rep_leg: form.rep_leg, cc_rep_leg: form.cc_rep_leg,
    }).eq('emp_ide', company.emp_ide)
    if (!error) { setCompany({ ...company, ...form }); setEditing(false) }
    setSaving(false)
  }

  async function handleFile(file: File) {
    if (!company) return
    setLogoError(null)
    setUploading(true)
    try {
      const url = await subirLogo(company.emp_ide, file)
      setCompany({ ...company, logo_url: url })
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  async function handleEliminar() {
    if (!company) return
    if (!confirm('¿Eliminar logo?')) return
    await eliminarLogo(company.emp_ide)
    setCompany({ ...company, logo_url: null })
  }

  if (!company) return <p className="text-muted-foreground">Cargando...</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi Empresa</h1>
          <p className="text-sm text-muted-foreground">{company.emp_ide}</p>
        </div>
        {!editing ? (
          <Button variant="outline" size="icon" onClick={() => setEditing(true)} title="Editar">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => { setEditing(false); setForm(company) }} title="Cancelar">
              <X className="size-4" />
            </Button>
            <Button size="icon" onClick={handleSave} disabled={saving} title={saving ? 'Guardando...' : 'Guardar'}>
              <Save className="size-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        )}
      >
        <EmpresaLogo logoUrl={company.logo_url} nombre={company.nom_com} size="lg" className="ring-2 ring-border" />
        <p className="text-sm font-medium">{company.nom_com}</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}
            title={uploading ? 'Subiendo...' : company.logo_url ? 'Cambiar logo' : 'Subir logo'}>
            <Upload className="size-4" />
          </Button>
          {company.logo_url && (
            <Button size="sm" variant="outline" className="text-destructive" onClick={handleEliminar} title="Eliminar">
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
        {logoError && <p className="text-xs text-destructive">{logoError}</p>}
        <p className="text-xs text-muted-foreground">PNG o JPEG · Máx 2MB</p>
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

function FieldEdit({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="theme-input" />
    </div>
  )
}
