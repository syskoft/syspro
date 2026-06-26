import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const DARK_VARS: Record<string, string> = {
  '--color-background': 'hsl(240 10% 3.9%)',
  '--color-foreground': 'hsl(0 0% 98%)',
  '--color-card': 'hsl(240 10% 3.9%)',
  '--color-card-foreground': 'hsl(0 0% 98%)',
  '--color-popover': 'hsl(240 10% 3.9%)',
  '--color-popover-foreground': 'hsl(0 0% 98%)',
  '--color-primary': 'hsl(0 0% 98%)',
  '--color-primary-foreground': 'hsl(240 5.9% 10%)',
  '--color-secondary': 'hsl(240 3.7% 15.9%)',
  '--color-secondary-foreground': 'hsl(0 0% 98%)',
  '--color-muted': 'hsl(240 3.7% 15.9%)',
  '--color-muted-foreground': 'hsl(240 5% 64.9%)',
  '--color-accent': 'hsl(240 3.7% 15.9%)',
  '--color-accent-foreground': 'hsl(0 0% 98%)',
  '--color-destructive': 'hsl(0 62.8% 30.6%)',
  '--color-destructive-foreground': 'hsl(0 0% 98%)',
  '--color-border': 'hsl(240 3.7% 15.9%)',
  '--color-input': 'hsl(240 3.7% 15.9%)',
  '--color-ring': 'hsl(240 4.9% 83.9%)',
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('syspro-theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('syspro-theme', dark ? 'dark' : 'light')

    if (dark) {
      for (const [key, value] of Object.entries(DARK_VARS)) {
        root.style.setProperty(key, value)
      }
    } else {
      for (const key of Object.keys(DARK_VARS)) {
        root.style.removeProperty(key)
      }
    }
  }, [dark])

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      className="theme-toggle"
      title={dark ? 'Modo claro' : 'Modo oscuro'}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}
