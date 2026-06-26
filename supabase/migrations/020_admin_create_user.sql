-- ============================================================
-- SYSPRO - RPC para crear usuarios sin afectar sesión actual
-- SECURITY DEFINER = se ejecuta con permisos de superadmin
-- ============================================================

CREATE OR REPLACE FUNCTION admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_emp_ide TEXT,
  p_role TEXT
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Verificar que el usuario actual es superadmin
  IF NOT is_superadmin() THEN
    RAISE EXCEPTION 'Solo superadmin puede crear usuarios';
  END IF;

  -- Verificar que el email no existe
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'El email ya está registrado';
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change_token_current
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(), NOW(),
    jsonb_build_object('emp_ide', p_emp_ide, 'role', p_role),
    NOW(), NOW(),
    '', '', '', ''
  );

  SELECT jsonb_build_object('id', v_user_id::text) INTO v_result;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
