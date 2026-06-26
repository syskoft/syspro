-- ============================================================
-- SYSPRO - Sistema de permisos por acción
-- ============================================================

CREATE TABLE IF NOT EXISTS permiso_acciones (
  codigo VARCHAR(50) PRIMARY KEY,
  modulo VARCHAR(30) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS usuario_permisos (
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  accion_codigo VARCHAR(50) NOT NULL REFERENCES permiso_acciones(codigo),
  PRIMARY KEY (usuario_id, accion_codigo)
);

ALTER TABLE permiso_acciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_permisos ENABLE ROW LEVEL SECURITY;

CREATE POLICY permiso_acciones_select ON permiso_acciones FOR SELECT USING (true);
CREATE POLICY usuario_permisos_select ON usuario_permisos FOR SELECT USING (true);
CREATE POLICY usuario_permisos_insert ON usuario_permisos FOR INSERT WITH CHECK (is_superadmin());
CREATE POLICY usuario_permisos_delete ON usuario_permisos FOR DELETE USING (is_superadmin());

-- SEED: acciones
INSERT INTO permiso_acciones (codigo, modulo, nombre, descripcion) VALUES
  ('articulos.ver', 'articulos', 'Ver artículos', 'Consultar el listado de artículos'),
  ('articulos.crear', 'articulos', 'Crear artículos', 'Crear nuevos artículos'),
  ('articulos.editar', 'articulos', 'Editar artículos', 'Modificar artículos existentes'),
  ('articulos.eliminar', 'articulos', 'Eliminar artículos', 'Eliminar artículos del sistema'),
  ('impuestos.ver', 'impuestos', 'Ver impuestos', 'Consultar tarifas de impuestos'),
  ('impuestos.crear', 'impuestos', 'Crear impuestos', 'Crear nuevas tarifas'),
  ('impuestos.editar', 'impuestos', 'Editar impuestos', 'Modificar tarifas existentes'),
  ('impuestos.eliminar', 'impuestos', 'Eliminar impuestos', 'Eliminar tarifas'),
  ('impuestos.config_contable', 'impuestos', 'Config. contable impuestos', 'Editar configuración contable de impuestos'),
  ('puc.ver', 'contabilidad', 'Ver PUC', 'Consultar el plan de cuentas'),
  ('puc.crear', 'contabilidad', 'Crear cuentas PUC', 'Crear nuevas cuentas en el PUC'),
  ('puc.editar', 'contabilidad', 'Editar cuentas PUC', 'Modificar cuentas del PUC'),
  ('puc.eliminar', 'contabilidad', 'Eliminar cuentas PUC', 'Eliminar cuentas del PUC'),
  ('definicion.ver', 'contabilidad', 'Ver definición cuentas', 'Consultar definición de cuentas'),
  ('definicion.editar', 'contabilidad', 'Editar definición cuentas', 'Modificar definición de cuentas'),
  ('perfil.editar', 'perfil', 'Editar perfil empresa', 'Modificar datos de la empresa'),
  ('perfil.logo', 'perfil', 'Cambiar logo empresa', 'Subir o eliminar el logo de la empresa'),
  ('admin.empresas', 'admin', 'Admin empresas', 'Gestionar empresas'),
  ('admin.planes', 'admin', 'Admin planes', 'Gestionar planes de suscripción'),
  ('admin.suscripciones', 'admin', 'Admin suscripciones', 'Gestionar suscripciones'),
  ('admin.modulos', 'admin', 'Admin módulos x plan', 'Configurar módulos por plan'),
  ('admin.usuarios', 'admin', 'Admin usuarios', 'Gestionar usuarios del sistema'),
  ('admin.permisos', 'admin', 'Admin permisos', 'Gestionar permisos de usuarios')
ON CONFLICT (codigo) DO NOTHING;

-- Trigger: asignar todos los permisos al crear un usuario
CREATE OR REPLACE FUNCTION grant_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usuario_permisos (usuario_id, accion_codigo)
  SELECT NEW.id, codigo FROM permiso_acciones
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_grant_permissions ON usuarios;
CREATE TRIGGER trg_grant_permissions
  AFTER INSERT ON usuarios
  FOR EACH ROW EXECUTE FUNCTION grant_default_permissions();
