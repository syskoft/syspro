-- ============================================================
-- SYSPRO - RPC functions para onboarding (bypass RLS)
-- SECURITY DEFINER = se ejecuta con permisos del creador
-- ============================================================

CREATE OR REPLACE FUNCTION onboarding_create_empresa(
  p_ide_emp VARCHAR,
  p_nom_com VARCHAR,
  p_raz_soc VARCHAR,
  p_dir TEXT DEFAULT NULL,
  p_ciu VARCHAR DEFAULT NULL,
  p_dep VARCHAR DEFAULT NULL,
  p_tel VARCHAR DEFAULT NULL,
  p_tel_2 VARCHAR DEFAULT NULL,
  p_tel_3 VARCHAR DEFAULT NULL,
  p_rep_leg VARCHAR DEFAULT NULL,
  p_cc_rep_leg VARCHAR DEFAULT NULL,
  p_per_ini_ano INT DEFAULT NULL,
  p_per_ini_mes INT DEFAULT NULL,
  p_pla_ctas TEXT DEFAULT NULL,
  p_reg_tri VARCHAR DEFAULT NULL,
  p_imp_vtas DECIMAL DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_emp_ide VARCHAR(20);
  v_result JSONB;
BEGIN
  INSERT INTO empresas (
    ide_emp, nom_com, raz_soc, dir, ciu, dep, tel, tel_2, tel_3,
    rep_leg, cc_rep_leg, per_ini_ano, per_ini_mes, pla_ctas, reg_tri, imp_vtas
  ) VALUES (
    p_ide_emp, p_nom_com, p_raz_soc, p_dir, p_ciu, p_dep, p_tel, p_tel_2, p_tel_3,
    p_rep_leg, p_cc_rep_leg, p_per_ini_ano, p_per_ini_mes, p_pla_ctas, p_reg_tri, p_imp_vtas
  )
  RETURNING emp_ide INTO v_emp_ide;

  SELECT jsonb_build_object('emp_ide', v_emp_ide) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION onboarding_create_subscription(
  p_emp_ide VARCHAR,
  p_sus_emp INT,
  p_num_mes INT
) RETURNS VOID AS $$
DECLARE
  v_fec_ini DATE := CURRENT_DATE;
  v_fec_fin DATE;
BEGIN
  v_fec_fin := v_fec_ini + (p_num_mes || ' months')::INTERVAL;

  INSERT INTO suscripciones (emp_ide, sus_emp, fec_ini, fec_fin, num_mes)
  VALUES (p_emp_ide, p_sus_emp, v_fec_ini, v_fec_fin, p_num_mes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
