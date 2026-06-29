import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRANCH = 'deploy'
const REPO = join(__dirname, '..')
const TEMP = join(tmpdir(), `syspro-deploy-${randomUUID().slice(0, 8)}`)
const BUILD_FILES = ['assets', 'index.html', '.htaccess']

function run(cmd) {
  execSync(cmd, { cwd: REPO, stdio: 'inherit', shell: true })
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: REPO, encoding: 'utf-8', shell: true }).toString().trim()
}

function cleanTemp() {
  if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true })
}

// 1. Build (NO npm install — preserves local node_modules)
console.log('\n=== BUILDING ===')
run('npm run build')

// 2. Copy build to temp
console.log('\n=== COPYING BUILD ===')
cleanTemp()
mkdirSync(TEMP, { recursive: true })
cpSync(join(REPO, 'dist'), TEMP, { recursive: true })

// 3. Switch to deploy branch
console.log('\n=== SWITCHING TO DEPLOY ===')
run(`git checkout ${BRANCH}`)

try {
  // 4. Replace only build files (assets/, index.html, .htaccess)
  //    Does NOT touch .env, node_modules, or any other local files
  console.log('\n=== REPLACING BUILD FILES ===')
  const replaceFiles = readdirSync(TEMP)
  for (const f of replaceFiles) {
    if (BUILD_FILES.includes(f)) {
      const dest = join(REPO, f)
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
      cpSync(join(TEMP, f), dest, { recursive: true })
    }
  }

  // 5. Commit & push (solo los archivos del build)
  console.log('\n=== COMMITTING & PUSHING ===')
  run('git add assets/ index.html .htaccess 2>nul; true')
  const hasChanges = runSilent('git status --porcelain').length > 0
  if (hasChanges) {
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
    run(`git commit -m "deploy: build ${date}"`)
    run(`git push origin ${BRANCH}`)
    console.log('\n\u2705 Deploy successful!')
  } else {
    console.log('\n\u2139\uFE0F No changes to deploy (same build as last commit)')
  }
} finally {
  // 6. Back to main — sin stash, sin env backup, limpio
  cleanTemp()
  run('git checkout main 2>nul')
}
