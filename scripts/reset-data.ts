/**
 * Reset de datos demo. Variables requeridas:
 *   SUPABASE_PROJECT_REF
 *   SUPABASE_SERVICE_KEY
 *   SUPABASE_MGMT_TOKEN
 */
import 'dotenv/config'

const projectRef = process.env.SUPABASE_PROJECT_REF
const serviceKey = process.env.SUPABASE_SERVICE_KEY
const mgmtToken = process.env.SUPABASE_MGMT_TOKEN

if (!projectRef || !serviceKey || !mgmtToken) {
  console.error('Faltan SUPABASE_PROJECT_REF, SUPABASE_SERVICE_KEY y SUPABASE_MGMT_TOKEN en .env')
  process.exit(1)
}

const BASE = `https://${projectRef}.supabase.co`
const MGMT = `https://api.supabase.com/v1/projects/${projectRef}`

async function sql(q: string) {
  const r = await fetch(`${MGMT}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mgmtToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q }),
  })
  return r.text()
}

async function main() {
  // 1. Delete all auth users
  const listRes = await fetch(`${BASE}/auth/v1/admin/users`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const { users } = await listRes.json()
  for (const u of users ?? []) {
    if (u.email !== 'juansebastian@syskoft.com') {
      await fetch(`${BASE}/auth/v1/admin/users/${u.id}`, {
        method: 'DELETE',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      })
      console.log(`🗑️ ${u.email} deleted`)
    } else {
      await fetch(`${BASE}/auth/v1/admin/users/${u.id}`, {
        method: 'PUT',
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '123456', email_confirm: true, user_metadata: { emp_ide: 'SYSPRO_00001', role: 'superadmin' } }),
      })
      console.log('✅ Existing user updated')
    }
  }

  // 2. Clean tables
  await sql('DELETE FROM suscripciones')
  await sql('DELETE FROM empresas')
  await sql('DELETE FROM puc_cuentas')
  await sql('DELETE FROM tipos_suscripcion WHERE ide IN (99,1,2,3,4,5,6)')

  // 3. Seed subscription plans
  await sql(`INSERT INTO tipos_suscripcion (nom_sus_emp, num_mes, val_sus_emp) VALUES
    ('Plan Básico', 1, 49000), ('Plan Profesional', 1, 99000), ('Plan Empresarial', 1, 199000),
    ('Plan Anual Básico', 12, 499000), ('Plan Anual Profesional', 12, 999000), ('Plan Anual Empresarial', 12, 1999000),
    ('Plan Demo', 12, 0)`)

  // 4. Create empresa
  await sql(`INSERT INTO empresas (emp_ide, ide_emp, nom_com, raz_soc, dir, ciu, dep, tel, rep_leg, cc_rep_leg, reg_tri, imp_vtas)
    VALUES ('SYSPRO_00001', '901234567-8', 'Empresa de Pruebas S.A.S.', 'Empresa de Pruebas S.A.S.',
      'Cra 7 # 71-21 Of 301', 'Bogotá', 'Cundinamarca', '601 9876543', 'Juan Sebastián', '1122334455', 'Regimen Común', 19.00)`)

  // 5. Create subscription
  await sql(`INSERT INTO suscripciones (emp_ide, sus_emp, fec_ini, fec_fin, num_mes)
    SELECT 'SYSPRO_00001', ide, CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months', 12
    FROM tipos_suscripcion WHERE nom_sus_emp = 'Plan Demo'`)

  // 6. Create/update profile
  const userList2 = await fetch(`${BASE}/auth/v1/admin/users`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  })
  const { users: users2 } = await userList2.json()
  const target = (users2 ?? []).find((u: any) => u.email === 'juansebastian@syskoft.com')
  if (target) {
    await sql(`INSERT INTO usuarios (id, emp_ide, usu, mail, role)
      VALUES ('${target.id}', 'SYSPRO_00001', 'juansebastian@syskoft.com', 'juansebastian@syskoft.com', 'superadmin')
      ON CONFLICT (id) DO UPDATE SET role = 'superadmin', emp_ide = 'SYSPRO_00001'`)
  }

  console.log('\n=== ✅ RESET COMPLETADO ===')
  console.log('Empresa: SYSPRO_00001 - Empresa de Pruebas S.A.S.')
  console.log('Usuario: juansebastian@syskoft.com / 123456 (superadmin)')
}

main().catch(console.error)
