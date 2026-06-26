import { supabase } from '@/lib/supabase'
import type { SusTip } from '@/types/database'

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
  const { data, error } = await supabase.rpc('onboarding_create_empresa', {
    p_ide_emp: form.ide_emp,
    p_nom_com: form.nom_com,
    p_raz_soc: form.raz_soc,
    p_dir: form.dir || null,
    p_ciu: form.ciu || null,
    p_dep: form.dep || null,
    p_tel: form.tel || null,
    p_tel_2: form.tel_2 || null,
    p_tel_3: form.tel_3 || null,
    p_rep_leg: form.rep_leg || null,
    p_cc_rep_leg: form.cc_rep_leg || null,
    p_per_ini_ano: form.per_ini_ano || null,
    p_per_ini_mes: form.per_ini_mes || null,
    p_pla_ctas: form.pla_ctas || null,
    p_reg_tri: form.reg_tri || null,
    p_imp_vtas: form.imp_vtas || null,
  })

  if (error) throw error
  return data as { emp_ide: string }
}

export async function createSubscription(
  emp_ide: string,
  sus_emp: number,
  num_mes: number,
): Promise<void> {
  const { error } = await supabase.rpc('onboarding_create_subscription', {
    p_emp_ide: emp_ide,
    p_sus_emp: sus_emp,
    p_num_mes: num_mes,
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
