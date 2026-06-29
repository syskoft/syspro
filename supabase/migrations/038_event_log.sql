-- ============================================================
-- SYSPRO - Log de Eventos del Sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS event_log (
  ide SERIAL,
  emp_ide VARCHAR(20) NOT NULL REFERENCES empresas(emp_ide) ON DELETE CASCADE,
  usuario_nombre VARCHAR(100),
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('CREAR', 'EDITAR', 'ELIMINAR')),
  tabla VARCHAR(50) NOT NULL,
  registro_id INT,
  detalle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ide, emp_ide)
);

CREATE INDEX IF NOT EXISTS idx_event_log_emp ON event_log(emp_ide);
CREATE INDEX IF NOT EXISTS idx_event_log_fecha ON event_log(emp_ide, created_at DESC);

ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY event_log_select ON event_log FOR SELECT USING (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
CREATE POLICY event_log_insert ON event_log FOR INSERT WITH CHECK (
  emp_ide = get_current_emp_ide()
);
