-- ============================================================
-- SYSPRO - Corregir RLS: usar TO anon en vez de auth.role()
-- auth.role() se comporta diferente según el contexto
-- TO anon garantiza que solo usuarios sin sesión accedan
-- ============================================================

-- empresas: INSERT para anónimos siempre permitido
DROP POLICY IF EXISTS empresas_insert ON empresas;
DROP POLICY IF EXISTS empresas_insert_auth ON empresas;
CREATE POLICY empresas_insert ON empresas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY empresas_insert_auth ON empresas FOR INSERT TO authenticated WITH CHECK (is_superadmin());

-- suscripciones: INSERT para anónimos durante onboarding
DROP POLICY IF EXISTS suscripciones_insert ON suscripciones;
CREATE POLICY suscripciones_insert ON suscripciones FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY suscripciones_insert_auth ON suscripciones FOR INSERT TO authenticated WITH CHECK (
  is_superadmin() OR emp_ide = get_current_emp_ide()
);
