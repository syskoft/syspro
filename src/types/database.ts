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
  logo_url: string | null
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

export interface Articulo {
  ide: number
  emp_ide: string
  codigo: string
  nombre: string
  presentacion: string | null
  unidades_presentacion: number
  precio: number
  precio_pos: number
  ina: boolean
  created_at: string
  updated_at: string
}

export interface ClaseImpuesto {
  codigo: string
  nombre: string
  descripcion: string | null
  ina: boolean
}

export interface ConfigContableClase {
  ide: number
  clase_codigo: string
  concepto: string
  naturaleza: 'D' | 'C'
  orden: number
}

export interface TarifaImpuesto {
  ide: number
  emp_ide: string
  clase_codigo: string
  nombre: string
  porcentaje: number
  config: TarifaConfigItem[]
  ina: boolean
  created_at: string
  updated_at: string
}

export interface TarifaConfigItem {
  concepto: string
  naturaleza: 'D' | 'C'
  cuenta_puc: string | null
}

export interface Articulo {
  ide: number
  emp_ide: string
  codigo: string
  nombre: string
  presentacion: string | null
  unidades_presentacion: number
  precio: number
  precio_pos: number
  ina: boolean
  created_at: string
  updated_at: string
  impuestos?: ArticuloImpuesto[]
}

export interface PermisoAccion {
  codigo: string
  modulo: string
  nombre: string
  descripcion: string | null
}

export interface UsuarioPermiso {
  usuario_id: string
  accion_codigo: string
}

export interface ArticuloImpuesto {
  ide: number
  articulo_ide: number
  emp_ide: string
  tarifa_id: number
  tarifa?: TarifaImpuesto
}

export interface ArticuloPrecio {
  ide: number
  emp_ide: string
  articulo_ide: number
  nombre: string
  precio: number
  incluye_impuesto: boolean
  ina: boolean
  created_at: string
  updated_at: string
  articulo?: Articulo
}

export type UserRole = 'admin' | 'superadmin'
