-- ============================================================
-- SYSPRO - Permisos para el módulo de Precios
-- ============================================================

INSERT INTO permiso_acciones (codigo, modulo, nombre, descripcion) VALUES
  ('precios.ver', 'precios', 'Ver precios', 'Consultar precios por artículo'),
  ('precios.crear', 'precios', 'Crear precios', 'Crear nuevos precios'),
  ('precios.editar', 'precios', 'Editar precios', 'Modificar precios existentes'),
  ('precios.eliminar', 'precios', 'Eliminar precios', 'Eliminar precios del sistema')
ON CONFLICT (codigo) DO NOTHING;
