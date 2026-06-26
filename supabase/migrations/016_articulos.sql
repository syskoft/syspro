-- ============================================================
-- SYSPRO - Tabla de Artículos
-- ============================================================

CREATE TABLE IF NOT EXISTS articulos (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  presentacion VARCHAR(100),
  unidades_presentacion INT NOT NULL DEFAULT 1,
  precio DECIMAL(16,2) NOT NULL DEFAULT 0,
  precio_pos DECIMAL(16,2) NOT NULL DEFAULT 0,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  UNIQUE(emp_ide, codigo)
);

CREATE INDEX IF NOT EXISTS idx_articulos_emp_ide ON articulos(emp_ide);

ALTER TABLE articulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY articulos_select ON articulos FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_insert ON articulos FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_update ON articulos FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_delete ON articulos FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);

CREATE TRIGGER trg_articulos_updated_at
  BEFORE UPDATE ON articulos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
