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

function run(cmd) {
  execSync(cmd, { cwd: REPO, stdio: 'inherit', shell: true })
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: REPO, encoding: 'utf-8', shell: true }).toString().trim()
}

function cleanTemp() {
  if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true })
}

// 1. Build (use direct paths to avoid node_modules/.bin corruption on Windows)
console.log('\n=== BUILDING ===')
run('node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build')

// 2. Copy dist to temp (outside repo so git clean can't touch it)
console.log('\n=== COPYING BUILD TO TEMP ===')
cleanTemp()
mkdirSync(TEMP, { recursive: true })
cpSync(join(REPO, 'dist'), TEMP, { recursive: true })

// 3. Stash any local changes on main
const status = runSilent('git status --porcelain')
if (status) run('git stash push -m "auto-stash for deploy"')

try {
  // 4. Switch to deploy
  console.log('\n=== SWITCHING TO DEPLOY ===')
  run(`git checkout ${BRANCH}`)

  // 5. Remove all tracked files via git
  console.log('\n=== CLEANING DEPLOY ===')
  const tracked = runSilent('git ls-files').split('\n').filter(Boolean)
  if (tracked.length > 0) run('git rm -r --ignore-unmatch .')
  run('git clean -fd')

  // 6. Copy build files
  console.log('\n=== COPYING BUILD ===')
  for (const f of readdirSync(TEMP)) {
    cpSync(join(TEMP, f), join(REPO, f), { recursive: true })
  }

  // 7. Commit & push
  console.log('\n=== COMMITTING & PUSHING ===')
  run('git add -A')
  const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
  run(`git commit -m "deploy: build ${date}"`)
  run(`git push origin ${BRANCH}`)

  console.log('\n\u2705 Deploy successful!')
} finally {
  // 8. Always go back to main (force to discard any leftover changes in deploy)
  cleanTemp()
  runSilent('git checkout --force main 2>nul')
  run('git checkout main 2>nul')
  const stashed = runSilent('git stash list')
  if (stashed.includes('auto-stash for deploy')) run('git stash pop')
}
