-- ============================================================
-- SYSPRO - Módulo Catálogos (Artículos, Servicios)
-- ============================================================

-- Agregar módulo Catálogos
INSERT INTO modulos_sistema (codigo, nombre, descripcion, tipo, ruta, orden)
VALUES ('catalogos', 'Catálogos', 'Gestión de artículos y servicios', 'modulo', '/dashboard/catalogos', 3)
ON CONFLICT (codigo) DO NOTHING;

-- Agregar submódulos
INSERT INTO modulos_sistema (codigo, nombre, descripcion, tipo, modulo_padre, ruta, orden)
VALUES
  ('articulos', 'Artículos', 'Gestión de productos y artículos', 'submodulo', 'catalogos', '/dashboard/catalogos/articulos', 1),
  ('servicios', 'Servicios', 'Gestión de servicios', 'submodulo', 'catalogos', '/dashboard/catalogos/servicios', 2)
ON CONFLICT (codigo) DO NOTHING;

-- Asignar a Plan Demo
DO $$
DECLARE
  v_demo_id INT;
BEGIN
  SELECT ide INTO v_demo_id FROM tipos_suscripcion WHERE nom_sus_emp = 'Plan Demo';
  IF v_demo_id IS NOT NULL THEN
    INSERT INTO plan_modulos (plan_id, modulo_codigo) VALUES
      (v_demo_id, 'catalogos'),
      (v_demo_id, 'articulos'),
      (v_demo_id, 'servicios')
    ON CONFLICT (plan_id, modulo_codigo) DO NOTHING;
  END IF;
END $$;
