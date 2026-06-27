-- ============================================================
-- SYSPRO - Agregar costos a artículos y eliminar precios viejos
-- ============================================================

ALTER TABLE articulos ADD COLUMN IF NOT EXISTS ultimo_costo DECIMAL(16,2) NOT NULL DEFAULT 0;
ALTER TABLE articulos ADD COLUMN IF NOT EXISTS costo_promedio DECIMAL(16,2) NOT NULL DEFAULT 0;

DROP TABLE IF EXISTS articulos_precios;
