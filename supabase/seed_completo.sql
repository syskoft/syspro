-- ============================================================
-- SYSPRO - Seed Completo (PUC, Empresa Demo, Usuario Demo)
-- ============================================================
-- EJECUTAR SOLO SI ES PRIMERA VEZ O RESET DE DATOS
-- ============================================================

-- 1. Crear empresa demo
INSERT INTO empresas (emp_ide, ide_emp, nom_com, raz_soc, dir, ciu, dep, tel, rep_leg, cc_rep_leg, reg_tri, imp_vtas)
VALUES (
  'SYSPRO_DEMO',
  '900123456-7',
  'Empresa Demo S.A.S.',
  'Empresa Demo S.A.S.',
  'Cra 7 # 71-21',
  'Bogotá',
  'Cundinamarca',
  '601 1234567',
  'Carlos Pérez',
  '1012345678',
  'Regimen Común',
  19.00
)
ON CONFLICT (emp_ide) DO NOTHING;

-- 2. PUC COLOMBIANO estándar para empresa demo
-- Clase 1: ACTIVO
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('1', 'SYSPRO_DEMO', 'ACTIVO', 'D', 1, NULL),
  ('11', 'SYSPRO_DEMO', 'DISPONIBLE', 'D', 2, '1'),
  ('1105', 'SYSPRO_DEMO', 'CAJA', 'D', 4, '11'),
  ('110505', 'SYSPRO_DEMO', 'Caja General', 'D', 6, '1105'),
  ('1110', 'SYSPRO_DEMO', 'BANCOS', 'D', 4, '11'),
  ('111005', 'SYSPRO_DEMO', 'Banco Colombiano Cta. Cte.', 'D', 6, '1110'),
  ('12', 'SYSPRO_DEMO', 'INVERSIONES', 'D', 2, '1'),
  ('1205', 'SYSPRO_DEMO', 'Acciones', 'D', 4, '12'),
  ('13', 'SYSPRO_DEMO', 'DEUDORES', 'D', 2, '1'),
  ('1305', 'SYSPRO_DEMO', 'CLIENTES', 'D', 4, '13'),
  ('130505', 'SYSPRO_DEMO', 'Clientes Nacionales', 'D', 6, '1305'),
  ('1310', 'SYSPRO_DEMO', 'CUENTAS CORRIENTES COMERCIALES', 'D', 4, '13'),
  ('131005', 'SYSPRO_DEMO', 'Casa Matriz', 'D', 6, '1310'),
  ('14', 'SYSPRO_DEMO', 'INVENTARIOS', 'D', 2, '1'),
  ('1405', 'SYSPRO_DEMO', 'Inventario de Mercancías', 'D', 4, '14'),
  ('15', 'SYSPRO_DEMO', 'PROPIEDADES PLANTA Y EQUIPO', 'D', 2, '1'),
  ('1505', 'SYSPRO_DEMO', 'Terrenos', 'D', 4, '15'),
  ('1510', 'SYSPRO_DEMO', 'Edificios', 'D', 4, '15'),
  ('1515', 'SYSPRO_DEMO', 'Maquinaria y Equipo', 'D', 4, '15'),
  ('1520', 'SYSPRO_DEMO', 'Equipo de Oficina', 'D', 4, '15'),
  ('1525', 'SYSPRO_DEMO', 'Equipo de Computación', 'D', 4, '15'),
  ('1595', 'SYSPRO_DEMO', 'Depreciación Acumulada', 'C', 4, '15'),
  ('16', 'SYSPRO_DEMO', 'INTANGIBLES', 'D', 2, '1'),
  ('1605', 'SYSPRO_DEMO', 'Software', 'D', 4, '16'),
  ('17', 'SYSPRO_DEMO', 'DIFERIDOS', 'D', 2, '1'),
  ('1705', 'SYSPRO_DEMO', 'Gastos Pagados por Anticipado', 'D', 4, '17')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 2: PASIVO
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('2', 'SYSPRO_DEMO', 'PASIVO', 'C', 1, NULL),
  ('21', 'SYSPRO_DEMO', 'OBLIGACIONES FINANCIERAS', 'C', 2, '2'),
  ('2105', 'SYSPRO_DEMO', 'Bancos Nacionales', 'C', 4, '21'),
  ('22', 'SYSPRO_DEMO', 'PROVEEDORES', 'C', 2, '2'),
  ('2205', 'SYSPRO_DEMO', 'Proveedores Nacionales', 'C', 4, '22'),
  ('23', 'SYSPRO_DEMO', 'CUENTAS POR PAGAR', 'C', 2, '2'),
  ('2305', 'SYSPRO_DEMO', 'Cuentas Corrientes Comerciales', 'C', 4, '23'),
  ('2310', 'SYSPRO_DEMO', 'A Costos y Gastos por Pagar', 'C', 4, '23'),
  ('2315', 'SYSPRO_DEMO', 'Acreedores Varios', 'C', 4, '23'),
  ('24', 'SYSPRO_DEMO', 'IMPUESTOS POR PAGAR', 'C', 2, '2'),
  ('2405', 'SYSPRO_DEMO', 'IVA por Pagar', 'C', 4, '24'),
  ('2410', 'SYSPRO_DEMO', 'Retención en la Fuente', 'C', 4, '24'),
  ('2415', 'SYSPRO_DEMO', 'ICA por Pagar', 'C', 4, '24'),
  ('25', 'SYSPRO_DEMO', 'OBLIGACIONES LABORALES', 'C', 2, '2'),
  ('2505', 'SYSPRO_DEMO', 'Salarios por Pagar', 'C', 4, '25'),
  ('2510', 'SYSPRO_DEMO', 'Prestaciones Sociales', 'C', 4, '25'),
  ('26', 'SYSPRO_DEMO', 'PASIVOS ESTIMADOS', 'C', 2, '2'),
  ('2605', 'SYSPRO_DEMO', 'Provisiones', 'C', 4, '26'),
  ('27', 'SYSPRO_DEMO', 'DIFERIDOS', 'C', 2, '2'),
  ('2705', 'SYSPRO_DEMO', 'Ingresos Recibidos por Anticipado', 'C', 4, '27')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 3: PATRIMONIO
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('3', 'SYSPRO_DEMO', 'PATRIMONIO', 'C', 1, NULL),
  ('31', 'SYSPRO_DEMO', 'CAPITAL SOCIAL', 'C', 2, '3'),
  ('3105', 'SYSPRO_DEMO', 'Aporte Social', 'C', 4, '31'),
  ('32', 'SYSPRO_DEMO', 'UTILIDADES', 'C', 2, '3'),
  ('3205', 'SYSPRO_DEMO', 'Utilidad del Ejercicio', 'C', 4, '32'),
  ('33', 'SYSPRO_DEMO', 'RESERVAS', 'C', 2, '3'),
  ('3305', 'SYSPRO_DEMO', 'Reservas Obligatorias', 'C', 4, '33'),
  ('34', 'SYSPRO_DEMO', 'DIVIDENDOS', 'C', 2, '3'),
  ('3405', 'SYSPRO_DEMO', 'Dividendos Decretados', 'C', 4, '34')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 4: INGRESOS
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('4', 'SYSPRO_DEMO', 'INGRESOS', 'C', 1, NULL),
  ('41', 'SYSPRO_DEMO', 'INGRESOS OPERACIONALES', 'C', 2, '4'),
  ('4105', 'SYSPRO_DEMO', 'Comercio al por Mayor y Menor', 'C', 4, '41'),
  ('410505', 'SYSPRO_DEMO', 'Venta de Mercancías', 'C', 6, '4105'),
  ('42', 'SYSPRO_DEMO', 'INGRESOS NO OPERACIONALES', 'C', 2, '4'),
  ('4205', 'SYSPRO_DEMO', 'Arrendamientos', 'C', 4, '42'),
  ('4210', 'SYSPRO_DEMO', 'Intereses', 'C', 4, '42'),
  ('4215', 'SYSPRO_DEMO', 'Otros Ingresos', 'C', 4, '42')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 5: GASTOS
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('5', 'SYSPRO_DEMO', 'GASTOS', 'D', 1, NULL),
  ('51', 'SYSPRO_DEMO', 'GASTOS DE ADMINISTRACIÓN', 'D', 2, '5'),
  ('5105', 'SYSPRO_DEMO', 'Sueldos', 'D', 4, '51'),
  ('5110', 'SYSPRO_DEMO', 'Prestaciones Sociales', 'D', 4, '51'),
  ('5115', 'SYSPRO_DEMO', 'Arrendamientos', 'D', 4, '51'),
  ('5120', 'SYSPRO_DEMO', 'Servicios Públicos', 'D', 4, '51'),
  ('5125', 'SYSPRO_DEMO', 'Honorarios', 'D', 4, '51'),
  ('5130', 'SYSPRO_DEMO', 'Impuestos', 'D', 4, '51'),
  ('5135', 'SYSPRO_DEMO', 'Depreciaciones', 'D', 4, '51'),
  ('5140', 'SYSPRO_DEMO', 'Amortizaciones', 'D', 4, '51'),
  ('5145', 'SYSPRO_DEMO', 'Gastos de Viaje', 'D', 4, '51'),
  ('5150', 'SYSPRO_DEMO', 'Varios', 'D', 4, '51'),
  ('52', 'SYSPRO_DEMO', 'GASTOS DE VENTAS', 'D', 2, '5'),
  ('5205', 'SYSPRO_DEMO', 'Sueldos Vendedores', 'D', 4, '52'),
  ('5210', 'SYSPRO_DEMO', 'Comisiones', 'D', 4, '52'),
  ('5215', 'SYSPRO_DEMO', 'Publicidad', 'D', 4, '52'),
  ('53', 'SYSPRO_DEMO', 'GASTOS NO OPERACIONALES', 'D', 2, '5'),
  ('5305', 'SYSPRO_DEMO', 'Intereses', 'D', 4, '53'),
  ('5310', 'SYSPRO_DEMO', 'Gastos Bancarios', 'D', 4, '53'),
  ('5315', 'SYSPRO_DEMO', 'Otros Gastos', 'D', 4, '53')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 6: COSTOS DE VENTAS
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('6', 'SYSPRO_DEMO', 'COSTOS DE VENTAS', 'D', 1, NULL),
  ('61', 'SYSPRO_DEMO', 'COSTO DE VENTAS', 'D', 2, '6'),
  ('6105', 'SYSPRO_DEMO', 'Costo de Mercancías Vendidas', 'D', 4, '61')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 7: COSTOS DE PRODUCCIÓN
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('7', 'SYSPRO_DEMO', 'COSTOS DE PRODUCCIÓN', 'D', 1, NULL),
  ('71', 'SYSPRO_DEMO', 'MATERIA PRIMA', 'D', 2, '7'),
  ('7105', 'SYSPRO_DEMO', 'Materia Prima Directa', 'D', 4, '71'),
  ('72', 'SYSPRO_DEMO', 'MANO DE OBRA', 'D', 2, '7'),
  ('7205', 'SYSPRO_DEMO', 'Mano de Obra Directa', 'D', 4, '72'),
  ('73', 'SYSPRO_DEMO', 'COSTOS INDIRECTOS', 'D', 2, '7'),
  ('7305', 'SYSPRO_DEMO', 'Costos Indirectos de Fabricación', 'D', 4, '73')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 8: CUENTAS DE ORDEN DEUDORAS
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('8', 'SYSPRO_DEMO', 'CUENTAS DE ORDEN DEUDORAS', 'D', 1, NULL),
  ('81', 'SYSPRO_DEMO', 'ACTIVOS FIJOS', 'D', 2, '8'),
  ('8105', 'SYSPRO_DEMO', 'Bienes Entregados', 'D', 4, '81'),
  ('82', 'SYSPRO_DEMO', 'OPERACIONES CON TERCEROS', 'D', 2, '8'),
  ('8205', 'SYSPRO_DEMO', 'Documentos Entregados', 'D', 4, '82'),
  ('83', 'SYSPRO_DEMO', 'OTRAS CUENTAS DE ORDEN DEUDORAS', 'D', 2, '8'),
  ('8305', 'SYSPRO_DEMO', 'Otras Cuentas de Orden', 'D', 4, '83')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- Clase 9: CUENTAS DE ORDEN ACREEDORAS
