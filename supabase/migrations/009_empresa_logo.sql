-- ============================================================
-- SYSPRO - Agregar logo_url a empresas
-- ============================================================

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;
