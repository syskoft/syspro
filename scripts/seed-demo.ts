/**
 * Seed: datos demo para SYSPRO_00001
 * Uso: npx tsx scripts/seed-demo.ts
 * Requiere: SUPABASE_PROJECT_REF y SUPABASE_SERVICE_KEY en .env
 */
import 'dotenv/config'

const ref = process.env.SUPABASE_PROJECT_REF!
const key = process.env.SUPABASE_SERVICE_KEY!
const EMP = 'SYSPRO_00001'
const BASE = `https://${ref}.supabase.co/rest/v1`
const HEADERS = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }

async function post(table: string, data: any) {
  const r = await fetch(`${BASE}/${table}`, { method: 'POST', headers: HEADERS, body: JSON.stringify(data) })
  const j = await r.json()
  if (!r.ok && r.status !== 409) console.error(`  ❌ ${table}:`, (j as any)?.message ?? r.statusText)
  else console.log(`  ✅ ${table}: ${Array.isArray(data) ? data.length : 1} registro(s)`)
  return j
}

async function seed() {
  console.log('\n=== SEMILLA DEMO ===\n')

  // ── Formas de Pago ──────────────────────────
  console.log('Formas de pago...')
  await post('formas_pago', [
    { emp_ide: EMP, codigo: 'EFECT', nombre: 'Efectivo', tipo: 'caja', cuenta_puc_codigo: '110505', aplica_en: ['FV', 'FC', 'FP', 'PP'] },
    { emp_ide: EMP, codigo: 'TARJ', nombre: 'Tarjeta Débito/Crédito', tipo: 'tarjeta', cuenta_puc_codigo: '111005', aplica_en: ['FV', 'FP', 'PP'] },
    { emp_ide: EMP, codigo: 'TRAN', nombre: 'Transferencia Bancaria', tipo: 'banco', cuenta_puc_codigo: '111005', aplica_en: ['FV', 'FC'] },
    { emp_ide: EMP, codigo: 'CHEQ', nombre: 'Cheque', tipo: 'banco', cuenta_puc_codigo: '111005', aplica_en: ['FC'] },
    { emp_ide: EMP, codigo: 'CRED', nombre: 'Crédito 30 días', tipo: 'cuenta_cobrar_pagar', cuenta_puc_codigo: '130505', aplica_en: ['FV', 'FC'] },
  ])

  // ── Terceros ──────────────────────────────
  console.log('Terceros...')
  const tercerosRaw = [
    { emp_ide: EMP, identificacion: '900123456-7', nombre: 'Comercial XYZ S.A.S.', tipo: 'cliente', ciudad: 'Bogotá', telefono: '6011234567', email: 'contacto@comercialxyz.com' },
    { emp_ide: EMP, identificacion: '900789012-3', nombre: 'Distribuidora ABC Ltda.', tipo: 'cliente', ciudad: 'Medellín', telefono: '6047890123', email: 'ventas@distribuidoraabc.com' },
    { emp_ide: EMP, identificacion: '800456789-0', nombre: 'TechSolutions S.A.S.', tipo: 'cliente', ciudad: 'Cali', telefono: '6024567890', email: 'info@techsolutions.com' },
    { emp_ide: EMP, identificacion: '1145678910', nombre: 'Carlos Rodríguez', tipo: 'cliente', ciudad: 'Barranquilla', telefono: '3055678901', email: 'carlos.r@email.com' },
    { emp_ide: EMP, identificacion: '900987654-3', nombre: 'Inversiones del Sur S.A.S.', tipo: 'proveedor', ciudad: 'Bogotá', telefono: '6019876543', email: null },
    { emp_ide: EMP, identificacion: '800321654-7', nombre: 'Suministros Tecnológicos S.A.', tipo: 'proveedor', ciudad: 'Medellín', telefono: '6043216547', email: null },
    { emp_ide: EMP, identificacion: '1034567890', nombre: 'Juan Pérez', tipo: 'ambos', ciudad: 'Bogotá', telefono: '3104567890', email: 'juan.perez@email.com' },
    { emp_ide: EMP, identificacion: '1034567891', nombre: 'María Gómez', tipo: 'ambos', ciudad: 'Medellín', telefono: '3104567891', email: 'maria.gomez@email.com' },
    { emp_ide: EMP, identificacion: '1034567892', nombre: 'Pedro López', tipo: 'ambos', ciudad: 'Cali', telefono: '3104567892', email: 'pedro.lopez@email.com' },
    { emp_ide: EMP, identificacion: '2222222222', nombre: 'Mostrador', tipo: 'cliente', ciudad: null, telefono: null, email: null },
  ]
  // Enviar uno por uno para evitar error de keys
  for (const t of tercerosRaw) { await post('terceros', t) }

  // ── Artículos ──────────────────────────────
  console.log('Artículos...')
  await post('articulos', [
    { emp_ide: EMP, codigo: 'PROD001', nombre: 'Laptop HP ProBook 450', presentacion: 'Unidad', unidades_presentacion: 1, precio: 2500000, ultimo_costo: 1800000 },
    { emp_ide: EMP, codigo: 'PROD002', nombre: 'Monitor Dell 24"', presentacion: 'Unidad', unidades_presentacion: 1, precio: 850000, ultimo_costo: 600000 },
    { emp_ide: EMP, codigo: 'PROD003', nombre: 'Teclado Mecánico RGB', presentacion: 'Unidad', unidades_presentacion: 1, precio: 180000, ultimo_costo: 120000 },
    { emp_ide: EMP, codigo: 'PROD004', nombre: 'Mouse Inalámbrico', presentacion: 'Unidad', unidades_presentacion: 1, precio: 95000, ultimo_costo: 60000 },
    { emp_ide: EMP, codigo: 'PROD005', nombre: 'Audífonos Bluetooth', presentacion: 'Unidad', unidades_presentacion: 1, precio: 220000, ultimo_costo: 150000 },
    { emp_ide: EMP, codigo: 'PROD006', nombre: 'Cargador USB-C 65W', presentacion: 'Unidad', unidades_presentacion: 1, precio: 65000, ultimo_costo: 40000 },
    { emp_ide: EMP, codigo: 'PROD007', nombre: 'Hub USB 7 puertos', presentacion: 'Unidad', unidades_presentacion: 1, precio: 120000, ultimo_costo: 80000 },
    { emp_ide: EMP, codigo: 'PROD008', nombre: 'Webcam HD 1080p', presentacion: 'Unidad', unidades_presentacion: 1, precio: 150000, ultimo_costo: 100000 },
    { emp_ide: EMP, codigo: 'PROD009', nombre: 'Silla Ergonómica', presentacion: 'Unidad', unidades_presentacion: 1, precio: 1200000, ultimo_costo: 850000 },
    { emp_ide: EMP, codigo: 'PROD010', nombre: 'Escritorio Eléctrico', presentacion: 'Unidad', unidades_presentacion: 1, precio: 2100000, ultimo_costo: 1500000 },
    { emp_ide: EMP, codigo: 'PROD011', nombre: 'Café Premium 500g', presentacion: 'Paquete', unidades_presentacion: 1, precio: 35000, ultimo_costo: 22000 },
    { emp_ide: EMP, codigo: 'PROD012', nombre: 'Agua Cristal x12', presentacion: 'Caja', unidades_presentacion: 12, precio: 28000, ultimo_costo: 18000 },
    { emp_ide: EMP, codigo: 'PROD013', nombre: 'Papelería Resma', presentacion: 'Resma', unidades_presentacion: 1, precio: 15000, ultimo_costo: 9000 },
    { emp_ide: EMP, codigo: 'PROD014', nombre: 'Tóner HP 26A', presentacion: 'Unidad', unidades_presentacion: 1, precio: 320000, ultimo_costo: 250000 },
    { emp_ide: EMP, codigo: 'PROD015', nombre: 'SSD 1TB NVMe', presentacion: 'Unidad', unidades_presentacion: 1, precio: 450000, ultimo_costo: 320000 },
  ])

  // ── Servicios ──────────────────────────────
  console.log('Servicios...')
  await post('servicios', [
    { emp_ide: EMP, codigo: 'SER001', nombre: 'Soporte Técnico Mensual', precio: 250000 },
    { emp_ide: EMP, codigo: 'SER002', nombre: 'Consultoría TI Hora', precio: 120000 },
    { emp_ide: EMP, codigo: 'SER003', nombre: 'Desarrollo Web', precio: 1500000 },
    { emp_ide: EMP, codigo: 'SER004', nombre: 'Mantenimiento Preventivo', precio: 180000 },
    { emp_ide: EMP, codigo: 'SER005', nombre: 'Capacitación Equipo', precio: 800000 },
  ])

  // ── Vendedores ─────────────────────────────
  console.log('Vendedores...')
  // Obtener IDs de los terceros tipo 'ambos' recién creados
  const tercerosRes = await fetch(`${BASE}/terceros?select=ide,nombre,telefono,email&emp_ide=eq.${EMP}&tipo=eq.ambos`, { headers: HEADERS })
  const tvs = await tercerosRes.json() as any[]
  const vendedorMap: Record<string, any> = {}
  tvs.forEach((t: any) => {
    if (t.nombre.includes('Juan')) vendedorMap['V001'] = t
    else if (t.nombre.includes('María')) vendedorMap['V002'] = t
    else if (t.nombre.includes('Pedro')) vendedorMap['V003'] = t
  })
  const vendedoresData = [
    { emp_ide: EMP, codigo: 'V001', tercero_ide: vendedorMap['V001']?.ide, telefono: vendedorMap['V001']?.telefono, email: vendedorMap['V001']?.email },
    { emp_ide: EMP, codigo: 'V002', tercero_ide: vendedorMap['V002']?.ide, telefono: vendedorMap['V002']?.telefono, email: vendedorMap['V002']?.email },
    { emp_ide: EMP, codigo: 'V003', tercero_ide: vendedorMap['V003']?.ide, telefono: vendedorMap['V003']?.telefono, email: vendedorMap['V003']?.email },
  ].filter((v) => v.tercero_ide)
  if (vendedoresData.length > 0) await post('vendedores', vendedoresData)
  else console.log('  ⚠️ No se encontraron terceros tipo ambos para crear vendedores')

  // ── Tipos específicos ──────────────────────
  console.log('Tipos de comprobante...')
  await post('comprobante_tipos', [
    { emp_ide: EMP, clase_codigo: 'FC', codigo: 'FC01', nombre: 'Compra Nacional' },
    { emp_ide: EMP, clase_codigo: 'FC', codigo: 'FC02', nombre: 'Importación' },
    { emp_ide: EMP, clase_codigo: 'FV', codigo: 'FV01', nombre: 'Venta Nacional' },
    { emp_ide: EMP, clase_codigo: 'FV', codigo: 'FV02', nombre: 'Exportación' },
    { emp_ide: EMP, clase_codigo: 'FP', codigo: 'FP01', nombre: 'Venta POS General' },
    { emp_ide: EMP, clase_codigo: 'PP', codigo: 'PP01', nombre: 'Pedido POS General' },
    { emp_ide: EMP, clase_codigo: 'NC', codigo: 'NC01', nombre: 'Nota General' },
    { emp_ide: EMP, clase_codigo: 'PE', codigo: 'PE01', nombre: 'Pedido General' },
  ])

  // ── Config contable ────────────────────────
  console.log('Config contable...')
  await post('facturacion_config', {
    emp_ide: EMP, cuenta_clientes: '130505', cuenta_ventas: '413505', cuenta_iva: '240805',
    cuenta_devoluciones: '417505', cuenta_descuentos: '417510', sig_consecutivo_factura: 1,
  })

  // ── Definición de cuentas (transacciones) ──
  console.log('Definición de cuentas...')
  await post('def_cuentas_contables', [
    { emp_ide: EMP, tab: 'transacciones', seccion: 'general', concepto_id: 'ventas', concepto: 'Cuenta de Ventas', cuenta_puc: '413505', naturaleza: 'C' },
    { emp_ide: EMP, tab: 'transacciones', seccion: 'general', concepto_id: 'clientes', concepto: 'Cuenta de Clientes', cuenta_puc: '130505', naturaleza: 'D' },
    { emp_ide: EMP, tab: 'transacciones', seccion: 'general', concepto_id: 'iva', concepto: 'Cuenta de IVA', cuenta_puc: '240805', naturaleza: 'C' },
  ])

  console.log('\n✅ Seed completo!')
}

seed().catch(console.error)
