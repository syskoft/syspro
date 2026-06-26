-- ============================================================
-- SYSPRO - Limpieza: eliminar tablas de comprobantes contables
-- Se conserva: puc_cuentas (Plan Único de Cuentas)
-- ============================================================

DROP TABLE IF EXISTS asientos_contables CASCADE;
DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS tipo_comprobante CASCADE;
DROP TABLE IF EXISTS comprobante_seq CASCADE;

DROP FUNCTION IF EXISTS get_next_comp_consecutivo CASCADE;
DROP FUNCTION IF EXISTS crear_comprobante CASCADE;
