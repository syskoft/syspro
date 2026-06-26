-- ============================================================
-- SYSPRO - Fix RLS para onboarding (permite INSERT sin auth)
-- ============================================================

-- Permitir INSERT sin autenticación en suscripciones
DROP POLICY IF EXISTS suscripciones_insert ON suscripciones;
CREATE POLICY suscripciones_insert ON suscripciones FOR INSERT WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide() OR auth.role() IS NULL
);

-- Permitir SELECT sin autenticación en tipos_suscripcion
DROP POLICY IF EXISTS tipos_suscripcion_select ON tipos_suscripcion;
CREATE POLICY tipos_suscripcion_select ON tipos_suscripcion FOR SELECT USING (true);
