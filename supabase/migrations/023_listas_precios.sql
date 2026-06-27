-- ============================================================
-- SYSPRO - Catálogo de Listas de Precios
-- ============================================================

CREATE TABLE IF NOT EXISTS listas_precios (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  UNIQUE(emp_ide, nombre)
);

CREATE TABLE IF NOT EXISTS lista_precios_items (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL,
  lista_ide INT NOT NULL,
  articulo_ide INT NOT NULL,
  tipo VARCHAR(10) NOT NULL DEFAULT 'fijo' CHECK (tipo IN ('fijo', 'porcentual')),
  valor DECIMAL(16,2) NOT NULL DEFAULT 0,
  ina BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide),
  UNIQUE(emp_ide, lista_ide, articulo_ide),
  FOREIGN KEY (lista_ide, emp_ide) REFERENCES listas_precios(ide, emp_ide) ON DELETE CASCADE,
  FOREIGN KEY (articulo_ide, emp_ide) REFERENCES articulos(ide, emp_ide) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listas_precios_emp ON listas_precios(emp_ide);
CREATE INDEX IF NOT EXISTS idx_lista_items_lista ON lista_precios_items(emp_ide, lista_ide);

ALTER TABLE listas_precios ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_precios_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY listas_precios_select ON listas_precios FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY listas_precios_insert ON listas_precios FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY listas_precios_update ON listas_precios FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY listas_precios_delete ON listas_precios FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);

CREATE POLICY lista_items_select ON lista_precios_items FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY lista_items_insert ON lista_precios_items FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY lista_items_update ON lista_precios_items FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY lista_items_delete ON lista_precios_items FOR DELETE USING (
  emp_ide = get_current_emp_ide()
);

CREATE TRIGGER trg_listas_precios_updated_at
  BEFORE UPDATE ON listas_precios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lista_items_updated_at
  BEFORE UPDATE ON lista_precios_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
