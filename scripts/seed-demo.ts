/**
 * Crea usuario demo. Variables requeridas:
 *   SUPABASE_PROJECT_REF
 *   SUPABASE_SERVICE_KEY
 */
import 'dotenv/config'

const projectRef = process.env.SUPABASE_PROJECT_REF
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!projectRef || !serviceKey) {
  console.error('Faltan SUPABASE_PROJECT_REF y SUPABASE_SERVICE_KEY en .env')
  process.exit(1)
}

async function seed() {
  const res = await fetch(
    `https://${projectRef}.supabase.co/auth/v1/admin/users`,
    {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'juansebastian@syskoft.com',
        password: '123456',
        email_confirm: true,
        user_metadata: { emp_ide: 'SYSPRO_00001', role: 'superadmin' },
      }),
    },
  )

  const data = await res.json()

  if (!res.ok) {
    if (res.status === 409) {
      console.log('⚠️ Usuario ya existe')
    } else {
      console.error('Error:', JSON.stringify(data))
      process.exit(1)
    }
  } else {
    console.log('✅ Usuario demo creado: juansebastian@syskoft.com / 123456')
  }

  const profileRes = await fetch(
    `https://${projectRef}.supabase.co/rest/v1/usuarios?select=id,emp_ide,role,usu&limit=5`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  )
  const profile = await profileRes.json()

  if (profile.length > 0) {
    console.log(`✅ Perfiles en usuarios: ${profile.length}`)
    profile.forEach((u: any) => console.log(`   ${u.usu} - ${u.role} - ${u.emp_ide ?? 'sin empresa'}`))
  } else {
    console.log('⚠️ No hay perfiles en usuarios (revisar trigger on_auth_user_created)')
  }
}

seed().catch(console.error)
