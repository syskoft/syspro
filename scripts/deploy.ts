import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const BRANCH = 'deploy'
const REPO = join(import.meta.dirname, '..')
const TEMP = join(REPO, '.deploy-tmp')

function run(cmd: string) {
  execSync(cmd, { cwd: REPO, stdio: 'inherit', shell: true })
}

function runSilent(cmd: string): string {
  return execSync(cmd, { cwd: REPO, encoding: 'utf-8', shell: true }).toString().trim()
}

function cleanTemp() {
  if (existsSync(TEMP)) rmSync(TEMP, { recursive: true, force: true })
}

// 1. Build
console.log('\n=== BUILDING ===')
run('npm run build')

// 2. Copy dist to temp
console.log('\n=== COPYING BUILD ===')
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

  // 5. Remove all tracked files via git (handles Windows locks better than fs.rmSync)
  console.log('\n=== CLEANING DEPLOY ===')
  const tracked = runSilent('git ls-files').split('\n').filter(Boolean)
  if (tracked.length > 0) run('git rm -r --ignore-unmatch .')
  // Remove untracked files (only .gitkeep and .git should survive)
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
  // 8. Always go back to main
  cleanTemp()
  run('git checkout main')
  const stashed = execSync('git stash list', { cwd: REPO, encoding: 'utf-8' }).toString().trim()
  if (stashed.includes('auto-stash for deploy')) run('git stash pop')
}
