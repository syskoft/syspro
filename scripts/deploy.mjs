import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'
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

// Save .env before we do anything destructive (git operations may delete it)
const ENV_BAK = join(TEMP, '__env__')
function saveEnv() {
  const src = join(REPO, '.env')
  if (existsSync(src)) { mkdirSync(TEMP, { recursive: true }); cpSync(src, ENV_BAK) }
}
function restoreEnv() {
  const dst = join(REPO, '.env')
  if (!existsSync(dst) && existsSync(ENV_BAK)) cpSync(ENV_BAK, dst)
}

// 1. Build
console.log('\n=== BUILDING ===')
run('node node_modules/typescript/bin/tsc -b && node node_modules/vite/bin/vite.js build')

// 2. Copy dist + .env to temp
console.log('\n=== COPYING BUILD TO TEMP ===')
cleanTemp()
mkdirSync(TEMP, { recursive: true })
cpSync(join(REPO, 'dist'), TEMP, { recursive: true })
saveEnv()

// 3. Stash any WIP changes on main
const status = runSilent('git status --porcelain')
if (status) run('git stash push -m "auto-stash for deploy"')

try {
  // 4. Switch to deploy branch
  console.log('\n=== SWITCHING TO DEPLOY ===')
  run(`git checkout ${BRANCH}`)

  // 5. Delete all tracked files and untracked leftovers
  const tracked = runSilent('git ls-files').split('\n').filter(Boolean)
  if (tracked.length > 0) run('git rm -r --ignore-unmatch .')
  run('git clean -fd')

  // 6. Copy build files (DO NOT copy .env — it's not needed in deploy branch)
  console.log('\n=== COPYING BUILD ===')
  for (const f of readdirSync(TEMP)) {
    if (f === '__env__') continue
    cpSync(join(TEMP, f), join(REPO, f), { recursive: true })
  }

  // 7. Remove .env if git clean restored it (it should NOT be in the deploy branch)
  const envDeploy = join(REPO, '.env')
  if (existsSync(envDeploy) && readFileSync(envDeploy, 'utf-8').includes('SUPABASE')) rmSync(envDeploy)

  // 7. Commit & push
  console.log('\n=== COMMITTING & PUSHING ===')
  run('git add -A')
  const hasChanges = runSilent('git status --porcelain').length > 0
  if (hasChanges) {
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ')
    run(`git commit -m "deploy: build ${date}"`)
    run(`git push origin ${BRANCH}`)
    console.log('\n\u2705 Deploy successful!')
  } else {
    console.log('\n\u2139\uFE0F No changes to deploy (same build as last commit)')
    run('git push origin deploy') // force push in case remote diverged
  }
} finally {
  // 8. Back to main
  restoreEnv()
  cleanTemp()
  runSilent('git checkout main 2>nul')
  const stashed = execSync('git stash list', { cwd: REPO, encoding: 'utf-8', shell: true }).toString().trim()
  if (stashed.includes('auto-stash for deploy')) run('git stash pop')
}
