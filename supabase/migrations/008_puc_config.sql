-- ============================================================
-- SYSPRO - Agregar columna config a puc_cuentas
-- Almacena checkboxes de configuración en JSONB
-- ============================================================

ALTER TABLE puc_cuentas ADD COLUMN IF NOT EXISTS config JSONB NOT NULL DEFAULT '{}'::jsonb;
