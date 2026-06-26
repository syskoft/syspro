-- ============================================================
-- SYSPRO - Migración Inicial
-- Sistema ERP Multiinquilino
-- Empresa: SYSKOFT
-- ============================================================

-- 0. SECUENCIA PARA CONSECUTIVO DE EMPRESAS (SYSPRO_00001)
CREATE SEQUENCE IF NOT EXISTS syspro_emp_ide_seq START 1;

-- Función para generar consecutivo de empresa
CREATE OR REPLACE FUNCTION generar_consecutivo_emp()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_val INT;
BEGIN
  next_val := NEXTVAL('syspro_emp_ide_seq');
  RETURN 'SYSPRO_' || LPAD(next_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. TABLA empresas
-- ============================================================
CREATE TABLE IF NOT EXISTS empresas (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL DEFAULT generar_consecutivo_emp(),
  ide_emp VARCHAR(20) NOT NULL,
  nom_com VARCHAR(255) NOT NULL,
  raz_soc VARCHAR(255) NOT NULL,
  dir TEXT,
  ciu VARCHAR(100),
  dep VARCHAR(100),
  tel VARCHAR(20),
  tel_2 VARCHAR(20),
  tel_3 VARCHAR(20),
  rep_leg VARCHAR(255),
  cc_rep_leg VARCHAR(20),
  per_ini_ano INT,
  per_ini_mes INT,
  pla_ctas TEXT,
  reg_tri VARCHAR(100),
  imp_vtas DECIMAL(5,2),
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (emp_ide)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_ide_emp ON empresas(ide_emp);

-- ============================================================
-- 2. TABLA tipos_suscripcion (Planes)
-- ============================================================
CREATE TABLE IF NOT EXISTS tipos_suscripcion (
  ide SERIAL PRIMARY KEY,
  nom_sus_emp VARCHAR(255) NOT NULL,
  num_mes INT NOT NULL,
  val_sus_emp DECIMAL(12,2) NOT NULL,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA suscripciones
-- ============================================================
CREATE TABLE IF NOT EXISTS suscripciones (
  ide SERIAL PRIMARY KEY,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  sus_emp INT NOT NULL REFERENCES tipos_suscripcion(ide),
  fec_ini DATE NOT NULL,
  fec_fin DATE NOT NULL,
  num_mes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_emp_ide ON suscripciones(emp_ide);

-- ============================================================
-- 4. TABLA usuarios
-- Vinculada a auth.users de Supabase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  emp_ide VARCHAR(20) REFERENCES empresas(emp_ide),
  usu VARCHAR(100) NOT NULL,
  mail VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(emp_ide, usu)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_emp_ide ON usuarios(emp_ide);
CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);

-- ============================================================
-- 5. FUNCIONES AUXILIARES
-- ============================================================

-- Obtener el emp_ide del usuario actual
CREATE OR REPLACE FUNCTION get_current_emp_ide()
RETURNS VARCHAR(20) AS $$
DECLARE
  emp_id VARCHAR(20);
BEGIN
  SELECT emp_ide INTO emp_id FROM usuarios WHERE id = auth.uid();
  RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Verificar si el usuario actual es SUPERADMIN
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role FROM usuarios WHERE id = auth.uid();
  RETURN user_role = 'superadmin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. POLÍTICAS RLS
-- ============================================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY empresas_select ON empresas FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY empresas_insert ON empresas FOR INSERT WITH CHECK (
  is_superadmin() OR auth.role() IS NULL
);
CREATE POLICY empresas_update ON empresas FOR UPDATE USING (is_superadmin());
CREATE POLICY empresas_delete ON empresas FOR DELETE USING (is_superadmin());

CREATE POLICY tipos_suscripcion_select ON tipos_suscripcion FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY tipos_suscripcion_insert ON tipos_suscripcion FOR INSERT WITH CHECK (is_superadmin());
CREATE POLICY tipos_suscripcion_update ON tipos_suscripcion FOR UPDATE USING (is_superadmin());

CREATE POLICY suscripciones_select ON suscripciones FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY suscripciones_insert ON suscripciones FOR INSERT WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY suscripciones_update ON suscripciones FOR UPDATE USING (is_superadmin());
CREATE POLICY suscripciones_delete ON suscripciones FOR DELETE USING (is_superadmin());

CREATE POLICY usuarios_select ON usuarios FOR SELECT USING (
  is_superadmin() OR id = auth.uid() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY usuarios_insert ON usuarios FOR INSERT WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY usuarios_update ON usuarios FOR UPDATE USING (
  is_superadmin() OR id = auth.uid()
);
CREATE POLICY usuarios_delete ON usuarios FOR DELETE USING (is_superadmin());

-- ============================================================
-- 7. TRIGGER: crear perfil al registrarse
-- ============================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
