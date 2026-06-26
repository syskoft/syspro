-- ============================================================
-- SYSPRO - Definición de Cuentas Contables
-- ============================================================

CREATE TABLE IF NOT EXISTS def_cuentas_contables (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  tab VARCHAR(20) NOT NULL,
  seccion VARCHAR(15) NOT NULL,
  concepto_id VARCHAR(60) NOT NULL,
  concepto TEXT NOT NULL,
  cuenta_puc VARCHAR(20),
  naturaleza CHAR(1) NOT NULL CHECK (naturaleza IN ('D', 'C')),
  PRIMARY KEY (ide, emp_ide)
);

ALTER TABLE def_cuentas_contables ENABLE ROW LEVEL SECURITY;

CREATE POLICY defcuentas_select ON def_cuentas_contables FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY defcuentas_insert ON def_cuentas_contables FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
CREATE POLICY defcuentas_update ON def_cuentas_contables FOR UPDATE USING (
  emp_ide = get_current_emp_ide()
);
