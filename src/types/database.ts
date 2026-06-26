export interface Emp {
  ide: number
  emp_ide: string
  ide_emp: string
  nom_com: string
  raz_soc: string
  dir: string | null
  ciu: string | null
  dep: string | null
  tel: string | null
  tel_2: string | null
  tel_3: string | null
  rep_leg: string | null
  cc_rep_leg: string | null
  per_ini_ano: number | null
  per_ini_mes: number | null
  pla_ctas: string | null
  reg_tri: string | null
  imp_vtas: number | null
  ina: boolean
  created_at: string
  updated_at: string
}

export interface SusTip {
  ide: number
  nom_sus_emp: string
  num_mes: number
  val_sus_emp: number
  ina: boolean
  created_at: string
}

export interface EmpSub {
  ide: number
  emp_ide: string
  sus_emp: number
  fec_ini: string
  fec_fin: string
  num_mes: number
  created_at: string
}

export interface User {
  id: string
  emp_ide: string | null
  usu: string
  mail: string
  role: 'admin' | 'superadmin'
  ina: boolean
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'superadmin'
