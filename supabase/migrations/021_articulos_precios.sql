-- ============================================================
-- SYSPRO - Tabla de Precios por Artículo
-- ============================================================

CREATE TABLE IF NOT EXISTS articulos_precios (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  articulo_ide INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(16,2) NOT NULL DEFAULT 0,
  incluye_impuesto BOOLEAN NOT NULL DEFAULT FALSE,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  UNIQUE(emp_ide, articulo_ide, nombre),
  FOREIGN KEY (articulo_ide, emp_ide) REFERENCES articulos(ide, emp_ide) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_articulos_precios_emp_ide ON articulos_precios(emp_ide);
CREATE INDEX IF NOT EXISTS idx_articulos_precios_articulo ON articulos_precios(articulo_ide);

ALTER TABLE articulos_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY articulos_precios_select ON articulos_precios FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_precios_insert ON articulos_precios FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_precios_update ON articulos_precios FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY articulos_precios_delete ON articulos_precios FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);

CREATE TRIGGER trg_articulos_precios_updated_at
  BEFORE UPDATE ON articulos_precios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
