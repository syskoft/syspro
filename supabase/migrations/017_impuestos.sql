-- ============================================================
-- SYSPRO - Módulo de Impuestos (clases, tarifas, config contable)
-- ============================================================

-- Clases de impuestos (global)
CREATE TABLE IF NOT EXISTS clases_impuestos (
  codigo VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ina BOOLEAN NOT NULL DEFAULT FALSE
);

-- Configuración contable predefinida por clase (global)
CREATE TABLE IF NOT EXISTS config_contable_clase (
  ide SERIAL PRIMARY KEY,
  clase_codigo VARCHAR(10) NOT NULL REFERENCES clases_impuestos(codigo) ON DELETE CASCADE,
  concepto VARCHAR(255) NOT NULL,
  naturaleza CHAR(1) NOT NULL CHECK (naturaleza IN ('D', 'C')),
  orden INT NOT NULL DEFAULT 0
);

-- Tarifas de impuestos por empresa
CREATE TABLE IF NOT EXISTS tarifas_impuestos (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  clase_codigo VARCHAR(10) NOT NULL REFERENCES clases_impuestos(codigo),
  nombre VARCHAR(255) NOT NULL,
  porcentaje DECIMAL(5,2) NOT NULL,
  config JSONB NOT NULL DEFAULT '[]',
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide)
);

CREATE INDEX IF NOT EXISTS idx_tarifas_emp_ide ON tarifas_impuestos(emp_ide);

ALTER TABLE clases_impuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_contable_clase ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifas_impuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY clases_select ON clases_impuestos FOR SELECT USING (true);
CREATE POLICY config_clase_select ON config_contable_clase FOR SELECT USING (true);
CREATE POLICY tarifas_select ON tarifas_impuestos FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY tarifas_insert ON tarifas_impuestos FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY tarifas_update ON tarifas_impuestos FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY tarifas_delete ON tarifas_impuestos FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);

-- ============================================================
-- SEED: clases de impuestos
-- ============================================================
INSERT INTO clases_impuestos (codigo, nombre, descripcion) VALUES
  ('IVA', 'Impuesto al Valor Agregado', 'Impuesto a las ventas IVA'),
  ('ICA', 'Impuesto de Industria y Comercio', 'Impuesto ICA'),
  ('ICO', 'Impuesto al Consumo', 'Impuesto al consumo ICO'),
  ('IMP_SAL', 'Impuestos Saludables', 'Impuestos saludables IBUA e ICUI')
ON CONFLICT (codigo) DO NOTHING;

-- SEED: config contable por clase
INSERT INTO config_contable_clase (clase_codigo, concepto, naturaleza, orden) VALUES
  ('IVA', 'IVA Descontable (DB)', 'D', 1),
  ('IVA', 'IVA Generado (CR)', 'C', 2),
  ('ICA', 'ICA Pagado (DB)', 'D', 1),
  ('ICA', 'ICA Cobrado (CR)', 'C', 2),
  ('ICO', 'ICO Pagado (DB)', 'D', 1),
  ('ICO', 'ICO Cobrado (CR)', 'C', 2),
  ('IMP_SAL', 'IBUA Pagado (DB)', 'D', 1),
  ('IMP_SAL', 'IBUA Cobrado (CR)', 'C', 2),
  ('IMP_SAL', 'ICUI Pagado (DB)', 'D', 3),
  ('IMP_SAL', 'ICUI Cobrado (CR)', 'C', 4)
ON CONFLICT DO NOTHING;
