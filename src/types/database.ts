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
  ultimo_costo: number
  costo_promedio: number
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

export interface ListaPrecio {
  ide: number
  emp_ide: string
  nombre: string
  descripcion: string | null
  ina: boolean
  created_at: string
  updated_at: string
}

export interface ListaPrecioItem {
  ide: number
  emp_ide: string
  lista_ide: number
  articulo_ide: number
  tipo: 'fijo' | 'porcentual'
  valor: number
  ina: boolean
  created_at: string
  updated_at: string
  articulo?: Articulo
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

export interface Vendedor {
  ide: number; emp_ide: string; tercero_ide: number; codigo: string
  telefono: string | null; email: string | null; ina: boolean
  created_at: string; updated_at: string; tercero?: Tercero
}

export interface Servicio {
  ide: number; emp_ide: string; codigo: string; nombre: string
  precio: number; ina: boolean; created_at: string; updated_at: string
}

export interface ComprobanteTipo {
  ide: number; emp_ide: string; clase_codigo: string; codigo: string
  nombre: string; descripcion: string | null; ina: boolean
  created_at: string; updated_at: string
}

export interface Tercero {
  ide: number; emp_ide: string; identificacion: string; dv: string | null
  nombre: string; tipo: 'cliente' | 'proveedor' | 'ambos'
  direccion: string | null; ciudad: string | null; departamento: string | null
  telefono: string | null; email: string | null; regimen: string | null
  ina: boolean; created_at: string; updated_at: string
}

export interface FormaPago {
  ide: number; emp_ide: string; codigo: string; nombre: string
  tipo: string | null; cuenta_puc_codigo: string | null; aplica_en: string[]
  ina: boolean; created_at: string; updated_at: string
}

export interface FacturacionConfig {
  emp_ide: string; cuenta_clientes: string | null; cuenta_ventas: string | null
  cuenta_iva: string | null; cuenta_devoluciones: string | null; cuenta_descuentos: string | null
  sig_consecutivo_factura: number
}

export interface Factura {
  ide: number; emp_ide: string; tipo_comp: string; consecutivo: number; prefijo: string
  tercero_ide: number; vendedor_ide: number | null; fecha: string; fecha_vencimiento: string | null
  forma_pago_ide: number | null; concepto: string | null
  sub_total: number; total_impuestos: number; total: number; saldo: number
  estado: 'emitida' | 'pagada' | 'anulada'; comprobante_ide: number | null; ina: boolean
  created_at: string; updated_at: string
  tercero?: Tercero; forma_pago?: FormaPago; items?: FacturaItem[]
}

export interface FacturaItem {
  ide: number; factura_ide: number; emp_ide: string
  articulo_ide: number | null; servicio_ide: number | null
  cantidad: number; precio_unitario: number; sub_total: number
  iva_porcentaje: number; iva_valor: number; total: number
  created_at: string; articulo?: Articulo
}

export interface Comprobante {
  ide: number; emp_ide: string; consecutivo: number; fecha: string
  concepto: string | null; origen_factura: number | null
  estado: 'activo' | 'anulado'; created_at: string
}

export interface AsientoContable {
  ide: number; comprobante_ide: number; emp_ide: string
  cuenta_puc_codigo: string; detalle: string | null
  debito: number; credito: number; created_at: string
}

export interface TipoComprobante {
  codigo: string; nombre: string; descripcion: string | null
  naturaleza: 'ingreso' | 'egreso' | 'nota'
  requiere_vendedor: boolean; ina: boolean
}

export type UserRole = 'admin' | 'superadmin'
