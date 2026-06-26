-- ============================================================
-- SYSPRO - Normalizar nombres de tablas
-- Convención: snake_case, español, plural
-- ============================================================

-- 1. Renombrar tablas
ALTER TABLE IF EXISTS emp RENAME TO empresas;
ALTER TABLE IF EXISTS sus_tip RENAME TO tipos_suscripcion;
ALTER TABLE IF EXISTS emp_sub RENAME TO suscripciones;
ALTER TABLE IF EXISTS users RENAME TO usuarios;

-- 2. Renombrar índices
ALTER INDEX IF EXISTS idx_emp_ide_emp RENAME TO idx_empresas_ide_emp;
ALTER INDEX IF EXISTS idx_emp_sub_emp_ide RENAME TO idx_suscripciones_emp_ide;
ALTER INDEX IF EXISTS idx_users_emp_ide RENAME TO idx_usuarios_emp_ide;
ALTER INDEX IF EXISTS idx_users_role RENAME TO idx_usuarios_role;

-- 3. Actualizar funciones que referencian tablas
CREATE OR REPLACE FUNCTION get_current_emp_ide()
RETURNS VARCHAR(20) AS $$
DECLARE
  emp_id VARCHAR(20);
BEGIN
  SELECT emp_ide INTO emp_id FROM usuarios WHERE id = auth.uid();
  RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role FROM usuarios WHERE id = auth.uid();
  RETURN user_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, emp_ide, usu, mail, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'emp_ide',
    NEW.email,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear triggers (nombres de tabla actualizados)
DROP TRIGGER IF EXISTS trg_emp_updated_at ON empresas;
CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_users_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Recrear políticas RLS con nuevos nombres de tabla

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE puc_cuentas ENABLE ROW LEVEL SECURITY;

-- empresas
DROP POLICY IF EXISTS emp_select ON empresas;
DROP POLICY IF EXISTS emp_insert ON empresas;
DROP POLICY IF EXISTS emp_update ON empresas;
DROP POLICY IF EXISTS emp_delete ON empresas;

CREATE POLICY empresas_select ON empresas FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY empresas_insert ON empresas FOR INSERT WITH CHECK (
  is_superadmin() OR auth.role() IS NULL
);
CREATE POLICY empresas_update ON empresas FOR UPDATE USING (
  is_superadmin()
);
CREATE POLICY empresas_delete ON empresas FOR DELETE USING (
  is_superadmin()
);

-- tipos_suscripcion
DROP POLICY IF EXISTS sus_tip_select ON tipos_suscripcion;
DROP POLICY IF EXISTS sus_tip_insert ON tipos_suscripcion;
DROP POLICY IF EXISTS sus_tip_update ON tipos_suscripcion;

CREATE POLICY tipos_suscripcion_select ON tipos_suscripcion FOR SELECT USING (
  auth.role() IS NOT NULL
);
CREATE POLICY tipos_suscripcion_insert ON tipos_suscripcion FOR INSERT WITH CHECK (
  is_superadmin()
);
CREATE POLICY tipos_suscripcion_update ON tipos_suscripcion FOR UPDATE USING (
  is_superadmin()
);

-- suscripciones
DROP POLICY IF EXISTS emp_sub_select ON suscripciones;
DROP POLICY IF EXISTS emp_sub_insert ON suscripciones;
DROP POLICY IF EXISTS emp_sub_update ON suscripciones;
DROP POLICY IF EXISTS emp_sub_delete ON suscripciones;

CREATE POLICY suscripciones_select ON suscripciones FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY suscripciones_insert ON suscripciones FOR INSERT WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY suscripciones_update ON suscripciones FOR UPDATE USING (
  is_superadmin()
);
CREATE POLICY suscripciones_delete ON suscripciones FOR DELETE USING (
  is_superadmin()
);

-- usuarios
DROP POLICY IF EXISTS users_select ON usuarios;
DROP POLICY IF EXISTS users_insert ON usuarios;
DROP POLICY IF EXISTS users_update ON usuarios;
DROP POLICY IF EXISTS users_delete ON usuarios;

CREATE POLICY usuarios_select ON usuarios FOR SELECT USING (
  is_superadmin() OR id = auth.uid() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY usuarios_insert ON usuarios FOR INSERT WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY usuarios_update ON usuarios FOR UPDATE USING (
  is_superadmin() OR id = auth.uid()
);
CREATE POLICY usuarios_delete ON usuarios FOR DELETE USING (
  is_superadmin()
);
