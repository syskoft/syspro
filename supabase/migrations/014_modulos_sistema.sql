-- ============================================================
-- SYSPRO - Módulos del sistema y asignación por plan
-- ============================================================

-- Catálogo de módulos y submódulos
CREATE TABLE IF NOT EXISTS modulos_sistema (
  codigo VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) NOT NULL DEFAULT 'modulo' CHECK (tipo IN ('modulo', 'submodulo')),
  modulo_padre VARCHAR(30) REFERENCES modulos_sistema(codigo),
  ruta VARCHAR(100),
  orden INT NOT NULL DEFAULT 0,
  ina BOOLEAN NOT NULL DEFAULT FALSE
);

-- Módulos asignados a cada plan
CREATE TABLE IF NOT EXISTS plan_modulos (
  ide SERIAL PRIMARY KEY,
  plan_id INT NOT NULL REFERENCES tipos_suscripcion(ide) ON DELETE CASCADE,
  modulo_codigo VARCHAR(30) NOT NULL REFERENCES modulos_sistema(codigo) ON DELETE CASCADE,
  UNIQUE(plan_id, modulo_codigo)
);

ALTER TABLE modulos_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY modulos_select ON modulos_sistema FOR SELECT USING (true);
CREATE POLICY plan_modulos_select ON plan_modulos FOR SELECT USING (true);
CREATE POLICY plan_modulos_insert ON plan_modulos FOR INSERT WITH CHECK (is_superadmin());
CREATE POLICY plan_modulos_delete ON plan_modulos FOR DELETE USING (is_superadmin());

-- Seed: módulos del sistema
INSERT INTO modulos_sistema (codigo, nombre, descripcion, tipo, ruta, orden) VALUES
  ('dashboard', 'Dashboard', 'Resumen general del sistema', 'modulo', '/dashboard', 1),
  ('facturacion', 'Facturación', 'Documentos electrónicos y facturación', 'modulo', '/dashboard/facturacion', 2),
  ('contabilidad', 'Contabilidad', 'Plan de cuentas y configuración contable', 'modulo', '/dashboard/contabilidad', 3),
  ('inventarios', 'Inventarios', 'Productos y bodegas', 'modulo', '/dashboard/inventarios', 4),
  ('pos', 'POS', 'Ventas y punto de venta', 'modulo', '/dashboard/pos', 5),
  ('restaurante', 'Restaurante', 'Mesas y comandas', 'modulo', '/dashboard/restaurante', 6),
  ('crm', 'CRM', 'Clientes y contactos', 'modulo', '/dashboard/crm', 7),
  ('informes', 'Informes', 'Reportes y gráficos', 'modulo', '/dashboard/informes', 8),
  ('perfil', 'Mi Empresa', 'Datos de la compañía', 'modulo', '/dashboard/perfil', 9),
  ('usuarios', 'Usuarios', 'Gestión de usuarios', 'modulo', '/dashboard/usuarios', 10)
ON CONFLICT (codigo) DO NOTHING;

-- Seed: submódulos
INSERT INTO modulos_sistema (codigo, nombre, descripcion, tipo, modulo_padre, ruta, orden) VALUES
  ('puc', 'Plan de Cuentas', 'Catálogo PUC con saldos acumulados', 'submodulo', 'contabilidad', '/dashboard/contabilidad/puc', 1),
  ('definicion-cuentas', 'Definición de Cuentas', 'Configuración de cuentas contables por impuesto', 'submodulo', 'contabilidad', '/dashboard/contabilidad/definicion-cuentas', 2)
ON CONFLICT (codigo) DO NOTHING;

-- Seed: asignar módulos según el plan
-- Plan Demo: acceso completo a todos los módulos
-- Planes regulares: módulos base
DO $$
DECLARE
  v_plan RECORD;
  v_demo_id INT;
BEGIN
  SELECT ide INTO v_demo_id FROM tipos_suscripcion WHERE nom_sus_emp = 'Plan Demo';

  FOR v_plan IN SELECT ide, nom_sus_emp FROM tipos_suscripcion WHERE ina = false LOOP
    IF v_plan.ide = v_demo_id THEN
      -- Plan Demo: todos los módulos
      INSERT INTO plan_modulos (plan_id, modulo_codigo)
      SELECT v_plan.ide, codigo FROM modulos_sistema
      ON CONFLICT (plan_id, modulo_codigo) DO NOTHING;
    ELSE
      -- Planes regulares: módulos base
      INSERT INTO plan_modulos (plan_id, modulo_codigo) VALUES
        (v_plan.ide, 'dashboard'),
        (v_plan.ide, 'contabilidad'),
        (v_plan.ide, 'perfil'),
        (v_plan.ide, 'usuarios'),
        (v_plan.ide, 'puc'),
        (v_plan.ide, 'definicion-cuentas')
      ON CONFLICT (plan_id, modulo_codigo) DO NOTHING;
    END IF;
  END LOOP;
END $$;
