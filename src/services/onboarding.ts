import { supabase } from '@/lib/supabase'
import type { SusTip } from '@/types/database'
// NOTA: las tablas se renombraron: emp→empresas, sus_tip→tipos_suscripcion, emp_sub→suscripciones

export interface CompanyFormData {
  ide_emp: string
  nom_com: string
  raz_soc: string
  dir: string
  ciu: string
  dep: string
  tel: string
  tel_2: string
  tel_3: string
  rep_leg: string
  cc_rep_leg: string
  per_ini_ano: number
  per_ini_mes: number
  pla_ctas: string
  reg_tri: string
  imp_vtas: number
}

export interface AdminFormData {
  email: string
  password: string
}

export async function fetchPlans(): Promise<SusTip[]> {
  const { data, error } = await supabase
    .from('tipos_suscripcion')
    .select('*')
    .eq('ina', false)
    .order('val_sus_emp', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createCompany(
  form: CompanyFormData,
): Promise<{ emp_ide: string }> {
  const { data, error } = await supabase
    .from('empresas')
    .insert({
      ide_emp: form.ide_emp,
      nom_com: form.nom_com,
      raz_soc: form.raz_soc,
      dir: form.dir || null,
      ciu: form.ciu || null,
      dep: form.dep || null,
      tel: form.tel || null,
      tel_2: form.tel_2 || null,
      tel_3: form.tel_3 || null,
      rep_leg: form.rep_leg || null,
      cc_rep_leg: form.cc_rep_leg || null,
      per_ini_ano: form.per_ini_ano || null,
      per_ini_mes: form.per_ini_mes || null,
      pla_ctas: form.pla_ctas || null,
      reg_tri: form.reg_tri || null,
      imp_vtas: form.imp_vtas || null,
    })
    .select('emp_ide')
    .single()

  if (error) throw error
  return data
}

export async function createSubscription(
  emp_ide: string,
  sus_emp: number,
  num_mes: number,
): Promise<void> {
  const fec_ini = new Date()
  const fec_fin = new Date()
  fec_fin.setMonth(fec_fin.getMonth() + num_mes)

  const { error } = await supabase.from('suscripciones').insert({
    emp_ide,
    sus_emp,
    fec_ini: fec_ini.toISOString().split('T')[0],
    fec_fin: fec_fin.toISOString().split('T')[0],
    num_mes,
  })

  if (error) throw error
}

export async function createAdminUser(
  email: string,
  password: string,
  emp_ide: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        emp_ide,
        role: 'admin',
      },
    },
  })

  if (error) throw error
}
