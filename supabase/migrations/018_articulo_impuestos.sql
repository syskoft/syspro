-- ============================================================
-- SYSPRO - Impuestos por Artículo (máx 5 por artículo)
-- ============================================================

CREATE TABLE IF NOT EXISTS articulo_impuestos (
  ide SERIAL PRIMARY KEY,
  articulo_ide INT NOT NULL,
  emp_ide VARCHAR(20) NOT NULL,
  tarifa_id INT NOT NULL,
  FOREIGN KEY (articulo_ide, emp_ide) REFERENCES articulos(ide, emp_ide) ON DELETE CASCADE,
  FOREIGN KEY (tarifa_id, emp_ide) REFERENCES tarifas_impuestos(ide, emp_ide),
  UNIQUE(articulo_ide, tarifa_id)
);

CREATE INDEX IF NOT EXISTS idx_art_imp_articulo ON articulo_impuestos(emp_ide, articulo_ide);

ALTER TABLE articulo_impuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY artimp_select ON articulo_impuestos FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY artimp_insert ON articulo_impuestos FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY artimp_delete ON articulo_impuestos FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);
