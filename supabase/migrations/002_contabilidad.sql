-- ============================================================
-- SYSPRO - Módulo de Contabilidad
-- ============================================================

-- SECUENCIA para consecutivos de comprobantes por empresa y tipo
CREATE TABLE IF NOT EXISTS comprobante_seq (
  emp_ide VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  ultimo INT NOT NULL DEFAULT 0,
  PRIMARY KEY (emp_ide, tipo)
);

-- Tabla: Plan de Cuentas (PUC)
CREATE TABLE IF NOT EXISTS puc_cuentas (
  codigo VARCHAR(20) NOT NULL,
  emp_ide VARCHAR(20) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  tipo_naturaleza CHAR(1) NOT NULL CHECK (tipo_naturaleza IN ('D', 'C')),
  nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 8),
  padre VARCHAR(20),
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (codigo, emp_ide),
  FOREIGN KEY (padre, emp_ide) REFERENCES puc_cuentas(codigo, emp_ide)
);

-- Tabla: Tipos de comprobante
CREATE TABLE IF NOT EXISTS tipo_comprobante (
  ide SERIAL PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  ina BOOLEAN NOT NULL DEFAULT FALSE
);

-- Tabla: Comprobantes (asientos contables - cabecera)
CREATE TABLE IF NOT EXISTS comprobantes (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL,
  tipo_comp INT NOT NULL REFERENCES tipo_comprobante(ide),
  consecutivo INT NOT NULL,
  fec DATE NOT NULL,
  concepto TEXT NOT NULL,
  total_debito DECIMAL(16,2) NOT NULL DEFAULT 0,
  total_credito DECIMAL(16,2) NOT NULL DEFAULT 0,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  UNIQUE(emp_ide, tipo_comp, consecutivo)
);

-- Tabla: Asientos contables (detalle del comprobante)
CREATE TABLE IF NOT EXISTS asientos_contables (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL,
  comprobante_ide INT NOT NULL,
  cuenta_codigo VARCHAR(20) NOT NULL,
  detalle TEXT,
  debito DECIMAL(16,2) NOT NULL DEFAULT 0,
  credito DECIMAL(16,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  FOREIGN KEY (comprobante_ide, emp_ide) REFERENCES comprobantes(ide, emp_ide) ON DELETE CASCADE,
  FOREIGN KEY (cuenta_codigo, emp_ide) REFERENCES puc_cuentas(codigo, emp_ide)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comprobantes_emp_ide ON comprobantes(emp_ide);
CREATE INDEX IF NOT EXISTS idx_comprobantes_fec ON comprobantes(emp_ide, fec);
CREATE INDEX IF NOT EXISTS idx_asientos_comprobante ON asientos_contables(emp_ide, comprobante_ide);
CREATE INDEX IF NOT EXISTS idx_asientos_cuenta ON asientos_contables(emp_ide, cuenta_codigo);
CREATE INDEX IF NOT EXISTS idx_puc_padre ON puc_cuentas(emp_ide, padre);

-- Trigger updated_at
CREATE TRIGGER trg_puc_updated_at
  BEFORE UPDATE ON puc_cuentas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_comprobantes_updated_at
  BEFORE UPDATE ON comprobantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE puc_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_comprobante ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobante_seq ENABLE ROW LEVEL SECURITY;

-- puc_cuentas
CREATE POLICY puc_select ON puc_cuentas FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY puc_insert ON puc_cuentas FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY puc_update ON puc_cuentas FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);

-- tipo_comprobante (visible a todos)
CREATE POLICY tcomp_select ON tipo_comprobante FOR SELECT USING (auth.role() IS NOT NULL);

-- comprobantes
CREATE POLICY comp_select ON comprobantes FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY comp_insert ON comprobantes FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY comp_update ON comprobantes FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);

-- asientos_contables
CREATE POLICY asientos_select ON asientos_contables FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY asientos_insert ON asientos_contables FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);

-- comprobante_seq
CREATE POLICY seq_select ON comprobante_seq FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY seq_insert ON comprobante_seq FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY seq_update ON comprobante_seq FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);

-- ============================================================
-- FUNCIONES RPC
-- ============================================================

-- Obtener siguiente consecutivo para un tipo de comprobante
CREATE OR REPLACE FUNCTION get_next_comp_consecutivo(
  p_emp_ide VARCHAR(20),
  p_tipo INT
) RETURNS INT AS $$
DECLARE
  v_tipo_cod VARCHAR(10);
  v_next INT;
BEGIN
  SELECT codigo INTO v_tipo_cod FROM tipo_comprobante WHERE ide = p_tipo;

  INSERT INTO comprobante_seq (emp_ide, tipo, ultimo)
  VALUES (p_emp_ide, v_tipo_cod, 1)
  ON CONFLICT (emp_ide, tipo) DO UPDATE SET ultimo = comprobante_seq.ultimo + 1
  RETURNING ultimo INTO v_next;

  RETURN v_next;
END;
$$ LANGUAGE plpgsql;

-- Crear comprobante con sus asientos
CREATE OR REPLACE FUNCTION crear_comprobante(
  p_cabecera JSONB,
  p_asientos JSONB
) RETURNS JSONB AS $$
DECLARE
  v_emp_ide VARCHAR(20) := p_cabecera->>'emp_ide';
  v_tipo_comp INT := (p_cabecera->>'tipo_comp')::INT;
  v_fec DATE := (p_cabecera->>'fec')::DATE;
  v_concepto TEXT := p_cabecera->>'concepto';
  v_consecutivo INT;
  v_total_debito DECIMAL(16,2) := 0;
  v_total_credito DECIMAL(16,2) := 0;
  v_comp_ide INT;
  v_asiento JSONB;
  v_result JSONB;
BEGIN
  -- Obtener consecutivo
  v_consecutivo := get_next_comp_consecutivo(v_emp_ide, v_tipo_comp);

  -- Calcular totales
  FOR v_asiento IN SELECT * FROM jsonb_array_elements(p_asientos)
  LOOP
    v_total_debito := v_total_debito + COALESCE((v_asiento->>'debito')::DECIMAL, 0);
    v_total_credito := v_total_credito + COALESCE((v_asiento->>'credito')::DECIMAL, 0);
  END LOOP;

  -- Insertar cabecera
  INSERT INTO comprobantes (emp_ide, tipo_comp, consecutivo, fec, concepto, total_debito, total_credito)
  VALUES (v_emp_ide, v_tipo_comp, v_consecutivo, v_fec, v_concepto, v_total_debito, v_total_credito)
  RETURNING ide INTO v_comp_ide;

  -- Insertar asientos
  FOR v_asiento IN SELECT * FROM jsonb_array_elements(p_asientos)
  LOOP
    INSERT INTO asientos_contables (emp_ide, comprobante_ide, cuenta_codigo, detalle, debito, credito)
    VALUES (
      v_emp_ide,
      v_comp_ide,
      v_asiento->>'cuenta_codigo',
      v_asiento->>'detalle',
      COALESCE((v_asiento->>'debito')::DECIMAL, 0),
      COALESCE((v_asiento->>'credito')::DECIMAL, 0)
    );
  END LOOP;

  -- Retornar resultado
  SELECT jsonb_build_object(
    'ide', v_comp_ide,
    'consecutivo', v_consecutivo,
    'emp_ide', v_emp_ide
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