INSERT INTO puc_cuentas (codigo, emp_ide, nombre, tipo_naturaleza, nivel, padre) VALUES
  ('9', 'SYSPRO_DEMO', 'CUENTAS DE ORDEN ACREEDORAS', 'C', 1, NULL),
  ('91', 'SYSPRO_DEMO', 'ACTIVOS FIJOS', 'C', 2, '9'),
  ('9105', 'SYSPRO_DEMO', 'Bienes Recibidos', 'C', 4, '91'),
  ('92', 'SYSPRO_DEMO', 'OPERACIONES CON TERCEROS', 'C', 2, '9'),
  ('9205', 'SYSPRO_DEMO', 'Documentos Recibidos', 'C', 4, '92'),
  ('93', 'SYSPRO_DEMO', 'OTRAS CUENTAS DE ORDEN ACREEDORAS', 'C', 2, '9'),
  ('9305', 'SYSPRO_DEMO', 'Otras Cuentas de Orden', 'C', 4, '93')
ON CONFLICT (codigo, emp_ide) DO NOTHING;

-- 3. Suscripción demo
INSERT INTO tipos_suscripcion (ide, nom_sus_emp, num_mes, val_sus_emp)
VALUES (99, 'Plan Demo', 12, 0)
ON CONFLICT (ide) DO NOTHING;

INSERT INTO suscripciones (emp_ide, sus_emp, fec_ini, fec_fin, num_mes)
VALUES ('SYSPRO_DEMO', 99, CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months', 12)
ON CONFLICT (ide) DO NOTHING;


