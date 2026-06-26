-- ============================================================
-- SYSPRO - Seed Data
-- ============================================================

-- Planes de suscripción disponibles
INSERT INTO tipos_suscripcion (nom_sus_emp, num_mes, val_sus_emp) VALUES
  ('Plan Básico', 1, 49000.00),
  ('Plan Profesional', 1, 99000.00),
  ('Plan Empresarial', 1, 199000.00),
  ('Plan Anual Básico', 12, 499000.00),
  ('Plan Anual Profesional', 12, 999000.00),
  ('Plan Anual Empresarial', 12, 1999000.00)
ON CONFLICT (ide) DO NOTHING;
