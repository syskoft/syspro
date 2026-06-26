/**
 * Ejecuta SQL directo en Supabase via Management API
 * Uso: npx tsx scripts/run-sql.ts '<sql>'
 *      npx tsx scripts/run-sql.ts --file <archivo.sql>
 * Variables de entorno requeridas:
 *   SUPABASE_MGMT_TOKEN  (sbp_...)
 *   SUPABASE_PROJECT_REF
 */
import 'dotenv/config'
import { readFileSync } from 'fs'

const token = process.env.SUPABASE_MGMT_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!token || !projectRef) {
  console.error('Faltan SUPABASE_MGMT_TOKEN y SUPABASE_PROJECT_REF en .env')
  process.exit(1)
}

const fileIdx = process.argv.indexOf('--file')
let sql: string

if (fileIdx !== -1 && process.argv[fileIdx + 1]) {
  sql = readFileSync(process.argv[fileIdx + 1], 'utf-8')
} else if (process.argv[2]) {
  sql = process.argv[2]
} else {
  console.error('Uso: npx tsx scripts/run-sql.ts "<sql>" | --file <archivo.sql>')
  process.exit(1)
}

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  },
)

const text = await response.text()

if (response.ok) {
  if (text.trim()) console.log(text)
  else console.log('✅ OK')
} else {
  console.error(`❌ ${text}`)
  process.exit(1)
}
