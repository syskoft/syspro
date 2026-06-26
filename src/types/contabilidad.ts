export interface PucConfig {
  req_tercero?: boolean
  req_centro_costo?: boolean
  req_documento?: boolean
  req_referencia?: boolean
  cta_impuestos?: boolean
  cta_impuestos_asignacion?: string | null
  aplicar_depreciaciones?: boolean
  depreciaciones_asignacion?: string | null
  establecer_presupuesto?: boolean
  presupuesto_asignacion?: string | null
  es_corriente?: boolean
  es_reciproca?: boolean
  no_acumular_tercero?: boolean
  no_validar_documento?: boolean
  validar_saldos_contrarios?: boolean
  no_reclasificar?: boolean
  inactiva?: boolean
}

export interface PucCuenta {
  codigo: string
  emp_ide: string
  nombre: string
  tipo_naturaleza: 'D' | 'C'
  nivel: number
  padre: string | null
  ina: boolean
  config: PucConfig
  created_at: string
  updated_at: string
  children?: PucCuenta[]
}

export interface PucConSaldo extends PucCuenta {
  saldo_debito: number
  saldo_credito: number
  saldo_neto: number
  children?: PucConSaldo[]
}
