-- ============================================================
-- SYSPRO - Permisos para Listas de Precios
-- ============================================================

INSERT INTO permiso_acciones (codigo, modulo, nombre, descripcion) VALUES
  ('listas_precios.ver', 'listas_precios', 'Ver listas', 'Consultar listas de precios'),
  ('listas_precios.crear', 'listas_precios', 'Crear listas', 'Crear nuevas listas de precios'),
  ('listas_precios.editar', 'listas_precios', 'Editar listas', 'Modificar listas de precios'),
  ('listas_precios.eliminar', 'listas_precios', 'Eliminar listas', 'Eliminar listas de precios')
ON CONFLICT (codigo) DO NOTHING;
